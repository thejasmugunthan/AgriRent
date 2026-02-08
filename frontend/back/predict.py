import os
import pickle
from datetime import datetime

import pandas as pd

from model_utils import build_features
from demand_stats import estimate_demand_fields
from seasonal_demand import estimate_seasonal_features
from logging_config import get_logger

logger = get_logger("predict")

MODELS_DIR = "models"


def _load(name: str):
    with open(os.path.join(MODELS_DIR, name), "rb") as f:
        return pickle.load(f)


def predict_price(input_data: dict) -> float:
    """
    input_data comes from API (React) and contains ONLY:

      machine_type, horsepower, age_years,
      hours_used, pincode, maintenance_cost, fuel_price,
      + weather fields (temp, humidity, pressure, wind_speed, rain)

    All other ML features (old_rental_price, last_year_price, bookings_7d,
    stock_on_hand, market_trend_score, seasonal_demand_score, etc.) are
    auto-generated here from training-time stats.
    """
    machine_type = input_data.get("machine_type") or "Unknown"
    horsepower = float(input_data.get("horsepower", 0))
    age_years = float(input_data.get("age_years", 0))
    hours_used = float(input_data.get("hours_used", 0))
    pincode = str(input_data.get("pincode", "000000"))
    maintenance_cost = float(input_data.get("maintenance_cost", 0))
    fuel_price = float(input_data.get("fuel_price", 0))

    # ---- demand / price history fields from training stats ----
    demand_fields = estimate_demand_fields(machine_type)

    # ---- created_at: current date ----
    created_at = datetime.now().strftime("%Y-%m-%d")

    # ---- seasonal demand features based on month + machine type ----
    seasonal = estimate_seasonal_features(machine_type, created_at)

    # weather features are added by api.py (after calling weather API)
    temp = float(input_data.get("temp", 0))
    humidity = float(input_data.get("humidity", 0))
    pressure = float(input_data.get("pressure", 0))
    wind_speed = float(input_data.get("wind_speed", 0))
    rain = float(input_data.get("rain", 0))

    raw = {
        "machine_type": machine_type,
        "horsepower": horsepower,
        "age_years": age_years,
        "hours_used": hours_used,
        "pincode": pincode,
        "maintenance_cost": maintenance_cost,
        "fuel_price": fuel_price,
        "created_at": created_at,

        # auto-filled demand fields (old_rental_price, last_year_price, etc.)
        **demand_fields,

        # seasonal features
        "seasonal_demand_score": seasonal["seasonal_demand_score"],
        "season_month": seasonal["season_month"],
        "is_peak_season": seasonal["is_peak_season"],
        "is_off_season": seasonal["is_off_season"],

        # weather
        "temp": temp,
        "humidity": humidity,
        "pressure": pressure,
        "wind_speed": wind_speed,
        "rain": rain,
    }

    df = pd.DataFrame([raw])

    # base engine features (also builds derived fields like usage_ratio etc.)
    X_base = build_features(df, freq_map={machine_type: 1})

    # numeric subset for XGB/LGBM in same order as training
    num_features = _load("num_features.pkl")
    X_num = (
        X_base.select_dtypes(include=["number"])
        .reindex(columns=num_features, fill_value=0)
    )

    scaler = _load("scaler.pkl")
    xgb = _load("xgb.pkl")
    lgbm = _load("lgbm.pkl")
    cat = _load("cat.pkl")
    cat_meta = _load("cat_meta.pkl")

    X_scaled = scaler.transform(X_num)

    # CatBoost frame aligned with training
    X_cat = X_base.reindex(columns=cat_meta["columns"], fill_value=0)

    p_xgb = float(xgb.predict(X_scaled)[0])
    p_lgb = float(lgbm.predict(X_num)[0])
    p_cat = float(cat.predict(X_cat)[0])

    price = (p_xgb + p_lgb + p_cat) / 3.0
    return float(price)
