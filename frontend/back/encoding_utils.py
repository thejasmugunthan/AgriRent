import pandas as pd
import numpy as np
from sklearn.model_selection import KFold
import pickle
import os

MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)


def _safe_splits(n_samples: int, desired: int = 5) -> int:
    if n_samples <= 1:
        return 1
    return min(desired, n_samples)


def target_encode(series: pd.Series, target: pd.Series, n_splits: int = 5):
    df = pd.DataFrame({"cat": series, "y": target})
    n_samples = len(df)
    n_splits = _safe_splits(n_samples, n_splits)

    global_median = float(target.median())

    if n_splits <= 1:
        enc_series = pd.Series(global_median, index=series.index)
        final_dict = df.groupby("cat")["y"].median().to_dict()
        return enc_series.values, final_dict, global_median

    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)

    encoded = pd.Series(np.zeros(n_samples), index=series.index)

    for tr_idx, val_idx in kf.split(df):
        train_fold = df.iloc[tr_idx]
        val_fold = df.iloc[val_idx]
        means = train_fold.groupby("cat")["y"].median()
        encoded.iloc[val_idx] = val_fold["cat"].map(means)

    encoded = encoded.fillna(global_median)
    final_dict = df.groupby("cat")["y"].median().to_dict()

    return encoded.values, final_dict, global_median


def hybrid_encode(series: pd.Series, target: pd.Series):
    freq = series.value_counts().to_dict()
    freq_encoded = series.map(freq).fillna(0)

    target_encoded, te_dict, global_median = target_encode(series, target)
    hybrid = 0.5 * freq_encoded + 0.5 * target_encoded

    return hybrid.values, freq, te_dict, global_median


def save_encoder(name: str, payload: dict):
    path = os.path.join(MODELS_DIR, name)
    with open(path, "wb") as f:
        pickle.dump(payload, f)
