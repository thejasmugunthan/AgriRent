// // src/api/machineApi.js

// import axios from "axios";
// import axiosClient from "./axiosClient";

// /* ============================================================
//    NODE BACKEND (http://localhost:5000/api)
// ============================================================ */

// // ⭐ Get ALL machines (for browsing)
// export const getMachines = () => axiosClient.get("/machines");

// // ⭐ Get machines ONLY for logged-in owner
// export const getOwnerMachines = (ownerId) =>
//   axiosClient.get(`/machines/owner/${ownerId}`);

// // ⭐ Add new machine
// export const addMachine = (formData) =>
//   axiosClient.post("/machines", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

// // ⭐ Delete machine
// export const deleteMachine = (id) =>
//   axiosClient.delete(`/machines/${id}`);

// // ⭐ Get machine by ID
// export const getMachineById = (id) =>
//   axiosClient.get(`/machines/${id}`);

// // ⭐ Rate a machine
// export const rateMachine = (machineId, data) =>
//   axiosClient.post(`/machines/rate-machine/${machineId}`, data);

// // ⭐ Create rental
// export const createRental = (payload) =>
//   axiosClient.post("/rentals", payload);


// /* ============================================================
//    FASTAPI ML SERVICE (http://localhost:5001/predict)
// ============================================================ */

// // ⭐ ML Price Prediction (FastAPI)
// export const predictPrice = (payload) =>
//   axios.post("http://localhost:5001/predict", payload);







// src/api/machineApi.js

import axios from "axios";
import axiosClient from "./axiosClient";

/* ============================================================
   NODE BACKEND (http://localhost:5000/api)
============================================================ */

// ⭐ Get ALL machines (for browsing)
export const getMachines = () => axiosClient.get("/machines");

// ⭐ Get machines ONLY for logged-in owner
export const getOwnerMachines = (ownerId) =>
  axiosClient.get(`/machines/owner/${ownerId}`);

// ⭐ Add new machine
export const addMachine = (formData) =>
  axiosClient.post("/machines", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ⭐ Delete machine
export const deleteMachine = (id) =>
  axiosClient.delete(`/machines/${id}`);

// ⭐ Get machine by ID
export const getMachineById = (id) =>
  axiosClient.get(`/machines/${id}`);

// ⭐ Rate a machine
export const rateMachine = (machineId, data) =>
  axiosClient.post(`/machines/rate-machine/${machineId}`, data);

// ⭐ Create rental
export const createRental = (payload) =>
  axiosClient.post("/rentals", payload);


/* ============================================================
   FASTAPI ML SERVICE (Category-wise Pricing)
   Base URL: http://127.0.0.1:8000
============================================================ */

// ⭐ Category-wise ML / Rule-based Price Prediction
// Usage from frontend:
// predictPrice("/predict/tractor", payload)
// predictPrice("/predict/harvester", payload)
// predictPrice("/predict/pump", payload)
// ...

export const predictPrice = (endpoint, payload) => {
  return axios.post(`http://127.0.0.1:8000${endpoint}`, payload);
};
