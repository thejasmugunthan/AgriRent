# seasonal_demand.py
import os
import pickle
from datetime import datetime
import pandas as pd

MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)


def _parse_month(value) -> int | None:
    """
    Robust month extractor from date-like values.
    Expects formats like 'YYYY-MM-DD'. Returns int 1–12 or None.
    """
    if value is None:
        return None

    s = str(value).strip()
    # Try fast split on '-'
    try:
        parts = s.split("-")
        if len(parts) >= 2:
            m = int(parts[1])
            if 1 <= m <= 12:
                return m
    except Exception:
        pass

    # Fallback: use datetime parser
    try:
        dt = datetime.fromisoformat(s)
        return dt.month
    except Exception:
        return None


def build_seasonal_stats(df: pd.DataFrame) -> None:
    """
    Build median rental_price per (machine_type, month) and per month.
    Saved to models/seasonal_stats.pkl as:

    {
      "by_type": { "Tractor": {1: 1200.0, 2: 1300.0, ...}, ... },
      "by_month": {1: 1150.0, 2: 1180.0, ...},
      "global_median": 1250.0
    }
    """
    df = df.copy()

    if "rental_price" not in df.columns:
        payload = {"by_type": {}, "by_month": {}, "global_median": 0.0}
        with open(os.path.join(MODELS_DIR, "seasonal_stats.pkl"), "wb") as f:
            pickle.dump(payload, f)
        return

    # If no created_at, we can only do global median
    if "created_at" not in df.columns:
        global_med = float(pd.to_numeric(df["rental_price"], errors="coerce").median())
        payload = {"by_type": {}, "by_month": {}, "global_median": global_med}
        with open(os.path.join(MODELS_DIR, "seasonal_stats.pkl"), "wb") as f:
            pickle.dump(payload, f)
        return

    df["month"] = df["created_at"].apply(_parse_month)
    df = df.dropna(subset=["month"])
    if df.empty:
        global_med = float(pd.to_numeric(df["rental_price"], errors="coerce").median())
        payload = {"by_type": {}, "by_month": {}, "global_median": global_med}
        with open(os.path.join(MODELS_DIR, "seasonal_stats.pkl"), "wb") as f:
            pickle.dump(payload, f)
        return

    df["month"] = df["month"].astype(int)

    # Ensure numeric rental_price
    df["rental_price"] = pd.to_numeric(df["rental_price"], errors="coerce")
    df = df.dropna(subset=["rental_price"])
    if df.empty:
        payload = {"by_type": {}, "by_month": {}, "global_median": 0.0}
        with open(os.path.join(MODELS_DIR, "seasonal_stats.pkl"), "wb") as f:
            pickle.dump(payload, f)
        return

    global_median = float(df["rental_price"].median())

    # Median per (machine_type, month)
    by_type: dict[str, dict[int, float]] = {}
    grouped = df.groupby(["machine_type", "month"])["rental_price"].median()
    for (mtype, month), val in grouped.items():
        by_type.setdefault(str(mtype), {})[int(month)] = float(val)

    # Median per month (ignore machine type)
    by_month_raw = df.groupby("month")["rental_price"].median().to_dict()
    by_month = {int(k): float(v) for k, v in by_month_raw.items()}

    payload = {
        "by_type": by_type,
        "by_month": by_month,
        "global_median": global_median,
    }

    with open(os.path.join(MODELS_DIR, "seasonal_stats.pkl"), "wb") as f:
        pickle.dump(payload, f)


def _load_seasonal_stats() -> dict:
    path = os.path.join(MODELS_DIR, "seasonal_stats.pkl")
    if not os.path.exists(path):
        return {"by_type": {}, "by_month": {}, "global_median": 0.0}
    with open(path, "rb") as f:
        obj = pickle.load(f)
    # Ensure keys exist
    return {
        "by_type": obj.get("by_type", {}),
        "by_month": obj.get("by_month", {}),
        "global_median": float(obj.get("global_median", 0.0) or 0.0),
    }


def estimate_seasonal_features(machine_type: str, created_at: str) -> dict:
    """
    At prediction-time: given machine_type + created_at,
    return season-aware features:

    {
      "seasonal_demand_score": float in ~[0.5, 1.5],
      "season_month": 1-12,
      "is_peak_season": 0/1,
      "is_off_season": 0/1,
    }
    """
    stats = _load_seasonal_stats()
    by_type = stats.get("by_type", {})
    by_month = stats.get("by_month", {})
    g = stats.get("global_median", 0.0) or 1.0  # avoid division by zero

    month = _parse_month(created_at) or 6  # default to June if parse fails

    base = None
    mtype = str(machine_type)

    if mtype in by_type and month in by_type[mtype]:
        base = by_type[mtype][month]
    elif month in by_month:
        base = by_month[month]
    else:
        base = g

    # Convert to factor vs global median
    score = float(base) / float(g)
    # Clamp between 0.5 and 1.5 to avoid crazy ratios
    score = max(0.5, min(1.5, score))

    is_peak = 1 if score > 1.1 else 0
    is_off = 1 if score < 0.9 else 0

    return {
        "seasonal_demand_score": score,
        "season_month": int(month),
        "is_peak_season": int(is_peak),
        "is_off_season": int(is_off),
    }
