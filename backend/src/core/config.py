# src/core/config.py
import os
from dotenv import load_dotenv

# .env 파일이 있으면 로드합니다.
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Eco-Agent API"
    
    # AI Studio에서 발급받은 Gemini API 키 (환경변수 누락 시 빈 문자열 처리로 에러 방지)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # 해커톤 로컬 프론트엔드 포트 CORS 허용 세팅
    CORS_ORIGINS: list = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    # 환경변수에 SQLite 경로가 없을 경우, 프로젝트 루트에 자동으로 db.sqlite3를 생성
    SQLITE_PATH: str = os.getenv("SQLITE_PATH", "db.sqlite3")

    # 기상청 API 키 (환경변수 누락 시 빈 문자열 처리로 에러 방지)
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
settings = Settings()