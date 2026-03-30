// ===== 토이상단 더미 데이터 (v2 - 상세페이지 포함) =====

const PRODUCTS = [
  { id: 'TS001', name: '보라 고양이 봉제인형 25cm', category: '중형인형', price: 4500, retailPrice: 12900, stock: 350, vat: true, shipping: 'overseas', image: 'https://picsum.photos/seed/plush01/400/400', images: ['https://picsum.photos/seed/plush01/600/600','https://picsum.photos/seed/plush01b/600/600'], badge: '인기', memo: '3/28 입고완료. 박스당 50개입.', desc: '부드러운 극세사 원단으로 제작된 귀여운 보라 고양이 인형입니다. 뽑기방에서 가장 인기있는 사이즈인 25cm로, 아이들부터 어른까지 모두 좋아하는 디자인입니다.', spec: '소재: 극세사 PP솜 | 크기: 25cm | 무게: 약 150g | KC인증: 완료', minOrder: 50, boxQty: '1박스 = 50개' },
  { id: 'TS002', name: '노랑 마우스 납작 키링 9cm', category: '키링', price: 1200, retailPrice: 3900, stock: 1200, vat: true, shipping: 'domestic', image: 'https://picsum.photos/seed/keyring02/400/400', images: ['https://picsum.photos/seed/keyring02/600/600'], badge: '당일출고', memo: '국내 창고 재고. 1봉지=10개.', desc: '귀여운 노랑 마우스 캐릭터 납작 키링입니다. 가방이나 핸드폰에 달기 좋은 사이즈이며, 봉지당 10개로 소분 판매 가능합니다.', spec: '소재: 폴리에스터 PP솜 | 크기: 9cm | 무게: 약 25g | KC인증: 완료', minOrder: 100, boxQty: '1봉지 = 10개' },
  { id: 'TS003', name: '하양 동글이 대형인형 60cm', category: '대형인형', price: 12000, retailPrice: 34900, stock: 80, vat: true, shipping: 'overseas', image: 'https://picsum.photos/seed/bigdoll03/400/400', images: ['https://picsum.photos/seed/bigdoll03/600/600'], badge: '신상', memo: '4/5 입고예정. 예약주문 가능.', desc: '포근한 하양 동글이 대형 인형입니다. 60cm의 넉넉한 사이즈로 뽑기방 대형기계 경품으로 최적입니다. 안고 자기 좋은 쿠션감이 특징입니다.', spec: '소재: 극세사 PP솜 | 크기: 60cm | 무게: 약 480g | KC인증: 완료', minOrder: 20, boxQty: '1박스 = 20개' },
  { id: 'TS004', name: '짱구 클래식 랜덤박스 피규어', category: '랜덤박스', price: 3800, retailPrice: 9900, stock: 500, vat: false, shipping: 'domestic', image: 'https://picsum.photos/seed/random04/400/400', images: ['https://picsum.photos/seed/random04/600/600'], badge: '당일출고', memo: 'KC인증 완료. 정품.', desc: '인기 캐릭터 랜덤박스 피규어입니다. 6종 중 1종 랜덤 발송되며, 뽑기방 소형 라인업에 최적화된 상품입니다.', spec: '소재: PVC | 크기: 약 8cm | 무게: 약 60g | KC인증: 완료 | 6종 랜덤', minOrder: 48, boxQty: '1박스 = 48개 (8세트)' },
  { id: 'TS005', name: '파랑 외계인 미니 봉제 12cm', category: '소형인형', price: 2200, retailPrice: 6900, stock: 800, vat: true, shipping: 'overseas', image: 'https://picsum.photos/seed/mini05/400/400', images: ['https://picsum.photos/seed/mini05/600/600'], badge: '', memo: '', desc: '앙증맞은 파랑 외계인 미니 봉제인형입니다. 12cm 소형 사이즈로 뽑기방 소형기계에 적합합니다.', spec: '소재: 폴리에스터 PP솜 | 크기: 12cm | 무게: 약 40g | KC인증: 완료', minOrder: 100, boxQty: '1박스 = 100개' },
  { id: 'TS006', name: '하늘 토끼 빅 쿠션 45cm', category: '대형인형', price: 9500, retailPrice: 27900, stock: 120, vat: true, shipping: 'overseas', image: 'https://picsum.photos/seed/rabbit06/400/400', images: ['https://picsum.photos/seed/rabbit06/600/600'], badge: '인기', memo: '가장 잘나가는 사이즈.', desc: '하늘색 토끼 캐릭터 빅 쿠션입니다. 45cm 사이즈로 쿠션으로도, 인형으로도 활용 가능한 인기 상품입니다.', spec: '소재: 극세사 PP솜 | 크기: 45cm | 무게: 약 350g | KC인증: 완료', minOrder: 30, boxQty: '1박스 = 30개' },
  { id: 'TS007', name: '팬더 동전지갑 키링 10cm', category: '키링', price: 1800, retailPrice: 5500, stock: 600, vat: true, shipping: 'domestic', image: 'https://picsum.photos/seed/panda07/400/400', images: ['https://picsum.photos/seed/panda07/600/600'], badge: '당일출고', memo: '', desc: '실용적인 팬더 동전지갑 키링입니다. 동전지갑 기능이 있어 실용적이며, 키링으로 가방에 달 수도 있습니다.', spec: '소재: 폴리에스터 | 크기: 10cm | 무게: 약 30g | KC인증: 완료', minOrder: 100, boxQty: '1봉지 = 20개' },
  { id: 'TS008', name: '클래식 로봇 고양이 봉제 30cm', category: '중형인형', price: 5200, retailPrice: 14900, stock: 200, vat: true, shipping: 'overseas', image: 'https://picsum.photos/seed/catbot08/400/400', images: ['https://picsum.photos/seed/catbot08/600/600'], badge: '', memo: '리오더 3차.', desc: '클래식한 로봇 고양이 캐릭터 봉제인형 30cm입니다. 꾸준히 재주문이 들어오는 스테디셀러 상품입니다.', spec: '소재: 극세사 PP솜 | 크기: 30cm | 무게: 약 200g | KC인증: 완료', minOrder: 50, boxQty: '1박스 = 50개' },
  { id: 'TS009', name: '별 모양 사운드 키캡 키링', category: '키링', price: 1500, retailPrice: 4900, stock: 900, vat: false, shipping: 'domestic', image: 'https://picsum.photos/seed/star09/400/400', images: ['https://picsum.photos/seed/star09/600/600'], badge: '신상', memo: '소리나는 키링. 건전지 포함.', desc: '누르면 소리가 나는 별 모양 키캡 키링! 귀여운 효과음이 나와 아이들에게 인기만점입니다.', spec: '소재: ABS 플라스틱 | 크기: 4cm | 무게: 약 15g | 건전지 포함', minOrder: 200, boxQty: '1봉지 = 50개' },
  { id: 'TS010', name: '핑크 원숭이 크로스백 20cm', category: '소형인형', price: 3200, retailPrice: 8900, stock: 450, vat: true, shipping: 'overseas', image: 'https://picsum.photos/seed/monkey10/400/400', images: ['https://picsum.photos/seed/monkey10/600/600'], badge: '인기', memo: '', desc: '핑크 원숭이 캐릭터 크로스백입니다. 인형이면서 가방으로도 사용 가능한 실용적인 상품입니다.', spec: '소재: 폴리에스터 PP솜 | 크기: 20cm | 무게: 약 120g | 지퍼 수납', minOrder: 50, boxQty: '1박스 = 50개' },
  { id: 'TS011', name: '미니 동물 세트 8종', category: '소형인형', price: 18000, retailPrice: 49900, stock: 60, vat: true, shipping: 'overseas', image: 'https://picsum.photos/seed/animalset11/400/400', images: ['https://picsum.photos/seed/animalset11/600/600'], badge: '한정', memo: '세트상품. 낱개분리 불가.', desc: '귀여운 미니 동물 봉제인형 8종 세트입니다. 다양한 동물 캐릭터가 포함되어 있어 세트 경품으로 인기 있습니다.', spec: '소재: 극세사 PP솜 | 크기: 각 10cm | 8종 1세트', minOrder: 10, boxQty: '1세트 = 8개' },
  { id: 'TS012', name: '액션 히어로 피규어 15cm', category: '피규어', price: 6800, retailPrice: 19900, stock: 150, vat: false, shipping: 'overseas', image: 'https://picsum.photos/seed/figure12/400/400', images: ['https://picsum.photos/seed/figure12/600/600'], badge: '신상', memo: '4/10 입고예정.', desc: '인기 액션 히어로 캐릭터 피규어 15cm입니다. 정교한 디테일과 관절 가동이 특징인 프리미엄 피규어입니다.', spec: '소재: PVC | 크기: 15cm | 무게: 약 100g | 관절 가동', minOrder: 24, boxQty: '1박스 = 24개' },
  { id: 'TS013', name: '핑크 멜로디 미니 키링', category: '키링', price: 1100, retailPrice: 3500, stock: 2000, vat: true, shipping: 'domestic', image: 'https://picsum.photos/seed/melody13/400/400', images: ['https://picsum.photos/seed/melody13/600/600'], badge: '당일출고', memo: '대량구매 추가할인 가능.', desc: '핑크색 멜로디 캐릭터 미니 키링입니다. 단가가 저렴하여 대량구매 시 마진이 좋은 효자 상품입니다.', spec: '소재: 폴리에스터 PP솜 | 크기: 7cm | 무게: 약 15g', minOrder: 200, boxQty: '1봉지 = 50개' },
  { id: 'TS014', name: '은빛눈 마법사 피규어', category: '피규어', price: 7500, retailPrice: 22900, stock: 100, vat: false, shipping: 'overseas', image: 'https://picsum.photos/seed/wizard14/400/400', images: ['https://picsum.photos/seed/wizard14/600/600'], badge: '인기', memo: '', desc: '인기 애니메이션 은빛눈 마법사 피규어입니다. 섬세한 도색과 역동적인 포즈가 특징입니다.', spec: '소재: PVC | 크기: 15cm | 무게: 약 110g | 고정 포즈', minOrder: 24, boxQty: '1박스 = 24개' },
  { id: 'TS015', name: '노랑 스폰지 봉제 35cm', category: '중형인형', price: 4800, retailPrice: 13900, stock: 300, vat: true, shipping: 'overseas', image: 'https://picsum.photos/seed/sponge15/400/400', images: ['https://picsum.photos/seed/sponge15/600/600'], badge: '', memo: '', desc: '밝은 노란색 스폰지 캐릭터 봉제인형 35cm입니다. 밝은 색상으로 뽑기방에서 눈에 잘 띕니다.', spec: '소재: 극세사 PP솜 | 크기: 35cm | 무게: 약 220g | KC인증: 완료', minOrder: 50, boxQty: '1박스 = 50개' },
  { id: 'TS016', name: '벚꽃 고양이 에디션 25cm', category: '중형인형', price: 5500, retailPrice: 16900, stock: 0, vat: true, shipping: 'overseas', image: 'https://picsum.photos/seed/cherry16/400/400', images: ['https://picsum.photos/seed/cherry16/600/600'], badge: '품절', memo: '4월 중순 재입고 예정.', desc: '봄 한정판 벚꽃 고양이 에디션입니다. 핑크색 벚꽃 자수가 포인트이며 시즌 한정 상품입니다.', spec: '소재: 극세사 PP솜 | 크기: 25cm | 무게: 약 160g | 시즌 한정', minOrder: 50, boxQty: '1박스 = 50개' },
];

