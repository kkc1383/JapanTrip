# 일본여행 준비 사이트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 8/20~22 일본여행의 일정·준비물·정보를 동행자와 실시간 공유하는 정적 웹사이트를 GitHub Pages에 배포한다.

**Architecture:** 빌드 없는 바닐라 HTML/CSS/JS 단일 페이지. Firebase Realtime Database(CDN ESM SDK)로 실시간 동기화. 탭 3개(일정/준비물/정보)를 각각 독립 JS 모듈로 구현.

**Tech Stack:** HTML/CSS/JS (ES Modules), Firebase Realtime Database v10 CDN, GitHub Pages

## Global Constraints

- 빌드 도구·번들러·npm 의존성 금지 — 파일을 그대로 서빙
- 모바일 우선 반응형 (기준 폭 ~390px, 데스크톱은 max-width 컨테이너)
- 모든 UI 텍스트는 한국어
- 날짜 키: `day1`=8/20(목), `day2`=8/21(금), `day3`=8/22(토)
- Firebase SDK 버전: `https://www.gstatic.com/firebasejs/10.12.0/` 고정
- 테스트 프레임워크 없음 — 각 태스크는 로컬 서버(`python -m http.server 8000`)에서 브라우저로 수동 검증
- 커밋 메시지: `[기능/수정] 한줄 요약` + Co-Authored-By 태그 (전역 CLAUDE.md 규칙)

---

### Task 1: 페이지 골격 + 탭 전환

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`

**Interfaces:**
- Produces: 탭 버튼 `.tab-btn[data-target]`, 패널 `#panel-itinerary` / `#panel-checklist` / `#panel-info`, 배너 `#offline-banner`. 이후 태스크가 이 DOM id들을 사용한다.

- [ ] **Step 1: index.html 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>일본여행 2026.8.20–22</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="offline-banner" hidden>오프라인 — 변경사항이 저장되지 않습니다</div>
  <header class="site-header">
    <h1>일본여행 🇯🇵</h1>
    <p class="dates">2026.8.20(목) – 8.22(토) · 2박 3일</p>
  </header>
  <nav class="tabs">
    <button class="tab-btn active" data-target="panel-itinerary">일정</button>
    <button class="tab-btn" data-target="panel-checklist">준비물</button>
    <button class="tab-btn" data-target="panel-info">정보</button>
  </nav>
  <main>
    <section id="panel-itinerary" class="tab-panel"></section>
    <section id="panel-checklist" class="tab-panel" hidden></section>
    <section id="panel-info" class="tab-panel" hidden></section>
  </main>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: css/style.css 작성**

```css
:root {
  --bg: #faf7f2;
  --card: #ffffff;
  --ink: #2b2b2b;
  --sub: #8a8578;
  --accent: #d64545;
  --accent-soft: #fdecec;
  --line: #e8e3da;
  --radius: 12px;
}
* { box-sizing: border-box; margin: 0; }
body {
  font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  background: var(--bg); color: var(--ink);
  max-width: 640px; margin: 0 auto; padding-bottom: 48px;
}
#offline-banner {
  background: var(--accent); color: #fff; text-align: center;
  padding: 8px; font-size: 14px; position: sticky; top: 0; z-index: 10;
}
.site-header { padding: 28px 20px 12px; }
.site-header h1 { font-size: 26px; }
.dates { color: var(--sub); font-size: 14px; margin-top: 4px; }
.tabs {
  display: flex; gap: 8px; padding: 12px 20px;
  position: sticky; top: 0; background: var(--bg); z-index: 5;
}
.tab-btn {
  flex: 1; padding: 10px 0; border: 1px solid var(--line); border-radius: 999px;
  background: var(--card); color: var(--sub); font-size: 15px; cursor: pointer;
}
.tab-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
.tab-panel { padding: 8px 20px; }
.card {
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 14px 16px; margin-bottom: 10px;
}
button.small {
  border: none; background: none; color: var(--sub); cursor: pointer;
  font-size: 13px; padding: 4px 6px;
}
button.small:hover { color: var(--accent); }
form.add-form { display: grid; gap: 8px; margin-top: 12px; }
form.add-form input, form.add-form textarea {
  border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px;
  font: inherit; background: var(--card);
}
form.add-form button[type="submit"] {
  background: var(--accent); color: #fff; border: none; border-radius: 8px;
  padding: 11px; font-size: 15px; font-weight: 600; cursor: pointer;
}
.empty-msg { color: var(--sub); text-align: center; padding: 32px 0; font-size: 14px; }
```

