import requests
import time

WEATHER_API_KEY = "167d3e864a478dd049344cd10f6a54f9"
API_BASE = "https://api.openweathermap.org/data/2.5/weather"

_WEATHER_CACHE = {}


def _fetch_weather(pin: str):
    try:
        url = f"{API_BASE}?zip={pin},IN&appid={WEATHER_API_KEY}&units=metric"
        resp = requests.get(url, timeout=5)
        data = resp.json()

        if "main" not in data:
            return {"invalid_pin": True}

        return {
            "temp": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "wind": data.get("wind", {}).get("speed", 0),
            "rain": data.get("rain", {}).get("1h", 0),
            "api_used": True,
        }
    except Exception:
        return {"invalid_pin": True}


def get_weather_for_pincode(pin: str):
    """
    Get weather info for a given pincode.
    Uses a simple in-memory cache to avoid repeated API hits.
    Falls back to a default weather if invalid pin or error.
    """
    pin = str(pin)
    if pin in _WEATHER_CACHE:
        return _WEATHER_CACHE[pin]

    w = _fetch_weather(pin)

    if w.get("invalid_pin"):
        # Fallback default
        w = {
            "temp": 28,
            "humidity": 65,
            "wind": 3,
            "rain": 0,
            "invalid_pin": True,
        }

    _WEATHER_CACHE[pin] = w
    # Tiny sleep to be polite to the API when batch processing
    time.sleep(0.20)
    return w


def clear_caches():
    _WEATHER_CACHE.clear()
