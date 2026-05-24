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
  const getValue = (item) => (typeof item === "string" ? item : item.id);
  const getLabel = (item) => (typeof item === "string" ? item : item.name);

  const toggle = (item) => {
    if (!onChange) return;
    const value = getValue(item);
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
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
        {appliances.map((item) => {
          const value = getValue(item);
          const label = getLabel(item);

          return (
            <label key={value} className="select-card">
              <input
                type="checkbox"
                className="w-4 h-4 accent-violet-600 rounded"
                checked={selected.includes(value)}
                onChange={() => toggle(item)}
              />
              <span className="font-semibold text-sm text-gray-800">{label}</span>
            </label>
          );
        })}
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
