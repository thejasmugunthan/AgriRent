from datetime import datetime
def get_weather_factor(): return 1.1
def get_fuel_price(): return 95.0
def build_features(machine_type, region):
    return {
        "machine_type": machine_type,
        "region": region,
        "month": str(datetime.now().month),
        "fuel_price": get_fuel_price(),
        "weather_factor": get_weather_factor()
    }
