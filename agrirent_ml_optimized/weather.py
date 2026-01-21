import os
import requests
from logging_config import get_logger

logger = get_logger("weather")

API_KEY = os.getenv("OPENWEATHER_KEY", "167d3e864a478dd049344cd10f6a54f9")


def get_weather(lat: float | None, lon: float | None) -> dict:
    if lat is None or lon is None or not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
        logger.warning("Weather skipped: missing coords or API key")
        return {}

    try:
        url = (
            "https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        )
        r = requests.get(url, timeout=5)
        if r.status_code != 200:
            logger.warning(f"Weather API failed: {r.status_code}")
            return {}
        return r.json()
    except Exception as e:
        logger.warning(f"Weather API error: {e}")
        return {}
