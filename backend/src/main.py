# src/main.py
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.database.connection import Database
from src.api.endpoints import router as api_router



# 기본 로깅 세팅
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI Lifespan 이벤트를 통해 애플리케이션 시작 시 SQLite 초기화를 수행합니다."""
    logger.info("새로운 Eco-Agent 백엔드 서버를 기동합니다. Lifespan 초기화 중...")
    
    # 1. 에이전트 행동 데이터 및 로그 저장을 위한 SQLite 테이블 자동 생성 스크립트
    db_manager = Database()
    try:
        conn = await db_manager.get_connection()
        async with conn.cursor() as cursor:
            # 에이전트 대화 및 절전 로그 적재용 테이블 (예시 스키마)
            await cursor.execute("""
                CREATE TABLE IF NOT EXISTS agent_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    appliance_id TEXT NOT NULL,
                    recommended_time TEXT NOT NULL,
                    carbon_saved_g REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            await conn.commit()
        await conn.close()
        logger.info("SQLite DB 'agent_logs' 테이블 검증 및 초기화 완료.")
    except Exception as e:
        logger.error(f"Lifespan DB 초기화 중 오류 발생: {str(e)}", exc_info=True)
    
    yield
    
    logger.info("Eco-Agent 백엔드 서버를 안전하게 종료합니다.")

# FastAPI 인스턴스 생성 및 Lifespan 바인딩
app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# CORS 미들웨어 적용 (프론트엔드 연동용 필수 설정)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# endpoints.py 라우터 연결
app.include_router(api_router, prefix="/api")

@app.get("/", tags=["Root"])
def read_root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "database_path": settings.SQLITE_PATH
    }