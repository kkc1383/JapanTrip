import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyDivf13uOJ9fdsj7fIiyL6r-vY8pl1Ciqs',
  authDomain: 'japantravel-d81cd.firebaseapp.com',
  databaseURL: 'https://japantravel-d81cd-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'japantravel-d81cd',
  storageBucket: 'japantravel-d81cd.firebasestorage.app',
  messagingSenderId: '982403765877',
  appId: '1:982403765877:web:7f0087855ba8a0116d4a3c',
}

export const db = getDatabase(initializeApp(firebaseConfig))
