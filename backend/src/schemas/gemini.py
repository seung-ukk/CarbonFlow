from enum import Enum
from pydantic import BaseModel
from typing import Literal, Union, List, Dict, Any

GeminiModel = Literal['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite']
GeminiContentReqT = List[Dict[str, Any]] | str
GeminiResponseT = Union[BaseModel, Dict[Any, Any], Enum] | str

class GenerateRecommandMsgCtx(BaseModel):
    current_carbon_intensity: str
    forecast_carbon_curve: str
    calculated_appliance_emission: str
    optimal_window: str

class GenerateConversationdMsgCtx(BaseModel):
    ... # 기획서 반영 이후 구현 예정