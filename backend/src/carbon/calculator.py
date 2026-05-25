import os
import pandas as pd
import requests
import logging
logger = logging.getLogger(__file__)

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from pydantic import BaseModel, Field
from typing import List

from src.database.connection import JSONDatabase

class ForecastItem(BaseModel):
    carbonIntensity: int
    datetime: datetime

class Forecast(BaseModel):
    forecast: List[ForecastItem] = Field(default_factory=list)

class CarbonCalculator:
    @classmethod
    def get_current_carbon_intensity(cls) -> dict:
        header = { 'auth-token': os.getenv('ELECTRICITYMAPS_API_KEY') }

        # 현재 카본 강도 조회
        url = 'https://api.electricitymaps.com/v3/carbon-intensity/latest?zone=KR'
        try:
            response = requests.get(url, headers=header, timeout=5).json()
            realtime_intensity = response['carbonIntensity']
        except Exception:
            logger.error(f"Could not get carbon intensity response['carbonIntensity]", exc_info=True)
            realtime_intensity = 422

        # 현재 카본 강도에 따른 status
        if realtime_intensity <= 350.0:
            level, status = "low", "좋음"
        elif realtime_intensity <= 430.0:
            level, status = "medium", "보통"
        else:
            level, status = "high", "나쁨"

        # 현재 재생 에너지 비중 조회
        url = 'https://api.electricitymaps.com/v3/renewable-energy/latest?zone=KR'
        try:
            response = requests.get(url, headers=header, timeout=5).json()
            r_renewable_ratio = response['value']
            renewable_ratio = float(r_renewable_ratio)
        except Exception:
            logger.error(f"Could not get renewable energy response['value']", exc_info=True)
            renewable_ratio = 14.0
        
        # 현재 총 전력량 조회
        url = 'https://api.electricitymaps.com/v3/total-load/latest?zone=KR'
        try:
            response = requests.get(url, headers=header, timeout=5).json()
            r_total_electricty = response['value']
            total_electricty = round(r_total_electricty, 1)
        except Exception:
            logger.error(f"Could not get total load response['value']", exc_info=True)
            total_electricty = 47933.5
        
        # 현재 석탄 발전량 조회
        url = 'https://api.electricitymaps.com/v3/electricity-source/coal/latest?zone=KR'
        try:
            response = requests.get(url, headers=header, timeout=5).json()
            data: List[dict] = response['data']
            coal = data[0].get('value')
        except Exception:
            logger.error(f"Could not get coal value response['data']['value']", exc_info=True)
            coal = 10135

        # 석탄 에너지 비중 조회
        coal_ratio = (coal / total_electricty) * 100.0

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
        r_response = requests.get(url, headers=header, timeout=5).json()
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