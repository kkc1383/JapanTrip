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
