from fastapi import APIRouter, Depends, HTTPException
import aiosqlite
from typing import List
from src.schemas.carbon import CarbonIntensityResponse

from src.database.connection import get_db, JSONDatabase
from src.schemas.appliance import ApplianceSchema
from src.carbon.calculator import CarbonCalculator

router = APIRouter()

# [1] 가전 도메인 API
@router.get("/appliances", response_model=List[ApplianceSchema], tags=["Appliances"])
def get_all_appliances():
    """프론트엔드가 가전 목록을 조회해가는 완벽하게 검증된 엔드포인트"""
    return JSONDatabase.read_appliances()

@router.get("/appliances/{appliance_id}", response_model=ApplianceSchema, tags=["Appliances"])
def get_appliance(appliance_id: str):
    """특정 가전제품 정보 상세 조회"""
    try:
        return JSONDatabase.get_appliance_by_id(appliance_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# [2] 탄소강도 도메인 API
@router.get(
        "/carbon/intensity",
        response_model=CarbonIntensityResponse,
        tags=["Carbon"],
        summary="실시간 탄소 집약도 및 24시간 예측 데이터 조회"
)
async def get_carbon_intensity(db: aiosqlite.Connection = Depends(get_db)):
    """실시간 탄소 집약도 및 24시간 예측 데이터 반환 엔드포인트"""
    current_data = CarbonCalculator.get_current_carbon()
    forecast_data = CarbonCalculator.get_24h_forecast()
    
    return {
        "current": current_data,
        "forecast": forecast_data
    }


# [3] AI 에이전트 도메인 API (임시 테스트용 가짜 데이터 버전)
@router.post("/agent/chat", tags=["Agent"])
async def chat_with_eco_agent(appliance_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """서버 정상 가동 테스트를 위한 임시 에이전트 샌드박스 엔드포인트"""
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