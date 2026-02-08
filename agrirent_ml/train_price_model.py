# train_price_model.py

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor

# Setup
os.makedirs("ml", exist_ok=True)

# Load dataset
df = pd.read_csv("retrain/combined_data.csv", low_memory=False)


# Feature groups
CATEGORICAL = [
    "machine_type",
    "season",
    "price_type",
    "pump_type",
    "trailer_type",
    "weeder_type",
    "state"
]

NUMERIC = [
    "horsepower",
    "diesel_price",
    "electricity_tariff",
    "rainfall_mm",
    "temperature_c",
    "water_scarcity_index",
    "road_quality_index"
]


# Data cleanup
df[CATEGORICAL] = df[CATEGORICAL].astype(str)
df[NUMERIC] = df[NUMERIC].fillna(df[NUMERIC].median())

# Split
X = df[CATEGORICAL + NUMERIC]
y = np.log1p(df["rental_price"])  # log transform

# Preprocessing
preprocess = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
    ("num", StandardScaler(), NUMERIC)
])

# Model
model = Pipeline([
    ("prep", preprocess),
    ("rf", RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1
    ))
])

# Train
Xtr, Xte, ytr, yte = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model.fit(Xtr, ytr)

# Save model
joblib.dump(model, "ml/price_model.joblib")


# Save training stats (for drift detection)
stats = {
    "horsepower_mean": float(df["horsepower"].mean()),
    "diesel_price_mean": float(df["diesel_price"].mean()),
    "rainfall_mean": float(df["rainfall_mm"].mean())
}

with open("ml/training_stats.json", "w") as f:
    json.dump(stats, f, indent=2)

print("✅ Price model trained successfully")
