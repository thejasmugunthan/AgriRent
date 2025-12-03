import pandas as pd
from utils.weather import get_weather_for_pincode

def build_features(df: pd.DataFrame):

    df = df.copy()

    df["machine_type"] = df["machine_type"].astype(str).str.upper()

    # weather
    temps = []
    hums = []
    winds = []
    rains = []

    pins = df["pincode"].unique()
    weather_map = {p: get_weather_for_pincode(p) for p in pins}

    for pin in df["pincode"]:
        w = weather_map[pin]
        temps.append(w["temp"])
        hums.append(w["humidity"])
        winds.append(w["wind"])
        rains.append(w["rain"])

    df["weather_temp"] = temps
    df["weather_humidity"] = hums
    df["weather_wind"] = winds
    df["weather_rain"] = rains

    # feature conversions
    numeric = ["horsepower","hours_used","age_years","maintenance_cost","fuel_price",
               "duration_days","advance_days","weekend","hours_per_day","bookings_7d",
               "cancellations_7d","stock_on_hand","market_trend_score","demand_index"]

    for c in numeric:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)

    # engineered features
    df["usage_ratio"] = df["hours_used"] * df["hours_per_day"]
    df["season_score"] = df["weather_temp"] / 40

    df["final_demand_boost"] = df["demand_index"] * df["market_trend_score"]

    return df
