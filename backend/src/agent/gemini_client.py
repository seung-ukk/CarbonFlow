# backend/src/agent/gemini_client.py

import os
import logging
logger = logging.getLogger(__name__)

from google import genai
from google.genai import types
from pydantic import ValidationError
from typing import Dict, Any, Optional

from src.schemas.gemini import (
    GeminiModel, GeminiContentReqT, GeminiResponseT,
    GenerateRecommandMsgCtx, GenerateConversationdMsgCtx
)


from src.agent.get_gemini_content import (
    get_generate_recommand_message, 
    get_generate_recommange_system_instruction,
    get_generate_chat_message,
    get_generate_chat_system_instruction
)

class GeminiClient:
    client: Optional[genai.Client] = None

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.warning("Failed to get gemini api key from environment!")
            raise RuntimeError("Failed to get gemini api key from environment.")
        if not self.client:
            self.client = genai.Client(api_key=api_key)
        return self.client
        
    async def get_response(
        self,
        model: GeminiModel,
        contents: GeminiContentReqT,
        config: Dict[str, Any],
        *,
        parsed: bool = False
    ) -> GeminiResponseT:
        client = self._get_client()
        try:
            res = await client.aio.models.generate_content(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(**config)
            )
            return res.text
        except Exception as e:
            logger.error("Failed to get response from gemini.", exc_info=True)
            raise RuntimeError("Failed to get response from gemini.") from e
        
    # 기존 추천 일회성 메시지 함수
    async def generate_recommand_message(
        self,
        context: GenerateRecommandMsgCtx,
        *,
        model: Optional[GeminiModel] = None,
        contents: Optional[GeminiContentReqT] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        model = model if model else 'gemini-2.5-flash'
        contents = contents if contents else get_generate_recommand_message(context)
        config = config if config else {
            'system_instruction': get_generate_recommange_system_instruction()
        }
        res = await self.get_response(model, contents, config)
        return res.strip() if res else ""
    
    # 🌟 [새조립 완착] 미구현이었던 자유 대화형 함수를 실시간 컨텍스트 연동형으로 전면 구현!
    async def generate_conversation_message(
        self,
        context: GenerateRecommandMsgCtx, # 실시간 탄소 상자 수령
        user_message: str,                # 프론트엔드 유저 채팅 입력값 수령
        *,
        model: Optional[GeminiModel] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        """[진짜 AI 에이전트 대화 코어] 유저 질문과 수리 지표를 하이브리드 결합하여 추론 대화를 사출합니다."""
        model = model if model else 'gemini-2.5-flash'
        
        # 실시간 XML 구조 프롬프트와 자유 대화 지침 동적 빌드
        contents = get_generate_chat_message(context, user_message)
        config = config if config else {
            'system_instruction': get_generate_chat_system_instruction()
        }

        # [GEMINI INPUT PROMPT] 실시간 프롬프트 검증 로그 유지
        print("\n" + "="*50 + "\n[GEMINI CONVERSATION PROMPT]\n" + str(contents) + "\n" + "="*50 + "\n", flush=True)

        res = await self.get_response(model, contents, config)
        return res.strip() if res else ""

# 🌟 외부 endpoints.py 에서 호출할 상위 챗 인터페이스 함수 신설
async def get_conversation_chat_message(context: GenerateRecommandMsgCtx, user_message: str) -> str:
    """실시간 자유 대화 에이전트 전용 3회 리트라이 세이프티 가동 함수"""
    instance = GeminiClient()
    last_exc = None
    for i in range(0, 3):
        try:
            res = await instance.generate_conversation_message(context, user_message)
            return res
        except Exception as e:
            last_exc = e
            logger.warning(f"Failed conversation chat (Attempt {i+1}/3).")
    raise RuntimeError("Could not get response from gemini conversation.") from last_exc