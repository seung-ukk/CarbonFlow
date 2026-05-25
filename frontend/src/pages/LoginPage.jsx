import { useState } from "react";
import { login } from "../services/api";
import api from "../services/api";

const INPUT_CLASS =
  "mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-400";

function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ id: "", password: "" });
  const [message, setMessage] = useState({ text: "", isError: true });
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === "signup";

  const handleRegister = async (signUpData) => {
    try {
      const response = await api.post("/register", {
        id: signUpData.id,
        password: signUpData.password
      });
      alert(response.data.message);
      onLoginSuccess?.(response.data.data);
    } catch (error) {
      alert(error.response?.data?.detail || "가입 실패");
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setForm({ id: "", password: "" });
    setMessage({ text: "", isError: true });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage({ text: "", isError: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.id.trim() || !form.password.trim()) {
      setMessage({ text: "아이디와 비밀번호를 입력해주세요.", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignup) {
        await handleRegister({ id: form.id.trim(), password: form.password });
      } else {
        const authData = await login({ id: form.id.trim(), password: form.password });
        if (!authData?.token) {
          setMessage({ text: "로그인 응답에 토큰이 없습니다.", isError: true });
          return;
        }
        onLoginSuccess?.(authData);
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.detail ?? error.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
      <header className="mb-6">
        <h1 className="page-title">{isSignup ? "SIGN UP" : "LOGIN"}</h1>
        <p className="page-subtitle">
          {isSignup ? "새 계정을 만들어주세요." : "테스트 계정으로 로그인합니다."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <label className="block">
          <span className="label-text">아이디</span>
          <input
            type="text"
            value={form.id}
            onChange={(e) => updateField("id", e.target.value)}
            className={INPUT_CLASS}
            placeholder="아이디"
          />
        </label>

        <label className="block">
          <span className="label-text">비밀번호</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className={INPUT_CLASS}
            placeholder="비밀번호"
          />
        </label>

        {message.text && (
          <p
            className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
              message.isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <button type="submit" disabled={isLoading} className="green-button w-full">
          {isLoading ? (isSignup ? "처리 중..." : "로그인 중...") : isSignup ? "회원가입" : "로그인"}
        </button>

        <p className="text-center text-sm text-gray-500">
          {isSignup ? (
            <>
              이미 계정이 있으신가요?{" "}
              <button type="button" onClick={() => switchMode("login")} className="font-semibold text-violet-500 hover:underline">
                로그인
              </button>
            </>
          ) : (
            <>
              계정이 없으신가요?{" "}
              <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-violet-500 hover:underline">
                회원가입
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
