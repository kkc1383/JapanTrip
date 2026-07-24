# 일본여행 준비 사이트 🇯🇵

2026.8.20(목) – 8.22(토) 2박 3일 일본여행 준비용 웹앱.

**사이트:** https://japantrip-orpin.vercel.app

## 탭 구성

- **여행 준비** — D-day, 엔화 환율(참고용), 준비물 체크리스트, 준비 정보 카드
- **여행 계획** — 날짜별 일정표(장소 좌표 검색·구글맵 연동), 가고 싶은 곳 후보 보드
- **여행 중** — 오늘 일정 뷰(지금/다음 하이라이트), 내장 지도(일정 마커 + 내 위치)

## 스택

Vite + React + TypeScript + Tailwind CSS · Firebase Realtime Database(실시간 공유) ·
Leaflet/OpenStreetMap · Nominatim 지오코딩

## 개발

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # 타입체크 + 프로덕션 빌드
```

`main` push 시 Vercel Git 연동이 자동 배포하고, GitHub Actions는 타입체크+빌드(CI)를 수행한다.
