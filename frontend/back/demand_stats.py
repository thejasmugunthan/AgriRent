import os
import pickle

MODELS_DIR = "models"
DEMAND_FILE = os.path.join(MODELS_DIR, "demand_stats.pkl")


def load_demand_stats():
    if not os.path.exists(DEMAND_FILE):
        return {"by_type": {}, "global": {}}
    with open(DEMAND_FILE, "rb") as f:
        return pickle.load(f)


def estimate_demand_fields(machine_type: str):
    stats = load_demand_stats()
    by_type = stats.get("by_type", {})
    global_stats = stats.get("global", {})

    type_stats = by_type.get(machine_type, {}) or {}

    def _get(field: str, default: float = 0.0) -> float:
        v = type_stats.get(field)
        if v is None:
            v = global_stats.get(field, default)
        if v is None:
            v = default
        return float(v)

    return {
        "old_rental_price": _get("old_rental_price", 0.0),
        "last_year_price": _get("last_year_price", 0.0),
        "bookings_7d": _get("bookings_7d", 0.0),
        "stock_on_hand": _get("stock_on_hand", 0.0),
        "market_trend_score": _get("market_trend_score", 0.0),
    }
