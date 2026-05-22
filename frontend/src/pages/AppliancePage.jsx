function AppliancePage({ favoriteAppliances = [], onFavoriteAppliancesChange }) {
  const removeFavorite = (item) => {
    onFavoriteAppliancesChange?.(
      favoriteAppliances.filter((appliance) => appliance !== item)
    );
  };

  return (
    <div className="space-y-5">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">즐겨찾기</h1>
        <p className="page-subtitle">추천에서 추가한 가전을 한눈에 확인하세요.</p>
      </header>

      <section className="card">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="card-title">즐겨찾기 목록</h3>
          <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1 rounded-full">
            {favoriteAppliances.length}개
          </span>
        </div>

        {favoriteAppliances.length > 0 ? (
          <div className="flex flex-col gap-3">
            {favoriteAppliances.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3"
              >
                <span className="font-semibold text-sm text-gray-800">{item}</span>
                <button
                  type="button"
                  onClick={() => removeFavorite(item)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            추천 페이지의 가전 추가에서 즐겨찾기를 먼저 추가하세요.
          </p>
        )}
      </section>
    </div>
  );
}

export default AppliancePage;
