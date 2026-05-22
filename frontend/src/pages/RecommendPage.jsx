import { useEffect, useState } from "react";
import ApplianceSelect from "../components/ApplianceSelect";
import AgentReasoning from "../components/AgentReasoning";
import { recommendations as mockRecommendations } from "../services/mockData";
import {
  SHOW_API_ERRORS,
  getApiErrorMessage,
  getAppliances,
  getRecommendations,
} from "../services/api";

const APPLIANCE_ICONS = {
  세탁기: "🫧",
  건조기: "🌀",
  식기세척기: "🍽",
  에어컨: "❄️",
  "전기차 충전기": "⚡",
};

function RecommendListItem({ item }) {
  const [liked, setLiked] = useState(false);
  const optimalDate = new Date(item.optimal_time);
  const timeLabel = `${optimalDate.getHours().toString().padStart(2, "0")}:00`;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* 아이콘 썸네일 */}
      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">
        {APPLIANCE_ICONS[item.appliance_kr] ?? "🏠"}
      </div>

      {/* 텍스트 */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm">{item.appliance_kr}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          CO₂ {item.saving_percent}% 절감 &bull; 최적 {timeLabel}
        </p>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{item.message}</p>
      </div>

      {/* 하트 버튼 */}
      <button
        type="button"
        onClick={() => setLiked((v) => !v)}
        className="shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          className={`w-5 h-5 ${liked ? "text-red-400" : "text-gray-300"}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>
    </div>
  );
}

function AIRecommendTab({ selected, onChange, applianceNames }) {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRecommend = async () => {
    setIsLoading(true);
    setResult(null);
    setErrorMessage("");

    try {
      const recommendations = await getRecommendations();
      const items = recommendations?.items ?? [];
      const filtered = items.filter((item) =>
        selected.includes(item.appliance_kr)
      );
      setResult({
        items: filtered.length > 0 ? filtered : items,
        agent_steps: recommendations?.agent_steps ?? [],
      });
    } catch (error) {
      const filtered = mockRecommendations.items.filter((item) =>
        selected.includes(item.appliance_kr)
      );
      setResult({
        items: filtered.length > 0 ? filtered : mockRecommendations.items.slice(0, 1),
        agent_steps: mockRecommendations.agent_steps,
      });
      setErrorMessage(
        getApiErrorMessage(error, "AI 추천 결과를 불러오지 못했습니다.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ApplianceSelect
        title="가전 선택"
        buttonLabel="AI 추천 받기"
        selected={selected}
        onChange={onChange}
        onRecommend={handleRecommend}
        isLoading={isLoading}
        layout="vertical"
        appliances={applianceNames}
      />

      {SHOW_API_ERRORS && errorMessage && (
        <p className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600">
          {errorMessage}
        </p>
      )}

      {result && (
        <>
          <AgentReasoning steps={result.agent_steps} />
          <div className="card">
            <p className="card-title mb-2">추천 결과</p>
            {result.items.length > 0 ? (
              result.items.map((item) => (
                <RecommendListItem key={item.appliance} item={item} />
              ))
            ) : (
              <p className="text-sm text-gray-500">선택한 가전에 대한 추천 결과가 없습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ApplianceTab({ favoriteAppliances, onFavoriteAppliancesChange, applianceNames }) {
  return (
    <div className="space-y-4">
      <ApplianceSelect
        title="즐겨찾기 추가"
        selected={favoriteAppliances}
        onChange={onFavoriteAppliancesChange}
        layout="vertical"
        appliances={applianceNames}
      />
    </div>
  );
}

function RecommendPage({
  onNavigate,
  favoriteAppliances = [],
  onFavoriteAppliancesChange,
}) {
  const [tab, setTab] = useState("ai");
  const [selected, setSelected] = useState([]);
  const [applianceNames, setApplianceNames] = useState(undefined);
  const [applianceError, setApplianceError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadAppliances = async () => {
      try {
        const appliances = await getAppliances();
        if (ignore) return;
        setApplianceNames(
          Array.isArray(appliances) ? appliances.map((item) => item.name) : undefined
        );
        setApplianceError("");
      } catch (error) {
        if (ignore) return;
        setApplianceError(
          getApiErrorMessage(error, "가전제품 목록을 불러오지 못했습니다.")
        );
      }
    };

    loadAppliances();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      {/* 뒤로 가기 + 탭 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => onNavigate?.("home")}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
          </svg>
        </button>

        {/* 토글 탭 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("ai")}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              tab === "ai"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab === "ai" && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
              </svg>
            )}
            AI 추천
          </button>
          <button
            type="button"
            onClick={() => setTab("appliance")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              tab === "appliance"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            가전 추가
          </button>
        </div>
      </div>

      {SHOW_API_ERRORS && applianceError && (
        <p className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600">
          {applianceError}
        </p>
      )}

      {tab === "ai" ? (
        <AIRecommendTab
          selected={selected}
          onChange={setSelected}
          applianceNames={applianceNames}
        />
      ) : (
        <ApplianceTab
          favoriteAppliances={favoriteAppliances}
          onFavoriteAppliancesChange={onFavoriteAppliancesChange}
          applianceNames={applianceNames}
        />
      )}
    </div>
  );
}

export default RecommendPage;
