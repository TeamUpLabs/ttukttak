# 뚝딱

매주 하나씩, 끝까지. 주간 미니 해커톤 플랫폼이에요.

매주 월요일 10:00에 제약이 걸린 주제 하나가 공개돼요. 참가자는 목요일 10:00까지 72시간 동안 만들어 제출하고, 일요일 24:00까지 서로의 결과물을 써보고 투표와 피드백을 남겨요. 다음 월요일 10:00에 트랙별 결과와 새 주제가 함께 발표돼요.

시간은 모두 한국 시간(Asia/Seoul) 기준이에요.

## 한 주의 흐름

| 단계 | 기간 | 하는 일 |
| --- | --- | --- |
| 제작 | 월 10:00 → 목 10:00 (72시간) | 주제에 맞춰 만들고 제출해요 |
| 투표 | 목 10:00 → 일 24:00 | 제출작을 써보고 투표·피드백을 남겨요 |
| 발표 대기 | 일 24:00 → 월 10:00 | 집계해요 |
| 결과 발표 | 월 10:00 | 트랙별 결과와 새 주제가 공개돼요 |

트랙은 입문 · 일반 · 고수 세 가지예요. 주차 번호는 ISO 주차(예: W46)를 써요.

## 시작하기

Node.js 20.19 이상 또는 22.12 이상이 필요해요.

```bash
npm install
npm run dev
```

| 명령어 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입체크(`tsc -b`) 후 프로덕션 빌드 |
| `npm run lint` | ESLint 실행 |
| `npm run preview` | 빌드 결과 미리보기 |

## 기술 스택

- **빌드**: Vite 8, TypeScript 6 (strict)
- **UI**: React 19 + React Compiler (`babel-plugin-react-compiler`)
- **라우팅**: React Router 7
- **스타일**: 전역 CSS + `--tt-*` 토큰, 컴포넌트는 `tt-` 클래스
- **서버 상태**: TanStack Query (예정)
- **백엔드**: Supabase — GitHub OAuth, Postgres, Storage (예정, 처음엔 목 데이터로)

## 폴더 구조

지금 있는 파일이에요.

```
├─ docs/
│  ├─ design-system/   README.md(브랜드 북), Motion.md, tokens.json, components/*.md
│  └─ screens/         README.md(화면 명세), reference/*.dc.html(시안 원본)
├─ public/             favicon.svg, icons.svg
├─ src/
│  ├─ app/             App.tsx, router.tsx
│  ├─ pages/           HomePage.tsx
│  ├─ styles/          tokens.css, base.css, motion.css, index.css
│  └─ main.tsx
└─ index.html
```

앞으로 채워 갈 `src` 구조예요.

```
src/
├─ app/          App.tsx, router.tsx, providers.tsx — 조립만
├─ pages/        라우트 단위 화면. 얇게, feature와 shared/ui를 조립만
├─ features/     week, submission, vote, feedback, profile, auth
│  └─ <name>/    components/, use*.ts, api.ts, types.ts
├─ shared/
│  ├─ ui/        Button, PressButton, Tag, Tabs, VoteButton, ProjectCard,
│  │             Countdown, StampBadge, StreakGrid
│  ├─ hooks/     useInterval, useCountUp, useReducedMotion
│  ├─ lib/       kst.ts(한국 시간 계산), supabase.ts
│  └─ types/
├─ styles/
└─ main.tsx
```

## 화면과 라우트

| 화면 | 라우트 | 시안 | 구현 |
| --- | --- | --- | --- |
| 메인 (이번 주) | `/` | `Main.dc.html` | 라우트만 연결 |
| 제출작 상세 | `/p/:id` | `Project.dc.html` | 예정 |
| 주차 결과 | `/w/:week` | `Week.dc.html` | 예정 |
| 프로필 | `/@:handle` | `Profile.dc.html` | 예정 |
| 제출하기 | `/submit` | 시안 없음 | 예정 |

화면별 섹션 구성과 인터랙션, 데이터 모델 초안은 [`docs/screens/README.md`](docs/screens/README.md)에 있어요.

React Router는 세그먼트 일부만 파라미터로 받지 못해요. 프로필 라우트는 `/:handle`로 받고 `@` 접두사를 확인하는 식으로 풀어야 해요.

## 개발 규칙

1. **의존 방향은 `pages → features → shared`.** feature끼리는 import하지 않아요. 둘 다 필요한 건 shared로 내리거나 페이지에서 조합해요. 예를 들어 ProjectCard의 투표 자리에는 페이지가 VoteButton을 꽂아줘요.
2. **`tt-` 클래스는 `src/shared/ui` 안에서만 써요.** 페이지와 feature는 `<Button variant="ink">`처럼 컴포넌트로 써요. 레이아웃용 `tt-wrap`, `tt-section`, `tt-grid`와 타입 클래스(`tt-display-l` 등)는 어디서든 써도 돼요.
3. **React Compiler를 전제로 해요.** `useMemo`, `useCallback`, `React.memo`를 쓰지 않아요. 렌더 중에 props나 외부 값을 바꾸지 않아요.
4. **색과 값은 토큰으로 써요.** 컴포넌트 안에 hex나 px 매직 넘버를 새로 만들지 않고 `var(--tt-*)`를 써요. 새 값이 필요하면 `src/styles/tokens.css`와 `docs/design-system/tokens.json`에 같이 추가해요.
5. **접근성을 지켜요.** 진짜 `<button>`, `<a href>`, `<label>`을 써요. 토글은 `aria-pressed`, 카운트다운은 `role="timer"`, 아이콘만 있는 버튼은 `aria-label`. 터치 타깃은 44px 이상이에요.
6. **움직임은 정해진 값만 써요.** `docs/design-system/Motion.md`의 곡선과 길이만 써요. JS로 돌리는 애니메이션은 `prefers-reduced-motion`이면 최종값을 바로 보여줘요.
7. **문구는 한국어 해요체로 짧게 써요.** 느낌표는 거의 쓰지 않고, 숫자와 시각은 구체적으로 적어요. 버튼은 동사로 끝나요("이번 주 참가하기").
8. **쓰지 않는 것**: 그라데이션, 블러 그림자, 이모지, 왼쪽 굵은 테두리 카드, 보라·파랑 강조색.

## 디자인 시스템

**작업대 위의 종이와 잉크, 그리고 주황 버튼 하나.** 무채색 바탕에 1.5px 검은 선으로 윤곽을 그리고, 색은 주황 하나만 써요.

- **색**: 강조색은 `--tt-signal` 하나뿐이에요. 면과 큰 숫자에만 써요. 바탕 위 작은 주황 글자는 대비 2.9:1로 기준에 못 미쳐요.
- **선**: 흐린 그림자 대신 `stroke-bold`(1.5px) 선으로 경계를 그어요. 깊이는 블러 없는 오프셋 그림자로 표현해요.
- **서체**: 한글은 IBM Plex Sans KR, 숫자와 영문 코드는 Archivo(`font-stretch: 62%`), 메타 정보는 JetBrains Mono.
- **레이아웃**: 콘텐츠 최대 폭 1320px. 카드 그리드는 3열 → 2열(1000px 이하) → 1열(640px 이하).
- **토큰**: CSS 변수 이름은 `--tt-` + 토큰 이름이에요(`signal` → `--tt-signal`).
