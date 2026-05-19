// 현재 탄소강도
export const currentCarbon = {
  carbon_intensity: 412,
  level: "high",
  renewable_ratio: 8.3,
  coal_ratio: 35.2,
  updated_at: "14:30",
};

// 12시간 예측
export const forecastData = {
  forecasts: [
    { hour: "15:00", carbon_intensity: 390, level: "medium" },
    { hour: "16:00", carbon_intensity: 340, level: "medium" },
    { hour: "17:00", carbon_intensity: 300, level: "medium" },
    { hour: "18:00", carbon_intensity: 480, level: "high" },
    { hour: "19:00", carbon_intensity: 520, level: "high" },
    { hour: "20:00", carbon_intensity: 510, level: "high" },
    { hour: "21:00", carbon_intensity: 460, level: "high" },
    { hour: "22:00", carbon_intensity: 400, level: "medium" },
    { hour: "23:00", carbon_intensity: 360, level: "medium" },
    { hour: "00:00", carbon_intensity: 320, level: "medium" },
    { hour: "01:00", carbon_intensity: 290, level: "low" },
    { hour: "02:00", carbon_intensity: 270, level: "low" },
  ],

  best_window: {
    start: "01:00",
    end: "03:00",
  },
};

// 추천 결과
export const recommendations = {
  recommendations: [
    {
      appliance: "washer",
      appliance_kr: "세탁기",
      current_co2: 185,
      optimal_co2: 114,
      saving_percent: 38,
      optimal_time: "01:00",
      message:
        "세탁기를 새벽 1시에 돌리면 CO₂ 71g 절감 가능합니다.",
    },

    {
      appliance: "ev_charger",
      appliance_kr: "전기차 충전기",
      current_co2: 1030,
      optimal_co2: 635,
      saving_percent: 38,
      optimal_time: "01:00",
      message:
        "전기차 충전을 새벽 1시로 예약하면 CO₂ 395g 절감 가능합니다.",
    },
  ],

  agent_steps: [
    {
      step: 1,
      tool: "get_current_carbon_intensity",
      result: "현재 탄소강도: 412 gCO2/kWh (high)",
    },

    {
      step: 2,
      tool: "forecast_carbon_curve",
      result: "새벽 1~3시 최저 270 gCO2/kWh 예측",
    },

    {
      step: 3,
      tool: "calculate_appliance_emission",
      result: "세탁기 1회 0.45kWh / 전기차 충전 2.5kWh",
    },

    {
      step: 4,
      tool: "find_optimal_window",
      result: "01:00~03:00 최적 구간 확인",
    },

    {
      step: 5,
      tool: "generate_recommendation",
      result: "추천 메시지 생성 완료",
    },
  ],
};