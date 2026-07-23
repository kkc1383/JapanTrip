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
