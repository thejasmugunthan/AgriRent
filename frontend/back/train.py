import os
import pickle
import pandas as pd
import numpy as np
from tqdm import tqdm

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor

from model_utils import build_features
from encoding_utils import target_encode, hybrid_encode, save_encoder
from seasonal_demand import build_seasonal_stats
from logging_config import get_logger

logger = get_logger("train")

RAW_DATA = os.path.join("data", "rentals_raw_150k (1).csv")
WEEKLY_DATA = os.path.join("data", "rentals_weekly_dataset.csv")
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)


# -------------------------------------------------------------
def progress(title: str):
    print(f"\n\033[96m=== {title} ===\033[0m")
# -------------------------------------------------------------


# =============================================================
# STEP 1 — LOAD DATA
# =============================================================
def load_data():
    progress("STEP 1: LOADING DATASET")

    if os.path.exists(WEEKLY_DATA):
        logger.info(f"Loading WEEKLY dataset: {WEEKLY_DATA}")
        return pd.read_csv(WEEKLY_DATA)

    logger.info(f"Weekly dataset missing -> using raw dataset: {RAW_DATA}")
    return pd.read_csv(RAW_DATA)


# =============================================================
# STEP 2 — CLEANING & MEDIAN PREPROCESSING
# =============================================================
def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    progress("STEP 2: CLEANING & MEDIAN PREPROCESSING")

    df = df.copy()
    df = df[df["rental_price"] > 0]

    numeric_cols = df.select_dtypes(include=["int", "float"]).columns
    for col in tqdm(numeric_cols, desc="Filling median for numeric columns"):
        df[col] = df[col].fillna(df[col].median())

    q1 = df["rental_price"].quantile(0.25)
    q3 = df["rental_price"].quantile(0.75)
    iqr = q3 - q1
    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    df = df[(df["rental_price"] >= lo) & (df["rental_price"] <= hi)]

    return df


# =============================================================
# STEP 3 — GLOBAL + TYPE DEMAND STATISTICS
# =============================================================
def build_demand_stats(df: pd.DataFrame):
    progress("STEP 3: BUILDING DEMAND STATISTICS")

    fields = [
        "old_rental_price",
        "last_year_price",
        "bookings_7d",
        "stock_on_hand",
        "market_trend_score",
    ]

    existing = [f for f in fields if f in df.columns]

    if not existing:
        payload = {"by_type": {}, "global": {}}
    else:
        by_type = df.groupby("machine_type")[existing].median().to_dict(orient="index")
        global_stats = df[existing].median().to_dict()
        payload = {"by_type": by_type, "global": global_stats}

    pickle.dump(payload, open(os.path.join(MODELS_DIR, "demand_stats.pkl"), "wb"))
    print("Demand statistics saved → models/demand_stats.pkl")


# =============================================================
# STEP 4 — SEASONAL DEMAND STATS
# =============================================================
def seasonal_analysis(df: pd.DataFrame):
    progress("STEP 4: BUILDING SEASONAL DEMAND STATS")

    from seasonal_demand import _parse_month

    print("Extracting month from 'created_at'...")

    months = df["created_at"].apply(_parse_month)
    valid = months.notna().sum()
    invalid = months.isna().sum()

    print(f" • Valid: {valid} | Invalid: {invalid}")

    print("Seasonal Stats Progress:")
    for _ in tqdm(range(100)):
        pass

    build_seasonal_stats(df)
    print("Seasonal stats saved → models/seasonal_stats.pkl")


# =============================================================
# STEP 5 — FEATURE ENGINEERING
# =============================================================
def feature_engineering(X_raw: pd.DataFrame):
    progress("STEP 5: FEATURE ENGINEERING")

    print("Building engineered features using model_utils.build_features...")

    freq_map = X_raw["machine_type"].value_counts().to_dict()
    X_fe = build_features(X_raw, freq_map=freq_map)

    print(f"Engineered feature count = {len(X_fe.columns)}")
    return X_fe, freq_map


# =============================================================
# STEP 6 — ENCODING
# =============================================================
def encoding_step(machine_series, y, X_fe):
    progress("STEP 6: ENCODING (Target & Hybrid)")

    print("→ Target Encoding (XGBoost)")
    xgb_enc, te_dict, global_median = target_encode(machine_series, y)
    save_encoder("xgb_te.pkl", {"te_dict": te_dict, "global_median": global_median})
    X_fe["machine_type_xgb"] = xgb_enc

    print("→ Hybrid Encoding (LightGBM)")
    hybrid_enc, freq_dict, te_d2, gm2 = hybrid_encode(machine_series, y)
    save_encoder("lgbm_hybrid.pkl",
                 {"freq_dict": freq_dict, "te_dict": te_d2, "global_median": gm2})
    X_fe["machine_type_lgb"] = hybrid_enc

    return X_fe


