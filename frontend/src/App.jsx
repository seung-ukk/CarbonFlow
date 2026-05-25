import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";

const AUTH_TOKEN_KEY = "carbonflow_token";
const AUTH_USER_KEY = "carbonflow_user";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(sessionStorage.getItem(AUTH_TOKEN_KEY))
  );

  const handleLoginSuccess = ({ token, user }) => {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user ?? null));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf5ff] p-8">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;
