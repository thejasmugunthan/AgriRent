"""
Quick test for feature engineering pipeline.
This script creates a tiny sample dataframe, runs build_features and asserts:
 - required columns exist
 - no NaNs in critical numeric columns
 - weather cache was populated
"""

import pandas as pd
from model_utils import build_features
import utils.weather as ws


def sample_df():
    return pd.DataFrame(
        [
            {
                "pincode": "560001",
                "machine_type": "TRACTOR",
                "horsepower": 45,
                "hours_used": 300,
                "age_years": 4,
                "maintenance_cost": 12000,
                "fuel_price": 95,
                "duration_days": 5,
                "advance_days": 2,
                "weekend": 1,
                "old_rental_price": 1500,
                "last_year_price": 1700,
                "demand_index": 0.8,
                "hours_per_day": 6,
                "created_at": "2024-01-01",
                "bookings_7d": 14,
                "cancellations_7d": 1,
                "stock_on_hand": 20,
                "rental_price": 1600,
            },
            {
                "pincode": "110001",
                "machine_type": "HARVESTER",
                "horsepower": 60,
                "hours_used": 100,
                "age_years": 8,
                "maintenance_cost": 22000,
                "fuel_price": 96,
                "duration_days": 3,
                "advance_days": 1,
                "weekend": 0,
                "old_rental_price": 2500,
                "last_year_price": 2400,
                "demand_index": 1.1,
                "hours_per_day": 10,
                "created_at": "2023-11-15",
                "bookings_7d": 7,
                "cancellations_7d": 0,
                "stock_on_hand": 5,
                "rental_price": 2700,
            },
            {
                "pincode": "999999",  # invalid pin -> fallback
                "machine_type": "SPRAYER",
                "horsepower": 20,
                "hours_used": 80,
                "age_years": 2,
                "maintenance_cost": 7000,
                "fuel_price": 90,
                "duration_days": 2,
                "advance_days": 0,
                "weekend": 0,
                "old_rental_price": 900,
                "last_year_price": 850,
                "demand_index": 0.9,
                "hours_per_day": 6,
                "created_at": "BAD_DATE",
                "bookings_7d": 3,
                "cancellations_7d": 1,
                "stock_on_hand": 3,
                "rental_price": 1000,
            },
        ]
    )


def run_test():
    ws.clear_caches()
    df = sample_df()
    freq_map = {"TRACTOR": 0.5, "HARVESTER": 0.3, "SPRAYER": 0.2}

    df_fe = build_features(df, freq_map)

    critical = [
        "weather_temp",
        "weather_humidity",
        "weather_wind",
        "weather_rain",
        "machine_type_freq",
        "future_demand_score",
        "daily_rate",
        "booking_pressure",
    ]
    missing = [c for c in critical if c not in df_fe.columns]
    assert not missing, f"Missing critical columns: {missing}"

    for c in critical:
        na_count = df_fe[c].isna().sum()
        assert na_count == 0, f"NaNs found in {c}: {na_count}"

    cache_size = len(ws._WEATHER_CACHE)
    assert cache_size >= 2, f"Weather cache too small: {cache_size}"

    print("✅ Feature engineering test passed.")
    print("Weather cache size:", cache_size)
    print(df_fe.head().to_string())


if __name__ == "__main__":
    run_test()