# =============================================================
# STEP 7 — TRAIN/VAL SPLIT
# =============================================================
def split_data(X_fe, y):
    progress("STEP 7: TRAIN/VAL SPLIT")

    X_num = X_fe.select_dtypes(include=["number"]).copy()

    print(f"Numeric feature count = {len(X_num.columns)}")

    X_train, X_val, y_train, y_val = train_test_split(
        X_num, y, test_size=0.2, random_state=42
    )

    print(f"Train rows = {len(X_train)}, Validation rows = {len(X_val)}")

    return X_train, X_val, y_train, y_val, X_num


# =============================================================
# STEP 8 — SCALING NUMERIC FEATURES FOR XGBOOST
# =============================================================
def scale_data(X_train, X_val):
    progress("STEP 8: SCALING NUMERIC FOR XGBOOST")

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    print("Scaling completed.")
    return scaler, X_train_scaled, X_val_scaled


# =============================================================
# STEP 9 — TRAIN MODELS
# =============================================================
def train_models():
    df = load_data()
    df = clean_data(df)

    df["machine_type"] = df["machine_type"].fillna("Unknown")

    # ------------ STEP 3 ------------
    build_demand_stats(df)

    # ------------ STEP 4 ------------
    seasonal_analysis(df)

    # ------------ STEP 5 ------------
    y = df["rental_price"].astype(float)
    X_raw = df.drop(columns=["rental_price"])
    X_fe, freq_map = feature_engineering(X_raw)

    # ------------ STEP 6 ------------
    X_fe = encoding_step(X_raw["machine_type"], y, X_fe)

    # ------------ STEP 7 ------------
    X_train, X_val, y_train, y_val, X_num = split_data(X_fe, y)

    # For CatBoost
    X_cat_train = X_fe.loc[X_train.index].copy()
    X_cat_val = X_fe.loc[X_val.index].copy()

    X_cat_train = X_cat_train.fillna("Unknown")
    X_cat_val = X_cat_val.fillna("Unknown")

    # ------------ STEP 8 ------------
    scaler, X_train_scaled, X_val_scaled = scale_data(X_train, X_val)

    # =============================================================
    # STEP 9 — TRAINING MODELS
    # =============================================================
    progress("STEP 9: TRAINING MODELS")

    print("🌲 Training XGBoost...")
    xgb = XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        tree_method="hist",
    )
    xgb.fit(X_train_scaled, y_train)

    print("💡 Training LightGBM...")
    lgbm = LGBMRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=-1,
        min_data_in_leaf=10,
        random_state=42,
    )
    lgbm.fit(X_train, y_train)

    print("🐈 Training CatBoost...")
    cat_features_idx = [
        i for i, col in enumerate(X_cat_train.columns)
        if X_cat_train[col].dtype == "object"
    ]

    cat = CatBoostRegressor(
        iterations=300,
        depth=6,
        learning_rate=0.05,
        loss_function="MAE",
        random_seed=42,
        verbose=False,
    )
    cat.fit(X_cat_train, y_train, cat_features=cat_features_idx)

    # =============================================================
    # STEP 10 — VALIDATION
    # =============================================================
    progress("STEP 10: VALIDATION & ENSEMBLE MAE")

    p_xgb = xgb.predict(X_val_scaled)
    p_lgb = lgbm.predict(X_val)
    p_cat = cat.predict(X_cat_val)

    preds = (p_xgb + p_lgb + p_cat) / 3.0
    mae = mean_absolute_error(y_val, preds)

    

    # =============================================================
    # 🌟 MODEL PERFORMANCE BLOCK (UPDATED FOR OLD SKLEARN)
    # =============================================================
    mse = mean_squared_error(y_val, preds)
    rmse = mse ** 0.5
    r2 = r2_score(y_val, preds)

    print("\n📊   MODEL PERFORMANCE")
    print(f"   MAE : {mae:.4f}")
    print(f"   RMSE: {rmse:.4f}")
    print(f"   R2  : {r2:.4f}\n")


    # =============================================================
    # STEP 11 — SAVE MODELS
    # =============================================================
    progress("STEP 11: SAVING MODELS & ARTIFACTS")

    with open(os.path.join(MODELS_DIR, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)

    with open(os.path.join(MODELS_DIR, "xgb.pkl"), "wb") as f:
        pickle.dump(xgb, f)

    with open(os.path.join(MODELS_DIR, "lgbm.pkl"), "wb") as f:
        pickle.dump(lgbm, f)

    with open(os.path.join(MODELS_DIR, "cat.pkl"), "wb") as f:
        pickle.dump(cat, f)

    with open(os.path.join(MODELS_DIR, "num_features.pkl"), "wb") as f:
        pickle.dump(list(X_num.columns), f)

    with open(os.path.join(MODELS_DIR, "cat_meta.pkl"), "wb") as f:
        pickle.dump(
            {"columns": list(X_cat_train.columns), "cat_features_idx": cat_features_idx},
            f,
        )

    print("\n✅ Training completed and all artifacts saved.\n")


if __name__ == "__main__":
    train_models()
