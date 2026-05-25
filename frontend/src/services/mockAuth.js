// 임시 mock 인증 — 백엔드 연동 시 이 파일 삭제 후 api.js의 login/register로 교체
const MOCK_USERS = [
  { username: "testuser", email: "test@test.com", password: "password", token: "mock-token-testuser" },
];

// 페이지 새로고침 시 초기화됨 (in-memory)
const users = [...MOCK_USERS];

export const mockLogin = ({ username, password }) => {
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
  return { token: user.token, username: user.username };
};

export const mockRegister = ({ username, email, password }) => {
  if (users.some((u) => u.username === username)) {
    throw new Error("이미 사용 중인 아이디입니다.");
  }
  users.push({ username, email, password, token: `mock-token-${username}` });
};
