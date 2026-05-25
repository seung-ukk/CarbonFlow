# src/schemas/gemini.py (임시 통합본)
from enum import Enum
from pydantic import BaseModel
from typing import Literal, Union, List, Dict, Any, Optional

# =========================================================================
# [1] Gemini 엔진 타입 정의
# =========================================================================
GeminiModel = Literal['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite']
GeminiContentReqT = List[Dict[str, Any]] | str
GeminiResponseT = Union[BaseModel, Dict[Any, Any], Enum] | str


# =========================================================================
# [2]데이터 규격에 맞춘 AI 컨텍스트 스키마 
# =========================================================================
class GenerateRecommandMsgCtx(BaseModel):
    current_carbon_intensity: Dict[str, Any]    # str -> dict 보정 (기상청 실황 데이터 대응)
    forecast_carbon_curve: List[Dict[str, Any]] # str -> list 보정 (24시간 예측 곡선 배열 대응)
    calculated_appliance_emission: float        # str -> float 보정 (소수점 연산 결과 대응)
    optimal_window: Dict[str, str]              # str -> dict 보정 (find_optimal_window 리턴 대응)

class GenerateConversationdMsgCtx(BaseModel):
    pass # 기획서 반영 이후 구현 예정


# =========================================================================
# [3] 프론트엔드 통신 및 에이전트 응답 스키마
# =========================================================================
class AgentChatRequest(BaseModel):
    appliance_id: str                          # 유저가 선택한 가전 ID
    user_message: Optional[str] = "이 가전제품을 언제 돌리는 게 가장 탄소 배출이 적을까?"

class ReasoningStep(BaseModel):
    step: int
    title: str
    content: str

class AgentChatResponse(BaseModel):
    recommended_time: str                      # 예: "22:00"
    carbon_saved_g: float                      # 절감된 탄소량
    reasoning_logs: List[ReasoningStep]        # 프론트에서 시각화할 에이전트 추론 프로세스
    agent_response: str                        # 유저에게 보여줄 최종 친절한 한마디