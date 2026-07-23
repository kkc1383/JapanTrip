# 일본여행 준비 사이트 설계 문서

작성일: 2026-07-23

## 개요

2026년 8월 20일(목)~22일(토) 2박 3일 일본여행 준비용 웹사이트.

- **호스팅**: GitHub Pages (`https://kkc1383.github.io/JapanTrip/`)
- **저장소**: https://github.com/kkc1383/JapanTrip.git
- **데이터 공유**: Firebase Realtime Database — 동행자와 일정·체크리스트·체크 상태 실시간 공유
- **기술**: 빌드 없는 바닐라 HTML/CSS/JS 정적 사이트, Firebase CDN SDK 사용
- **디자인**: 모바일 우선 반응형 (여행 중 폰 사용 전제)

## 사용자와 목적

- 사용자 본인 + 동행자가 같은 URL로 접속해 함께 사용
- 누가 체크하거나 일정을 편집하면 모두에게 실시간 반영
- 목적지는 아직 미정 — 일정표는 빈 상태로 시작하고 직접 채워나감

## 페이지 구성

상단 탭 3개로 전환하는 단일 페이지(SPA):

### 1. 일정
- 8/20, 8/21, 8/22 날짜 탭
- 일정 항목: 시간, 제목, 장소, 메모
- 추가 / 수정 / 삭제 / 순서 변경 가능
- 빈 상태로 시작, 편집 즉시 모두에게 반영

### 2. 준비물 체크리스트
- 기본 카테고리: 필수 서류, 전자기기, 의류/세면, 기타
- 기본 항목 미리 채움 (여권, 엔화, 유심, 보조배터리 등)
- 항목 추가/삭제 가능, 체크 상태 실시간 공유

### 3. 여행 정보
- 기본 정보 카드: Visit Japan Web 입국 절차, 유심/로밍, 교통(스이카/파스모), 환전 팁 등
- 카드 추가/편집 가능

## 데이터 구조 (Firebase Realtime DB)

```
/itinerary/{day}/{itemId} → {time, title, place, memo, order}
/checklist/{catId}         → {name, order, items: {itemId: {text, checked, order}}}
/info/{cardId}             → {title, content, order}
```

- `day`는 `day1`(8/20), `day2`(8/21), `day3`(8/22)
- 실시간 동기화: `onValue` 리스너 사용
- 오프라인/연결 실패 시: 읽기 전용 안내 배너 표시

## Firebase 설정

- 사용자 계정으로 Firebase 프로젝트 생성 (무료 Spark 플랜)
- 사용자가 config 값을 전달하면 `config.js`(또는 인라인)에 연결
- DB 규칙: 링크를 아는 사람은 읽기/쓰기 가능 (open rules)
  - 개인 여행 규모에서 실용적 선택. 리포가 public이면 이론상 제3자가 데이터 수정 가능함을 사용자에게 고지 완료.

## 에러 처리

- Firebase 초기화 실패 / 네트워크 끊김: 상단 배너로 "오프라인 — 변경사항이 저장되지 않습니다" 안내
- 쓰기 실패: 콘솔 로그 + 배너

## 배포

- `main` 브랜치 루트를 GitHub Pages로 서빙
- 빌드 단계 없음 — push 즉시 반영
