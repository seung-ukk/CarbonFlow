#psudo code for Gemini agent 관련 스키마 정의
from pydantic import BaseModel
from typing import List, Optional

class AgentChatRequest(BaseModel):
    appliance_id: str          # 유저가 선택한 가전 ID
    user_message: Optional[str] = "이 가전제품을 언제 돌리는 게 가장 탄소 배출이 적을까?"

class ReasoningStep(BaseModel):
    step: int
    title: str
    content: str

class AgentChatResponse(BaseModel):
    recommended_time: str      # 예: "22:00"
    carbon_saved_g: float      # 절감된 탄소량
    reasoning_logs: List[ReasoningStep]  # 프론트에서 시각화할 에이전트 추론 프로세스
    agent_response: str        # 유저에게 보여줄 최종 친절한 한마디