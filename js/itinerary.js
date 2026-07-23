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
