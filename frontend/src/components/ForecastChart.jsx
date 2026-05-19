import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from "recharts";

function ForecastChart({ data }) {
  const minItem = data.reduce((min, item) =>
    item.carbon_intensity < min.carbon_intensity ? item : min
  );

  return (
    <section className="card">
      <h3 className="card-title mb-5">12시간 탄소강도 예측</h3>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />

            <XAxis
              dataKey="hour"
              tickFormatter={(value) => new Date(value).getHours() + ":00"}
            />

            <YAxis />

            <Line
              type="monotone"
              dataKey="carbon_intensity"
              stroke="#94a3b8"
              strokeWidth={3}
              dot={{ fill: "#94a3b8", stroke: "#94a3b8", r: 4 }}
              activeDot={{ r: 6 }}
            />

            <ReferenceDot
              x={minItem.hour}
              y={minItem.carbon_intensity}
              r={7}
              fill="#22c55e"
              stroke="#bbf7d0"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-green-400 font-bold">
        최저 탄소강도: {new Date(minItem.hour).getHours()}:00 ·{" "}
        {minItem.carbon_intensity} gCO₂/kWh
      </p>
    </section>
  );
}

export default ForecastChart;