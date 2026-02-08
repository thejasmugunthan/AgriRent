import pandas as pd, os
if not os.path.exists("logs/requests.csv"):
    raise SystemExit("No logs found")
df = pd.read_csv("logs/requests.csv")
df.to_csv("retrain/combined_data.csv", index=False)
print("Retraining dataset prepared")
