// ===== 토이상단 Firebase 서비스 모듈 =====
// Firestore CRUD + Storage 업로드 + Auth 통합

// XSS 방지
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== 이미지 업로드 (Firebase Storage) =====
const StorageService = {
  // 파일 업로드 후 다운로드 URL 반환
  async uploadFile(file, path) {
    const ref = storage.ref().child(path);
    const snapshot = await ref.put(file);
    return await snapshot.ref.getDownloadURL();
  },

  // 상품 이미지 업로드
  async uploadProductImage(file, productId) {
    const ext = file.name.split('.').pop();
    const path = `products/${productId}/thumb_${Date.now()}.${ext}`;
    return await this.uploadFile(file, path);
  },

  // 상품 추가 이미지 업로드 (여러장)
  async uploadProductExtraImages(files, productId) {
    const urls = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `products/${productId}/extra_${Date.now()}_${Math.random().toString(36).slice(2,6)}.${ext}`;
      const url = await this.uploadFile(file, path);
      urls.push(url);
    }
    return urls;
  },

  // 사업자등록증 업로드
  async uploadBizCert(file, memberId) {
    const ext = file.name.split('.').pop();
    const path = `members/${memberId}/biz_cert.${ext}`;
    return await this.uploadFile(file, path);
  },

  // 파일 삭제
  async deleteFile(url) {
    try {
      const ref = storage.refFromURL(url);
      await ref.delete();
    } catch (e) {
      console.warn('파일 삭제 실패:', e);
    }
  }
};

