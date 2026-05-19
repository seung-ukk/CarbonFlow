# Carbon API 명세서

### 실시간 탄소강도 및 24시간 예측 조회
- **URL:** `/carbon/intensity`
- **Method:** `GET`
- **Description:** 현재의 탄소 상태 등급과 프론트엔드 차트용 24시간 데이터 패키지 반환

- **Success Response (200 OK):**
```json
{
  "current": {
    "carbon_intensity": 437.65,
    "status": "나쁨",
    "unit": "gCO2/kWh"
  },
  "forecast": [
    { "time": "00:00", "carbon_intensity": 370.0 },
    { "time": "12:00", "carbon_intensity": 307.5 }
  ]
}