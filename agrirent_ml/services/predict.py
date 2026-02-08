import joblib, pandas as pd, numpy as np
from services.logger import log_request
from services.drift import detect_drift
from services.explain import explain_prediction

price_model = joblib.load("ml/price_model.joblib")
demand_model = joblib.load("ml/demand_model.joblib")

def predict_price(features):
    demand = demand_model.predict(pd.DataFrame([features])[["machine_type","region","month"]])[0]
    features["demand_multiplier"] = demand
    X = price_model.named_steps["prep"].transform(pd.DataFrame([features]))
    trees = price_model.named_steps["rf"].estimators_
    preds = [np.expm1(t.predict(X)[0]) for t in trees]
    price = np.mean(preds) * features["weather_factor"]
    low, high = np.percentile(preds,[10,90])
    log_request(features, price, demand)
    return round(price,2), round(low,2), round(high,2), demand, detect_drift(features), explain_prediction(price_model)
