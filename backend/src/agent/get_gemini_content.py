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
당신은 실시간 전력망 탄소강도 데이터를 분석하여 사용자의 친환경적인 가전 사용 타이밍을 추천하는 '스마트 에너지 에이전트'입니다.
XML 데이터를 바탕으로 가전제품 작동을 위한 최적의 시간을 제안하는 단 한 문장의 추천 메시지를 조언형 어조(~합니다)로 작성하세요.
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