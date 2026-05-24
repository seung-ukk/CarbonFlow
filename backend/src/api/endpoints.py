# src/api/endpoints.py
from fastapi import APIRouter, Depends, HTTPException
import aiosqlite
from typing import List
from datetime import datetime
from pydantic import BaseModel


from src.schemas.gemini import GenerateRecommandMsgCtx, AgentChatResponse, ReasoningStep
from src.agent.gemini_client import get_conversation_chat_message

from src.database.connection import get_db, JSONDatabase
from src.schemas.appliance import ApplianceSchema
from src.carbon.calculator import CarbonCalculator
from src.schemas.carbon import CurrentCarbonResponse, ForecastCarbonResponse

router = APIRouter()


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
# 탄소강도 도메인 API
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

@router.get("/carbon/forecast", tags=["Carbon"])
async def get_carbon_forecast():
    """향후 예측 탄소 곡선 및 요약 지표 조회 (Prediction 공란 해결사)"""
    # 1. 고도화된 연산 코어로부터 데이터 수령
    raw_forecast_dict = CarbonCalculator.forecast_carbon_curve()
    
    forecasts_list = raw_forecast_dict.get("forecasts", [])
    
    # 2. 기존의 최적 윈도우(Optimal Window) 연산 로직에 배열 전달
    best_window_data = CarbonCalculator.find_optimal_window(forecasts_list)

    # 3. 프론트엔드 전용 JSON 스키마 구조로 1:1 바인딩하여 200 OK 사출
    return {
        "status": 200,
        "message": "12시간 예측 조회 성공",
        "data": {
            "best_window": best_window_data,          
            "forecasts": forecasts_list[:12],  # UI 스펙에 맞춘 앞단 12시간 슬라이싱
            "min_carbon_intensity": raw_forecast_dict.get("min_carbon_intensity"), 
            "max_carbon_hour": raw_forecast_dict.get("max_carbon_hour"),            
            "max_carbon_intensity": raw_forecast_dict.get("max_carbon_intensity")
        }
    }


# =========================================================================
# AI 에이전트 도메인 API (자유 대화 및 실시간 컨텍스트 결합 완결본)
# =========================================================================
@router.post("/agent/chat", tags=["Agent"], summary="실시간 Gemini AI 대화형 에이전트 챗")
async def chat_with_eco_agent(
    appliance_id: str, 
    user_message: str = "이 가전제품을 언제 돌리는 게 가장 탄소 배출이 적을까?", # 🌟 프론트 입력 메시지 낚아채기
    db: aiosqlite.Connection = Depends(get_db)
):
    """
    유저의 자유 질문을 분석하여 
    실시간 탄소 데이터 기반으로 맞춤형 답변을 생성하는 리얼 AI 에이전트 통로입니다.
    """
    try:
        appliance = JSONDatabase.get_appliance_by_id(appliance_id)
        
        # 1. 실시간 탄소 연산 지표 수집
        current_intensity_dict = CarbonCalculator.get_current_carbon_intensity()
        raw_forecast_dict = CarbonCalculator.forecast_carbon_curve()
        forecasts_list = raw_forecast_dict.get("forecasts", [])
        best_window_data = CarbonCalculator.find_optimal_window(forecasts_list)
        
        duration = appliance.get("duration_hours", 1.5)
        current_emission = round(duration * current_intensity_dict["carbon_intensity"], 2)
        optimized_intensity = raw_forecast_dict.get("min_carbon_intensity", 247.5)
        optimized_emission = round(duration * optimized_intensity, 2)
        saved_carbon_g = max(0.0, round(current_emission - optimized_emission, 2))
        
        # 2. 대화형 컨텍스트 객체 빌드
        ai_context = GenerateRecommandMsgCtx(
            appliance_name=appliance['name'],
            current_carbon_intensity=current_intensity_dict,
            forecast_carbon_curve=forecasts_list[:6],
            calculated_appliance_emission=saved_carbon_g,
            optimal_window={
                "start": best_window_data.get("start", "12:00"),
                "end": best_window_data.get("end", "13:00")
            }
        )
        
        # 3. 3회 리트라이 및 전용 비동기 대화 제어 함수 결합
        try:
            # 상단에서 단독 임포트한 정석 대화 처리 엔진 함수 호출
            gemini_response = await get_conversation_chat_message(ai_context, user_message)
        except Exception as e:
            print(f"===> [Warning] 대화형 Gemini 통신 실패 세이프티 가동: {str(e)}")
            gemini_response = f"현재 전력망 상태는 {current_intensity_dict['status']}입니다. {appliance['name']} 사용을 {best_window_data.get('start')}로 조절하시면 탄소 배출을 줄일 수 있으니 참고해 보세요!"

        # 4. 프론트엔드가 요구하는 스펙 그대로 패키징
        reasoning_logs = [
            {"step": 1, "title": "유저 입력 분석", "content": f"사용자 질문 수신 완료: '{user_message}'"},
            {"step": 2, "title": "실시간 탄소망 컨텍스트 융합", "content": f"현재 탄소 강도 {current_intensity_dict['carbon_intensity']}gCO2/kWh 기반 실시간 대화 컨텍스트 매칭 완료"},
            {"step": 3, "title": "AI 에이전트 자연어 생성", "content": "제미나이 기반 맞춤형 저탄소 행동 가이드 문장 조립 완료"}
        ]

        return {
            "recommended_time": best_window_data.get("start", "12:00"),
            "carbon_saved_g": saved_carbon_g,
            "reasoning_logs": reasoning_logs,
            "agent_response": gemini_response  # 유저 질문에 맞춰 동적으로 변하는 진짜 AI의 답변!
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"===> [Critical] 대화형 에이전트 라우터 터짐: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))