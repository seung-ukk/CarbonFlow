export const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.432z" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
  </svg>
);

const IconBookmark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M6.32 2.577A49.255 49.255 0 0112 2.25c1.92 0 3.813.11 5.68.327 1.497.174 2.57 1.46 2.57 2.93v16.568a.75.75 0 01-1.085.67L12 19.16l-7.165 3.584a.75.75 0 01-1.085-.67V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
  </svg>
);

const IconLogin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M7.5 3.75A3.75 3.75 0 1111.25 7.5 3.75 3.75 0 017.5 3.75zm-3 16.5a6.75 6.75 0 0113.5 0 .75.75 0 01-.75.75h-12a.75.75 0 01-.75-.75zm13.72-8.03a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 11-1.06-1.06l.97-.97H12a.75.75 0 010-1.5h7.19l-.97-.97a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

const NAV = [
  { id: "home", label: "Home", Icon: IconHome },
  { id: "forecast", label: "Prediction", Icon: IconChart },
  { id: "recommend", label: "Recommend", Icon: IconStar },
  { id: "favorite", label: "Bookmark", Icon: IconBookmark },
];

const AUTH_NAV = { id: "login", label: "Login", Icon: IconLogin };

function NavButton({ item, active, onNavigate }) {
  const { id, label, Icon } = item;

  return (
    <button
      type="button"
      onClick={() => onNavigate(id)}
      className={`flex flex-col items-center justify-center gap-1 w-full min-h-16 rounded-2xl py-3 transition-colors ${
        active
          ? "bg-violet-100 text-violet-700"
          : "text-gray-500 hover:bg-violet-50 hover:text-violet-600"
      }`}
    >
      <Icon />
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}

function Sidebar({ route, onNavigate }) {
  return (
    <aside className="w-24 shrink-0 min-h-screen bg-white border-r border-gray-100 flex flex-col items-center justify-between pt-14 pb-6">
      <nav className="flex flex-col items-center gap-3 w-full px-3">
        {NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={route === item.id}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <nav className="w-full px-3">
        <NavButton
          item={AUTH_NAV}
          active={route === AUTH_NAV.id}
          onNavigate={onNavigate}
        />
      </nav>
    </aside>
  );
}

export default Sidebar;
