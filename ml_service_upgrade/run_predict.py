import json
from predict import predict_price
from utils.weather import get_weather_for_pincode
from utils.demand import compute_demand_index

data = {
    "pincode": "560001",
    "machine_type": "TRACTOR",
    "horsepower": 45,
    "hours_used": 300,
    "age_years": 4,
    "maintenance_cost": 12000,
    "fuel_price": 95,
    "duration_days": 5,
    "advance_days": 2,
    "weekend": 1,
    "old_rental_price": 1500,
    "last_year_price": 1700,
    "hours_per_day": 6,
    "created_at": "2024-01-01",
    "bookings_7d": 14,
    "cancellations_7d": 1,
    "stock_on_hand": 20,
    "rental_price": 1600,
}

weather = get_weather_for_pincode(data["pincode"])
data["demand_index"] = compute_demand_index(data, weather)

predicted = predict_price(data)

print("\n===================================")
print("🔧 RENTAL PRICE PREDICTION (AgriRent CLI)")
print("===================================\n")

print("🌦 WEATHER REPORT")
print("-----------------------------------")
print(f"📍 Pincode:            {data['pincode']}")
print(f"🌡  Temperature:        {weather['temp']} °C")
print(f"💧 Humidity:            {weather['humidity']} %")
print(f"💨 Wind Speed:          {weather['wind']} m/s")
print(f"🌧  Rain (1h):           {weather['rain']} mm")
print("-----------------------------------\n")

print("📦 INPUT SUMMARY")
print("-----------------------------------")
print(f"🚜 Machine Type:       {data['machine_type']}")
print(f"⏱  Duration (days):    {data['duration_days']}")
print(f"📈 Auto Demand Index:  {data['demand_index']}")
print("-----------------------------------\n")

print("💰 PRICE ANALYSIS")
print("-----------------------------------")
print(f"🤖 Predicted Price:    ₹{predicted:.2f}")
print("-----------------------------------")
print("\n===================================\n")
