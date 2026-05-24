export const currentCarbon = {
  carbon_intensity: 437.65,
  status: "나쁨",
  renewable_ratio: 8.3,
  coal_ratio: 35.2,
  unit: "gCO2/kWh",
};

export const forecastData = {
  current: {
    carbon_intensity: 437.65,
    status: "나쁨",
    renewable_ratio: 8.3,
    coal_ratio: 35.2,
    unit: "gCO2/kWh",
  },
  forecast: [
    { time: "15:00", carbon_intensity: 390 },
    { time: "16:00", carbon_intensity: 340 },
    { time: "17:00", carbon_intensity: 300 },
    { time: "18:00", carbon_intensity: 480 },
    { time: "19:00", carbon_intensity: 520 },
    { time: "20:00", carbon_intensity: 510 },
    { time: "21:00", carbon_intensity: 460 },
    { time: "22:00", carbon_intensity: 400 },
    { time: "23:00", carbon_intensity: 360 },
    { time: "00:00", carbon_intensity: 320 },
    { time: "01:00", carbon_intensity: 290 },
    { time: "02:00", carbon_intensity: 270 },
  ],
};

export const recommendations = {
  items: [
    {
      appliance: "washer",
      appliance_kr: "세탁기",
      current_co2: 185,
      optimal_co2: 114,
      saving_percent: 38,
      optimal_time: "2026-05-20T01:00:00+09:00",
      message: "세탁기를 새벽 1시에 돌리면 CO₂ 71g 절감 가능합니다.",
    },
    {
      appliance: "dryer",
      appliance_kr: "건조기",
      current_co2: 312,
      optimal_co2: 205,
      saving_percent: 34,
      optimal_time: "2026-05-20T02:00:00+09:00",
      message: "건조기를 새벽 2시에 돌리면 CO₂ 107g 절감 가능합니다.",
    },
  ],

  agent_steps: [
    {
      step: 1,
      tool: "get_current_carbon_intensity",
      result: "현재 탄소강도: 412 gCO₂/kWh (high)",
    },
    {
      step: 2,
      tool: "get_forecast_24h",
      result: "12시간 예측 분석 완료, 최저 구간 새벽 1~3시 확인",
    },
    {
      step: 3,
      tool: "find_optimal_window",
      result: "최적 사용 시간대: 2026-05-20 01:00 ~ 03:00 (270 gCO₂/kWh)",
    },
    {
      step: 4,
      tool: "calculate_savings",
      result: "세탁기 기준 38% 절감 가능, 건조기 기준 34% 절감 가능",
    },
  ],
};
