"""
Training pipeline for AgriRent.
- Reads raw CSV (no manual preprocessing)
- Builds features via model_utils.build_features (this will fetch weather)
- Trains an ensemble: XGBoost, CatBoost, LightGBM
- Saves models, scaler and feature order into models/ directory
"""

import json
import joblib
from pathlib import Path
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import RobustScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

import xgboost as xgb
from catboost import CatBoostRegressor
import lightgbm as lgb

from model_utils import build_features
import utils.weather as ws


ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "rentals_raw_150k.csv"
OUT_DIR = ROOT / "models"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def clip_series_iqr(s: pd.Series, factor: float = 3.0) -> pd.Series:
    q1 = s.quantile(0.25)
    q3 = s.quantile(0.75)
    iqr = q3 - q1
    return s.clip(q1 - factor * iqr, q3 + factor * iqr)


def main():
    print("\n===============================================")
    print("🚜 AGRIRENT TRAINING PIPELINE (with Demand + Weather)")
    print("===============================================\n")

    if not DATA_FILE.exists():
        raise FileNotFoundError(f"CSV file not found: {DATA_FILE}")

    print("📥 Loading dataset:", DATA_FILE)
    df = pd.read_csv(DATA_FILE)

    if "rental_price" not in df.columns:
        raise KeyError("Missing target column 'rental_price' in CSV")

    before = len(df)
    df = df.dropna(subset=["rental_price"])
    after = len(df)
    print(f"   • Dropped {before - after} rows with missing rental_price")

    df["rental_price"] = clip_series_iqr(
        pd.to_numeric(df["rental_price"], errors="coerce").fillna(0.0),
        factor=3.0
    )

    # Normalize machine type and compute frequency map
    df["machine_type"] = df["machine_type"].fillna("UNKNOWN").astype(str).str.upper()
    machine_freq = df["machine_type"].value_counts(normalize=True).to_dict()

    (OUT_DIR / "machine_type_freq.json").write_text(json.dumps(machine_freq))
    print(f"Saved machine_type_freq.json (unique machine types: {len(machine_freq)})")

    # Clear weather cache before feature engineering
    ws.clear_caches()

    # Feature engineering
    df_fe = build_features(df, machine_freq)

    # Drop object-like columns that models can't handle
    object_drop = [
        c for c in ["pincode", "machine_type", "created_at", "state_name", "place_name"]
        if c in df_fe.columns
    ]
    if object_drop:
        df_fe = df_fe.drop(columns=object_drop)
        print(f"   • Dropped object columns before training: {object_drop}")

    if "rental_price" not in df_fe.columns:
        raise KeyError("Feature engineering removed 'rental_price' target unexpectedly.")

    y = df_fe["rental_price"].astype(float)
    X = df_fe.drop(columns=["rental_price"])

    print("\n✂️  Splitting train & test...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42
    )
    print(f"   • Train rows: {len(X_train)}, Test rows: {len(X_test)}")

    numeric_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
    scaler = RobustScaler()
    if numeric_cols:
        X_train[numeric_cols] = scaler.fit_transform(X_train[numeric_cols])
        X_test[numeric_cols] = scaler.transform(X_test[numeric_cols])

    joblib.dump(scaler, OUT_DIR / "scaler.pkl")
    print(f"   • Saved scaler.pkl (num features: {len(numeric_cols)})")

    feature_cols = list(X.columns)
    (OUT_DIR / "feature_cols.json").write_text(json.dumps(feature_cols))
    print(f"   • Saved feature_cols.json ({len(feature_cols)} features)")

    # Weather cache stats
    api_used = sum(1 for v in ws._WEATHER_CACHE.values() if v.get("api_used"))
    invalid = sum(1 for v in ws._WEATHER_CACHE.values() if v.get("invalid_pin"))
    print("\n🌦 Weather Summary:")
    print(f"   Unique pincodes processed: {len(ws._WEATHER_CACHE)}")
    print(f"   API calls (fresh)        : {api_used}")
    print(f"   Invalid pincodes         : {invalid}\n")

    # -------------------------
    # Train models
    # -------------------------
    print("Training XGBoost...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
    )
    xgb_model.fit(X_train, y_train)

    print("Training CatBoost...")
    cat_model = CatBoostRegressor(
        iterations=200,
        depth=8,
        learning_rate=0.05,
        loss_function="RMSE",
        verbose=False,
    )
    cat_model.fit(X_train, y_train)

    print("Training LightGBM...")
    lgb_model = lgb.LGBMRegressor(
        n_estimators=200,
        learning_rate=0.05,
        num_leaves=50,
        random_state=42,
    )
    lgb_model.fit(X_train, y_train)

    # -------------------------
    # Evaluate ensemble
    # -------------------------
    p1 = xgb_model.predict(X_test)
    p2 = cat_model.predict(X_test)
    p3 = lgb_model.predict(X_test)
    ensemble = (p1 + p2 + p3) / 3.0

    print("\n📊   MODEL PERFORMANCE")
    print(f"   MAE : {mean_absolute_error(y_test, ensemble):.4f}")
    print(f"   RMSE: {mean_squared_error(y_test, ensemble) ** 0.5:.4f}")
    print(f"   R2  : {r2_score(y_test, ensemble):.4f}")

    # -------------------------
    # Save models
    # -------------------------
    joblib.dump(xgb_model, OUT_DIR / "xgb_model.pkl")
    joblib.dump(cat_model, OUT_DIR / "cat_model.pkl")
    joblib.dump(lgb_model, OUT_DIR / "lgb_model.pkl")
    print(f"\nModels saved to: {OUT_DIR}")


if __name__ == "__main__":
    main()
