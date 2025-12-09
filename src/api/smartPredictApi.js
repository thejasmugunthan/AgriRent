// src/api/smartPredictApi.js
import axios from "axios";

const ML_BASE_URL = "http://localhost:5001"; // FastAPI server

export function smartPredict(payload) {
  // payload should match SmartPredictRequest in api.py
  return axios.post(`${ML_BASE_URL}/smart_predict`, payload);
}
