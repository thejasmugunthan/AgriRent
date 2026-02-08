import csv, os
from datetime import datetime
LOG_FILE = "logs/requests.csv"
os.makedirs("logs", exist_ok=True)
def log_request(features, price, demand):
    exists = os.path.exists(LOG_FILE)
    with open(LOG_FILE,"a",newline="") as f:
        w = csv.writer(f)
        if not exists:
            w.writerow(["timestamp","machine_type","region","month","horsepower","age_years","hours_used","fuel_price","demand_multiplier","price"])
        w.writerow([datetime.now().isoformat(),features["machine_type"],features["region"],features["month"],features["horsepower"],features["age_years"],features["hours_used"],features["fuel_price"],demand,price])