- [ ] **Step 3: js/app.js 작성 (탭 전환만)**

```js
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-panel').forEach(p => { p.hidden = p.id !== btn.dataset.target; });
  });
});
```

- [ ] **Step 4: 브라우저 검증**

Run: `python -m http.server 8000` (프로젝트 루트에서, 백그라운드)
확인: `http://localhost:8000` 접속 → 제목/날짜 표시, 탭 3개 클릭 시 패널 전환(내용은 아직 빈 상태), 모바일 폭에서 레이아웃 정상.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "[기능] 페이지 골격 및 탭 전환 구현"
```

---

### Task 2: Firebase 연결 모듈 + 오프라인 배너

**Files:**
- Create: `js/firebase-config.js`
- Create: `js/firebase.js`
- Modify: `js/app.js`

**Interfaces:**
- Produces: `js/firebase.js`가 `db`(Database 인스턴스 또는 null)와 `watchConnection(cb: (connected: boolean) => void)`를 export. 이후 모든 태스크가 `db`를 import한다.

- [ ] **Step 1: 사용자에게 Firebase 설정 요청**

사용자에게 다음을 요청한다 (이미 받았다면 생략):
1. https://console.firebase.google.com 에서 새 프로젝트 생성 (Analytics 불필요)
2. Realtime Database 생성 — 위치는 `asia-southeast1`, 보안 규칙은 아래로 설정:
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
3. 프로젝트 설정 > 일반 > 내 앱 > 웹 앱 추가 → `firebaseConfig` 객체 값 전달받기

config를 아직 못 받았으면 placeholder로 계속 진행한다(사이트는 "설정 필요" 배너 표시 상태로 동작).

- [ ] **Step 2: js/firebase-config.js 작성**

```js
// Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱 의 값으로 교체
export const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  databaseURL: "https://REPLACE_ME-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "REPLACE_ME",
  appId: "REPLACE_ME"
};
```

(사용자에게 실제 값을 받았으면 그 값을 넣는다.)

- [ ] **Step 3: js/firebase.js 작성**

```js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';

let db = null;
if (firebaseConfig.apiKey !== 'REPLACE_ME') {
  try {
    db = getDatabase(initializeApp(firebaseConfig));
  } catch (e) {
    console.error('Firebase 초기화 실패:', e);
  }
}

export { db };

export function watchConnection(cb) {
  if (!db) return;
  onValue(ref(db, '.info/connected'), snap => cb(snap.val() === true));
}
```

- [ ] **Step 4: js/app.js 수정 — 배너 연동**

기존 탭 전환 코드 위에 추가:

```js
import { db, watchConnection } from './firebase.js';

const banner = document.getElementById('offline-banner');
if (!db) {
  banner.hidden = false;
  banner.textContent = 'Firebase 설정 필요 — js/firebase-config.js를 확인하세요';
} else {
  watchConnection(connected => { banner.hidden = connected; });
}
```

- [ ] **Step 5: 브라우저 검증**

확인: config가 placeholder면 "Firebase 설정 필요" 배너 표시. 실제 config면 배너 숨김(연결 성공), 개발자도구 네트워크 탭에 firebase 웹소켓 연결 확인.

- [ ] **Step 6: Commit**

```bash
git add js/firebase-config.js js/firebase.js js/app.js
git commit -m "[기능] Firebase Realtime DB 연결 및 오프라인 배너"
```

---

### Task 3: 일정 탭

**Files:**
- Create: `js/itinerary.js`
- Modify: `index.html` (panel-itinerary 내부 마크업)
- Modify: `js/app.js` (init 호출)
- Modify: `css/style.css` (일정 전용 스타일 추가)

**Interfaces:**
- Consumes: `db` from `js/firebase.js`
- Produces: `initItinerary()` — DB 경로 `/itinerary/{day}/{itemId}` = `{time, title, place, memo, order}`

- [ ] **Step 1: index.html의 panel-itinerary 채우기**

```html
<section id="panel-itinerary" class="tab-panel">
  <nav id="day-tabs" class="day-tabs"></nav>
  <div id="itinerary-list"></div>
  <form id="itinerary-form" class="add-form">
    <input name="time" type="time">
    <input name="title" placeholder="일정 제목 (필수)" required>
    <input name="place" placeholder="장소">
    <textarea name="memo" placeholder="메모" rows="2"></textarea>
    <button type="submit">일정 추가</button>
    <button type="button" id="itinerary-cancel" class="small" hidden>수정 취소</button>
  </form>
