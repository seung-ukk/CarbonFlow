# src/carbon/kpx_client.py
import random

class KPXClient:
    def get_realtime_intensity(self) -> float:
        """대한민국 실시간 평균 탄소강도(gCO2/kWh) 모방 데이터를 반환합니다.
        Day 2 실제 공공데이터포털 API 연동 시 이 내부 로직만 requests 기반으로 리팩터링됩니다.
        """
        # 한국 전력망 기준 현실적인 수치 범위인 410 ~ 450 사이를 오차 없이 반환
        return round(random.uniform(410.0, 450.0), 2)