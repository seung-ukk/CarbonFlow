import { useState } from "react";
import CarbonGauge from "../components/CarbonGauge";
import ForecastChart from "../components/ForecastChart";
import AgentReasoning from "../components/AgentReasoning";
import ApplianceSelect from "../components/ApplianceSelect";
import { currentCarbon, forecastData, recommendations } from "../services/mockData";

function PageHeader({ title, desc }) {
  return (
    <header className="mb-8">
      <h2 className="page-title">{title}</h2>
      <p className="page-desc">{desc}</p>
    </header>
  );
}

function InfoBox({ label, value, className = "" }) {
  return (
    <div className="sub-card">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold ${className}`}>{value}</p>
    </div>
  );
}

function RecommendationCard({ item }) {
  return (
    <div className="card">
      <h3 className="green-title mb-4">{item.appliance_kr}</h3>
      <p className="text-slate-300 mb-5">{item.message}</p>

      <div className="grid grid-cols-2 gap-4">
        <InfoBox label="지금 사용 시" value={`${item.current_co2}g`} />
        <InfoBox
          label="추천 시간 사용 시"
          value={`${item.optimal_co2}g`}
          className="text-green-400"
        />
      </div>
    </div>
  );
}

function Dashboard() {
  const [menu, setMenu] = useState("home");
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleRecommend = () => {
    setIsLoading(true);
    setShowResult(false);

    setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
    }, 2000);
  };

  const menus = [
    ["home", "홈"],
    ["forecast", "예측"],
    ["recommend", "추천"],
    ["appliance", "가전"],
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6">
        <h1 className="text-3xl font-bold text-green-400 mb-10">
          탄소절감...
        </h1>

        <nav className="flex flex-col gap-3">
          {menus.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMenu(id)}
              className={`menu-button ${menu === id ? "menu-button-active" : ""}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {menu === "home" && (
          <>
            <PageHeader
              title="홈 대시보드"
              desc="현재 탄소강도와 AI 추천을 확인하세요."
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CarbonGauge
                intensity={currentCarbon.carbon_intensity}
                renewable={currentCarbon.renewable_ratio}
                coal={currentCarbon.coal_ratio}
                updatedAt={currentCarbon.updated_at}
                level={currentCarbon.level}
              />

              <section className="card">
                <h3 className="green-title mb-5">오늘의 AI 추천</h3>

                <p className="text-3xl font-bold mb-3">세탁기 사용 추천</p>

                <p className="text-slate-400 text-lg">
                  새벽 1시에 사용하면 CO₂를 38% 절감할 수 있어요.
                </p>

                <button
                  onClick={() => setMenu("recommend")}
                  className="green-button mt-6"
                >
                  추천 상세 보기
                </button>
              </section>
            </div>
          </>
        )}

        {menu === "forecast" && (
          <>
            <PageHeader
              title="탄소강도 예측"
              desc="시간대별 탄소강도 변화와 최적 사용 시간대를 확인하세요."
            />

            <ForecastChart data={forecastData.forecasts} />

            <section className="card mt-6">
              <h3 className="text-2xl font-bold mb-4">세부 예측사항</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoBox
                  label="최적 시간대"
                  value={`${forecastData.best_window.start} - ${forecastData.best_window.end}`}
                  className="text-green-400"
                />

                <InfoBox label="가장 낮은 탄소강도" value="270 gCO₂/kWh" />

                <InfoBox
                  label="주의 시간대"
                  value="19:00 - 21:00"
                  className="text-red-400"
                />
              </div>
            </section>
          </>
        )}

        {menu === "recommend" && (
          <>
            <PageHeader
              title="AI 추천"
              desc="가전별 최적 사용 시간과 절감량을 확인하세요."
            />

            <ApplianceSelect onRecommend={handleRecommend} />

            {isLoading && (
              <div className="card mt-6">
                <p className="text-green-400 font-bold animate-pulse">
                  AI가 최적 사용 시간대를 분석 중입니다...
                </p>
              </div>
            )}

            {showResult && (
              <>
                <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {recommendations.items.map((item) => (
                    <RecommendationCard key={item.appliance} item={item} />
                  ))}
                </div>

                <section className="card mt-6">
                  <h3 className="text-2xl font-bold mb-4">
                    1일 추천 타임테이블
                  </h3>

                  <div className="space-y-3">
                    <div className="sub-card">
                      01:00 - 03:00 세탁기 / 전기차 충전 추천
                    </div>

                    <div className="sub-card">
                      12:00 - 14:00 식기세척기 사용 가능
                    </div>

                    <div className="sub-card text-red-400">
                      19:00 - 21:00 사용 자제 권장
                    </div>
                  </div>
                </section>

                <AgentReasoning steps={recommendations.agent_steps} />
              </>
            )}
          </>
        )}

        {menu === "appliance" && (
          <>
            <PageHeader
              title="가전 관리"
              desc="자주 사용하는 가전을 등록하고 추천에 활용하세요."
            />

            <section className="card">
              <h3 className="text-2xl font-bold mb-5">가전 등록</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["세탁기", "건조기", "식기세척기", "에어컨", "전기차 충전기"].map(
                  (item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 sub-card"
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-green-500"
                      />
                      <span className="font-semibold">{item}</span>
                    </label>
                  )
                )}
              </div>

              <button className="green-button mt-6">등록하기</button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;