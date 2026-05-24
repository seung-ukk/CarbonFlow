# src/api/endpoints.py
from fastapi import APIRouter, Depends, HTTPException
import aiosqlite
from typing import List
from datetime import datetime, timedelta

from src.database.connection import get_db, JSONDatabase
from src.schemas.appliance import ApplianceSchema
from src.carbon.calculator import CarbonCalculator
from src.schemas.carbon import CurrentCarbonResponse, ForecastCarbonResponse

router = APIRouter()

# =========================================================================
# [1] 가전 도메인 API
# =========================================================================
@router.get("/appliances", response_model=List[ApplianceSchema], tags=["Appliances"])
def get_all_appliances():
    return JSONDatabase.read_appliances()

@router.get("/appliances/{appliance_id}", response_model=ApplianceSchema, tags=["Appliances"])
def get_appliance(appliance_id: str):
    try:
        return JSONDatabase.get_appliance_by_id(appliance_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# =========================================================================
# [2] 탄소강도 도메인 API (명세서 일치화 리팩터링 완전체 🔄)
# =========================================================================
@router.get(
    "/carbon/current", 
    response_model=CurrentCarbonResponse,
    tags=["Carbon"],
    summary="현재 실시간 탄소 지수 조회"
)
async def get_current_carbon_intensity(db: aiosqlite.Connection = Depends(get_db)):
    # 변수를 두어 명확하게 표현
    raw_current = CarbonCalculator.get_current_carbon_intensity()
    intensity = raw_current["carbon_intensity"]
    level = raw_current["level"]
    now_iso = datetime.now().strftime("%Y-%m-%dT%H:%M:00+09:00")

    return {
        "status": 200,
        "message": "현재 카본 강도 조회 성공",
        "data": {
            "updated_at": now_iso,
            "carbon_intensity": intensity,
            "level": level,
            "renewable_ratio": 14.5 if level == "low" else 6.2,
            "coal_ratio": 28.1 if level == "low" else 41.5
        }
    }

@router.get(
    "/carbon/forecast", 
    response_model=ForecastCarbonResponse,
    tags=["Carbon"],
    summary="향후 예측 탄소 곡선 조회"
)
async def get_carbon_forecast(db: aiosqlite.Connection = Depends(get_db)):
    # 1. 변수를 두어 전체 예측 곡선을 먼저 확보합니다.
    raw_forecast = CarbonCalculator.forecast_carbon_curve()
    
    # 2. [리팩터링] 복잡한 계산식 대신, 완벽하게 격리 분리된 핵심 함수를 깔끔하게 호출합니다.
    best_window_data = CarbonCalculator.find_optimal_window(raw_forecast)

    return {
        "status": 200,
        "message": "12시간 예측 조회 성공",
        "data": {
            "best_window": best_window_data,          # 분리된 함수 결과 대입
            "forecasts": raw_forecast[:12]           # 명세서 기준 앞 12시간 분량만 슬라이싱
        }
    }


# =========================================================================
# [3] AI 에이전트 도메인 API (임시 테스트용 가짜 데이터 버전)
# =========================================================================
@router.post("/agent/chat", tags=["Agent"])
async def chat_with_eco_agent(appliance_id: str, db: aiosqlite.Connection = Depends(get_db)):
    try:
        appliance = JSONDatabase.get_appliance_by_id(appliance_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
        
    return {
        "recommended_time": "22:00",
        "carbon_saved_g": 142.5,
        "reasoning_logs": [
            {"step": 1, "title": "가전 분석", "content": f"{appliance['name']} 분석 완료"},
            {"step": 2, "title": "탄소 대조", "content": "22시 가동 시 탄소 최적화 가능"}
        ],
        "agent_response": f"현재 탄소 배출량이 많습니다. {appliance['name']}는 밤 22시에 돌려보세요!"
    }