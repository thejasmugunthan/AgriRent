"""
Demand index computation logic.

We do NOT ask the user for demand_index.
Instead, we compute it from:
- booking pressure
- price trend
- season (month)
- weather temperature
"""

def compute_demand_index(data: dict, weather: dict) -> float:
    """
    Auto-calculates demand index using:
      40% booking pressure
      25% price trend
      20% season
      15% weather

    Output is typically in ~[0.5, 1.5].
    """

    # -------------------------------
    # 1. Booking Pressure Score
    # -------------------------------
    bookings = float(data.get("bookings_7d", 0))
    stock = float(data.get("stock_on_hand", 1))
    booking_pressure = (bookings + 1) / (stock + 1)

    # Normalize to ~0.5 – 1.5
    booking_pressure_score = min(1.5, max(0.5, 1 + (booking_pressure - 1) * 0.5))

    # -------------------------------
    # 2. Price Trend Score
    # -------------------------------
    old_p = float(data.get("old_rental_price", 0))
    last_p = float(data.get("last_year_price", 0))

    if last_p > 0:
        price_growth = (old_p - last_p) / (last_p + 1)
    else:
        price_growth = 0.0

    # Clamp impact to avoid extreme swings
    price_trend_score = 1 + max(-0.3, min(0.3, price_growth * 0.3))

    # -------------------------------
    # 3. Season Score
    # -------------------------------
    created_at = str(data.get("created_at", "2024-01-01"))

    try:
        month = int(created_at.split("-")[1])
    except Exception:
        month = 6  # default: monsoon-ish

    # Very simple agri season weighting
    if month in [11, 12, 1, 2]:
        # Rabi season – higher demand
        season_score = 1.2
    elif month in [6, 7, 8]:
        # Kharif / monsoon – moderate-high demand
        season_score = 1.1
    else:
        season_score = 1.0

    # -------------------------------
    # 4. Weather Score
    # -------------------------------
    temp = float(weather.get("temp", 28))
    # 1% change per degree from 25°C
    weather_score = 1 + (temp - 25) / 100.0

    # -------------------------------
    # Final Weighted Score
    # -------------------------------
    final = (
        0.40 * booking_pressure_score +
        0.25 * price_trend_score +
        0.20 * season_score +
        0.15 * weather_score
    )

    return round(final, 2)
