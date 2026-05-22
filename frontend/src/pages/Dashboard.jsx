import { useState } from "react";
import Sidebar from "../components/Sidebar";
import HomePage from "./HomePage";
import ForecastPage from "./ForecastPage";
import RecommendPage from "./RecommendPage";
import AppliancePage from "./AppliancePage";

const ROUTES = {
  home: HomePage,
  forecast: ForecastPage,
  recommend: RecommendPage,
  favorite: AppliancePage,
};

function Dashboard() {
  const [route, setRoute] = useState("home");
  const [favoriteAppliances, setFavoriteAppliances] = useState([]);

  const PageComponent = ROUTES[route] ?? HomePage;

  return (
    <div className="flex min-h-screen bg-[#faf5ff]">
      <Sidebar route={route} onNavigate={setRoute} />
      <main className="flex-1 p-8 overflow-x-hidden">
        <PageComponent
          onNavigate={setRoute}
          favoriteAppliances={favoriteAppliances}
          onFavoriteAppliancesChange={setFavoriteAppliances}
        />
      </main>
    </div>
  );
}

export default Dashboard;
