from datetime import datetime
from predict import predict_price

if __name__ == "__main__":
    sample = {
        "machine_type": "Tractor",
        "horsepower": 45,
        "age_years": 5,
        "hours_used": 300,
        "pincode": "641001",
        "maintenance_cost": 1200,
        "fuel_price": 95,
        # weather fields normally added by api.py – put dummy values here
        "temp": 30,
        "humidity": 60,
        "pressure": 1005,
        "wind_speed": 3,
        "rain": 0,
    }

    print("=== AgriRent – Manual Prediction Test ===")
    print("Input:", sample)

    price = predict_price(sample)
    print(f"\nPredicted hourly price: ₹{price:.2f}\n")
