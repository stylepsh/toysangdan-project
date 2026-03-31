// ===== 토이상단 Firebase 설정 =====
// 아래 값을 Firebase 콘솔에서 발급받은 값으로 교체하세요.
// Firebase Console > 프로젝트 설정 > 일반 > 내 앱 > Firebase SDK snippet

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC_9yT0h3bjxPGjYVTtrwSX5Q4WvdtahYQ",
  authDomain: "toysangdan.firebaseapp.com",
  projectId: "toysangdan",
  storageBucket: "toysangdan.firebasestorage.app",
  messagingSenderId: "697286737301",
  appId: "1:697286737301:web:d26c2c3a9a6123f21f0a9c",
  measurementId: "G-3J6HSMRJ36"
};

// Firebase 초기화
firebase.initializeApp(FIREBASE_CONFIG);

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Firestore 설정 (오프라인 캐시)
db.enablePersistence({ synchronizeTabs: true }).catch(() => {});

// ===== 컬렉션 참조 =====
const DB = {
  products:  db.collection('products'),
  orders:    db.collection('orders'),
  members:   db.collection('members'),
  notices:   db.collection('notices'),
  qna:       db.collection('qna'),
  calendar:  db.collection('calendar'),
  settings:  db.collection('settings'),
  kakao:     db.collection('kakao_messages')
};
