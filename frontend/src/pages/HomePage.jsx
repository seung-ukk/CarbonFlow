import { useEffect, useState } from "react";
import CarbonGauge from "../components/CarbonGauge";
import { currentCarbon as mockCurrentCarbon, recommendations as mockRecommendations } from "../services/mockData";
import {
  SHOW_API_ERRORS,
  getApiErrorMessage,
  getCurrentCarbon,
  getRecommendations,
} from "../services/api";

function ChatPanel({ onNavigate, topPick }) {
  const optimalHour = new Date(topPick.optimal_time).getHours();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `안녕하세요! 오늘 탄소강도는 현재 높은 상태예요. ${topPick.appliance_kr}를 새벽 ${optimalHour}시에 사용하면 CO₂를 ${topPick.saving_percent}% 절감할 수 있습니다.`,
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
        <div className="flex items-center gap-2 text-gray-400">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 cursor-pointer hover:text-gray-600">
            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 cursor-pointer hover:text-gray-600">
            <path fillRule="evenodd" d="M14.447 3.027a.75.75 0 01.527.92l-4.5 16.5a.75.75 0 01-1.448-.394l4.5-16.5a.75.75 0 01.921-.526zM16.72 6.22a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06L19.94 10.5l-3.22-3.22a.75.75 0 010-1.06zm-9.44 0a.75.75 0 010 1.06L4.06 10.5l3.22 3.22a.75.75 0 11-1.06 1.06L2.47 11.03a.75.75 0 010-1.06l3.75-3.75a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 cursor-pointer hover:text-gray-600">
            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
            <path d="M6 10.5a.75.75 0 01.75.75v1.5a4.5 4.5 0 009 0v-1.5a.75.75 0 011.5 0v1.5a6 6 0 01-5.25 5.954V21h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.796A6 6 0 015.25 12.75v-1.5A.75.75 0 016 10.5z" />
          </svg>
        </div>
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
        &nbsp;— 새벽 {new Date(topPick.optimal_time).getHours()}시에 사용하면 CO₂를{" "}
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

function HomePage({ onNavigate }) {
  const [currentCarbon, setCurrentCarbon] = useState(mockCurrentCarbon);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const topPick = recommendations.items?.[0] ?? mockRecommendations.items[0];

  useEffect(() => {
    let ignore = false;

    const loadHomeData = async () => {
      const [currentResult, recommendationResult] = await Promise.allSettled([
        getCurrentCarbon(),
        getRecommendations(),
      ]);

      if (ignore) return;

      const nextErrors = [];

      if (currentResult.status === "fulfilled") {
        setCurrentCarbon(currentResult.value ?? mockCurrentCarbon);
      } else {
        nextErrors.push(
          getApiErrorMessage(currentResult.reason, "현재 탄소강도 데이터를 불러오지 못했습니다.")
        );
      }

      if (recommendationResult.status === "fulfilled") {
        setRecommendations(recommendationResult.value ?? mockRecommendations);
      } else {
        nextErrors.push(
          getApiErrorMessage(recommendationResult.reason, "AI 추천 결과를 불러오지 못했습니다.")
        );
      }

      setErrorMessages(nextErrors);
      setIsLoading(false);
    };

    loadHomeData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <header className="mb-4">
        <h1 className="page-title">DASHBOARD</h1>
        <p className="page-subtitle">현재 탄소강도와 AI 추천을 확인하세요.</p>
      </header>

      {isLoading && (
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

      <div className="flex items-stretch gap-6">
        {/* 왼쪽 패널: 게이지 + 제안 카드 */}
        <div className="flex w-[45%] min-w-0 flex-col gap-4">
          <CarbonGauge
            intensity={currentCarbon.carbon_intensity}
            renewable={currentCarbon.renewable_ratio}
            level={currentCarbon.level}
          />
          <SuggestionCard topPick={topPick} onNavigate={onNavigate} />
        </div>

        {/* 오른쪽 패널: 챗봇 */}
        <div className="flex min-w-0 flex-1">
          <ChatPanel onNavigate={onNavigate} topPick={topPick} />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