const ORDERS = [
  { id: 'ORD-20260329-001', date: '2026-03-29', customer: '행복뽑기', customerId: 'M003', items: [{ product: 'TS001', name: '보라 고양이 봉제인형 25cm', qty: 100, price: 4500 }, { product: 'TS007', name: '팬더 동전지갑 키링 10cm', qty: 200, price: 1800 }], total: 810000, status: 'pending', memo: '4월 1일까지 배송 부탁드립니다', payment: 'bank' },
  { id: 'ORD-20260329-002', date: '2026-03-29', customer: '스타뽑기 강남점', customerId: 'M001', items: [{ product: 'TS002', name: '노랑 마우스 납작 키링 9cm', qty: 500, price: 1200 }], total: 600000, status: 'confirmed', memo: '', payment: 'bank' },
  { id: 'ORD-20260328-003', date: '2026-03-28', customer: '럭키캐치 부산점', customerId: 'M004', items: [{ product: 'TS006', name: '하늘 토끼 빅 쿠션 45cm', qty: 50, price: 9500 }, { product: 'TS010', name: '핑크 원숭이 크로스백 20cm', qty: 100, price: 3200 }], total: 795000, status: 'shipped', memo: '부산 직송', payment: 'card' },
  { id: 'ORD-20260328-004', date: '2026-03-28', customer: '토이박스 대구', customerId: 'M005', items: [{ product: 'TS004', name: '짱구 클래식 랜덤박스 피규어', qty: 200, price: 3800 }], total: 760000, status: 'shipped', memo: '', payment: 'bank' },
  { id: 'ORD-20260327-005', date: '2026-03-27', customer: '뽑기천국 인천', customerId: 'M006', items: [{ product: 'TS013', name: '핑크 멜로디 미니 키링', qty: 1000, price: 1100 }, { product: 'TS009', name: '별 모양 사운드 키캡 키링', qty: 300, price: 1500 }], total: 1550000, status: 'completed', memo: '대량주문 감사합니다', payment: 'bank' },
  { id: 'ORD-20260327-006', date: '2026-03-27', customer: '펀플레이 서울', customerId: 'M007', items: [{ product: 'TS003', name: '하양 동글이 대형인형 60cm', qty: 30, price: 12000 }], total: 360000, status: 'completed', memo: '예약주문건', payment: 'bank' },
  { id: 'ORD-20260326-007', date: '2026-03-26', customer: '스타뽑기 강남점', customerId: 'M001', items: [{ product: 'TS014', name: '은빛눈 마법사 피규어', qty: 50, price: 7500 }, { product: 'TS012', name: '액션 히어로 피규어 15cm', qty: 50, price: 6800 }], total: 715000, status: 'completed', memo: '', payment: 'card' },
  { id: 'ORD-20260325-008', date: '2026-03-25', customer: '행복뽑기', customerId: 'M003', items: [{ product: 'TS005', name: '파랑 외계인 미니 봉제 12cm', qty: 300, price: 2200 }], total: 660000, status: 'completed', memo: '', payment: 'bank' },
];

