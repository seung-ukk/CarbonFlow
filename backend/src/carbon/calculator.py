# src/carbon/calculator.py
from datetime import datetime, timedelta
from src.carbon.kpx_client import KPXClient

kpx_client = KPXClient()

class CarbonCalculator:
    @classmethod
    def get_current_carbon(cls) -> dict:
        """현재 시점의 탄소강도 및 상태 등급을 반환합니다."""
        base_intensity = kpx_client.get_realtime_intensity()
        current_hour = datetime.now().hour

        # 친환경 버프 시나리오: 낮 시간(11시~15시)에는 태양광 발전량 급증 기믹 반영
        discount = 0.8 if 11 <= current_hour <= 15 else 1.0
        final_intensity = round(base_intensity * discount, 2)
        
        status = "좋음" if final_intensity < 360 else "보통" if final_intensity < 430 else "나쁨"

        return {
            "carbon_intensity": final_intensity,
            "status": status,
            "unit": "gCO2/kWh"
        }

    @classmethod
    def get_24h_forecast(cls) -> list:
        """프론트엔드 차트 시각화용 24시간 예측 데이터를 생성합니다."""
        now = datetime.now()
        forecast = []
        
        for i in range(24):
            future_time = now + timedelta(hours=i)
            hour = future_time.hour
            
            # 전력 피크 타임과 새벽 시간대의 유기적인 변동 모방
            if 0 <= hour < 6:
                base = 370.0
            elif 8 <= hour <= 10 or 18 <= hour <= 21:
                base = 460.0
            else:
                base = 410.0
                
            # 낮 시간대 친환경 버프 반영
            if 12 <= hour <= 14:
                base = base * 0.75

            forecast.append({
                "time": future_time.strftime("%H:00"),
                "carbon_intensity": round(base, 2)
            })
        return forecast

    @classmethod
    def calculate_appliance_carbon(cls, power_w: float, duration_hours: float) -> float:
        """[추가 구현] 특정 가전제품의 전력 소모량과 가동시간을 기준으로 예상 탄소 배출량(g)을 연산합니다.
        W(와트) 단위를 kW(킬로와트)로 변환한 뒤 실시간 탄소강도를 곱합니다.
        """
        current_intensity = cls.get_current_carbon()["carbon_intensity"]
        power_kw = power_w / 1000.0
        # 탄소 배출량(g) = 전력소모량(kW) * 사용시간(h) * 탄소강도(gCO2/kWh)
        total_carbon_g = power_kw * duration_hours * current_intensity
        return round(total_carbon_g, 2)