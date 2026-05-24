# src/schemas/carbon.py

from pydantic import BaseModel, Field
from typing import List, Optional

# --- [공통] 모든 API 응답의 표준 겉포장 규격 ---
class CommonResponse(BaseModel):
    status: int = Field(..., description="HTTP 상태 코드 규칙", example=200)
    message: str = Field(..., description="응답 메시지", example="조회 성공")

# =========================================================================
# 1.GET /api/carbon/current 전용 데이터 스키마
# =========================================================================
class CurrentCarbonData(BaseModel):
    updated_at: str = Field(..., description="마지막 업데이트 시각 (ISO 8601 포맷)", example="2026-05-24T12:00:00+09:00")
    carbon_intensity: float = Field(..., description="현재 기상청 날씨 연동 탄소강도 (gCO2/kWh)", example=412.0)
    level: str = Field(..., description="탄소 배출 등급 (low / medium / high)", example="high")
    renewable_ratio: float = Field(..., description="현재 전력망 신재생에너지 발전 비중 %", example=8.3)
    coal_ratio: float = Field(..., description="현재 전력망 석탄 화력발전 비중 %", example=35.2)

class CurrentCarbonResponse(CommonResponse):
    data: Optional[CurrentCarbonData] = None


# =========================================================================
# 2.GET /api/carbon/forecast 전용 데이터 스키마
# =========================================================================
class BestWindow(BaseModel):
    # 프론트엔드가 차트 내부 강조 처리를 위해 요구한 가장 친환경적인 구간 시간값
    start: str = Field(..., description="최적 구간 시작 시각 (ISO 8601)", example="2026-05-24T01:00:00+09:00")
    end: str = Field(..., description="최적 구간 종료 시각 (ISO 8601)", example="2026-05-24T03:00:00+09:00")

class ForecastItem(BaseModel):
    hour: str = Field(..., description="예측 대상 시각 (ISO 8601)", example="2026-05-24T15:00:00+09:00")
    carbon_intensity: float = Field(..., description="해당 시간대의 예상 탄소강도 수치", example=390.0)
    level: str = Field(..., description="해당 시간대의 탄소 배출 등급 (low / medium / high)", example="medium")

class ForecastData(BaseModel):
    best_window: BestWindow = Field(..., description="차트 시각화용 최적 가동 시간대 정보")
    forecasts: List[ForecastItem] = Field(..., description="12시간 탄소 예측 곡선 데이터 배열")

class ForecastCarbonResponse(CommonResponse):
    data: Optional[ForecastData] = None