# src/api/endpoints.py
from fastapi import APIRouter, Depends, HTTPException
import aiosqlite
from typing import List
from datetime import datetime, timedelta
from pydantic import BaseModel

from src.database.connection import get_db, JSONDatabase
from src.schemas.appliance import ApplianceSchema
from src.carbon.calculator import CarbonCalculator
from src.schemas.carbon import CurrentCarbonResponse, ForecastCarbonResponse

router = APIRouter()

class LoginRequest(BaseModel):
    id: str        # 프론트의 { id: userId } 스펙과 매칭
    password: str

@router.post("/login", tags=["Auth"], summary="로그인")
async def login_mock(payload: LoginRequest):
    if payload.id == "testuser" and payload.password == "password":
        return {
            "status": 200,
            "message": "로그인 성공",
            "data": {  # unwrap 함수가 response.data.data를 찾으므로 data 계층을 만들기
                "token": "mock-jwt-token",
                "user": {"id": payload.id, "role": "user"}
            }
        }
    raise HTTPException(
        status_code=401,
        detail="아이디 또는 비밀번호가 일치하지 않습니다."
    )

# =========================================================================
# 가전 도메인 API
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
# [2] 탄소강도 도메인 API (엔진 통합형 무결점 코드)
# =========================================================================
@router.get(
    "/carbon/current", 
    response_model=CurrentCarbonResponse,
    tags=["Carbon"],
    summary="현재 실시간 탄소 지수 조회"
)
async def get_current_carbon_intensity(db: aiosqlite.Connection = Depends(get_db)):
    # 1. 뼈대 계산 엔진에서 실제 연산 및 발전 비중까지 완벽하게 처리된 딕셔너리 수령
    raw_current = CarbonCalculator.get_current_carbon_intensity()
    
    now_iso = datetime.now().strftime("%Y-%m-%dT%H:%M:00+09:00")

    return {
        "status": 200,
        "message": "현재 카본 강도 조회 성공",
        "data": {
            "updated_at": now_iso,
            "carbon_intensity": raw_current["carbon_intensity"],
            "level": raw_current["level"],
            "renewable_ratio": raw_current["renewable_ratio"],  # 데이터 유실 위험 0%
            "coal_ratio": raw_current["coal_ratio"]             # 데이터 유실 위험 0%
        }
    }

@router.get(
    "/carbon/forecast", 
    response_model=ForecastCarbonResponse,
    tags=["Carbon"],
    summary="향후 예측 탄소 곡선 조회"
)
async def get_carbon_forecast(db: aiosqlite.Connection = Depends(get_db)):
    raw_forecast = CarbonCalculator.forecast_carbon_curve()
    best_window_data = CarbonCalculator.find_optimal_window(raw_forecast)

    return {
        "status": 200,
        "message": "12시간 예측 조회 성공",
        "data": {
            "best_window": best_window_data,          
            "forecasts": raw_forecast[:12]  # 프론트 명세 맞춤형 12시간 슬라이싱
        }
    }


# =========================================================================
# [3] AI 에이전트 도메인 API (임시 테스트용 가짜 데이터 버전)
# =========================================================================
@router.post("/agent/chat", tags=["Agent"])
async def chat_with_eco_agent(appliance_id: str, db: aiosqlite.Connection = Depends(get_db)):
    try:
        appliance = JSONDatabase.get_appliance_by_id(appliance_id)
        
        current_emission = CarbonCalculator.calculate_appliance_emission(appliance_id)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
        

    return {
        "recommended_time": "22:00",
        "carbon_saved_g": 142.5,
        "reasoning_logs": [
            {"step": 1, "title": "가전 분석", "content": f"{appliance['name']} 스펙 로드 완료"},
            {"step": 2, "title": "탄소 배출량 연산", "content": f"현재 가동 시 예상 배출량: {current_emission}g"}
        ],
        "agent_response": f"현재 탄소 배출량이 유동적입니다. {appliance['name']}를 지금 돌리시면 약 {current_emission}g의 탄소가 발생해요. 밤 22시에 돌려보시는 건 어떨까요?"
    }