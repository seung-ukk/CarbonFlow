import { useState } from "react";
import { getApiErrorMessage, login } from "../services/api";

function LoginPage({ onLoginSuccess }) {
  const [form, setForm] = useState({
    userId: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.userId.trim() || !form.password.trim()) {
      setMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      const authData = await login({
        userId: form.userId.trim(),
        password: form.password,
      });

      if (!authData?.token) {
        setMessage("로그인 응답에 토큰이 없습니다.");
        return;
      }

      onLoginSuccess?.(authData);
    } catch (error) {
      setMessage(getApiErrorMessage(error, "아이디 또는 비밀번호가 일치하지 않습니다."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
      <header className="mb-6">
        <h1 className="page-title">LOGIN</h1>
        <p className="page-subtitle">테스트 계정으로 로그인합니다.</p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <label className="block">
          <span className="label-text">아이디</span>
          <input
            type="text"
            value={form.userId}
            onChange={(event) => updateField("userId", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            placeholder="testuser"
          />
        </label>

        <label className="block">
          <span className="label-text">비밀번호</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            placeholder="password"
          />
        </label>

        {message && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {message}
          </p>
        )}

        <button type="submit" disabled={isLoading} className="green-button w-full">
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
