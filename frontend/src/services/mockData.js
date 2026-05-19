export const currentCarbon = {
  updated_at: "2026-05-19T14:30:00+09:00",
  carbon_intensity: 412,
  level: "high",
  renewable_ratio: 8.3,
  coal_ratio: 35.2,
};

export const forecastData = {
  best_window: {
    start: "2026-05-20T01:00:00+09:00",
    end: "2026-05-20T03:00:00+09:00",
  },

  forecasts: [
    { hour: "2026-05-19T15:00:00+09:00", carbon_intensity: 390, level: "medium" },
    { hour: "2026-05-19T16:00:00+09:00", carbon_intensity: 340, level: "medium" },
    { hour: "2026-05-19T17:00:00+09:00", carbon_intensity: 300, level: "medium" },
    { hour: "2026-05-19T18:00:00+09:00", carbon_intensity: 480, level: "high" },
    { hour: "2026-05-19T19:00:00+09:00", carbon_intensity: 520, level: "high" },
    { hour: "2026-05-19T20:00:00+09:00", carbon_intensity: 510, level: "high" },
    { hour: "2026-05-19T21:00:00+09:00", carbon_intensity: 460, level: "high" },
    { hour: "2026-05-19T22:00:00+09:00", carbon_intensity: 400, level: "medium" },
    { hour: "2026-05-19T23:00:00+09:00", carbon_intensity: 360, level: "medium" },
    { hour: "2026-05-20T00:00:00+09:00", carbon_intensity: 320, level: "medium" },
    { hour: "2026-05-20T01:00:00+09:00", carbon_intensity: 290, level: "low" },
    { hour: "2026-05-20T02:00:00+09:00", carbon_intensity: 270, level: "low" },
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
  ],

  agent_steps: [
    {
      step: 1,
      tool: "get_current_carbon_intensity",
      result: "현재 탄소강도: 412 gCO2/kWh (high)",
    },
  ],
};