# smart_predict.py
import pickle
import os
import numpy as np
import pandas as pd
from datetime import datetime

from model_utils import build_features

# -----------------------------
# LOAD MODELS + ARTIFACTS
# -----------------------------

MODELS_DIR = "models"

# numerical features
num_features = pickle.load(open(f"{MODELS_DIR}/num_features.pkl", "rb"))

# encoders
xgb_te = pickle.load(open(f"{MODELS_DIR}/xgb_te.pkl", "rb"))
lgbm_hybrid = pickle.load(open(f"{MODELS_DIR}/lgbm_hybrid.pkl", "rb"))

# scaling
scaler = pickle.load(open(f"{MODELS_DIR}/scaler.pkl", "rb"))

# models
xgb = pickle.load(open(f"{MODELS_DIR}/xgb.pkl", "rb"))
lgbm = pickle.load(open(f"{MODELS_DIR}/lgbm.pkl", "rb"))
cat = pickle.load(open(f"{MODELS_DIR}/cat.pkl", "rb"))

# metadata
cat_meta = pickle.load(open(f"{MODELS_DIR}/cat_meta.pkl", "rb"))

# demand statistics (for autofill)
demand_stats = pickle.load(open(f"{MODELS_DIR}/demand_stats.pkl", "rb"))

# seasonal stats
seasonal_stats = pickle.load(open(f"{MODELS_DIR}/seasonal_stats.pkl", "rb"))

# -----------------------------
# INTERNAL UTILITIES
# -----------------------------

def safe(val, default=0):
    """Convert NaN or None → default."""
    try:
        if val is None or (isinstance(val, float) and np.isnan(val)):
            return default
        return val
    except:
        return default


def get_demand_fill(machine_type: str, key: str):
    """Return median fallback for missing fields."""
    machine_type = machine_type or "Unknown"
    if machine_type in demand_stats["by_type"]:
        if key in demand_stats["by_type"][machine_type]:
            return float(demand_stats["by_type"][machine_type][key])
    return float(demand_stats["global"].get(key, 0))


def get_seasonal_multiplier(month: int):
    """Return seasonal demand multiplier."""
    if month in seasonal_stats:
        return float(seasonal_stats[month])
    return 1.0


# -----------------------------
# MAIN PREDICT FUNCTION
# -----------------------------

def smart_predict(payload: dict):

    # -------------------------------------
    # 1) Extract & autofill missing fields
    # -------------------------------------

    machine_type = payload.get("machine_type", "Unknown")
    month = datetime.now().month

    # fetch missing fields using demand stats
    old_price = safe(payload.get("old_rental_price"),
                     get_demand_fill(machine_type, "old_rental_price"))

    last_year = safe(payload.get("last_year_price"),
                     get_demand_fill(machine_type, "last_year_price"))

    bookings = safe(payload.get("bookings_7d"),
                    get_demand_fill(machine_type, "bookings_7d"))

    stock = safe(payload.get("stock_on_hand"),
                 get_demand_fill(machine_type, "stock_on_hand"))

    trend = safe(payload.get("market_trend_score"),
                 get_demand_fill(machine_type, "market_trend_score"))

    # seasonal boost
    seasonal_mul = get_seasonal_multiplier(month)

    # -------------------------------------
    # 2) Build ML feature input
    # -------------------------------------

    df = pd.DataFrame([{
        "machine_type": machine_type,
        "horsepower": payload.get("horsepower", 50),
        "age_years": payload.get("age_years", 0),
        "hours_used": payload.get("hours_used", 0),
        "pincode": payload.get("pincode"),
        "maintenance_cost": payload.get("maintenance_cost", 0),
        "fuel_price": payload.get("fuel_price", 95),
        "temp": payload.get("weather_temp", payload.get("temp", 0)),
        "humidity": payload.get("weather_humidity", payload.get("humidity", 0)),
        "pressure": payload.get("pressure", 0),
        "wind_speed": payload.get("wind_speed", 0),
        "rain": payload.get("weather_rain", payload.get("rain", 0)),
        "old_rental_price": old_price,
        "last_year_price": last_year,
        "bookings_7d": bookings,
        "stock_on_hand": stock,
        "market_trend_score": trend,
        "created_at": datetime.now().isoformat(),
    }])

    # Feature engineering
    freq_map = {machine_type: 1000}  # dummy for prediction
    df = build_features(df, freq_map=freq_map)

    # -------------------------------------
    # 3) Apply encoders
    # -------------------------------------

    # target encoding (xgb)
    te_dict = xgb_te["te_dict"]
    global_median = xgb_te["global_median"]
    df["machine_type_xgb"] = df["machine_type"].map(te_dict).fillna(global_median)

    # hybrid encoding (lgb)
    df["machine_type_lgb"] = df["machine_type"].map(
        lgbm_hybrid["te_dict"]
    ).fillna(lgbm_hybrid["global_median"])

    # -------------------------------------
    # 4) Prep inputs for each model
    # -------------------------------------

    X_num = df[num_features].astype(float)

    # scale for xgboost
    X_scaled = scaler.transform(X_num)

    # catboost needs its full columns
    cat_cols = cat_meta["columns"]
    X_cat = df[cat_cols]

    cat_features_idx = cat_meta["cat_features_idx"]

    # -------------------------------------
    # 5) Predict (ensemble)
    # -------------------------------------

    p_xgb = float(xgb.predict(X_scaled)[0])
    p_lgb = float(lgbm.predict(X_num)[0])
    p_cat = float(cat.predict(X_cat)[0])

    price = (p_xgb + p_lgb + p_cat) / 3.0

    # -------------------------------------
    # 6) Apply seasonal multiplier
    # -------------------------------------

    final_price = float(price * seasonal_mul)

    return round(final_price, 2)
