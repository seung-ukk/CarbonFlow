import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
  Tooltip,
} from "recharts";

function ForecastChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <section className="card">
        <h3 className="card-title mb-5">24시간 탄소강도 예측</h3>
        <p className="text-sm text-gray-500">표시할 예측 데이터가 없습니다.</p>
      </section>
    );
  }

  const minItem = data.reduce((min, item) =>
    item.carbon_intensity < min.carbon_intensity ? item : min
  );

  return (
    <section className="card">
      <h3 className="card-title mb-5">24시간 탄소강도 예측</h3>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#374151" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#374151" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />

            <XAxis
              dataKey="hour"
              stroke="#e5e7eb"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickFormatter={(value) => `${new Date(value).getHours()}:00`}
            />

            <YAxis
              stroke="#e5e7eb"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              domain={[0, 600]}
              ticks={[0, 150, 300, 450, 600]}
            />

            {/* 
            <Tooltip
              labelFormatter={(value) => `${new Date(value).getHours()}:00`}
              formatter={(value) => [`${value} gCO2/kWh`, "탄소강도"]}
            />
            */}

            <Area
              type="monotone"
              dataKey="carbon_intensity"
              stroke="#374151"
              strokeWidth={2.5}
              fill="url(#carbonGrad)"
              dot={{ fill: "#374151", stroke: "#ffffff", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, fill: "#374151" }}
            />

            <ReferenceDot
              x={minItem.hour}
              y={minItem.carbon_intensity}
              r={7}
              fill="#16a34a"
              stroke="#bbf7d0"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-green-600 font-bold text-sm">
        최저 탄소강도: {new Date(minItem.hour).getHours()}:00 &bull;{" "}
        {minItem.carbon_intensity} gCO2/kWh
      </p>
    </section>
  );
}

export default ForecastChart;
