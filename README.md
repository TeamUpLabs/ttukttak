<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/ttukttak-logo/svg/ttukttak-logo-reverse.svg" />
  <img src="public/ttukttak-logo/svg/ttukttak-logo.svg" alt="뚝딱" width="200" />
</picture>

### 매주 하나씩, 끝까지.

월요일 10:00에 주제가 열리고, 72시간 안에 만들어 올리는 주간 미니 해커톤 플랫폼

![React](https://img.shields.io/badge/React-19-121212?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-121212?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-121212?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-121212?style=flat-square&logo=tailwindcss)
![React Router](https://img.shields.io/badge/React_Router-8-121212?style=flat-square&logo=reactrouter)

[소개](#소개) · [시작하기](#시작하기) · [구조](#프로젝트-구조) · [데이터](#데이터와-시간) · [규칙](#개발-규칙) · [배포](#배포) · [로드맵](#로드맵)

</div>

---

## 소개

뚝딱은 **작게 만들고, 완성하고, 서로 써 보는** 습관을 만드는 주간 해커톤이에요. 큰 프로젝트를 시작만 하고 끝내지 못하는 대신, 매주 제약이 걸린 주제 하나를 72시간 안에 끝까지 만들어요.

### 한 주의 흐름

모든 시각은 한국 시간(Asia/Seoul) 기준이에요.

| 단계 | 기간 | 하는 일 |
| --- | --- | --- |
| **제작** | 월 10:00 → 목 10:00 (72시간) | 주제에 맞춰 만들고 제출해요 |
| **투표** | 목 10:00 → 일 24:00 | 제출작을 직접 써 보고 투표·피드백을 남겨요 |
| **집계** | 일 24:00 → 월 10:00 | 결과를 집계해요 |
| **발표** | 월 10:00 | 트랙별 결과와 새 주제가 함께 공개돼요 |

- **트랙**: 입문 · 일반 · 고수. 같은 주제라도 실력에 맞는 범위로 참가해요.
- **주차**: ISO 주차(W46 등)를 써요. 명절처럼 쉬어 가는 주는 `break`로 두고, 연속 기록을 끊지 않아요.

### 주요 기능

| 화면 | 기능 |
| --- | --- |
| **메인** | 이번 주 주제와 마감 카운트다운, 주제마다 다른 인터랙티브 데모, 최근 제출 마퀴, 트랙별 제출작 갤러리와 투표, 지난 주제 아카이브, 다음 주제 알림 |
| **제출하기** | 7단계 제출 폼, 실시간 카드 미리보기, 제출 준비 체크리스트, 데모·레포 URL 검사, 썸네일 업로드, 제출 후 연속 기록 |
| **제출작 상세** | 클릭할 때만 불러오는 sandbox 데모, 제작기, 유형별 피드백 |
| **주차 상세** | 진행 상태별 화면, 트랙별 시상대와 전체 순위, 참가·완주 통계, 한 줄 회고 |
| **프로필** | 52주 스트릭, 제출 기록, 받은 피드백 |
| **헤더** | 진행 중이면 `LIVE`, 아니면 `END`. 로그인하면 계정 메뉴와 제출 버튼 |

## 시작하기

### 필요한 것

- **Node.js 22.18 이상**: 테스트가 `.ts` 파일을 Node로 바로 실행해서, 타입 제거가 기본으로 켜진 버전이 필요해요.
- npm

### 설치와 실행

```bash
git clone https://github.com/lee-seokmin/ttukttak.git
cd ttukttak
npm install
npm run dev
```

`http://localhost:5173`에서 열려요. 백엔드 없이 `mocks/`의 목 데이터로 모든 화면이 동작해요. 환경 변수는 아직 필요 없어요.

### 둘러보기

| 주소 | 화면 |
| --- | --- |
| `/` | 메인 |
| `/login` | 로그인 (GitHub 버튼을 누르면 목 계정 `@guest`로 로그인돼요) |
| `/submit` | 제출하기 (로그인 + 제출 기간에만 폼이 열려요) |
| `/p/s-101` | 제출작 상세 |
| `/w/2026-w46` | 주차 상세 |
| `/@jh.park` | 프로필 |

### 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입체크(`tsc -b`) 후 `dist/`에 프로덕션 빌드 |
| `npm run preview` | 빌드 결과를 로컬에서 미리 보기 |
| `npm run lint` | ESLint (React Compiler 규칙 포함) |
| `npm test` | 단위 테스트 (`node --test`) |

커밋 전에는 `npm run lint && npm test && npm run build`가 모두 통과해야 해요.

## 기술 스택

| 영역 | 선택 | 비고 |
| --- | --- | --- |
| 빌드 | Vite 8 (rolldown) | `vendor` 청크 분리 |
| 언어 | TypeScript 6 | `strict`, `verbatimModuleSyntax` |
| UI | React 19 + React Compiler | 메모이제이션은 컴파일러에 맡겨요 |
| 라우팅 | React Router 8 | 메인 외 페이지는 lazy 로드 |
| 서버 상태 | TanStack Query 5 | `staleTime` 60초 |
| 스타일 | Tailwind CSS 4 + CSS 변수 | 디자인 토큰 `--tt-*` |
| 테스트 | Node 내장 test runner | 의존성 추가 없음 |
| 백엔드 | Supabase (예정) | GitHub OAuth, Postgres, Storage |

## 프로젝트 구조

```
ttukttak/
├─ docs/
│  ├─ design-system/      브랜드 북, 움직임 규칙, 토큰 원본, 컴포넌트 가이드
│  └─ screens/            화면 명세와 시안 원본(*.dc.html)
├─ mocks/                 목 데이터 (weeks, submissions, users, feedback, results)
├─ public/
│  ├─ ttukttak-logo/      로고, 심볼, 워드마크, 파비콘
│  └─ manifest.webmanifest
├─ src/
│  ├─ app/                App, router, providers — 조립만 해요
│  ├─ pages/              라우트 단위 화면 — feature와 shared/ui를 조합만 해요
│  ├─ features/
│  │  ├─ week/            주차 계산, 결과·시상대, 이번 주 카드, 흐름, 아카이브
│  │  ├─ submission/      제출작 데이터, 갤러리, 상세, 데모, 피드백, 제출 폼
│  │  ├─ vote/            투표 토글
│  │  ├─ profile/         스트릭·통계 계산, 프로필 화면
│  │  └─ auth/            세션, 로그인 패널
│  ├─ shared/
│  │  ├─ ui/              디자인 시스템 컴포넌트
│  │  ├─ hooks/           useNow, useCountUp, useReducedMotion
│  │  └─ lib/             kst(한국 시간), time(상대 시간)
│  ├─ styles/             tokens, base, motion, components
│  └─ main.tsx
└─ index.html             메타데이터, 파비콘, Open Graph
```

### 의존 방향

```
pages  ──▶  features  ──▶  shared
```

- feature끼리는 서로 import하지 않아요. 둘 다 필요하면 shared로 내리거나 페이지에서 조합해요.
- 예를 들어 제출작 갤러리(`submission`)는 투표(`vote`)를 모르고, 페이지가 `renderVote` 슬롯으로 꽂아 줘요.

### 디자인 시스템 컴포넌트

`src/shared/ui/`의 폴더마다 `X.tsx`와 `index.ts`가 있고, `shared/ui/index.ts`에서 한 번에 export해요.

`Avatar` `Button` `Countdown` `Dropdown` `FeedbackType` `LiveDot` `Marquee` `PressButton` `ProjectCard` `SiteFooter` `SiteHeader` `StampBadge` `StreakGrid` `Tabs` `Tag` `VoteButton`

## 데이터와 시간

### 주차는 날짜로 계산해요

`mocks/weeks.json`에 2026년 전체와 2027년 초 주차가 들어 있어요. `getThisWeek(weeks, now)`가 현재 시각으로 이번 주, 다음 주제 주, 진행 단계, 다음 마감을 계산해요. 매주 손으로 고칠 곳이 없어요.

### 한국 시간은 한 곳에서만 다뤄요

`src/shared/lib/kst.ts`가 브라우저 시간대와 상관없이 `Asia/Seoul` 기준 날짜·요일·시각을 줘요. 자정 마감은 "일 24:00"처럼 전날 24시로 보여 줘요.

### 목 데이터에서 Supabase로

백엔드를 붙일 때 바꿀 곳은 모두 `ponytail:` 주석으로 표시해 뒀어요.

```bash
grep -rn "ponytail:" src
```

| 데이터 | 지금 | 바꿀 파일 |
| --- | --- | --- |
| 주차 | `mocks/weeks.json` | `features/week/useThisWeek.ts` |
| 제출작 | `mocks/submissions.json` | `features/submission/data.ts` |
| 사용자·피드백 | `mocks/users.json`, `mocks/feedback.json` | `features/profile/useProfile.ts` |
| 주차 결과 | `mocks/results.json` | `features/week/useWeekResults.ts` |
| 로그인 | `localStorage`의 `tt-session` | `features/auth/session.ts` |
| 투표·피드백·제출·알림 작성 | 화면 상태로만 유지 | 각 컴포넌트의 `ponytail:` 주석 |

## 보안

- **로그인 후 이동**: `?next=` 값은 `safeNext`로 검사해요. 같은 출처의 경로만 허용하고 `//evil.com`, 역슬래시, 제어 문자처럼 외부로 빠지는 값은 홈으로 바꿔요.
- **사용자 링크**: 데모·레포 주소는 `safeHttps`로 `https://`일 때만 링크로 만들어요.
- **데모 실행**: 제출작 데모는 사용자가 누를 때만 `sandbox` iframe으로 불러와요. 같은 출처 권한은 주지 않아요.

## 개발 규칙

자세한 기준은 [`CLAUDE.md`](CLAUDE.md)와 [`docs/design-system/README.md`](docs/design-system/README.md)에 있어요. UI 작업 전에 브랜드 북을 먼저 읽어요.

1. **의존 방향**: `pages → features → shared`. feature끼리 import하지 않아요.
2. **`tt-` 클래스는 `shared/ui` 안에서만**: 페이지와 feature는 컴포넌트로 써요. 레이아웃(`tt-wrap`, `tt-section`, `tt-grid`)과 타입 클래스(`tt-display-l` 등)는 예외예요.
3. **React Compiler 전제**: `useMemo`, `useCallback`, `React.memo`를 쓰지 않아요. 렌더 중에 props나 외부 값을 바꾸지 않아요.
4. **값은 토큰으로**: hex나 px 매직 넘버 대신 `var(--tt-*)`. 새 값은 `src/styles/tokens.css`와 `docs/design-system/tokens.json`에 같이 추가해요.
5. **접근성**: 진짜 `<button>`, `<a href>`, `<label>`. 토글은 `aria-pressed`, 카운트다운은 `role="timer"`, 아이콘 버튼은 `aria-label`. 터치 타깃 44px 이상.
6. **움직임**: [`Motion.md`](docs/design-system/Motion.md)의 곡선과 길이만 써요. `useReducedMotion`이 true면 최종값을 바로 보여 줘요.
7. **문구**: 한국어 해요체, 짧게, 느낌표 없이, 숫자와 시각은 구체적으로. 버튼은 동사로 끝나요("이번 주 참가하기").
8. **쓰지 않는 것**: 그라데이션, 블러 그림자, 이모지, 왼쪽 굵은 테두리 카드, 보라·파랑 강조색.

### 디자인 원칙

> 작업대 위의 종이와 잉크, 그리고 주황 버튼 하나.

| 요소 | 기준 |
| --- | --- |
| 색 | 무채색 바탕 + 강조색 `--tt-signal` 하나. 면과 큰 숫자에만 써요 |
| 선 | 1.5px 검은 선으로 경계를 그리고, 깊이는 블러 없는 오프셋 그림자로 |
| 서체 | 한글 IBM Plex Sans KR, 숫자·코드 Archivo, 메타 정보 JetBrains Mono |
| 레이아웃 | 최대 폭 1320px, 카드 그리드 3열 → 2열(1000px) → 1열(640px) |
| 테마 | 라이트 모드 고정 (`color-scheme: light only`) |

### 스타일 불러오는 순서

`src/styles/index.css`의 순서를 바꾸면 깨져요.

1. Google Fonts `@import` — CSS 규칙상 맨 앞이어야 해요
2. `tailwindcss`
3. `tokens.css`
4. `base.css` — `layer(base)`로 넣어서 Tailwind 유틸리티가 덮어쓸 수 있어요
5. `motion.css`, `components.css`

## 테스트

계산 로직만 테스트해요. 테스트 파일은 대상 옆에 `*.test.ts`로 두고, 앱 타입체크(`tsconfig.app.json`)에서는 빼요.

| 파일 | 확인하는 것 |
| --- | --- |
| `features/week/thisWeek.test.ts` | 이번 주·단계·마감 계산, 쉬는 주, 데이터 경계 |
| `features/week/results.test.ts` | 일정별 주차 상태, 트랙별 시상대, 완주율 |
| `features/submission/submitForm.test.ts` | URL·이미지 검사, 스택 추가, 제출 준비 체크 |
| `features/profile/profile.test.ts` | 연속 기록(쉬는 주와 이번 주는 끊기지 않음), 52칸 격자 |
| `features/auth/session.test.ts` | `safeNext`의 열린 리다이렉트 차단 |

```bash
npm test
```

## 배포

`npm run build`로 만든 `dist/`를 정적 호스팅에 올려요.

- **SPA 폴백 필수**: `/w/2026-w46`, `/@jh.park` 같은 주소로 바로 들어오거나 새로고침해도 `index.html`을 돌려줘야 해요.

  ```jsonc
  // Vercel: vercel.json
  { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
  ```

  ```
  # Netlify: public/_redirects
  /*  /index.html  200
  ```

- **번들**: 메인 페이지만 첫 번들에 들어가고, 나머지 페이지는 들어갈 때 불러와요. 라이브러리는 `vendor` 청크로 분리돼서 앱만 다시 배포하면 브라우저 캐시를 그대로 써요.
- **공유 미리보기**: 도메인이 정해지면 `index.html`의 `og:image`를 절대 주소로 바꿔요. 카카오톡·슬랙은 상대 경로를 읽지 못해요.


## 브랜드 자산

로고, 심볼, 워드마크, 앱 아이콘은 `public/ttukttak-logo/`에 SVG와 PNG로 있어요. 쓰임새와 여백 기준은 [`public/ttukttak-logo/README.md`](public/ttukttak-logo/README.md)를 봐요. 밝은 바탕에는 기본형, 어두운 바탕에는 `-reverse` 파일을 써요.

## 라이선스

아직 정하지 않았어요. 라이선스 파일이 생기기 전까지 모든 권리는 저작자에게 있어요.
