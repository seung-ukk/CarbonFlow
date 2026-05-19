import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
  Label,
} from "recharts";

function ForecastChart({ data }) {
  const chartData = data.forecasts;
  const bestStart = data.best_window.start;
  const bestEnd = data.best_window.end;

  const bestPoint = chartData.reduce((min, item) =>
    item.carbon_intensity < min.carbon_intensity ? item : min
  );

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-7 shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">24시간 탄소강도 예측</h2>
        </div>

        <div className="rounded-2xl bg-green-500 text-white px-5 py-3 text-lg font-bold">
          최적 {bestStart} - {bestEnd}
        </div>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

            <XAxis dataKey="hour" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />

            <Line
              type="monotone"
              dataKey="carbon_intensity"
              stroke="#94a3b8"
              strokeWidth={4}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isBest = payload.hour === bestPoint.hour;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={isBest ? 8 : 6}
        fill={isBest ? "#22c55e" : "#94a3b8"}
        stroke={isBest ? "#30f274" : "#94a3b8"}
        strokeWidth={isBest ? 3 : 1}
      />
    );
  }}
            />

           
           
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ForecastChart;