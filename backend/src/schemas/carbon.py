# src/schemas/carbon.py
from pydantic import BaseModel, Field
from typing import List

class CurrentCarbonResponse(BaseModel):
    carbon_intensity: float = Field(..., description="현재 기상청 실황 날씨 버프가 반영된 실시간 탄소강도 (gCO2/kWh)", example=320.5)
    status: str = Field(..., description="탄소 효율 등급 (좋음/보통/나쁨)", example="좋음")
    unit: str = Field("gCO2/kWh", description="데이터 단위", example="gCO2/kWh")

class ForecastItem(BaseModel):
    time: str = Field(..., description="예측 타임라인 시간대 (현재 시각 기준 동적 정렬)", example="15:00")
    carbon_intensity: float = Field(..., description="해당 시간대의 예상 탄소강도 수치", example=307.5)

class CarbonIntensityResponse(BaseModel):
    current: CurrentCarbonResponse = Field(..., description="현재 실시간 탄소 데이터")
    forecast: List[ForecastItem] = Field(..., description="향후 24시간 예측 추이 데이터 리스트")