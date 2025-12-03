from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from predict import predict_price
from utils.weather import get_weather_for_pincode
from utils.demand import compute_demand_index

app = FastAPI(title="AgriRent ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    pincode: str
    machine_type: str
    horsepower: float
    hours_used: float
    age_years: float
    maintenance_cost: float
    fuel_price: float

    duration_days: float = 1
    advance_days: float = 0
    weekend: int = 0
    hours_per_day: float = 1
    created_at: str
    bookings_7d: float = 0
    cancellations_7d: float = 0
    stock_on_hand: float = 1

    market_trend_score: float = 1.0
    rental_price: Optional[float] = 0.0


class PredictResponse(BaseModel):
    predicted_rental_price: float
    demand_index: float
    market_trend_score: float
    note: str


@app.post("/predict", response_model=PredictResponse)
def predict_api(req: PredictRequest):

    data = req.dict()

    weather = get_weather_for_pincode(data["pincode"])

    demand_idx = compute_demand_index(data, weather)
    data["demand_index"] = demand_idx

    predicted = predict_price(data)

    return PredictResponse(
        predicted_rental_price=float(predicted),
        demand_index=float(demand_idx),
        market_trend_score=float(data["market_trend_score"]),
        note="Price prediction with auto-demand & market trend",
    )


@app.get("/")
def root():
    return {"status": "ok", "message": "ML Service Running"}