</section>
```

- [ ] **Step 2: css/style.css에 일정 스타일 추가**

```css
.day-tabs { display: flex; gap: 6px; margin: 8px 0 14px; }
.day-tabs button {
  flex: 1; padding: 8px 0; border: 1px solid var(--line); border-radius: 8px;
  background: var(--card); color: var(--sub); font-size: 14px; cursor: pointer;
}
.day-tabs button.active { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); font-weight: 600; }
.it-item { display: flex; gap: 12px; align-items: flex-start; }
.it-time { color: var(--accent); font-weight: 700; font-size: 14px; min-width: 48px; padding-top: 2px; }
.it-body { flex: 1; }
.it-title { font-weight: 600; }
.it-place { color: var(--sub); font-size: 13px; margin-top: 2px; }
.it-memo { font-size: 13px; margin-top: 6px; white-space: pre-wrap; }
.it-actions { display: flex; flex-direction: column; gap: 2px; }
```

- [ ] **Step 3: js/itinerary.js 작성**

```js
import { db } from './firebase.js';
import { ref, onValue, push, update, remove } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const DAYS = [
  { key: 'day1', label: '8/20 (목)' },
  { key: 'day2', label: '8/21 (금)' },
  { key: 'day3', label: '8/22 (토)' },
];

export function initItinerary() {
  const dayTabs = document.getElementById('day-tabs');
  const listEl = document.getElementById('itinerary-list');
  const form = document.getElementById('itinerary-form');
  const cancelBtn = document.getElementById('itinerary-cancel');
  let currentDay = 'day1';
  let editingId = null;
  let data = {};

  DAYS.forEach(d => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = d.label;
    btn.dataset.day = d.key;
    if (d.key === currentDay) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentDay = d.key;
      resetForm();
      dayTabs.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
    dayTabs.appendChild(btn);
  });

  onValue(ref(db, 'itinerary'), snap => { data = snap.val() || {}; render(); });

  function entries() {
    const day = data[currentDay] || {};
    return Object.entries(day).sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0));
  }

  function render() {
    const items = entries();
    listEl.innerHTML = '';
    if (!items.length) {
      listEl.innerHTML = '<p class="empty-msg">아직 일정이 없어요. 아래에서 추가해 보세요!</p>';
      return;
    }
    items.forEach(([id, it], idx) => {
      const card = document.createElement('div');
      card.className = 'card it-item';
      card.innerHTML = `
        <div class="it-time">${it.time || '—'}</div>
        <div class="it-body">
          <div class="it-title"></div>
          ${it.place ? '<div class="it-place"></div>' : ''}
          ${it.memo ? '<div class="it-memo"></div>' : ''}
        </div>
        <div class="it-actions">
          <button class="small" data-act="up" ${idx === 0 ? 'disabled' : ''}>▲</button>
          <button class="small" data-act="down" ${idx === items.length - 1 ? 'disabled' : ''}>▼</button>
          <button class="small" data-act="edit">수정</button>
          <button class="small" data-act="del">삭제</button>
        </div>`;
      card.querySelector('.it-title').textContent = it.title;
      if (it.place) card.querySelector('.it-place').textContent = '📍 ' + it.place;
      if (it.memo) card.querySelector('.it-memo').textContent = it.memo;
      card.addEventListener('click', e => {
        const act = e.target.dataset.act;
        if (!act) return;
        if (act === 'del') { remove(ref(db, `itinerary/${currentDay}/${id}`)); if (editingId === id) resetForm(); }
        if (act === 'edit') startEdit(id, it);
        if (act === 'up') swapOrder(items, idx, idx - 1);
        if (act === 'down') swapOrder(items, idx, idx + 1);
      });
      listEl.appendChild(card);
    });
  }

  function swapOrder(items, i, j) {
    const [idA, a] = items[i], [idB, b] = items[j];
    update(ref(db, `itinerary/${currentDay}`), {
      [`${idA}/order`]: b.order ?? j,
      [`${idB}/order`]: a.order ?? i,
    });
  }

  function startEdit(id, it) {
    editingId = id;
    form.time.value = it.time || '';
    form.title.value = it.title;
    form.place.value = it.place || '';
    form.memo.value = it.memo || '';
    form.querySelector('button[type="submit"]').textContent = '일정 수정';
    cancelBtn.hidden = false;
    form.scrollIntoView({ behavior: 'smooth' });
  }

  function resetForm() {
    editingId = null;
    form.reset();
    form.querySelector('button[type="submit"]').textContent = '일정 추가';
    cancelBtn.hidden = true;
  }

  cancelBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const item = {
      time: form.time.value,
      title: form.title.value.trim(),
      place: form.place.value.trim(),
      memo: form.memo.value.trim(),
    };
    if (!item.title) return;
    if (editingId) {
      update(ref(db, `itinerary/${currentDay}/${editingId}`), item);
    } else {
      const maxOrder = entries().reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1);
      push(ref(db, `itinerary/${currentDay}`), { ...item, order: maxOrder + 1 });
    }
    resetForm();
  });
}
```

- [ ] **Step 4: js/app.js에 init 연결**

`if (!db)` 분기의 else 쪽에 추가:

```js
import { initItinerary } from './itinerary.js';
// ...
} else {
  watchConnection(connected => { banner.hidden = connected; });
  initItinerary();
}
```

- [ ] **Step 5: 브라우저 검증**

확인: 날짜 탭 3개 전환, 일정 추가 → 카드 표시, 수정/삭제/▲▼ 순서변경 동작. 브라우저 창 2개를 열고 한쪽에서 추가하면 다른 쪽에 즉시 반영되는지 확인.

- [ ] **Step 6: Commit**

```bash
git add js/itinerary.js js/app.js index.html css/style.css
git commit -m "[기능] 날짜별 일정 탭 구현 (실시간 동기화)"
```

---

### Task 4: 준비물 체크리스트 탭 + 기본 데이터 시드

**Files:**
- Create: `js/checklist.js`
- Modify: `index.html` (panel-checklist 내부)
- Modify: `js/app.js` (init 호출)
- Modify: `css/style.css` (체크리스트 스타일)

**Interfaces:**
- Consumes: `db` from `js/firebase.js`
- Produces: `initChecklist()` — DB 경로 `/checklist/{catId}` = `{name, order, items: {itemId: {text, checked, order}}}`

- [ ] **Step 1: index.html의 panel-checklist 채우기**

```html
<section id="panel-checklist" class="tab-panel" hidden>
  <div id="checklist-root"></div>