// 개인정보 마스킹 처리 (실제 서비스에서는 백엔드 API로 관리)
const MEMBERS = [
  { id: 'M001', name: '김*호', store: '스타뽑기 강남점', phone: '010-****-5678', email: 'st**@naver.com', bizNo: '123-**-*7890', grade: 'gold', joinDate: '2025-08-15', status: 'active', route: '네이버 검색', totalOrders: 24, totalAmount: 18500000, bizCertImage: 'https://picsum.photos/seed/biz1/300/400' },
  { id: 'M002', name: '이*영', store: '캐치미 홍대점', phone: '010-****-6789', email: 'ca****@gmail.com', bizNo: '234-**-*8901', grade: 'silver', joinDate: '2025-11-20', status: 'active', route: '카카오톡 광고', totalOrders: 12, totalAmount: 8200000, bizCertImage: 'https://picsum.photos/seed/biz2/300/400' },
  { id: 'M003', name: '박*혁', store: '행복뽑기', phone: '010-****-7890', email: 'ha***@naver.com', bizNo: '345-**-*9012', grade: 'gold', joinDate: '2025-06-10', status: 'active', route: '도매꾹', totalOrders: 31, totalAmount: 24300000, bizCertImage: 'https://picsum.photos/seed/biz3/300/400' },
  { id: 'M004', name: '최*진', store: '럭키캐치 부산점', phone: '010-****-8901', email: 'lu***@naver.com', bizNo: '456-**-*0123', grade: 'silver', joinDate: '2026-01-05', status: 'active', route: '유튜브', totalOrders: 8, totalAmount: 5600000, bizCertImage: 'https://picsum.photos/seed/biz4/300/400' },
  { id: 'M005', name: '정*우', store: '토이박스 대구', phone: '010-****-9012', email: 'to****@gmail.com', bizNo: '567-**-*1234', grade: 'bronze', joinDate: '2026-02-18', status: 'active', route: '인스타그램', totalOrders: 5, totalAmount: 3800000, bizCertImage: 'https://picsum.photos/seed/biz5/300/400' },
  { id: 'M006', name: '한*희', store: '뽑기천국 인천', phone: '010-****-0123', email: 'he****@naver.com', bizNo: '678-**-*2345', grade: 'gold', joinDate: '2025-09-22', status: 'active', route: '지인 소개', totalOrders: 19, totalAmount: 15700000, bizCertImage: 'https://picsum.photos/seed/biz6/300/400' },
  { id: 'M007', name: '윤*석', store: '펀플레이 서울', phone: '010-****-1234', email: 'fu****@gmail.com', bizNo: '789-**-*3456', grade: 'bronze', joinDate: '2026-03-01', status: 'active', route: '네이버 블로그', totalOrders: 3, totalAmount: 1200000, bizCertImage: 'https://picsum.photos/seed/biz7/300/400' },
  { id: 'M008', name: '오*진', store: '프렌즈뽑기 수원', phone: '010-****-2345', email: 'fr****@naver.com', bizNo: '890-**-*4567', grade: '', joinDate: '2026-03-28', status: 'pending', route: '카카오톡 오픈채팅', totalOrders: 0, totalAmount: 0, bizCertImage: 'https://picsum.photos/seed/biz8/300/400' },
  { id: 'M009', name: '강*수', store: '위너뽑기 광주', phone: '010-****-3456', email: 'wi****@gmail.com', bizNo: '901-**-*5678', grade: '', joinDate: '2026-03-29', status: 'pending', route: '도매꾹', totalOrders: 0, totalAmount: 0, bizCertImage: 'https://picsum.photos/seed/biz9/300/400' },
];

