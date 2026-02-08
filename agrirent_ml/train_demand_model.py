# train_demand_model.py

import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier

# Setup
os.makedirs("ml", exist_ok=True)

# Load dataset
df = pd.read_csv("retrain/combined_data.csv", low_memory=False)

# Features & Target
X = df[[
    "machine_type",
    "state",
    "season"
]].astype(str)

y = df["demand_signal"].astype(str)


# Preprocessing
preprocess = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), X.columns)
])


# Model
model = Pipeline([
    ("prep", preprocess),
    ("rf", RandomForestClassifier(
        n_estimators=150,
        max_depth=15,
        random_state=42
    ))
])

# Train
Xtr, Xte, ytr, yte = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model.fit(Xtr, ytr)


# Save
joblib.dump(model, "ml/demand_model.joblib")

print("✅ Demand model trained successfully")
