function RecommendationCard({ item }) {
  const optimalDate = new Date(item.optimal_time);
  const timeLabel = `${optimalDate.getHours()}시 ${optimalDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}분`;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-white">{item.appliance_kr}</h4>
        <span className="text-green-400 font-bold text-2xl">
          {item.saving_percent}%
        </span>
      </div>

      <p className="text-slate-300 mt-3 text-sm">{item.message}</p>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="sub-card p-4">
          <p className="label-text">지금 사용</p>
          <p className="mt-1 text-2xl font-bold text-red-400">
            {item.current_co2}
            <span className="text-sm text-slate-400 ml-1">g</span>
          </p>
        </div>
        <div className="sub-card p-4">
          <p className="label-text">{timeLabel} 사용</p>
          <p className="mt-1 text-2xl font-bold text-green-400">
            {item.optimal_co2}
            <span className="text-sm text-slate-400 ml-1">g</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecommendationCard;