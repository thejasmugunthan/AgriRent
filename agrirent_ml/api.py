from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="AgriRent Pricing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_season(month: int):
    if month in [3,4,5]:
        return "summer"
    if month in [6,7,8]:
        return "monsoon"
    if month in [9,10,11]:
        return "harvest"
    return "winter"

def confidence(multiplier: float):
    if multiplier >= 1.25:
        return "High"
    if multiplier >= 1.1:
        return "Medium"
    return "Low"

# ================= TRACTOR =================

class TractorInput(BaseModel):
    horsepower: int
    attachment_type: str
    age_years: int
    hours_used: int
    pincode: int
    maintenance_cost: int = 0

    class Config:
        extra = "forbid"

@app.post("/predict/tractor")
def predict_tractor(data: TractorInput):
    season = get_season(datetime.now().month)
    base = 450
    hp_factor = data.horsepower / 50
    wear = max(0.7, 1 - data.age_years * 0.04)
    demand = 1.25 if season == "harvest" else 1.0

    price = base * hp_factor * wear * demand
    return {
        "final_price": round(price, 2),
        "pricing_unit": "per_hour",
        "confidence": confidence(demand),
    }

# ================= HARVESTER =================

class HarvesterInput(BaseModel):
    harvester_type: str
    crop_type: str
    age_years: int = 0
    pincode: int

    class Config:
        extra = "forbid"

@app.post("/predict/harvester")
def predict_harvester(data: HarvesterInput):
    season = get_season(datetime.now().month)
    base = 1800
    crop = 1.3 if data.crop_type.lower() in ["paddy","wheat"] and season=="harvest" else 1.0
    wear = max(0.8, 1 - data.age_years * 0.03)
    price = base * crop * wear
    return {
        "final_price": round(price,2),
        "pricing_unit": "per_acre",
        "confidence": confidence(crop),
    }

# ================= PUMP =================

class PumpInput(BaseModel):
    pump_type: str
    capacity_hp: int
    pincode: int

    class Config:
        extra = "forbid"

@app.post("/predict/pump")
def predict_pump(data: PumpInput):
    season = get_season(datetime.now().month)
    base = 120
    fuel = {"diesel":1.2,"electric":0.9,"solar":0.8}.get(data.pump_type.lower(),1)
    demand = 1.3 if season=="summer" else 1.0
    price = base * fuel * demand
    return {
        "final_price": round(price,2),
        "pricing_unit": "per_hour",
        "confidence": confidence(demand),
    }

# ================= TRAILER =================

class TrailerInput(BaseModel):
    trailer_type: str
    load_type: str
    pincode: int

    class Config:
        extra = "forbid"

@app.post("/predict/trailer")
def predict_trailer(data: TrailerInput):
    season = get_season(datetime.now().month)
    base = 300
    demand = 1.15 if season in ["harvest","summer"] else 1
    price = base * demand
    return {
        "final_price": round(price,2),
        "pricing_unit": "per_hour",
        "confidence": confidence(demand),
    }

# ================= SPRAYER =================

class SprayerInput(BaseModel):
    sprayer_type: str
    tank_capacity: int
    age_years: int = 0
    pincode: int

    class Config:
        extra = "forbid"

@app.post("/predict/sprayer")
def predict_sprayer(data: SprayerInput):
    base = 200
    cap = data.tank_capacity / 400
    wear = max(0.8, 1 - data.age_years * 0.03)
    price = base * cap * wear
    return {
        "final_price": round(price,2),
        "pricing_unit": "per_hour",
        "confidence": "Medium",
    }

# ================= WEEDER =================

class WeederInput(BaseModel):
    weeder_type: str
    horsepower: int
    age_years: int
    pincode: int

    class Config:
        extra = "forbid"

@app.post("/predict/weeder")
def predict_weeder(data: WeederInput):
    base = 250
    hp = data.horsepower / 10
    wear = max(0.75, 1 - data.age_years * 0.04)
    price = base * hp * wear
    return {
        "final_price": round(price,2),
        "pricing_unit": "per_hour",
        "confidence": "Medium",
    }
