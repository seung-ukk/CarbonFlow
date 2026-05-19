import { useState } from "react";
import CarbonGauge from "../components/CarbonGauge";
import ForecastChart from "../components/ForecastChart";
import { currentCarbon, forecastData, recommendations } from "../services/mockData";

function ApplianceSelect() {
  const appliances = ["세탁기", "건조기", "식기세척기", "에어컨", "전기차 충전기"];

  return (
    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
      <h3 className="text-2xl font-bold mb-5">가전 선택</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appliances.map((item) => (
          <label key={item} className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
            <input type="checkbox" className="w-5 h-5 accent-green-500" />
            <span className="font-semibold">{item}</span>
          </label>
        ))}
      </div>

      <button className="mt-6 w-full bg-green-500 py-3 rounded-2xl font-bold">
        AI 추천 받기
      </button>
    </section>
  );
}

function RecommendationCard({ item }) {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
      <h3 className="text-2xl font-bold text-green-400 mb-4">{item.appliance_kr}</h3>
      <p className="text-slate-300 mb-5">{item.message}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">지금 사용 시</p>
          <p className="text-2xl font-bold">{item.current_co2}g</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">추천 시간 사용 시</p>
          <p className="text-2xl font-bold text-green-400">{item.optimal_co2}g</p>
        </div>
      </div>
    </div>
  );
}

function AgentReasoning({ steps }) {
  return (
    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
      <h3 className="text-2xl font-bold mb-5">AI Agent 추론 과정</h3>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.step} className="rounded-2xl bg-slate-800 p-4">
            <p className="font-bold text-green-400">
              {step.step}. {step.tool}
            </p>
            <p className="text-slate-300 mt-1">{step.result}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Dashboard() {
  const [menu, setMenu] = useState("home");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6">
        <h1 className="text-3xl font-bold text-green-400 mb-10">
          탄소절감...
        </h1>

        <nav className="flex flex-col gap-3">
          {[
            ["home", "홈"],
            ["forecast", "예측"],
            ["recommend", "추천"],
            ["appliance", "가전"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMenu(id)}
              className={`text-left px-4 py-3 rounded-xl ${
                menu === id
                  ? "bg-green-500 text-white font-bold"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {menu === "home" && (
          <>
            <header className="mb-8">
              <h2 className="text-3xl font-bold">홈 대시보드</h2>
              <p className="text-slate-400 mt-2">
                현재 탄소강도와 AI 추천을 확인하세요.
              </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CarbonGauge
                intensity={currentCarbon.carbon_intensity}
                renewable={currentCarbon.renewable_ratio}
                coal={currentCarbon.coal_ratio}
                updatedAt={currentCarbon.updated_at}
                level={currentCarbon.level}
              />

              <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
                <h3 className="text-2xl font-bold text-green-400 mb-5">
                  오늘의 AI 추천
                </h3>

                <p className="text-3xl font-bold mb-3">세탁기 사용 추천</p>

                <p className="text-slate-400 text-lg">
                  새벽 1시에 사용하면 CO₂를 38% 절감할 수 있어요.
                </p>

                <button
                  onClick={() => setMenu("recommend")}
                  className="mt-6 bg-green-500 px-6 py-3 rounded-2xl font-bold"
                >
                  추천 상세 보기
                </button>
              </section>
            </div>
          </>
        )}

        {menu === "forecast" && (
  <>
    <header className="mb-8">
      <h2 className="text-3xl font-bold">탄소강도 예측</h2>
      <p className="text-slate-400 mt-2">
        시간대별 탄소강도 변화와 최적 사용 시간대를 확인하세요.
      </p>
    </header>

    <ForecastChart data={forecastData} />

    <section className="mt-6 rounded-3xl bg-slate-900 border border-slate-800 p-6">
      <h3 className="text-2xl font-bold mb-4">세부 예측사항</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">최적 시간대</p>
          <p className="text-2xl font-bold text-green-400">
            {forecastData.best_window.start} - {forecastData.best_window.end}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">가장 낮은 탄소강도</p>
          <p className="text-2xl font-bold">270 gCO₂/kWh</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-4">
          <p className="text-slate-400 text-sm">주의 시간대</p>
          <p className="text-2xl font-bold text-red-400">19:00 - 21:00</p>
        </div>
      </div>
    </section>
  </>
)}

        {menu === "recommend" && (
  <>
    <header className="mb-8">
      <h2 className="text-3xl font-bold">AI 추천</h2>
      <p className="text-slate-400 mt-2">
        가전별 최적 사용 시간과 절감량을 확인하세요.
      </p>
    </header>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {recommendations.recommendations.map((item) => (
        <section
          key={item.appliance}
          className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
        >
          <h3 className="text-2xl font-bold text-green-400 mb-4">
            {item.appliance_kr}
          </h3>

          <p className="text-slate-300 mb-5">{item.message}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-slate-400 text-sm">지금 사용 시</p>
              <p className="text-2xl font-bold">{item.current_co2}g</p>
            </div>

            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-slate-400 text-sm">추천 시간 사용 시</p>
              <p className="text-2xl font-bold text-green-400">
                {item.optimal_co2}g
              </p>
            </div>
          </div>

          <p className="mt-5 text-green-400 font-bold">
            {item.saving_percent}% 절감 · {item.optimal_time} 추천
          </p>
        </section>
      ))}
    </div>

    <section className="mt-6 rounded-3xl bg-slate-900 border border-slate-800 p-6">
      <h3 className="text-2xl font-bold mb-4">1일 추천 타임테이블</h3>

      <div className="space-y-3">
        <div className="rounded-2xl bg-slate-800 p-4">
          01:00 - 03:00 세탁기 / 전기차 충전 추천
        </div>
        <div className="rounded-2xl bg-slate-800 p-4">
          12:00 - 14:00 식기세척기 사용 가능
        </div>
        <div className="rounded-2xl bg-slate-800 p-4 text-red-400">
          19:00 - 21:00 사용 자제 권장
        </div>
      </div>
    </section>
  </>
)}

{menu === "appliance" && (
  <>
    <header className="mb-8">
      <h2 className="text-3xl font-bold">가전 관리</h2>
      <p className="text-slate-400 mt-2">
        자주 사용하는 가전을 등록하고 추천에 활용하세요.
      </p>
    </header>

    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
      <h3 className="text-2xl font-bold mb-5">가전 등록</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["세탁기", "건조기", "식기세척기", "에어컨", "전기차 충전기"].map(
          (item) => (
            <label
              key={item}
              className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4"
            >
              <input type="checkbox" className="w-5 h-5 accent-green-500" />
              <span className="font-semibold">{item}</span>
            </label>
          )
        )}
      </div>

      <button className="mt-6 bg-green-500 px-6 py-3 rounded-2xl font-bold">
        등록하기
      </button>
    </section>
  </>
)}
      </main>
    </div>
  );
}

export default Dashboard;