</section>
```

- [ ] **Step 2: css/style.css에 체크리스트 스타일 추가**

```css
.cl-cat h2 { font-size: 16px; margin-bottom: 8px; }
.cl-progress { color: var(--sub); font-size: 13px; font-weight: 400; margin-left: 6px; }
.cl-item { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
.cl-item input[type="checkbox"] { width: 20px; height: 20px; accent-color: var(--accent); }
.cl-item label { flex: 1; font-size: 15px; }
.cl-item.done label { color: var(--sub); text-decoration: line-through; }
.cl-add { display: flex; gap: 6px; margin-top: 8px; }
.cl-add input { flex: 1; border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; font: inherit; }
.cl-add button { border: none; background: var(--accent-soft); color: var(--accent); border-radius: 8px; padding: 0 14px; cursor: pointer; font-weight: 600; }
```

- [ ] **Step 3: js/checklist.js 작성**

```js
import { db } from './firebase.js';
import { ref, onValue, push, update, remove, get, set } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const DEFAULT_CATEGORIES = [
  { name: '필수 서류', items: ['여권 (유효기간 확인)', 'Visit Japan Web 등록', '항공권 (e-티켓)', '숙소 바우처', '여행자보험'] },
  { name: '전자기기', items: ['유심 / eSIM', '보조배터리', '충전기 · 케이블', '110V 돼지코 어댑터'] },
  { name: '의류/세면', items: ['여벌 옷 (2박 3일)', '속옷 · 양말', '세면도구', '선크림', '우산 (8월 소나기 대비)'] },
  { name: '기타', items: ['엔화 환전', '해외결제 카드', '상비약 (소화제·진통제)', '에코백 (쇼핑용)'] },
];

export function initChecklist() {
  const root = document.getElementById('checklist-root');

  get(ref(db, 'checklist')).then(snap => {
    if (snap.exists()) return;
    const seed = {};
    DEFAULT_CATEGORIES.forEach((cat, ci) => {
      const items = {};
      cat.items.forEach((text, ii) => { items['seed' + ii] = { text, checked: false, order: ii }; });
      seed['cat' + ci] = { name: cat.name, order: ci, items };
    });
    set(ref(db, 'checklist'), seed);
  });

  onValue(ref(db, 'checklist'), snap => render(snap.val() || {}));

  function render(data) {
    root.innerHTML = '';
    const cats = Object.entries(data).sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0));
    if (!cats.length) {
      root.innerHTML = '<p class="empty-msg">체크리스트를 불러오는 중...</p>';
      return;
    }
    cats.forEach(([catId, cat]) => {
      const items = Object.entries(cat.items || {}).sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0));
      const done = items.filter(([, it]) => it.checked).length;
      const sec = document.createElement('div');
      sec.className = 'card cl-cat';
      sec.innerHTML = `<h2></h2><div class="cl-items"></div>
        <form class="cl-add"><input placeholder="항목 추가" required><button type="submit">추가</button></form>`;
      sec.querySelector('h2').innerHTML = `${escapeHtml(cat.name)} <span class="cl-progress">${done}/${items.length}</span>`;
      const itemsEl = sec.querySelector('.cl-items');
      items.forEach(([itemId, it]) => {
        const row = document.createElement('div');
        row.className = 'cl-item' + (it.checked ? ' done' : '');
        const cbId = `cb-${catId}-${itemId}`;
        row.innerHTML = `<input type="checkbox" id="${cbId}" ${it.checked ? 'checked' : ''}>
          <label for="${cbId}"></label><button class="small">삭제</button>`;
        row.querySelector('label').textContent = it.text;
        row.querySelector('input').addEventListener('change', e =>
          update(ref(db, `checklist/${catId}/items/${itemId}`), { checked: e.target.checked }));
        row.querySelector('button').addEventListener('click', () =>
          remove(ref(db, `checklist/${catId}/items/${itemId}`)));
        itemsEl.appendChild(row);
      });
      sec.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        const input = e.target.querySelector('input');
        const text = input.value.trim();
        if (!text) return;
        const maxOrder = items.reduce((m, [, it]) => Math.max(m, it.order ?? 0), -1);
        push(ref(db, `checklist/${catId}/items`), { text, checked: false, order: maxOrder + 1 });
        input.value = '';
      });
      root.appendChild(sec);
    });
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
```

- [ ] **Step 4: js/app.js에 init 연결**

```js
import { initChecklist } from './checklist.js';
// else 분기에 추가:
initChecklist();
```

- [ ] **Step 5: 브라우저 검증**

확인: 첫 로드 시 기본 카테고리 4개 + 기본 항목 시드됨(Firebase 콘솔에서도 확인). 체크 시 취소선 + 진행도(n/m) 갱신, 항목 추가/삭제 동작, 두 브라우저 창 간 체크 상태 실시간 동기화.

- [ ] **Step 6: Commit**

```bash
git add js/checklist.js js/app.js index.html css/style.css
git commit -m "[기능] 준비물 체크리스트 구현 (기본 항목 시드 포함)"
```

---

### Task 5: 여행 정보 탭 + 기본 카드 시드

**Files:**
- Create: `js/info.js`
- Modify: `index.html` (panel-info 내부)
- Modify: `js/app.js` (init 호출)
- Modify: `css/style.css` (정보 카드 스타일)

**Interfaces:**
- Consumes: `db` from `js/firebase.js`
- Produces: `initInfo()` — DB 경로 `/info/{cardId}` = `{title, content, order}`

- [ ] **Step 1: index.html의 panel-info 채우기**

```html
<section id="panel-info" class="tab-panel" hidden>
  <div id="info-root"></div>
  <form id="info-form" class="add-form">
    <input name="title" placeholder="카드 제목 (필수)" required>
    <textarea name="content" placeholder="내용 (URL은 자동으로 링크가 됩니다)" rows="4" required></textarea>
    <button type="submit">정보 카드 추가</button>
    <button type="button" id="info-cancel" class="small" hidden>수정 취소</button>
  </form>
