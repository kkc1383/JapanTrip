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
