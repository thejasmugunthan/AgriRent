import json
import joblib
import pandas as pd
from pathlib import Path
from model_utils import build_features

ROOT = Path(__file__).resolve().parent
MODELS = ROOT / "models"

def try_load(path):
    try: return joblib.load(path)
    except: return None

xgb_model = try_load(MODELS/"xgb_model.pkl")
cat_model = try_load(MODELS/"cat_model.pkl")
lgb_model = try_load(MODELS/"lgb_model.pkl")
scaler    = try_load(MODELS/"scaler.pkl")

try: feature_cols = json.loads((MODELS/"feature_cols.json").read_text())
except: feature_cols = None


def safe_numeric(df):
    for c in df.columns:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)
    return df


def predict_price(data: dict) -> float:

    df = pd.DataFrame([data])
    df = safe_numeric(df)

    df_fe = build_features(df)

    if feature_cols:
        for c in feature_cols:
            if c not in df_fe:
                df_fe[c] = 0
        df_fe = df_fe[feature_cols]

    if scaler:
        df_fe[df_fe.columns] = scaler.transform(df_fe[df_fe.columns])

    preds = []
    if xgb_model: preds.append(xgb_model.predict(df_fe)[0])
    if cat_model: preds.append(cat_model.predict(df_fe)[0])
    if lgb_model: preds.append(lgb_model.predict(df_fe)[0])

    if not preds: return 1500.0

    return sum(preds) / len(preds)
