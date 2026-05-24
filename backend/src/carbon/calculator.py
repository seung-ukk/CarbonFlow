# src/carbon/calculator.py
from datetime import datetime, timedelta
from src.carbon.kpx_client import KPXClient

kpx_client = KPXClient()

class CarbonCalculator:
    
    @classmethod
    def get_current_carbon_intensity(cls) -> dict:
        """기상청 API와 통신하여 현재 날씨가 반영된 탄소 지수 및 등급을 반환합니다."""
        realtime_intensity = kpx_client.get_realtime_intensity()
        
        if realtime_intensity <= 350.0:
            level = "low"
            status = "좋음"
        elif realtime_intensity <= 430.0:
            level = "medium"
            status = "보통"
        else:
            level = "high"
            status = "나쁨"
            
        return {
            "carbon_intensity": realtime_intensity,
            "status": status,
            "level": level,
            "unit": "gCO2/kWh"
        }

    @classmethod
    def forecast_carbon_curve(cls) -> list:
        """현재 시각 기점 향후 24시간의 탄소강도 추이를 ISO 8601 포맷 데이터 배열로 예측 생성합니다."""
        forecast_list = []
        now = datetime.now()
        
        for i in range(24):
            future_time = now + timedelta(hours=i)
            future_hour = future_time.hour
            
            if 0 <= future_hour < 6:
                base = 370.0
            elif 8 <= future_hour <= 10 or 18 <= future_hour <= 21:
                base = 460.0
            else:
                base = 410.0
                
            if 12 <= future_hour <= 14:
                base = base * 0.75
                
            level = "low" if base <= 350.0 else "medium" if base <= 430.0 else "high"
                
            forecast_list.append({
                "hour": future_time.strftime("%Y-%m-%dT%H:00:00+09:00"),
                "carbon_intensity": round(base, 2),
                "level": level
            })
            
        return forecast_list

    @classmethod
    def find_optimal_window(cls, forecasts: list) -> dict:
        """ 생성된 예측 배열을 기반으로 가장 탄소 배출이 적은 시간대(시작/종료)를 찾아 반환합니다."""
        if not forecasts:
            now_iso = datetime.now().strftime("%Y-%m-%dT%H:00:00+09:00")
            return {"start": now_iso, "end": now_iso}
            
        # 탄소 강도가 가장 낮은(최적인) 아이템 추출
        best_item = min(forecasts, key=lambda x: x["carbon_intensity"])
        best_start_str = best_item["hour"]
        
        # ISO 8601 파싱 후 가동 시간(예: 기본 2시간 가동 기준)을 더해 종료 시간 산출
        start_dt = datetime.strptime(best_start_str, "%Y-%m-%dT%H:%M:%S+09:00")
        best_end_str = (start_dt + timedelta(hours=2)).strftime("%Y-%m-%dT%H:00:00+09:00")
        
        return {
            "start": best_start_str,
            "end": best_end_str
        }

    @classmethod
    def calculate_appliance_emission(cls, power_w: float, duration_hours: float) -> float:
        """특정 가전의 전력 소모량과 가동시간 기준 예상 탄소 배출량(g)을 연산합니다."""
        current_data = cls.get_current_carbon_intensity()
        current_intensity = current_data["carbon_intensity"]
        power_kw = power_w / 1000.0
        
        total_carbon_g = power_kw * duration_hours * current_intensity
        return round(total_carbon_g, 2)