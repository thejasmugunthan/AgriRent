# api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import requests
from datetime import datetime

from logging_config import get_logger
from pincode import get_location_from_pincode
from weather import get_weather
from predict import predict_price

logger = get_logger("api")

app = FastAPI(title="AgriRent ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
#  DIESEL PRICE API (Real-Time)
# ============================================================
def get_diesel_price() -> float:
    try:
        r = requests.get(
            "https://dailyfuelpriceindia.com/api/todayDieselPrice",
            timeout=5,
        )
        if r.status_code == 200:
            data = r.json()
            return float(data.get("todayDieselPrice", 95))
    except Exception as e:
        logger.warning(f"Diesel API failed: {e}")

    return 95.0


@app.get("/get_diesel")
def api_diesel():
    """Frontend uses this endpoint to fetch live diesel price."""
    return {"diesel_price": get_diesel_price()}


# ============================================================
#  ML BASE PREDICT (used by AddMachine.jsx)
# ============================================================
class PredictRequest(BaseModel):
    machine_type: str
    horsepower: float
    age_years: float | None = 0
    hours_used: float | None = 0
    pincode: str
    maintenance_cost: float | None = 0
    fuel_price: float | None = 95


class PredictResponse(BaseModel):
    predicted_rental_price: float
    location: dict
    weather: dict


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict_endpoint(body: PredictRequest):

    # ---- LOCATION ----
    loc = get_location_from_pincode(body.pincode)

    # ---- WEATHER ----
    weather_raw = get_weather(loc["lat"], loc["lng"]) or {}
    main = weather_raw.get("main", {})
    wind = weather_raw.get("wind", {})

    rain = 0.0
    if isinstance(weather_raw.get("rain"), dict):
        rain = list(weather_raw["rain"].values())[0]

    desc = (weather_raw.get("weather") or [{}])[0].get("description", "")

    weather = {
        "temp": main.get("temp"),
        "humidity": main.get("humidity"),
        "pressure": main.get("pressure"),
        "wind_speed": wind.get("speed"),
        "rain": rain,
        "description": desc,
    }

    # ---- ML PAYLOAD ----
    payload = {
        "machine_type": body.machine_type,
        "horsepower": body.horsepower,
        "age_years": body.age_years or 0.0,
        "hours_used": body.hours_used or 0.0,
        "pincode": body.pincode,
        "maintenance_cost": body.maintenance_cost or 0.0,
        "fuel_price": body.fuel_price or 95.0,
        "temp": weather.get("temp") or 0.0,
        "humidity": weather.get("humidity") or 0.0,
        "pressure": weather.get("pressure") or 0.0,
        "wind_speed": weather.get("wind_speed") or 0.0,
        "rain": weather.get("rain") or 0.0,
        "created_at": datetime.utcnow().strftime("%Y-%m-%d"),
    }

    price = predict_price(payload)

    return PredictResponse(
        predicted_rental_price=price,
        location={
            "city": loc.get("city"),
            "state": loc.get("state"),
            "lat": loc.get("lat"),
            "lng": loc.get("lng"),
        },
        weather=weather,
    )


# ============================================================
#  SMART PREDICT (Used by PricePredictor.jsx)
# ============================================================
class SmartPredictRequest(BaseModel):
    machine_type: str
    pincode: str
    duration_days: int
    season: str
    crop_type: str
    demand_index: float
    weather_temp: float = 0
    weather_humidity: float = 0
    weather_rain: float = 0


@app.post("/smart_predict")
def smart_predict(body: SmartPredictRequest):

    loc = get_location_from_pincode(body.pincode)
    diesel_price = get_diesel_price()

    hours_used = float(body.duration_days) * 8.0

    ml_payload = {
        "machine_type": body.machine_type,
        "horsepower": 50.0,
        "age_years": 3.0,
        "hours_used": hours_used,
        "pincode": body.pincode,
        "maintenance_cost": 0.0,
        "fuel_price": diesel_price,
        "temp": body.weather_temp,
        "humidity": body.weather_humidity,
        "rain": body.weather_rain,
        "pressure": 1000.0,
        "wind_speed": 2.0,
        "created_at": datetime.utcnow().strftime("%Y-%m-%d"),
    }

    base_price = predict_price(ml_payload)
    final_price = round(base_price * body.demand_index, 2)

    return {
        "success": True,
        "price": final_price,
        "ml_base_price": base_price,
        "demand_index": body.demand_index,
        "diesel_price": diesel_price,
        "location": loc,
    }