// ===== 상품 서비스 =====
const ProductService = {
  // 전체 상품 조회
  async getAll() {
    const snap = await DB.products.orderBy('createdAt', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // 카테고리별 조회
  async getByCategory(category) {
    const snap = await DB.products.where('category', '==', category).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // 단일 상품 조회
  async getById(id) {
    const doc = await DB.products.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  // 상품 등록
  async create(data, imageFile, extraFiles) {
    const id = 'TS' + String(Date.now()).slice(-6);
    let imageUrl = data.image || '';
    let extraUrls = [];

    if (imageFile) {
      imageUrl = await StorageService.uploadProductImage(imageFile, id);
    }
    if (extraFiles && extraFiles.length > 0) {
      extraUrls = await StorageService.uploadProductExtraImages(extraFiles, id);
    }

    const product = {
      ...data,
      image: imageUrl,
      images: extraUrls.length > 0 ? [imageUrl, ...extraUrls] : [imageUrl],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await DB.products.doc(id).set(product);
    return { id, ...product };
  },

  // 상품 수정
  async update(id, data, newImageFile) {
    const updateData = {
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (newImageFile) {
      updateData.image = await StorageService.uploadProductImage(newImageFile, id);
    }

    await DB.products.doc(id).update(updateData);
    return { id, ...updateData };
  },

  // 상품 삭제
  async delete(id) {
    const product = await this.getById(id);
    if (product?.image) {
      await StorageService.deleteFile(product.image).catch(() => {});
    }
    await DB.products.doc(id).delete();
  },

  // 재고 차감
  async decrementStock(id, qty) {
    await DB.products.doc(id).update({
      stock: firebase.firestore.FieldValue.increment(-qty)
    });
  },

  // 실시간 리스너
  onSnapshot(callback) {
    return DB.products.orderBy('createdAt', 'desc').onSnapshot(snap => {
      const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(products);
    });
  }
};

// ===== 주문 서비스 =====
const OrderService = {
  async getAll() {
    const snap = await DB.orders.orderBy('date', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getByCustomer(customerId) {
    const snap = await DB.orders.where('customerId', '==', customerId).orderBy('date', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async create(data) {
    const id = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Date.now()).slice(-3)}`;
    const order = {
      ...data,
      id,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await DB.orders.doc(id).set(order);
    return order;
  },

  async updateStatus(id, status) {
    await DB.orders.doc(id).update({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  async delete(id) {
    await DB.orders.doc(id).delete();
  },

  onSnapshot(callback) {
    return DB.orders.orderBy('date', 'desc').onSnapshot(snap => {
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(orders);
    });
  }
};

// ===== 회원 서비스 =====
const MemberService = {
  async getAll() {
    const snap = await DB.members.orderBy('joinDate', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getById(id) {
    const doc = await DB.members.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async create(data, bizCertFile) {
    const id = 'M' + String(Date.now()).slice(-6);
    let bizCertUrl = '';

    if (bizCertFile) {
      bizCertUrl = await StorageService.uploadBizCert(bizCertFile, id);
    }

    const member = {
      ...data,
      bizCertImage: bizCertUrl,
      status: 'pending',
      grade: '',
      totalOrders: 0,
      totalAmount: 0,
      joinDate: new Date().toISOString().slice(0, 10),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await DB.members.doc(id).set(member);
    return { id, ...member };
  },

  async approve(id) {
    await DB.members.doc(id).update({
      status: 'active',
      grade: 'bronze',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  async reject(id) {
    await DB.members.doc(id).delete();
  },

  async updateGrade(id, grade) {
    await DB.members.doc(id).update({ grade });
  },

  async addMemo(id, memo) {
    await DB.members.doc(id).update({ adminMemo: memo });
  },

  onSnapshot(callback) {
    return DB.members.orderBy('joinDate', 'desc').onSnapshot(snap => {
      const members = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(members);
    });
  }
};

// ===== 공지사항 서비스 =====
const NoticeService = {
  async getAll() {
    const snap = await DB.notices.orderBy('date', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async create(data) {
    const ref = await DB.notices.add({
      ...data,
      date: new Date().toISOString().slice(0, 10),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id, ...data };
  },

  async update(id, data) {
    await DB.notices.doc(id).update(data);
  },

  async delete(id) {
    await DB.notices.doc(id).delete();
  },

  onSnapshot(callback) {
    return DB.notices.orderBy('date', 'desc').onSnapshot(snap => {
      const notices = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(notices);
    });
  }
};

// ===== Q&A 서비스 =====
const QnaService = {
  async getAll() {
    const snap = await DB.qna.orderBy('date', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async create(data) {
    const ref = await DB.qna.add({
      ...data,
      date: new Date().toISOString().slice(0, 10),
      reply: null,
      replyDate: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id, ...data };
  },

  async reply(id, replyText) {
    await DB.qna.doc(id).update({
      reply: replyText,
      replyDate: new Date().toISOString().slice(0, 10)
    });
  },

  async delete(id) {
    await DB.qna.doc(id).delete();
  },

  onSnapshot(callback) {
    return DB.qna.orderBy('date', 'desc').onSnapshot(snap => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(list);
    });
  }
};

// ===== 입고 캘린더 서비스 =====
const CalendarService = {
  async getAll() {
    const snap = await DB.calendar.orderBy('date', 'asc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async create(data) {
    const ref = await DB.calendar.add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id, ...data };
  },

  async delete(id) {
    await DB.calendar.doc(id).delete();
  },

  onSnapshot(callback) {
    return DB.calendar.orderBy('date', 'asc').onSnapshot(snap => {
      const events = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(events);
    });
  }
};

// ===== 카카오 메시지 서비스 =====
const KakaoService = {
  async getAll() {
    const snap = await DB.kakao.orderBy('date', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async create(data) {
    const ref = await DB.kakao.add({
      ...data,
      date: new Date().toLocaleString('ko-KR'),
      sent: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id, ...data };
  },

  onSnapshot(callback) {
    return DB.kakao.orderBy('createdAt', 'desc').onSnapshot(snap => {
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(msgs);
    });
  }
};

// ===== 인증 서비스 =====
const AuthService = {
  // 이메일/비밀번호 로그인
  async login(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return cred.user;
  },

  // 회원가입
  async register(email, password) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    return cred.user;
  },

  // 로그아웃
  async logout() {
    await auth.signOut();
  },

  // 현재 사용자
  getCurrentUser() {
    return auth.currentUser;
  },

  // 관리자 여부 확인 (Firestore custom field)
  async isAdmin(uid) {
    const doc = await db.collection('admins').doc(uid).get();
    return doc.exists;
  },

  // 인증 상태 리스너
  onAuthChange(callback) {
    return auth.onAuthStateChanged(callback);
  }
};

// ===== 매출 데이터 서비스 =====
const SalesService = {
  async getSummary() {
    const orders = await OrderService.getAll();
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.date === today);
    const thisMonth = today.slice(0, 7);
    const monthOrders = orders.filter(o => o.date?.startsWith(thisMonth));

    return {
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((s, o) => s + (o.total || 0), 0),
      monthRevenue: monthOrders.reduce((s, o) => s + (o.total || 0), 0),
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
      shippedOrders: orders.filter(o => o.status === 'shipped').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      weeklyData: this._calcWeekly(orders),
      monthlyData: this._calcMonthly(orders)
    };
  },

  _calcWeekly(orders) {
    const labels = ['월','화','수','목','금','토','일'];
    const data = [0,0,0,0,0,0,0];
    const now = new Date();
    orders.forEach(o => {
      const d = new Date(o.date);
      const diff = Math.floor((now - d) / 86400000);
      if (diff < 7) {
        const day = d.getDay();
        const idx = day === 0 ? 6 : day - 1;
        data[idx] += o.total || 0;
      }
    });
    return { labels, data };
  },

  _calcMonthly(orders) {
    const labels = [];
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      labels.push((d.getMonth() + 1) + '월');
      const sum = orders.filter(o => o.date?.startsWith(key)).reduce((s, o) => s + (o.total || 0), 0);
      data.push(sum);
    }
    return { labels, data };
  }
};

console.log('✅ Firebase 서비스 모듈 로드 완료');