</section>
```

- [ ] **Step 2: css/style.css에 정보 카드 스타일 추가**

```css
.info-card h2 { font-size: 16px; margin-bottom: 6px; }
.info-card .info-content { font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-all; }
.info-card .info-content a { color: var(--accent); }
.info-card .card-actions { display: flex; justify-content: flex-end; gap: 4px; margin-top: 8px; }
```

- [ ] **Step 3: js/info.js 작성**

```js
import { db } from './firebase.js';
import { ref, onValue, push, update, remove, get, set } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const DEFAULT_CARDS = [
  { title: '🛂 입국 준비 — Visit Japan Web', content: '일본 입국 시 세관 신고를 온라인으로 미리 해두면 공항에서 QR만 찍으면 됩니다.\n\n1. https://vjw-lp.digital.go.jp/ko/ 접속\n2. 계정 생성 후 여권·항공편 정보 입력\n3. 세관 신고 QR 코드 발급 → 캡처해두기\n\n출발 전날까지 등록 권장.' },
  { title: '📱 데이터 — 유심/eSIM', content: '2박 3일이면 eSIM이 제일 간편합니다.\n\n· 도시락eSIM, 말톡, 유심사 등에서 일본 3일 무제한 5천원 안팎\n· 폰이 eSIM 지원인지 미리 확인 (아이폰 XS 이후, 갤럭시 S23 이후 대부분 지원)\n· 출국 전 설치, 일본 도착 후 활성화' },
  { title: '🚃 교통 — 스이카/파스모', content: '· 아이폰: Apple Wallet에서 Suica 바로 발급 가능 (외국 카드 충전 OK)\n· 안드로이드(한국 폰): 모바일 스이카 불가 → 공항에서 Welcome Suica 실물 카드 발급\n· 지하철·편의점·자판기 대부분 사용 가능' },
  { title: '💴 환전 & 결제', content: '· 트래블월렛/트래블로그 카드가 수수료 제일 유리\n· 현금은 1인 1~2만엔 정도면 충분 (작은 가게·신사는 현금만 받는 곳 있음)\n· 엔화 환전은 주거래은행 앱 환전 → 공항 수령이 편함' },
  { title: '🌦️ 8월 날씨 팁', content: '8월 하순 일본은 한국보다 덥고 습합니다 (최고 33~35℃).\n\n· 얇은 옷 + 실내 냉방 대비 겉옷 하나\n· 휴대용 선풍기, 선크림 필수\n· 소나기 잦음 — 접이식 우산' },
];

