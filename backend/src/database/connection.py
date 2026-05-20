# src/database/connection.py
import os
import json
import logging
import aiosqlite
from typing import List, Dict, Any, AsyncGenerator
from src.core.config import settings

logger = logging.getLogger(__name__)

# JSON DB 경로 설정 (connection.py와 같은 폴더에 위치한 appliances.json)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, "appliances.json")

class JSONDatabase:
    @staticmethod
    def read_appliances() -> List[Dict[str, Any]]:
        """appliances.json 파일을 읽어 순수 딕셔너리 리스트로 반환합니다."""
        if not os.path.exists(JSON_PATH):
            logger.warning(f"JSON DB 파일이 해당 경로에 없습니다: {JSON_PATH}")
            return []
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def get_appliance_by_id(appliance_id: str) -> Dict[str, Any]:
        """ID 기반으로 특정 가전제품의 딕셔너리 데이터를 찾아 반환합니다."""
        appliances = JSONDatabase.read_appliances()
        for app in appliances:
            if str(app.get("id")) == str(appliance_id):
                return app
        raise ValueError(f"Appliance with id {appliance_id} not found")

class Database:
    def __init__(self) -> None:
        self.sqlite_path = settings.SQLITE_PATH
    
    async def get_connection(self) -> aiosqlite.Connection:
        """비동기 SQLite 커넥션을 생성하고 WAL 모드를 활성화하여 최적화합니다."""
        try:
            conn = await aiosqlite.connect(self.sqlite_path, timeout=5.0)
            conn.row_factory = aiosqlite.Row
            # 동시성 및 쓰기 성능 최적화를 위한 WAL 모드 설정
            await conn.execute("PRAGMA journal_mode=WAL;")
            await conn.execute("PRAGMA synchronous=NORMAL;")
            return conn
        except Exception as e:
            logger.error(f"Failed to connect to SQLite: {self.sqlite_path}", exc_info=True)
            raise e

async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """FastAPI Depends용 데이터베이스 세션 제너레이터입니다."""
    manager = Database()
    conn = await manager.get_connection()
    try:
        yield conn
    finally:
        await conn.close()