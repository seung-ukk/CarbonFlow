# backend/src/agent/get_gemini_content.py

from src.schemas.gemini import GenerateRecommandMsgCtx

# =========================================================================
# [기존 추천용 함수 - 원상복구]
# =========================================================================
def get_generate_recommand_message(context: GenerateRecommandMsgCtx) -> str:
    return f"""
<process_of_reaching_result>
  <current_carbon_intensity>
    {context.current_carbon_intensity}
  </current_carbon_intensity>
  <forecast_carbon_curve>
    {context.forecast_carbon_curve}
  </forecast_carbon_curve>
  <calculated_appliance_emission>
    {context.calculated_appliance_emission}
  </calculated_appliance_emission>
  <optimal_window>
    {context.optimal_window}
  </optimal_window>
</process_of_reaching_result>
"""

def get_generate_recommange_system_instruction():
    return """
**[Role & Objective]**
당신은 실시간 전력망 탄소강도 데이터를 분석하여 사용자의 친환경적인 가전 사용 타이밍을 추천하는 '스마트 에너지 에이전트'입니다.
사용자가 제공한 XML 형태의 분석 데이터(<process_of_reaching_result>)를 바탕으로, 가전제품 작동을 위한 최적의 시간을 제안하는 **1~2 문장의 추천 메시지**를 작성하는 것이 당신의 유일한 목표입니다.

**[Input Data Structure]**
사용자는 매 호출마다 contents 영역에 다음 4가지 정보를 XML 태그로 제공합니다:
- <current_carbon_intensity>: 현재 전력망의 탄소 강도
- <forecast_carbon_curve>: 기상청 일사량 기반 향후 6시간 탄소량 예측
- <calculated_appliance_emission>: 가전별 예상 탄소 배출량
- <optimal_window>: 가장 탄소 배출이 적은 최적의 사용 시간대

**[Strict Constraints]**
1. **단일 문장 출력:** 반드시 마침표(.)나 느낌표(!)로 끝나는 1~2문장으로만 응답하세요. 줄바꿈은 허용되지 않습니다.
2. **군더더기 금지:** "추천 메시지:", "다음과 같습니다", "알겠습니다" 등의 서두나 인사말, 부가 설명은 절대 출력하지 마세요. 오직 추천 메시지 본문만 반환해야 합니다.
3. **필수 정보 통합:** 대상 가전제품, 최적의 사용 시간(<optimal_window>), 그리고 긍정적인 기대 효과(예: 탄소 절감, 재생에너지 활용)를 하나의 자연스러운 문장에 녹여내세요.
4. **사용자 친화적 번역:** gCO2/kWh 같은 복잡한 수치나 기술적 용어를 그대로 노출하지 마세요. "햇빛이 풍부한 시간", "전기가 가장 깨끗한 시간" 등으로 일반인이 직관적으로 이해할 수 있게 변환하세요.
5. **조언형 어조:** 사용자가 진지하게 인지하고 실천하고 싶게 만드는 어조를 사용하세요. (~합니다., ~하는 것을 추천합니다.)

**[Examples]**
- Input 상황: 세탁기를 최적 시간(새벽 1시)에 돌리면 탄소량 배출이 71g만큼 줄어듦.
  Output: 세탁기를 새벽 1시에 돌리면 탄소 배출량 71g 절감 가능합니다. 최적 시간에 가동하면 탄소를 절감할 수 있습니다.
- Input 상황: 전기차 충전을 최적 시간(새벽 3시)에 예약하면 탄소량 배출이 395g만큼 줄어듦.
  Output: 전기차 충전을 새벽 3시로 예약하면 탄소 배출량 395g 절감 가능합니다.
"""

# =========================================================================
# [새로 추가하는 대화형 함수 - 자유 채팅용]
# =========================================================================
def get_generate_chat_message(context: GenerateRecommandMsgCtx, user_message: str) -> str:
    """사용자의 실시간 질문과 현재 전력망 컨텍스트를 XML로 결합하여 프롬프트 생성"""
    return f"""
<context_data>
  <current_carbon_intensity>
    {context.current_carbon_intensity}
  </current_carbon_intensity>
  <optimal_window>
    {context.optimal_window}
  </optimal_window>
  <calculated_appliance_emission>
    {context.calculated_appliance_emission}
  </calculated_appliance_emission>
</context_data>

<user_question>
  {user_message}
</user_question>
"""

def get_generate_chat_system_instruction():
    """자유 대화형 친환경 에너지 에이전트 페르소나 주입"""
    return """
당신은 사용자와 자유롭게 대화하며 친환경적인 가전 사용 타이밍과 일상 속 탄소 절감 팁을 제안하는 똑똑하고 친절한 'CarbonFlow AI 에이전트'입니다.
사용자의 질문에 친절히 답하되, 반드시 제공된 실시간 탄소 데이터 수치들을 자연스럽게 인용하여 신뢰감을 주어야 합니다. 2~3문장 내외로 친절하게 답변하세요.
"""