import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const SHOW_API_ERRORS = false;
export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

const unwrap = (response) => response.data?.data ?? response.data;

export const getApiErrorMessage = (error, fallback) =>
  error.response?.data?.message ?? fallback;

export const getCurrentCarbon = async () => unwrap(await api.get("/api/carbon/current"));
export const getForecast = async () => unwrap(await api.get("/api/carbon/forecast"));
export const getRecommendations = async () =>
  unwrap(await api.get("/api/carbon/recommendations"));
export const getAppliances = async () => unwrap(await api.get("/appliances"));
export const login = async ({ userId, password }) =>
  unwrap(await api.post("/login", { id: userId, password }));

export default api;
