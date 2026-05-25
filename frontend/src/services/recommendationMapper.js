const DEFAULT_UNIT_INTENSITY = 0;

export const fallbackAppliances = [
  {
    id: "washing_machine",
    name: "세탁기",
    category: "세탁가전",
    power_consumption_w: 500,
    duration_hours: 1.5,
    energy_rating: 1,
    is_eco_friendly: true,
  },
  {
    id: "clothes_dryer",
    name: "건조기",
    category: "세탁가전",
    power_consumption_w: 2000,
    duration_hours: 2,
    energy_rating: 3,
    is_eco_friendly: false,
  },
  {
    id: "dishwasher",
    name: "식기세척기",
    category: "주방가전",
    power_consumption_w: 1500,
    duration_hours: 1,
    energy_rating: 2,
    is_eco_friendly: true,
  },
];

export const getApplianceLabel = (appliances = [], id) =>
  appliances.find((appliance) => appliance.id === id)?.name ?? id;

const round = (value) => Math.round(Number(value) || 0);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getRecommendationTimeIso = (time) => {
  const value = String(time ?? "").trim();
  if (value.includes("T") && !Number.isNaN(new Date(value).getTime())) {
    return value;
  }

  const [hour = "0", minute = "0"] = String(value || "00:00").split(":");
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour.padStart(2, "0")}:${minute.padStart(
    2,
    "0"
  )}:00+09:00`;
};

export const normalizeReasoningLogs = (logs = []) =>
  (Array.isArray(logs) ? logs : []).map((log, index) => ({
    step: log.step ?? index + 1,
    tool: log.title ?? "Agent reasoning",
    result: log.content ?? "",
  }));

export const normalizeAgentRecommendation = ({
  appliance,
  currentCarbon,
  recommendation,
}) => {
  const targetAppliance = appliance ?? {};
  const carbonIntensity =
    currentCarbon?.carbon_intensity ?? DEFAULT_UNIT_INTENSITY;
  const currentCo2 =
    (Number(carbonIntensity) *
      Number(targetAppliance.power_consumption_w ?? 0) *
      Number(targetAppliance.duration_hours ?? 0)) /
    1000;
  const savedCo2 = Number(recommendation?.carbon_saved_g ?? 0);
  const optimalCo2 = Math.max(currentCo2 - savedCo2, 0);
  const savingPercent =
    currentCo2 > 0 ? clamp((savedCo2 / currentCo2) * 100, 0, 100) : 0;

  return {
    appliance: targetAppliance.id ?? "unknown",
    appliance_kr: targetAppliance.name ?? "가전제품",
    current_co2: round(currentCo2),
    optimal_co2: round(optimalCo2),
    saving_percent: round(savingPercent),
    optimal_time: getRecommendationTimeIso(recommendation?.recommended_time),
    message:
      recommendation?.agent_response ??
      `${targetAppliance.name ?? "가전제품"}의 최적 사용 시간을 확인했습니다.`,
  };
};
