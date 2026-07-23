import { db, watchConnection } from './firebase.js';
import { initItinerary } from './itinerary.js';

const banner = document.getElementById('offline-banner');
if (!db) {
  banner.hidden = false;
  banner.textContent = 'Firebase 설정 필요 — js/firebase-config.js를 확인하세요';
} else {
  watchConnection(connected => { banner.hidden = connected; });
  initItinerary();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-panel').forEach(p => { p.hidden = p.id !== btn.dataset.target; });
  });
});
