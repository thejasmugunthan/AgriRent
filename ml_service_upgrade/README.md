
Agrirent ML Service - Upgraded (Phases 1-4)
==========================================

This upgraded project includes:
 - modular structure (api/, ml/, utils/, tests/)
 - improved preprocessing (winsorization, freq encoding)
 - scaler and artifacts saved in ml/models/
 - simple in-memory weather cache (utils/weather.py)
 - unit tests (pytest)
 - sample raw dataset (data/rentals_raw_150k.csv) - a 150k sample from your original 300k CSV

Files generated from your uploaded dataset: data/rentals_raw_150k.csv.

Quick commands
--------------

1) Create virtualenv and install:
   python -m venv venv
   source venv/bin/activate    # Windows: venv\Scripts\activate
   pip install -r requirements.txt

2) Train models (will create ml/models/ with artifacts):
   python -m ml.train

3) Run API:
   uvicorn api.service:app --reload --host 0.0.0.0 --port 8000

4) Run tests:
   pytest -q

Project layout
--------------
[
  "logging_config.py",
  "requirements.txt",
  "data/rentals_raw_150k.csv",
  "api/service.py",
  "ml/train.py",
  "ml/predict.py",
  "ml/preprocess/model_utils.py",
  "utils/pincode.py",
  "utils/weather.py",
  "tests/test_feature_engineering.py"
]
