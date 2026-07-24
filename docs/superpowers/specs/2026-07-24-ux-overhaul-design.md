# UX 전면 개편 설계 (2차)

2026-07-24. 사용자 위임("알아서 해봐")에 따라 컨트롤러 판단으로 설계·구현.
시각 테마(쇼와 레트로 티켓)는 유지하고 인터랙션 구조를 교체한다.

## 변경 사항

1. **입력 폼 → 바텀시트**
   - 공용 `BottomSheet`(딤 배경, 슬라이드업, ESC/딤 클릭 닫기, body 스크롤 잠금)
   - 일정 추가/수정, 후보 추가, 정보 카드 추가/수정이 시트에서 이뤄짐
   - 리스트 화면에서 폼이 사라져 세로 길이 대폭 감소
2. **플로팅 추가 버튼(FAB)**
   - 탭바 위 우하단 고정, 한코 레드 필 형태 (`.fab`)
   - 일정/후보 섹션에서 각자 렌더 (세그먼트 전환으로 동시 노출 없음)
   - 정보 카드는 리스트 끝 점선 "＋ 추가" 버튼 (체크리스트 인라인 추가는 유지)
3. **카드 조작 수납**
   - 상시 노출되던 수정/삭제/▲▼ 버튼을 `ActionMenu`("⋯" 팝오버)로 이동
4. **여행 계획 탭 세그먼트화**
   - `일정 | 가고 싶은 곳` 세그먼트 컨트롤로 한 화면에 한 섹션만
5. **지도 접기/펼치기**
   - 기본 h-52, 펼치면 62dvh; 전환 시 `map.invalidateSize()` 재계산

## 신규 컴포넌트

- `src/components/BottomSheet.tsx` — `{open, title, onClose, children}`
- `src/components/Fab.tsx` — `{label, onClick}`
- `src/components/ActionMenu.tsx` — `{actions: {label, onClick, danger?, disabled?}[]}`

## 불변 사항

- DB 스키마·쓰기 로직 무변경 (formEpoch 리마운트, moveToDay 가드 등 기존 수정 유지)
- 시트 닫기 = 폼 리셋 (편집 중이던 항목이 삭제되면 시트도 닫음)
- prefers-reduced-motion 시 시트/딤 애니메이션 비활성
