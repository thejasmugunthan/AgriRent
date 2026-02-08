def explain_prediction(model):
    rf = model.named_steps["rf"]
    idx = rf.feature_importances_.argsort()[::-1][:3]
    return [f"feature_{i}" for i in idx]
