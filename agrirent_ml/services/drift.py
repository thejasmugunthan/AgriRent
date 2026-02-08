import json, os
def detect_drift(features, threshold=0.35):
    if not os.path.exists("ml/training_stats.json"): return False
    with open("ml/training_stats.json") as f: s = json.load(f)
    hp = abs(features["horsepower"]-s["horsepower_mean"])/s["horsepower_mean"]
    hrs = abs(features["hours_used"]-s["hours_used_mean"])/s["hours_used_mean"]
    return hp>threshold or hrs>threshold
