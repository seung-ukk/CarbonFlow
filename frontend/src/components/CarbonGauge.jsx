function CarbonGauge({ intensity, renewable, level }) {
  const maxIntensity = 600;
  const ratio = Math.min(Math.max(intensity / maxIntensity, 0), 1);
  const needleAngle = -90 + ratio * 180;

  const levelTextMap = {
    low: {
      label: "낮음",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
      status: "지금은 전기가 비교적 친환경적입니다.",
    },
    medium: {
      label: "보통",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      status: "현재 전력망은 보통 수준입니다.",
    },
    high: {
      label: "높음",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
      status: "지금은 탄소 배출이 많은 시간대입니다.",
    },
  };

  const currentLevel = levelTextMap[level] ?? levelTextMap.medium;

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="card-title">현재 탄소강도</h2>
          <p className="page-subtitle">초록에 가까울수록 사용하기 좋은 시간입니다.</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${currentLevel.bg} ${currentLevel.border} ${currentLevel.color}`}
        >
          {currentLevel.label}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-[360px] h-[210px]">
          <svg viewBox="0 0 320 190" className="w-full h-full">
            <defs>
              <linearGradient id="carbonGaugeGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="45%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path
              d="M 34 154 A 126 126 0 0 1 286 154"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <path
              d="M 34 154 A 126 126 0 0 1 286 154"
              fill="none"
              stroke="url(#carbonGaugeGradient)"
              strokeWidth="24"
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute left-1/2 bottom-[50px] h-[112px] w-1 -translate-x-1/2">
            <div
              className="h-full w-full origin-bottom rounded-full bg-gray-900 shadow-sm transition-transform"
              style={{ transform: `rotate(${needleAngle}deg)` }}
            />
          </div>
          <div className="absolute left-1/2 bottom-[42px] h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white bg-gray-900 shadow" />

          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="text-5xl font-extrabold text-gray-900 leading-none">{intensity}</p>
            <p className="mt-1 text-xs font-semibold text-gray-500">gCO₂/kWh</p>
          </div>
        </div>

        <div className="flex w-full max-w-[360px] justify-between text-xs font-semibold text-gray-400">
          <span>낮음</span>
          <span>보통</span>
          <span>높음</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-7">
          <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
            <p className="label-text">재생에너지 비중</p>
            <p className="text-3xl font-extrabold mt-2 text-green-700">{renewable}%</p>
          </div>

          <div className={`rounded-2xl border p-4 ${currentLevel.bg} ${currentLevel.border}`}>
            <p className="label-text">현재 상태</p>
            <p className={`mt-2 text-sm font-bold leading-snug ${currentLevel.color}`}>
              {currentLevel.status}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CarbonGauge;
