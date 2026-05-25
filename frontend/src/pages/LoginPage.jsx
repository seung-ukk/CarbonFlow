import { useState } from "react";
import { mockLogin, mockRegister } from "../services/mockAuth";

const INPUT_CLASS =
  "mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-400";

function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", passwordConfirm: "" });
  const [message, setMessage] = useState({ text: "", isError: true });
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === "signup";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setForm({ username: "", email: "", password: "", passwordConfirm: "" });
    setMessage({ text: "", isError: true });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage({ text: "", isError: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setMessage({ text: "아이디와 비밀번호를 입력해주세요.", isError: true });
      return;
    }

    if (isSignup && form.password !== form.passwordConfirm) {
      setMessage({ text: "비밀번호가 일치하지 않습니다.", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignup) {
        mockRegister({ username: form.username.trim(), email: form.email.trim(), password: form.password });
        switchMode("login");
        setMessage({ text: "회원가입 성공! 로그인해주세요.", isError: false });
      } else {
        const authData = mockLogin({ username: form.username.trim(), password: form.password });
        if (!authData?.token) {
          setMessage({ text: "로그인 응답에 토큰이 없습니다.", isError: true });
          return;
        }
        onLoginSuccess?.(authData);
      }
    } catch (error) {
      setMessage({ text: error.message, isError: true });
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
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
            className={INPUT_CLASS}
            placeholder="아이디"
          />
        </label>

        {isSignup && (
          <label className="block">
            <span className="label-text">이메일</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={INPUT_CLASS}
              placeholder="이메일"
            />
          </label>
        )}

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

        {isSignup && (
          <label className="block">
            <span className="label-text">비밀번호 확인</span>
            <input
              type="password"
              value={form.passwordConfirm}
              onChange={(e) => updateField("passwordConfirm", e.target.value)}
              className={INPUT_CLASS}
              placeholder="비밀번호 재입력"
            />
          </label>
        )}

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