const NOTICES = [
  { id: 1, title: '🚚 4월 입고 스케줄 안내', date: '2026-03-28', content: '4월 첫째주 산리오 시리즈 대량 입고 예정입니다. 사전 예약 주문 받습니다.', pinned: true },
  { id: 2, title: '💰 봄맞이 대량구매 특별 할인 이벤트', date: '2026-03-25', content: '100만원 이상 주문 시 추가 5% 할인! 기간: 3/25 ~ 4/10', pinned: true },
  { id: 3, title: '📋 세금계산서 발행 안내', date: '2026-03-20', content: '매월 1일~10일 사이 전월분 세금계산서를 자동 발행합니다.', pinned: false },
  { id: 4, title: '⚠️ 배송 지연 안내 (해외배송)', date: '2026-03-18', content: '중국 물류 사정으로 해외배송 상품이 2-3일 추가 소요될 수 있습니다.', pinned: false },
  { id: 5, title: '🎉 토이상단 그랜드 오픈!', date: '2026-03-15', content: '토이상단이 새롭게 오픈했습니다. 오픈 기념 전 상품 10% 할인!', pinned: false },
];

const QNA_LIST = [
  { id: 1, author: '스타뽑기 강남점', date: '2026-03-29', title: '4월 입고 상품 목록 언제 나오나요?', content: '4월에 입고 예정인 전체 상품 리스트 미리 받아볼 수 있을까요?', reply: '안녕하세요! 4월 입고 리스트는 3/31(월)에 카톡 채널로 먼저 공유드릴 예정입니다. 감사합니다!', replyDate: '2026-03-29' },
  { id: 2, author: '럭키캐치 부산점', date: '2026-03-28', title: '대량 구매 시 추가 할인이 되나요?', content: '200만원 이상 주문 시 추가 할인 가능한지 문의드립니다.', reply: '네, 200만원 이상 주문 시 추가 3% 할인 적용됩니다. 자세한 사항은 카톡 1:1 상담으로 연락주세요!', replyDate: '2026-03-28' },
  { id: 3, author: '토이박스 대구', date: '2026-03-27', title: '해외배송 상품 KC인증 관련 문의', content: '해외배송 상품 중 KC인증이 안 된 상품도 있나요? 뽑기방 운영 시 KC인증 필수라서요.', reply: '토이상단의 모든 봉제인형/피규어 상품은 KC인증 완료 상품만 취급합니다. 안심하고 주문해주세요.', replyDate: '2026-03-27' },
  { id: 4, author: '뽑기천국 인천', date: '2026-03-25', title: '특정 캐릭터 사입 대행 가능한가요?', content: '중국에서 유행하는 특정 캐릭터 인형을 원하는데, 사입 대행이 가능할까요?', reply: '네, 가능합니다! 원하시는 상품의 사진이나 링크를 보내주시면 현지에서 직접 확인 후 견적을 보내드립니다. 카톡 1:1로 문의주세요.', replyDate: '2026-03-26' },
];

