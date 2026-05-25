# ⚡ CarbonFlow

> **실시간 탄소강도 기반 친환경 가전 사용 타이밍 추천 서비스**  
> Google Gemini AI 에이전트와 전력거래소(KPX) 실측 데이터를 결합해, 탄소 배출을 최소화하는 가전 가동 시간을 추천합니다.

---

## 📋 목차

- [서비스 소개](#-서비스-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [API 명세](#-api-명세)
- [환경 변수](#-환경-변수)

---

## 서비스 소개

CarbonFlow는 대한민국 전력거래소(KPX)의 실시간 전력 수요 데이터와 기상청 일사량 데이터를 분석해 **현재 전력망의 탄소강도(gCO₂/kWh)** 를 계산하고, Google Gemini AI 에이전트가 사용자의 가전제품별 최적 가동 시간을 추천해주는 서비스입니다.

세탁기, 건조기, 식기세척기 등 대기전력 소비가 큰 가전의 가동 시간을 태양광 발전이 풍부한 시간대로 조정함으로써 일상에서 손쉽게 탄소 배출을 줄일 수 있습니다.

---

## 주요 기능

### 실시간 탄소강도 대시보드
- KPX 실측 전력 수요 데이터를 5분 단위 버킷팅으로 매칭
- 현재 탄소강도를 `low / medium / high` 3단계로 시각화
- 재생에너지 비중 및 석탄 발전 비중 실시간 표시
- 15분 주기 자동 갱신

### 12시간 탄소강도 예측
- 향후 12시간의 탄소강도 변화 곡선 차트
- **최적 시간대** (탄소 최저) 및 **주의 시간대** (탄소 최고) 자동 탐색
- 낮 12~14시 태양광 인센티브 가중치 반영

### AI 에이전트 추천
- 가전제품을 선택하면 Gemini 2.5 Flash가 최적 가동 시간 추천 메시지 생성
- 실시간 탄소 데이터를 XML 프롬프트로 결합한 컨텍스트 인식 추론
- 3회 리트라이 세이프티 내장

### CarbonFlow 챗봇
- 홈 대시보드에서 AI 에이전트와 자유롭게 대화
- "이 가전제품을 언제 돌리는 게 좋을까?" 등 자유 질문 가능
- API 장애 시 fallback 응답으로 서비스 연속성 유지

### 가전 즐겨찾기
- 자주 사용하는 가전제품을 즐겨찾기에 등록하여 빠른 추천 접근

---

## 기술 스택

### Backend
| 항목 | 내용 |
|------|------|
| Framework | FastAPI 0.136 |
| AI | Google Gemini 2.5 Flash (`google-genai`) |
| DB | SQLite (aiosqlite) + JSON 파일 DB |
| 데이터 처리 | pandas (KPX CSV 버킷팅) |
| 런타임 | uvicorn + Python 3.x |

### Frontend
| 항목 | 내용 |
|------|------|
| Framework | React 19 + Vite 8 |
| 스타일 | Tailwind CSS v4 |
| HTTP | axios |
| 차트 | recharts |
| 라우팅 | react-router-dom v7 |

---

## 프로젝트 구조

```
duyoutonT16/
├── backend/
│   ├── src/
│   │   ├── main.py              # FastAPI 앱 진입점, lifespan, CORS
│   │   ├── api/
│   │   │   └── endpoints.py     # 가전 / 탄소 / 에이전트 API 라우터
│   │   ├── agent/
│   │   │   ├── gemini_client.py      # Gemini API 클라이언트, 리트라이 로직
│   │   │   └── get_gemini_content.py # 프롬프트 빌더 (추천용 / 대화용)
│   │   ├── carbon/
│   │   │   ├── calculator.py    # 탄소강도 연산 엔진 (KPX CSV 기반)
│   │   │   └── kpx_client.py   # 기상청 초단기실황 API 클라이언트
│   │   ├── core/
│   │   │   └── config.py        # 환경변수 설정 (Settings)
│   │   ├── database/
│   │   │   ├── connection.py    # SQLite / JSON DB 연결
│   │   │   └── appliances.json  # 가전제품 데이터
│   │   └── schemas/
│   │       ├── gemini.py        # Gemini 요청/응답 Pydantic 스키마
│   │       └── appliance.py     # 가전제품 스키마
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # 인증 상태 관리 (sessionStorage)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # 사이드바 + 페이지 라우팅
│   │   │   ├── HomePage.jsx     # 탄소 게이지 + AI 추천 + 챗봇
│   │   │   ├── ForecastPage.jsx # 12시간 예측 차트 + 통계 카드
│   │   │   ├── RecommendPage.jsx# AI 추천 / 가전 즐겨찾기 탭
│   │   │   ├── AppliancePage.jsx# 즐겨찾기 목록 관리
│   │   │   └── LoginPage.jsx    # 로그인
│   │   ├── components/          # 공통 UI 컴포넌트
│   │   └── services/
│   │       ├── api.js           # API 호출 함수 모음 (axios)
│   │       ├── mockData.js      # API 장애 시 fallback 데이터
│   │       └── recommendationMapper.js # 응답 정규화 유틸
│   ├── package.json
│   └── vite.config.js
│
└── docs/
    ├── agent-api.md
    ├── carbon-api.md
    ├── common-response.md
    └── 기획서.md
```

---

## 시작하기

### 사전 요구사항

- Python 3.10+
- Node.js 18+
- Google Gemini API 키 ([Google AI Studio](https://aistudio.google.com/)에서 발급)

### 1. 저장소 클론

```bash
git clone https://github.com/seung-ukk/duyoutonT16.git
cd duyoutonT16
git checkout dev
```

### 2. 백엔드 실행

```bash
cd backend

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일에 GEMINI_API_KEY 입력 (필수)

# 서버 실행
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

백엔드가 실행되면 `http://localhost:8000` 에서 접근할 수 있습니다.  
API 문서는 `http://localhost:8000/docs` 에서 확인하세요.

### 3. 프론트엔드 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드는 `http://localhost:5173` 에서 실행됩니다.

### 4. 로그인

서비스 접속 후 아래 테스트 계정으로 로그인하세요.

| 항목 | 값 |
|------|-----|
| 아이디 | `testuser` |
| 비밀번호 | `password` |

---

## API 명세

### 인증

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/login` | Mock 로그인 (토큰 발급) |

### 가전제품

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/appliances` | 전체 가전제품 목록 조회 |
| `GET` | `/api/appliances/{appliance_id}` | 특정 가전제품 상세 조회 |

### 탄소강도

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/carbon/current` | 현재 실시간 탄소강도 조회 |
| `GET` | `/api/carbon/forecast` | 향후 12시간 탄소강도 예측 조회 |

### AI 에이전트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/agent/chat` | Gemini 기반 가전 사용 시간 추천 및 자유 대화 |

**`/api/agent/chat` 파라미터**

| 파라미터 | 위치 | 필수 | 설명 |
|----------|------|------|------|
| `appliance_id` | query | ✅ | 가전제품 ID |
| `user_message` | query | ❌ | 사용자 질문 (기본값: 최적 시간 질의) |

---

## 환경 변수

`backend/.env` 파일을 생성하고 아래 변수를 설정하세요.

```env
# 필수 - Google AI Studio에서 발급
GEMINI_API_KEY=your_gemini_api_key_here

# 선택 - 기상청 공공데이터포털 API 키 (미설정 시 KPX CSV 기반 fallback 동작)
WEATHER_API_KEY=your_weather_api_key_here

# 선택 - SQLite DB 경로 (기본값: db.sqlite3)
SQLITE_PATH=db.sqlite3
```

> **Note:** `WEATHER_API_KEY`가 없어도 서비스는 정상 동작합니다. KPX 실측 CSV 데이터 기반의 탄소강도 계산 엔진이 자동으로 fallback됩니다.

---

## 탄소강도 등급 기준

| 등급 | 범위 | 의미 |
|------|------|------|
| 🟢 `low` (좋음) | ≤ 350 gCO₂/kWh | 가전 사용 최적 시간대 |
| 🟡 `medium` (보통) | 351 ~ 430 gCO₂/kWh | 일반 사용 가능 |
| 🔴 `high` (나쁨) | ≥ 431 gCO₂/kWh | 가전 사용 자제 권장 |

---

## 📄 라이선스

이 프로젝트는 해커톤 출품작입니다.
