# 토이상단 Firebase 셋업 가이드

## 1단계: Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름: `toysangdan` 입력
4. Google Analytics 비활성화 (선택) → **프로젝트 만들기**

## 2단계: 웹 앱 등록

1. 프로젝트 대시보드에서 **</>** (웹) 아이콘 클릭
2. 앱 닉네임: `토이상단 웹` 입력
3. **Firebase Hosting** 체크하지 않아도 됨 (GitHub Pages 사용)
4. **앱 등록** 클릭
5. 표시되는 Firebase 설정값을 복사

## 3단계: firebase-config.js 수정

`firebase-config.js` 파일을 열고 아래 값을 교체:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "여기에_복사한_apiKey",
  authDomain: "여기에_복사한_authDomain",
  projectId: "여기에_복사한_projectId",
  storageBucket: "여기에_복사한_storageBucket",
  messagingSenderId: "여기에_복사한_messagingSenderId",
  appId: "여기에_복사한_appId"
};
```

## 4단계: Firebase 서비스 활성화

### Firestore Database
1. 좌측 메뉴 → **Firestore Database** → **데이터베이스 만들기**
2. 위치: `asia-northeast3` (서울) 선택
3. **테스트 모드에서 시작** 선택 → **만들기**
4. **규칙** 탭에서 `firestore.rules` 파일 내용 붙여넣기

### Authentication
1. 좌측 메뉴 → **Authentication** → **시작하기**
2. **이메일/비밀번호** 활성화 → **저장**

### Storage
1. 좌측 메뉴 → **Storage** → **시작하기**
2. **테스트 모드에서 시작** → **다음** → 위치 선택 → **완료**
3. **규칙** 탭에서 `storage.rules` 파일 내용 붙여넣기

## 5단계: 초기 데이터 시딩

1. 브라우저에서 `seed.html` 열기
2. **🚀 시딩 시작** 버튼 클릭 → 모든 더미 데이터가 Firestore에 등록됨
3. **👤 관리자 계정 생성** 버튼 클릭 → 관리자 이메일/비밀번호 입력

## 6단계: 확인

- 메인 페이지 → 상품이 Firebase에서 로드되는지 확인
- 관리자 페이지 → Firebase 이메일로 로그인
- 상품 추가 → Firestore 콘솔에서 데이터 확인
- 이미지 업로드 → Storage에 파일 저장 확인

## 구조

```
Firestore 컬렉션:
├── products/      상품 데이터
├── orders/        주문 데이터
├── members/       회원 데이터
├── notices/       공지사항
├── qna/           Q&A
├── calendar/      입고 캘린더
├── kakao_messages/ 카카오 메시지 이력
├── admins/        관리자 UID 목록
└── settings/      사이트 설정

Storage 구조:
├── products/{id}/   상품 이미지
└── members/{id}/    사업자등록증
```

## 비용

Firebase 무료 티어 (Spark Plan):
- Firestore: 1GB 저장, 일 50K 읽기
- Storage: 5GB 저장
- Auth: 무제한
- **소규모 도매 사이트에 충분**
