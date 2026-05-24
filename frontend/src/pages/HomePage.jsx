import { useEffect, useState } from "react";
import CarbonGauge from "../components/CarbonGauge";
import { currentCarbon as mockCurrentCarbon, recommendations as mockRecommendations } from "../services/mockData";
import {
  fallbackAppliances,
  normalizeAgentRecommendation,
} from "../services/recommendationMapper";
import {
  REFRESH_INTERVAL_MS,
  SHOW_API_ERRORS,
  getApiErrorMessage,
  getAgentRecommendation,
  getAppliances,
  getCurrentCarbon,
} from "../services/api";

function formatRecommendationTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return `${date.getHours().toString().padStart(2, "0")}:00`;
}

function ChatPanel({ topPick }) {
  const optimalTime = formatRecommendationTime(topPick.optimal_time);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `안녕하세요! 오늘 탄소강도는 현재 높은 상태예요. ${topPick.appliance_kr}를 ${optimalTime}에 사용하면 CO₂를 ${topPick.saving_percent}% 절감할 수 있습니다.`,
    },
  ]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "추천 페이지에서 가전별 최적 사용 시간을 확인해보세요!" },
      ]);
    }, 600);
  };

  return (
    <div className="card flex flex-1 flex-col">
      <p className="page-title mb-4">CARBONFLOW CHAT</p>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-violet-600">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-violet-100 text-violet-900"
                  : "bg-gray-50 text-gray-800 border border-gray-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <div className="border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 bg-white">
        <input
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          placeholder="무엇이 궁금하신가요?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-violet-600 hover:text-white flex items-center justify-center transition-colors text-gray-500"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SuggestionCard({ topPick, onNavigate }) {
  return (
    <div className="card border-l-4 border-l-green-400">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500 shrink-0">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-bold text-gray-700">오늘의 AI 추천</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        <span className="font-semibold text-gray-800">{topPick.appliance_kr} 사용 추천</span>
        &nbsp;— {formatRecommendationTime(topPick.optimal_time)}에 사용하면 CO₂를{" "}
        <span className="text-green-600 font-bold">{topPick.saving_percent}%</span> 절감할 수 있어요.
      </p>
      <button
        type="button"
        onClick={() => onNavigate?.("recommend")}
        className="mt-4 px-5 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
      >
        자세히 보기
      </button>
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <div className="grid gap-6 lg:grid-cols-[45%_1fr]">
      <div className="flex flex-col gap-4">
        <section className="card animate-pulse">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-3">
              <div className="h-5 w-32 rounded bg-gray-100" />
              <div className="h-3 w-56 rounded bg-gray-100" />
            </div>
            <div className="h-7 w-16 rounded-full bg-gray-100" />
          </div>
          <div className="mx-auto h-[210px] max-w-[360px] rounded-t-full bg-gray-100" />
          <div className="mt-7 h-20 rounded-2xl bg-gray-100" />
        </section>

        <section className="card animate-pulse">
          <div className="h-4 w-28 rounded bg-gray-100" />
          <div className="mt-4 h-4 w-full rounded bg-gray-100" />
          <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />
          <div className="mt-5 h-9 w-28 rounded-xl bg-gray-100" />
        </section>
      </div>

      <section className="card min-h-[420px] animate-pulse">
        <div className="h-6 w-48 rounded bg-gray-100" />
        <div className="mt-8 space-y-4">
          <div className="h-16 w-4/5 rounded-2xl bg-gray-100" />
          <div className="ml-auto h-14 w-2/3 rounded-2xl bg-gray-100" />
          <div className="h-16 w-3/4 rounded-2xl bg-gray-100" />
        </div>
        <div className="mt-24 h-14 rounded-2xl bg-gray-100" />
      </section>
    </div>
  );
}

function HomePage({ onNavigate }) {
  const [currentCarbon, setCurrentCarbon] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const topPick = recommendations?.items?.[0] ?? null;

  useEffect(() => {
    let ignore = false;

    const loadHomeData = async () => {
      const [currentResult, appliancesResult] = await Promise.allSettled([
        getCurrentCarbon(),
        getAppliances(),
      ]);

      if (ignore) return;

      const nextErrors = [];
      let nextCurrentCarbon = mockCurrentCarbon;
      let nextRecommendations = mockRecommendations;

      if (currentResult.status === "fulfilled") {
        nextCurrentCarbon = currentResult.value ?? mockCurrentCarbon;
      } else {
        nextErrors.push(
          getApiErrorMessage(
            currentResult.reason,
            "현재 탄소강도 데이터를 불러오지 못했습니다."
          )
        );
      }

      if (appliancesResult.status === "fulfilled") {
        const appliances =
          Array.isArray(appliancesResult.value) && appliancesResult.value.length > 0
            ? appliancesResult.value
            : fallbackAppliances;
        const topAppliance = appliances[0];

        try {
          const recommendation = await getAgentRecommendation(topAppliance.id);
          if (!ignore) {
            nextRecommendations = {
              items: [
                normalizeAgentRecommendation({
                  appliance: topAppliance,
                  currentCarbon: nextCurrentCarbon,
                  recommendation,
                }),
              ],
              agent_steps: [],
            };
          }
        } catch (error) {
          nextErrors.push(
            getApiErrorMessage(error, "AI 추천 결과를 불러오지 못했습니다.")
          );
        }
      } else {
        nextErrors.push(
          getApiErrorMessage(
            appliancesResult.reason,
            "가전제품 목록을 불러오지 못했습니다."
          )
        );
      }

      if (ignore) return;
      setCurrentCarbon(nextCurrentCarbon);
      setRecommendations(nextRecommendations);
      setErrorMessages(nextErrors);
      setIsLoading(false);
    };

    loadHomeData();
    const refreshTimer = setInterval(loadHomeData, REFRESH_INTERVAL_MS);

    return () => {
      ignore = true;
      clearInterval(refreshTimer);
    };
  }, []);

  const hasDashboardData = Boolean(currentCarbon && topPick);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <header className="mb-4">
        <h1 className="page-title">DASHBOARD</h1>
        <p className="page-subtitle">현재 탄소강도와 AI 추천을 확인하세요.</p>
      </header>

      {isLoading && !hasDashboardData && (
        <p className="mb-4 rounded-2xl bg-white border border-gray-100 px-4 py-3 text-sm text-gray-500">
          대시보드 데이터를 불러오는 중입니다...
        </p>
      )}

      {SHOW_API_ERRORS &&
        errorMessages.map((message) => (
          <p
            key={message}
            className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600"
          >
            {message}
          </p>
        ))}

      {isLoading && !hasDashboardData ? (
        <DashboardLoadingState />
      ) : (
        hasDashboardData && (
          <div className="flex items-stretch gap-6">
        {/* 왼쪽 패널: 게이지 + 제안 카드 */}
        <div className="flex w-[45%] min-w-0 flex-col gap-4">
          <CarbonGauge
            intensity={currentCarbon.carbon_intensity}
            status={currentCarbon.status}
            unit={currentCarbon.unit}
            renewableRatio={currentCarbon.renewable_ratio}
            coalRatio={currentCarbon.coal_ratio}
          />
          <SuggestionCard topPick={topPick} onNavigate={onNavigate} />
        </div>

        {/* 오른쪽 패널: 챗봇 */}
        <div className="flex min-w-0 flex-1">
          <ChatPanel
            key={`${topPick.appliance}-${topPick.optimal_time}`}
            topPick={topPick}
          />
        </div>
          </div>
        )
      )}

      {!isLoading && !hasDashboardData && (
        <div className="card">
          <p className="text-sm text-gray-500">
            표시할 대시보드 데이터가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
