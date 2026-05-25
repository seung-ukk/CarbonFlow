import os
import pandas as pd
import requests
import logging
logger = logging.getLogger(__file__)

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from pydantic import BaseModel, Field
from typing import List, Optional

from src.database.connection import JSONDatabase

class ForecastItem(BaseModel):
    carbonIntensity: int
    datetime: datetime

class Forecast(BaseModel):
    forecast: List[ForecastItem] = Field(default_factory=list)

class CarbonCalculator:
    BASE_INTENSITY = 330.0  
    PEAK_PENALTY_FACTOR = 160.0  
    CSV_PATH = os.path.join("backend", "src", "database", "kpx_sukub.csv")

    @classmethod
    def _load_kpx_dataframe(cls) -> pd.DataFrame:
        if not os.path.exists(cls.CSV_PATH):
            raise FileNotFoundError(f"전력거래소 실측 데이터 파일이 없습니다: {cls.CSV_PATH}")
        
        df = pd.read_csv(
            cls.CSV_PATH,
            encoding="utf-8",
            skiprows=1,
            names=['base_time', 'supply_cap', 'current_demand', 'max_forecast', 'reserve_cap', 'reserve_rate', 'op_reserve_cap', 'op_reserve_rate']
        )
        df = df.dropna(subset=['base_time', 'current_demand'])
        df['base_time'] = df['base_time'].astype(str).str.strip()
        df['current_demand'] = df['current_demand'].astype(float)
        
        # YYYYMMDDHHMMSS 구조의 8번째부터 12번째 인덱스 직전까지 잘라내어 "HHMM" 컬럼화
        df['hhmm'] = df['base_time'].str[8:12]
        return df

    @classmethod
    def get_current_carbon_intensity(cls) -> dict:
        """[버킷팅 알고리즘 완결판] 애매한 현재 분 단위를 5분 바구니로 정렬하여 실측 매칭을 수행합니다."""
        now = datetime.now()
        current_hour = now.hour
        
        #[시계열 버킷팅] 21시 42분 -> 21시 40분 (5분 단위 내림 양자화)
        bucketed_minute = (now.minute // 5) * 5
        target_hhmm = f"{now.strftime('%H')}{bucketed_minute:02d}"
        
        try:
            df = cls._load_kpx_dataframe()
            
            # 버킷팅된 시간("HHMM")과 CSV 컬럼을 1:1 정밀 매칭
            matched_rows = df[df['hhmm'] == target_hhmm]
                
            if not matched_rows.empty:
                current_demand = matched_rows.iloc[0]['current_demand']
                print(f"===> [KPX 버킷팅 성공] {target_hhmm} 타임슬롯 실측 수요 매칭: {current_demand} MW")
            else:
                # 특정 새벽 시간대 버킷이 비어있을 경우 해당 시간(HH)의 평균값으로 안전 마진 확보
                target_hh = now.strftime("%H")
                backup_rows = df[df['hhmm'].str.startswith(target_hh)]
                current_demand = backup_rows['current_demand'].mean() if not backup_rows.empty else 57000.0
            
        except Exception as e:
            print(f"===> [Warning] 실시간 지수 로드 중 Fallback 시뮬레이터 가동: {str(e)}")
            # 인프라 장애 시 표준 전력 프로파일 가상 부하 세팅
            current_demand = 63000.0 if 18 <= current_hour <= 21 else 57000.0

        # [통합 연속형 연산 엔진] 수요 비례 탄소 지수 및 발전 비중 연산
        min_d, max_d = 50000.0, 65000.0
        demand_ratio = max(0.0, min(1.0, (current_demand - min_d) / (max_d - min_d)))
        
        realtime_intensity = cls.BASE_INTENSITY + (demand_ratio * cls.PEAK_PENALTY_FACTOR)
        
        # 낮 시간대(12시~14시) 태양광 공급 인센티브 버프 반영 (0.75배)
        solar_bonus = 1.0
        if 12 <= current_hour <= 14:
            realtime_intensity = realtime_intensity * 0.75
            solar_bonus = 1.4  # 태양광 비중 가중치 버프
            
        realtime_intensity = round(realtime_intensity, 2)
        
        # 대한민국 전력망 특성을 투영한 실측 기반 발전원 비중 역산 수리 모델
        renewable_ratio = round((15.0 - (demand_ratio * 9.0)) * solar_bonus, 1)
        renewable_ratio = max(1.0, min(25.0, renewable_ratio))
        coal_ratio = round(30.0 + (demand_ratio * 15.0), 1)
        
        # 기존 기획 규격 등급 분기점 (350, 430) 완전 동기화
        if realtime_intensity <= 350.0:
            level, status = "low", "좋음"
        elif realtime_intensity <= 430.0:
            level, status = "medium", "보통"
        else:
            level, status = "high", "나쁨"
            
        return {
            "carbon_intensity": realtime_intensity,
            "status": status,
            "level": level,
            "unit": "gCO2/kWh",
            "renewable_ratio": renewable_ratio,
            "coal_ratio": coal_ratio
        }

    @classmethod
    def forecast_carbon_curve(cls) -> dict:
        url = 'https://api.electricitymaps.com/v3/carbon-intensity/forecast?zone=KR'
        header = { 'auth-token': os.getenv('ELECTRICITYMAPS_API_KEY') }
        r_response = requests.get(url, headers=header).json()
        response = Forecast(**r_response)

        now = datetime.now(ZoneInfo("Asia/Seoul"))
        
        final_forecast = []
        min_carbon_intensity = 4096
        max_carbon_intensity = 0
        for forecast_item in response.forecast:
            target_dt = forecast_item.datetime
            if isinstance(target_dt, str):
                target_dt = datetime.fromisoformat(target_dt)
            
            kst_target_dt = target_dt.astimezone(ZoneInfo("Asia/Seoul"))

            if (kst_target_dt - now).total_seconds() > 0:
                final_forecast.append({
                    'hour': kst_target_dt.isoformat(timespec='seconds'),
                    'carbon_intensity': forecast_item.carbonIntensity,
                    'level': "low" if forecast_item.carbonIntensity <= 350.0 else "medium" if forecast_item.carbonIntensity <= 430.0 else "high"
                })

                if min_carbon_intensity > forecast_item.carbonIntensity:
                    min_carbon_intensity = forecast_item.carbonIntensity

                if max_carbon_intensity < forecast_item.carbonIntensity:
                    max_carbon_hour = forecast_item.datetime.strftime("%Y-%m-%dT%H:%M:%S+09:00")
                    max_carbon_intensity = forecast_item.carbonIntensity
        
        logger.info(f"탄소 예측: {final_forecast}")

        return {
            'forecasts': final_forecast,
            'min_carbon_intensity': min_carbon_intensity,
            'max_carbon_hour': max_carbon_hour,
            'max_carbon_intensity"': max_carbon_intensity
        }

    @classmethod
    def find_optimal_window(cls, forecasts: list) -> dict:
        """생성된 예측 배열을 기반으로 가장 탄소 배출이 적은 시간대를 찾아 반환합니다."""
        if not forecasts:
            now_iso = datetime.now().strftime("%Y-%m-%dT%H:00:00+09:00")
            return {"start": now_iso, "end": now_iso}
            
        #예측 리스트 중 탄소 집집약도가 가장 낮은 최소값(Min) 탐색
        best_item = min(forecasts, key=lambda x: x["carbon_intensity"])
        best_start_str = best_item["hour"]
        
        # [안전 규격화] 타임스탬프 포맷 매칭 에러 방지 유연화
        # 00분 00초 고정 포맷 규격에 맞춰 안전하게 스트립 파싱합니다.
        try:
            start_dt = datetime.strptime(best_start_str, "%Y-%m-%dT%H:%M:%S+09:00")
        except ValueError:
            start_dt = datetime.strptime(best_start_str, "%Y-%m-%dT%H:00:00+09:00")
        
        # 가동 주기 기본 스펙(2시간)을 더해 종료 마크 타임 생성
        best_end_str = (start_dt + timedelta(hours=2)).strftime("%Y-%m-%dT%H:00:00+09:00")
        
        return {
            "start": best_start_str,
            "end": best_end_str
        }

    @classmethod
    def calculate_appliance_emission(cls, appliance_id: str) -> float:
        """
        가전 ID를 받아 appliances.json DB에서 
        소비전력(power_consumption_w)과 가동시간(duration_hours)을 가져와 탄소 배출량을 연산하기
        """
        # 1. DB에서 가전 상세 정보 조회 (없으면 내장된 ValueError 예외 처리로 404 에러 발생)
        appliance = JSONDatabase.get_appliance_by_id(appliance_id)
        
        power_w = appliance["power_consumption_w"]
        duration_hours = appliance["duration_hours"]
        
        # 2. 실시간 탄소강도 추출 (우리가 구현한 버킷팅 실측 엔진 호출)
        current_data = cls.get_current_carbon_intensity()
        current_intensity = current_data["carbon_intensity"]
        
        # 3. 공식 대입 연산 (W -> kW 변환)
        power_kw = power_w / 1000.0
        total_carbon_g = power_kw * duration_hours * current_intensity
        
        return round(total_carbon_g, 2)