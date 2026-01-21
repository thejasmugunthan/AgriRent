from train import train_models

if __name__ == "__main__":
    # Simple wrapper so you can schedule `python retrain.py` via cron/task scheduler
    train_models()
