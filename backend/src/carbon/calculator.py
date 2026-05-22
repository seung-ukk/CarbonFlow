# src/carbon/calculator.py
from datetime import datetime, timedelta
from src.carbon.kpx_client import KPXClient

# 기상청 실제 오픈 API 통신을 담당하는 클라이언트 인스턴스
kpx_client = KPXClient()

class CarbonCalculator:
    
    @classmethod
    def get_current_carbon(cls) -> dict:
        """기상청 API와 실시간으로 통신하여 현재 날씨가 반영된 탄소 지수 및 등급을 반환합니다."""
        # 유저님이 고도화하신 기상청 requests 통신 함수를 직접 호출합니다.
        realtime_intensity = kpx_client.get_realtime_intensity()
        
        # 실제 수치를 기준으로 등급을 동적 판정합니다.
        if realtime_intensity <= 350.0:
            status = "좋음"
        elif realtime_intensity <= 430.0:
            status = "보통"
        else:
            status = "나쁨"
            
        return {
            "carbon_intensity": realtime_intensity,
            "status": status,
            "unit": "gCO2/kWh"
        }

    @classmethod
    def get_24h_forecast(cls) -> list:
        """현재 시각을 기준으로 앞으로 다가올 24시간의 탄소강도 추이를 동적으로 예측 생성합니다."""
        forecast_list = []
        now = datetime.now()
        
        for i in range(24):
            future_time = now + timedelta(hours=i)
            time_label = future_time.strftime("%H:00")
            future_hour = future_time.hour
            
            # 시간대별 시나리오 가중치 부여 (기존 비즈니스 로직 유지 및 고도화)
            if 0 <= future_hour < 6:
                base = 370.0
            elif 8 <= future_hour <= 10 or 18 <= future_hour <= 21:
                base = 460.0
            else:
                base = 410.0
                
            # 낮 시간대 친환경 태양광 버프 시뮬레이션 적용
            if 12 <= future_hour <= 14:
                base = base * 0.75
                
            forecast_list.append({
                "time": time_label,
                "carbon_intensity": round(base, 2)
            })
            
        return forecast_list

    @classmethod
    def calculate_appliance_carbon(cls, power_w: float, duration_hours: float) -> float:
        """[기존 로직 유지] 특정 가전제품의 전력 소모량과 가동시간 기준 예상 탄소 배출량(g)을 연산합니다."""
        current_intensity = cls.get_current_carbon()["carbon_intensity"]
        power_kw = power_w / 1000.0
        
        # 탄소 배출량(g) = 전력소모량(kW) * 사용시간(h) * 탄소강도(gCO2/kWh)
        total_carbon_g = power_kw * duration_hours * current_intensity
        return round(total_carbon_g, 2)