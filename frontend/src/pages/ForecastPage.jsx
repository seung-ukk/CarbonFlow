import { useEffect, useState } from "react";
import ForecastChart from "../components/ForecastChart";
import { forecastData } from "../services/mockData";
import { SHOW_API_ERRORS, getApiErrorMessage, getForecast } from "../services/api";

function formatRange(startIso, endIso) {
  if (!startIso || !endIso) return "-";
  const hh = (d) => `${new Date(d).getHours().toString().padStart(2, "0")}:00`;
  return `${hh(startIso)} - ${hh(endIso)}`;
}

function getWorstWindow(forecasts) {
  if (!forecasts || forecasts.length === 0) return null;

  const worst = forecasts.reduce((max, item) =>
    item.carbon_intensity > max.carbon_intensity ? item : max
  );
  const end = new Date(worst.hour);
  end.setHours(end.getHours() + 1);
  return { start: worst.hour, end: end.toISOString() };
}

const STAT_CARDS = (best, worst, minIntensity) => [
  {
    label: "최적 시간대",
    value: formatRange(best.start, best.end),
    color: "text-green-600",
    bg: "bg-green-50",
    change: "탄소 절감 최적",
    up: true,
  },
  {
    label: "최저 탄소강도",
    value: `${minIntensity}`,
    unit: "gCO₂/kWh",
    color: "text-gray-900",
    bg: "bg-blue-50",
    change: "오늘의 최저",
    up: true,
  },
  {
    label: "주의 시간대",
    value: formatRange(worst.start, worst.end),
    color: "text-red-500",
    bg: "bg-red-50",
    change: "탄소 배출 최고",
    up: false,
  },
  {
    label: "예측 기간",
    value: "12",
    unit: "시간",
    color: "text-violet-700",
    bg: "bg-violet-50",
    change: "현재 ~ 내일 새벽",
    up: null,
  },
];

function StatCard({ label, value, unit, color, bg, change, up }) {
  return (
    <div className={`rounded-2xl ${bg} border border-white p-5`}>
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p className={`text-2xl font-extrabold ${color} leading-tight`}>
        {value}
        {unit && <span className="text-sm font-semibold text-gray-500 ml-1">{unit}</span>}
      </p>
      <div className="flex items-center gap-1 mt-2">
        {up !== null && (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-3 h-3 ${up ? "text-green-500" : "text-red-400 rotate-180"}`}
          >
            <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l6.75 6.75a.75.75 0 11-1.06 1.06L12.75 6.31v13.19a.75.75 0 01-.75.75z" clipRule="evenodd" />
          </svg>
        )}
        <span className="text-xs text-gray-500">{change}</span>
      </div>
    </div>
  );
}

function ForecastPage() {
  const [forecast, setForecast] = useState(forecastData);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadForecast = async () => {
      try {
        const data = await getForecast();
        if (ignore) return;
        setForecast(data ?? forecastData);
        setErrorMessage("");
      } catch (error) {
        if (ignore) return;
        setErrorMessage(
          getApiErrorMessage(error, "12시간 예측 데이터를 불러오지 못했습니다.")
        );
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadForecast();

    return () => {
      ignore = true;
    };
  }, []);

  const forecasts = forecast.forecasts ?? [];
  const bestWindow = forecast.best_window;
  const worstWindow = forecast.worst_window ?? getWorstWindow(forecasts);
  const minIntensity =
    forecasts.length > 0
      ? Math.min(...forecasts.map((f) => f.carbon_intensity))
      : "-";
  const stats = STAT_CARDS(bestWindow, worstWindow, minIntensity);

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">탄소강도 예측</h1>
          <p className="page-subtitle">시간대별 탄소강도 변화와 최적 사용 시간대를 확인하세요.</p>
        </div>
      </div>

      {isLoading && (
        <p className="mb-4 rounded-2xl bg-white border border-gray-100 px-4 py-3 text-sm text-gray-500">
          예측 데이터를 불러오는 중입니다...
        </p>
      )}

      {SHOW_API_ERRORS && errorMessage && (
        <p className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600">
          {errorMessage}
        </p>
      )}

      {/* 차트 */}
      <ForecastChart data={forecasts} />

      {/* 통계 카드 4개 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}

export default ForecastPage;
