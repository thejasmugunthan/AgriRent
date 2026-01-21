import pgeocode
import pandas as pd

_nom = pgeocode.Nominatim("IN")


def get_location_from_pincode(pincode: str) -> dict:
    try:
        res = _nom.query_postal_code(str(pincode))
        if res is None or pd.isna(res.latitude):
            return {"lat": None, "lng": None, "city": None, "state": None}
        return {
            "lat": float(res.latitude),
            "lng": float(res.longitude),
            "city": res.place_name,
            "state": res.state_name,
        }
    except Exception:
        return {"lat": None, "lng": None, "city": None, "state": None}
