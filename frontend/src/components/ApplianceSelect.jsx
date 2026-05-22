const DEFAULT_APPLIANCES = [
  "세탁기",
  "건조기",
  "식기세척기",
  "에어컨",
  "전기차 충전기",
];

function ApplianceSelect({
  selected = [],
  onChange,
  onRecommend,
  title = "가전 선택",
  buttonLabel = "AI 추천 받기",
  appliances = DEFAULT_APPLIANCES,
  isLoading = false,
  layout = "grid",
}) {
  const toggle = (item) => {
    if (!onChange) return;
    if (selected.includes(item)) {
      onChange(selected.filter((v) => v !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <section className="card">
      <h3 className="card-title mb-5">{title}</h3>

      <div
        className={
          layout === "vertical"
            ? "flex flex-col gap-3"
            : "grid grid-cols-1 md:grid-cols-2 gap-3"
        }
      >
        {appliances.map((item) => (
          <label key={item} className="select-card">
            <input
              type="checkbox"
              className="w-4 h-4 accent-violet-600 rounded"
              checked={selected.includes(item)}
              onChange={() => toggle(item)}
            />
            <span className="font-semibold text-sm text-gray-800">{item}</span>
          </label>
        ))}
      </div>

      {onRecommend && (
        <button
          onClick={() => onRecommend(selected)}
          disabled={isLoading || selected.length === 0}
          className="green-button w-full mt-6"
        >
          {isLoading ? "추천 생성 중..." : buttonLabel}
        </button>
      )}
    </section>
  );
}

export default ApplianceSelect;