const CALENDAR_EVENTS = [
  { date: '2026-03-31', title: '캐릭터 시리즈 20종 입고', type: 'incoming', items: 20 },
  { date: '2026-04-02', title: '신상 키링 세트 입고', type: 'incoming', items: 8 },
  { date: '2026-04-05', title: '대형인형 시리즈 입고', type: 'incoming', items: 5 },
  { date: '2026-04-07', title: '피규어 시리즈 입고', type: 'incoming', items: 12 },
  { date: '2026-04-10', title: '봄 에디션 한정판 입고', type: 'incoming', items: 15 },
  { date: '2026-04-15', title: '액션피규어 2차 입고', type: 'incoming', items: 6 },
  { date: '2026-04-01', title: '3월분 세금계산서 발행', type: 'notice', items: 0 },
  { date: '2026-04-10', title: '봄맞이 할인 이벤트 종료', type: 'notice', items: 0 },
];

const CATEGORIES = ['전체', '소형인형', '중형인형', '대형인형', '키링', '피규어', '랜덤박스'];

const SALES_DATA = {
  weekly: { labels: ['월','화','수','목','금','토','일'], data: [1250000, 980000, 1560000, 2100000, 1870000, 890000, 420000] },
  monthly: { labels: ['1월','2월','3월','4월','5월','6월'], data: [18500000, 22300000, 28700000, 0, 0, 0] }
};

const KAKAO_MESSAGES = [
  { id: 1, date: '2026-03-29 14:30', type: 'all', title: '4월 입고 스케줄 공지', content: '안녕하세요 토이상단입니다! 4월 입고 스케줄을 안내드립니다...', sent: true, recipients: 7 },
  { id: 2, date: '2026-03-25 10:00', type: 'all', title: '봄맞이 할인 이벤트 안내', content: '봄맞이 대량구매 특별 할인! 100만원 이상 주문 시...', sent: true, recipients: 7 },
  { id: 3, date: '2026-03-20 16:00', type: 'grade', title: '골드 회원 전용 특가', content: '골드 회원만을 위한 특별 가격으로...', sent: true, recipients: 3 },
];
