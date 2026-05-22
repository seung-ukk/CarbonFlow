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
from src.agent.get_gemiti_content import get_generate_recommand_message, get_generate_recommange_system_instruction

class GeminiClient:
    client: Optional[genai.Client] = None

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.warning("Failed to get gemini api key from environment!")
            raise RuntimeError("Failed to get gemini api key from environment.")
        
        if not self.client:
            try:
                self.client = genai.Client(api_key=api_key)
            except Exception as e:
                logger.error("Gemini client initialization failed.", exc_info=True)
                raise e
        
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
            return res.parsed if parsed else res.text
        except ValidationError as e:
            logger.error("Could not parse arg into gemini request.", exc_info=True)
            raise RuntimeError("Could not parse arg into gemini request.") from e
        except Exception as e:
            logger.error("Failed to get response from gemini.", exc_info=True)
            raise RuntimeError("Failed to get response from gemini.") from e
        finally:
            await client.aio.aclose()
        
    async def generate_recommand_message(
        self,
        context: GenerateRecommandMsgCtx,
        *,
        model: Optional[GeminiModel] = None,
        contents: Optional[GeminiContentReqT] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        model = model if model else 'gemini-3.5-flash'
        contents = contents if contents else get_generate_recommand_message(context)
        config = config if config else {
            'system_instruction': get_generate_recommange_system_instruction()
        }
        
        res = await self.get_response(model, contents, config)
        return res.strip() # 문자열 다듬은 뒤 반환.
    
    async def generate_conversation_message(
        self,
        context: GenerateConversationdMsgCtx,
        *,
        model: Optional[GeminiModel] = None,
        contents: Optional[GeminiContentReqT] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        # 미구현 코드. 추후 기획서 반영 이후 구현 예정.
        model = model if model else 'gemini-3.5-flash'
        contents = contents if contents else "<prompt_from_context>"
        config = config if config else {
            'system_instruction': "<prompt_from_system>"
        }

        res = await self.get_response(model, contents, config)
        return res

async def get_recommand_message(context: GenerateRecommandMsgCtx) -> str:
    instance = GeminiClient()