export function initInfo() {
  const root = document.getElementById('info-root');
  const form = document.getElementById('info-form');
  const cancelBtn = document.getElementById('info-cancel');
  let editingId = null;

  get(ref(db, 'info')).then(snap => {
    if (snap.exists()) return;
    const seed = {};
    DEFAULT_CARDS.forEach((c, i) => { seed['seed' + i] = { ...c, order: i }; });
    set(ref(db, 'info'), seed);
  });

  let cards = [];
  onValue(ref(db, 'info'), snap => {
    const data = snap.val() || {};
    cards = Object.entries(data).sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0));
    render();
  });

  function render() {
    root.innerHTML = '';
    if (!cards.length) {
      root.innerHTML = '<p class="empty-msg">정보 카드를 불러오는 중...</p>';
      return;
    }
    cards.forEach(([id, c]) => {
      const el = document.createElement('div');
      el.className = 'card info-card';
      el.innerHTML = `<h2></h2><div class="info-content"></div>
        <div class="card-actions">
          <button class="small" data-act="edit">수정</button>
          <button class="small" data-act="del">삭제</button>
        </div>`;
      el.querySelector('h2').textContent = c.title;
      el.querySelector('.info-content').innerHTML = linkify(c.content);
      el.querySelector('[data-act="edit"]').addEventListener('click', () => startEdit(id, c));
      el.querySelector('[data-act="del"]').addEventListener('click', () => {
        remove(ref(db, `info/${id}`));
        if (editingId === id) resetForm();
      });
      root.appendChild(el);
    });
  }

  function startEdit(id, c) {
    editingId = id;
    form.title.value = c.title;
    form.content.value = c.content;
    form.querySelector('button[type="submit"]').textContent = '카드 수정';
    cancelBtn.hidden = false;
    form.scrollIntoView({ behavior: 'smooth' });
  }

  function resetForm() {
    editingId = null;
    form.reset();
    form.querySelector('button[type="submit"]').textContent = '정보 카드 추가';
    cancelBtn.hidden = true;
  }

  cancelBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const card = { title: form.title.value.trim(), content: form.content.value.trim() };
    if (!card.title || !card.content) return;
    if (editingId) {
      update(ref(db, `info/${editingId}`), card);
    } else {
      const maxOrder = cards.reduce((m, [, c]) => Math.max(m, c.order ?? 0), -1);
      push(ref(db, 'info'), { ...card, order: maxOrder + 1 });
    }
    resetForm();
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function linkify(text) {
  return escapeHtml(text).replace(/(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener">$1</a>');
}
```

- [ ] **Step 4: js/app.js에 init 연결**

```js
import { initInfo } from './info.js';
// else 분기에 추가:
initInfo();
```

최종 app.js 형태:

```js
import { db, watchConnection } from './firebase.js';
import { initItinerary } from './itinerary.js';
import { initChecklist } from './checklist.js';
import { initInfo } from './info.js';

const banner = document.getElementById('offline-banner');
if (!db) {
  banner.hidden = false;
  banner.textContent = 'Firebase 설정 필요 — js/firebase-config.js를 확인하세요';
} else {
  watchConnection(connected => { banner.hidden = connected; });
  initItinerary();
  initChecklist();
  initInfo();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-panel').forEach(p => { p.hidden = p.id !== btn.dataset.target; });
  });
});
```

- [ ] **Step 5: 브라우저 검증**

확인: 정보 탭에 기본 카드 5장 시드, URL 자동 링크, 카드 추가/수정/삭제 동작, 실시간 동기화.

- [ ] **Step 6: Commit**

```bash
git add js/info.js js/app.js index.html css/style.css
git commit -m "[기능] 여행 정보 탭 구현 (기본 정보 카드 시드 포함)"
```

---

### Task 6: GitHub Pages 배포

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: 완성된 사이트 전체
- Produces: 공개 URL `https://kkc1383.github.io/JapanTrip/`

