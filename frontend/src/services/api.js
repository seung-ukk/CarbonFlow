import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const SHOW_API_ERRORS = true;
export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

const unwrap = (response) => response.data?.data ?? response.data;

const createApiDataError = (message) => {
  const error = new Error(message);
  error.response = { data: { message } };
  return error;
};

const unwrapRequiredData = (response, fallbackMessage) => {
  if (
    response.data &&
    Object.prototype.hasOwnProperty.call(response.data, "data")
  ) {
    if (response.data.data == null) {
      throw createApiDataError(response.data.message ?? fallbackMessage);
    }

    return response.data.data;
  }

  return unwrap(response);
};

const LEVEL_STATUS_MAP = {
  low: "좋음",
  medium: "보통",
  high: "나쁨",
  좋음: "좋음",
  보통: "보통",
  나쁨: "나쁨",
};

const formatHour = (value) => {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return `${date.getHours().toString().padStart(2, "0")}:00`;
  }

  const match = String(value ?? "").match(/T(\d{2}):/);
  return match ? `${match[1]}:00` : "";
};

const normalizeCurrentCarbon = (data = {}) => {
  const level = data?.level ?? data?.status ?? "medium";

  return {
    ...data,
    carbon_intensity: Number(data?.carbon_intensity ?? 0),
    level,
    status: LEVEL_STATUS_MAP[level] ?? "보통",
    unit: data?.unit ?? "gCO2/kWh",
  };
};

const normalizeForecast = (data = {}) => ({
  ...data,
  best_window: data?.best_window ?? null,
  forecast: Array.isArray(data?.forecasts)
    ? data.forecasts.map((item) => ({
        ...item,
        time: formatHour(item.hour),
      }))
    : [],
});

export const getApiErrorMessage = (error, fallback) =>
  error.response?.data?.message ?? fallback;

export const getCurrentCarbon = async () =>
  normalizeCurrentCarbon(
    unwrapRequiredData(
      await api.get("/api/carbon/current"),
      "현재 탄소강도 데이터를 불러오지 못했습니다."
    )
  );

export const getForecast = async () =>
  normalizeForecast(
    unwrapRequiredData(
      await api.get("/api/carbon/forecast"),
      "12시간 예측 데이터를 불러오지 못했습니다."
    )
  );

export const getAppliances = async () => unwrap(await api.get("/api/appliances"));

export const getAgentRecommendation = async (applianceId) =>
  unwrap(
    await api.post("/api/agent/chat", null, {
      params: { appliance_id: applianceId },
    })
  );

export const sendChatMessage = async (applianceId, message) =>
  unwrap(
    await api.post("/api/agent/chat", null, {
      params: { appliance_id: applianceId, message },
    })
  );
export const login = async ({ id, password }) =>
  unwrap(await api.post("/login", { id, password }));

export const register = async ({ username, email, password }) => {
  const response = await api.post("/api/auth/register", { username, email, password });
  return response.data;
};

export default api;
