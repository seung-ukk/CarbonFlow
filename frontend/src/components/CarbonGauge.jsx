function CarbonGauge({ intensity, renewable, level }) {
  let statusText = "";

  if (level === "low") {
    statusText = "지금 전기가 친환경적입니다";
  } else if (level === "medium") {
    statusText = "현재 전력망이 안정적인 상태입니다";
  } else {
    statusText = "지금은 탄소 배출이 많은 시간대입니다";
  }

  return (
    <div className="card p-7 shadow-xl">
      <h2 className="card-title mb-8">현재 탄소강도</h2>

      <div className="flex flex-col items-center">
        <div className="relative w-72 h-72">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(#22c55e_0deg,#eab308_180deg,#ef4444_360deg)]" />

          <div className="absolute inset-[22px] rounded-full bg-slate-900 flex flex-col items-center justify-center">
            <p className="text-6xl font-extrabold">{intensity}</p>
            <p className="text-2xl text-slate-400 mt-2">gCO₂/kWh</p>
          </div>
        </div>

        <p className="mt-8 text-3xl font-bold text-green-400">{level}</p>

        <div className="grid grid-cols-2 gap-4 w-full mt-10">
          <div className="sub-card p-5">
            <p className="label-text">재생에너지 비중</p>
            <p className="text-4xl font-bold mt-2">{renewable}%</p>
          </div>

          <div className="sub-card p-5">
            <p className="label-text">현재 상태</p>
            <p className="mt-6 text-xl font-semibold text-slate-200">
              {statusText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarbonGauge;