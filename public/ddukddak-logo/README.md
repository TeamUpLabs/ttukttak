# 뚝딱 로고

검은 사각형 안의 주황 점(누르는 버튼)과 "뚝딱" 글자의 조합이에요. 글자는 IBM Plex Sans KR Bold를 자간 -0.04em으로 놓고 윤곽선으로 바꿔서, 서체가 없는 곳에서도 똑같이 보여요.

## 파일

| 파일 | 쓰는 곳 |
| --- | --- |
| `svg/ddukddak-logo.svg` | 기본. 밝은 바탕(`#F1F1EE`, 흰색) 위 |
| `svg/ddukddak-logo-reverse.svg` | 어두운 바탕(`#121212`) 위 |
| `svg/ddukddak-mark.svg` · `-reverse` | 공간이 좁을 때 심볼만 (내비게이션 축소, 아바타 자리) |
| `svg/ddukddak-wordmark.svg` · `-reverse` | 글자만 (심볼이 이미 근처에 있을 때) |
| `svg/ddukddak-app-icon.svg` | 앱 아이콘 원본. 모서리는 OS가 둥글게 잘라줘요 |
| `png/` | SVG를 못 쓰는 곳용. 기본 높이 160px, `@3x`는 480px |
| `favicon/` | 웹사이트용 아이콘 세트 |

## 파비콘 연결 (Vite면 `public/`에 넣고)

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

`icon-192.png`, `icon-512.png`는 웹 앱 매니페스트(`manifest.webmanifest`)의 `icons`에 넣어요.

## 규칙

- 색은 세 가지뿐: 잉크 `#121212`, 바탕 `#F1F1EE`, 주황 `#FF5A1F`. 점은 어떤 버전에서도 주황이에요.
- 여백: 심볼 높이의 절반 이상을 사방에 비워요.
- 최소 크기: 가로형 로고 높이 24px, 심볼 16px.
- 하지 않기: 늘이거나 기울이기, 그림자·그라데이션 넣기, 점 색 바꾸기, 글자를 다른 서체로 다시 쓰기, 주황 바탕 위에 올리기.
