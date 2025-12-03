import axiosClient from "./axiosClient";

// Get all machines
export const getMachines = () => axiosClient.get("/machines");

// Add machine
export const addMachine = (formData) =>
  axiosClient.post("/machines", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete machine
export const deleteMachine = (id) => axiosClient.delete(`/machines/${id}`);

// ML price prediction
export const predictPrice = (payload) =>
  axiosClient.post("/predict", payload);

// ⭐ Get single machine by ID (needed for rating page)
export const getMachineById = (id) =>
  axiosClient.get(`/machines/${id}`);

// ⭐ Rate a machine (rating API fix)
export const rateMachine = (machineId, data) =>
  axiosClient.post(`/machines/rate-machine/${machineId}`, data);
