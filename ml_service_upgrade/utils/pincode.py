import logging

logger = logging.getLogger("agri_service.pincode")

try:
    import pgeocode

    NOMI = pgeocode.Nominatim("in")
except Exception:
    NOMI = None
    logger.warning("pgeocode not available, using fallback mapping.")

FALLBACK = {
    "560001": {"place_name": "Bangalore", "state_name": "Karnataka"},
    "600001": {"place_name": "Chennai", "state_name": "Tamil Nadu"},
    "110001": {"place_name": "Delhi", "state_name": "Delhi"},
}


def pin_to_location(pin: str):
    """
    Convert pincode to (place_name, state_name) using pgeocode if available,
    otherwise use the fallback mapping.
    """
    pin = str(pin).strip()

    if NOMI:
        try:
            data = NOMI.query_postal_code(pin)
            place = getattr(data, "place_name", "") or ""
            state = getattr(data, "state_name", "") or ""
            return {"place_name": place, "state_name": state}
        except Exception:
            pass

    return FALLBACK.get(pin, {"place_name": "", "state_name": ""})
