from pydantic import BaseModel
from typing import Optional

class ApplianceSchema(BaseModel):
    id: str
    name: str
    category: str
    power_consumption_w: float  # 소비전력 (W단위로 통일하여 프론트가 보여주기 편하게 설정)
    duration_hours: float       # 1회 가동 시간 (에이전트 연산용 필수 필드)
    energy_rating: int          # 에너지 소비 효율 등급 (1~5)
    is_eco_friendly: bool       # 친환경 가전 여부
    description: Optional[str] = None