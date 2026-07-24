# JapanTrip React 개편 설계

2026-07-24 승인. 기존 바닐라 JS 사이트(일정/준비물/정보 3탭)를 React 기반의
**여행 준비 / 여행 계획 / 여행 중** 3탭 웹앱으로 개편한다.

## 목표

- 모바일 웹앱 느낌의 UI (하단 고정 탭바, 앱 스타일 카드 레이아웃)
- 기존 Firebase Realtime Database 데이터·실시간 공유는 그대로 유지
- 배포는 웹사이트 유지 (PWA/네이티브 아님) — Vercel Git 연동 자동 배포

## 스택

| 항목 | 선택 |
|---|---|
| 프레임워크 | Vite + React + TypeScript |
| 스타일링 | Tailwind CSS |
| 데이터 | Firebase Realtime Database (기존 프로젝트, npm SDK) |
| 지도 | Leaflet + react-leaflet (OpenStreetMap 타일, 무료·키 불필요) |
| 지오코딩 | Nominatim (무료, 장소명 검색) |
| 환율 | 무료 환율 API (frankfurter 등, JPY→KRW) |
| 배포 | Vercel (Vite 프리셋), GitHub Actions CI는 `tsc --noEmit` + `vite build` |

기존 바닐라 파일(`index.html`, `css/`, `js/`)은 React 구조로 대체·삭제한다.
`js/firebase-config.js`의 기존 config 값을 `src/lib/firebase.ts`로 이식한다.

## 화면 구조

```
App (하단 탭바 3개, 데스크톱은 max-width 컨테이너)
├─ [여행 준비] PrepareTab
│   ├─ D-day 카운트다운 (출발일 2026-08-20 하드코딩, 클라이언트 계산)
│   ├─ 엔화 환율 위젯 ("100엔 = ○○○원", 무료 API — 일 단위 갱신 참고용)
│   ├─ 준비물 체크리스트 (기존 /checklist 기능 이식)
│   └─ 준비 정보 카드 (기존 /info 기능 이식)
├─ [여행 계획] PlanTab
│   ├─ day1~3 날짜 탭 + 일정 리스트/추가·수정 폼 (기존 /itinerary 이식)
│   │   · 장소명 입력 시 Nominatim 후보 검색 → 선택하면 lat/lng 저장 (선택 사항)
│   │   · 장소 탭하면 구글맵 열기 (좌표 있으면 좌표, 없으면 장소명 검색 URL)
│   └─ "가고 싶은 곳" 후보 보드 (/wishlist 신규)
│       · 항목: 제목/장소/메모, "일정으로 옮기기" 버튼 → 날짜 선택해 일정에 편입 후 보드에서 제거
└─ [여행 중] DuringTab
    ├─ 오늘 일정 뷰 — 여행 기간(8/20~22)이면 오늘 자동 선택, 아니면 day1 기본 + 수동 전환.
    │   현재 시각 기준 지금/다음 일정 하이라이트
    └─ 내장 지도 (Leaflet) — 선택된 날짜 일정 중 좌표 있는 항목 마커 표시,
        Geolocation으로 내 위치 마커, 마커 팝업에서 구글맵 길찾기 링크
```

## 데이터 모델 (기존 DB 호환 + 확장)

| 경로 | 내용 |
|---|---|
| `/checklist/{catId}` | 기존 그대로 — `{name, order, items:{id:{text,checked,order}}}` |
| `/info/{cardId}` | 기존 그대로 — `{title, content, order}` |
| `/itinerary/{day}/{id}` | 기존 필드 `{time,title,place,memo,order}` + `lat?`, `lng?` 추가 |
| `/wishlist/{id}` | 신규 — `{title, place?, memo?, lat?, lng?, order}` |

기존 데이터 마이그레이션 불필요 (필드 추가만, 기존 항목은 좌표 없음 상태로 동작).

## 에러 처리

- 오프라인 배너 유지 (`.info/connected` 구독)
- 환율 API·지오코딩 실패 시 해당 위젯만 숨김/안내 — 다른 기능에 영향 없음
- 위치 권한 거부 시 내 위치 마커만 생략
- 좌표 없는 일정 항목은 지도 마커 생략, 리스트에는 정상 표시

## 검증

- 브라우저 수동 검증 (`npm run dev`), 두 창 간 실시간 동기화 확인
- CI: 타입체크(`tsc --noEmit`) + 빌드(`vite build`) 통과
- 배포 후 Vercel URL에서 3탭 동작 확인

## 범위 제외 (YAGNI)

- PWA(manifest/서비스워커), 네이티브/스토어 배포
- 지출 기록, 예산 계획, 예약 트래커, 메모 보드 — 사용자가 선택하지 않음
- 인증/권한 (DB 규칙은 기존 공개 설정 유지)
