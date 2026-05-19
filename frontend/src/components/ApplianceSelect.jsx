function ApplianceSelect({ onRecommend }) {
  const appliances = ["세탁기", "건조기", "식기세척기", "에어컨", "전기차 충전기"];

  return (
    <section className="card">
      <h3 className="card-title mb-5">가전 선택</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appliances.map((item) => (
          <label key={item} className="select-card">
            <input type="checkbox" className="w-5 h-5 accent-green-500" />
            <span className="font-semibold">{item}</span>
          </label>
        ))}
      </div>

      <button onClick={onRecommend} className="green-button w-full mt-6">
        AI 추천 받기
      </button>
    </section>
  );
}

export default ApplianceSelect;