- [ ] **Step 1: README.md 작성**

```markdown
# 일본여행 준비 사이트 🇯🇵

2026.8.20(목) – 8.22(토) 2박 3일 일본여행 준비용 사이트.

**사이트:** https://kkc1383.github.io/JapanTrip/

- 날짜별 일정표 (실시간 공유)
- 준비물 체크리스트 (체크 상태 공유)
- 여행 정보 모음

빌드 없는 정적 사이트 + Firebase Realtime Database.
```

- [ ] **Step 2: push 및 Pages 활성화**

```bash
git add README.md
git commit -m "[기능] README 추가"
git push -u origin master:main
gh api repos/kkc1383/JapanTrip/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

`gh` 미인증이면 사용자에게 GitHub 저장소 Settings > Pages > Branch: main, / (root) 설정을 요청한다.

- [ ] **Step 3: 배포 검증**

Run: `gh api repos/kkc1383/JapanTrip/pages --jq .html_url` → `https://kkc1383.github.io/JapanTrip/`
브라우저에서 해당 URL 접속 → 3개 탭 모두 정상 동작, Firebase 동기화 확인. (반영까지 1~2분 걸릴 수 있음)

- [ ] **Step 4: 완료 보고**

사용자에게 사이트 URL 전달 — 동행자에게 이 URL만 공유하면 됨.
