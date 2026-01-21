import pandas as pd
import numpy as np

# ------------------------------------------------------------
# PINCODE FEATURES
# ------------------------------------------------------------
def add_pincode_features(df: pd.DataFrame):
    df = df.copy()

    df["pincode_str"] = df.get("pincode", "").astype(str).str.strip()
    df["pincode_prefix"] = df["pincode_str"].str[:3]
    df["pincode_suffix"] = df["pincode_str"].str[3:]

    df["pincode_prefix"] = pd.to_numeric(df["pincode_prefix"], errors="coerce").fillna(0)
    df["pincode_suffix"] = pd.to_numeric(df["pincode_suffix"], errors="coerce").fillna(0)
    df["pincode_int"] = pd.to_numeric(df["pincode_str"], errors="coerce").fillna(0)

    return df


# ------------------------------------------------------------
# DATE FEATURES
# ------------------------------------------------------------
def get_season(month: int) -> int:
    if month in [12, 1, 2]:   return 1   # Winter
    if month in [3, 4, 5]:    return 2   # Summer
    if month in [6, 7, 8]:    return 3   # Monsoon
    if month in [9, 10, 11]:  return 4   # Post-Monsoon
    return 0


def add_date_features(df: pd.DataFrame):
    df = df.copy()

    dt = pd.to_datetime(df.get("created_at", None), errors="coerce")

    df["created_year"]       = dt.dt.year.fillna(0).astype(int)
    df["created_month"]      = dt.dt.month.fillna(0).astype(int)
    df["created_dayofyear"]  = dt.dt.dayofyear.fillna(0).astype(int)
    df["season"]             = df["created_month"].apply(get_season)

    return df


# ------------------------------------------------------------
# FREQUENCY ENCODING
# ------------------------------------------------------------
def apply_frequency_features(df: pd.DataFrame, freq_map: dict | None):
    df = df.copy()

    if freq_map:
        df["machine_type_freq"] = df["machine_type"].map(freq_map).fillna(1)
    else:
        df["machine_type_freq"] = 1.0

    return df


# ------------------------------------------------------------
# NUMERIC CLEANING
# ------------------------------------------------------------
def sanitize_numeric(df: pd.DataFrame):
    df = df.copy()

    for col in df.select_dtypes(include=["float", "int"]).columns:
        df[col] = df[col].replace([np.inf, -np.inf], np.nan)
        df[col] = df[col].fillna(df[col].median())

    return df


# ------------------------------------------------------------
# MASTER BUILD FEATURES (used in train.py + predict.py)
# ------------------------------------------------------------
def build_features(df: pd.DataFrame, freq_map=None) -> pd.DataFrame:
    df = df.copy()

    # --- machine_type ---
    df["machine_type"] = df.get("machine_type", "Unknown").fillna("Unknown")

    # --- Apply sub-transformations ---
    df = add_pincode_features(df)
    df = add_date_features(df)
    df = apply_frequency_features(df, freq_map)

    # --- Required numeric fields ---
    numeric_cols = [
        "horsepower", "age_years", "hours_used", "maintenance_cost",
        "fuel_price", "old_rental_price", "last_year_price",
        "bookings_7d", "stock_on_hand", "market_trend_score",
        "machine_type_freq", "pincode_int", "pincode_prefix",
        "pincode_suffix", "created_year", "created_month",
        "created_dayofyear", "season",
        "temp", "humidity", "pressure", "wind_speed", "rain",
    ]

    for col in numeric_cols:
        if col not in df.columns:
            df[col] = 0.0
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    # --- Derived ML features ---
    df["usage_ratio"] = df["hours_used"] / (df["age_years"] + 1.0)
    df["demand_ratio"] = df["bookings_7d"] / (df["stock_on_hand"] + 1.0)
    df["price_trend"] = df["old_rental_price"] - df["last_year_price"]
    df["fuel_cost_factor"] = df["fuel_price"] * df["hours_used"]
    df["heat_stress"] = (df["temp"] - 35).clip(lower=0)
    df["humidity_stress"] = df["humidity"] / 100
    df["rain_risk"] = (df["rain"] > 0).astype(int)

    # final pass for NaN / Inf
    df = sanitize_numeric(df)

    return df
