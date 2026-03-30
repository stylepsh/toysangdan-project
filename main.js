// ===== 토이상단 메인 스토어 JS (v4 - Firebase 연동) =====

// XSS 방지 (firebase-service.js에 없을 때 fallback)
if (typeof escapeHtml === 'undefined') {
  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Firebase 사용 가능 여부
const USE_FIREBASE = (typeof firebase !== 'undefined' && typeof DB !== 'undefined');

// 장바구니 (7일 만료)
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('toysangdan_cart') || '{}');
    if (saved.expires && Date.now() > saved.expires) {
      localStorage.removeItem('toysangdan_cart');
      return [];
    }
    return Array.isArray(saved.items) ? saved.items : [];
  } catch { return []; }
}
function saveCart() {
  localStorage.setItem('toysangdan_cart', JSON.stringify({
    items: cart,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000
  }));
}

let cart = loadCart();
let currentSort = 'default';

// Firebase 데이터 로드 (실패 시 data.js fallback)
async function loadFirebaseData() {
  if (!USE_FIREBASE) return false;
  try {
    const [products, notices, qna, calendar] = await Promise.all([
      ProductService.getAll(),
      NoticeService.getAll(),
      QnaService.getAll(),
      CalendarService.getAll()
    ]);
    if (products.length > 0) {
      PRODUCTS.length = 0;
      products.forEach(p => PRODUCTS.push(p));
    }
    if (notices.length > 0) {
      NOTICES.length = 0;
      notices.forEach(n => NOTICES.push(n));
    }
    if (qna.length > 0) {
      QNA_LIST.length = 0;
      qna.forEach(q => QNA_LIST.push(q));
    }
    if (calendar.length > 0) {
      CALENDAR_EVENTS.length = 0;
      calendar.forEach(e => CALENDAR_EVENTS.push(e));
    }
    console.log('✅ Firebase 데이터 로드 완료');
    return true;
  } catch (err) {
    console.warn('⚠️ Firebase 로드 실패, data.js fallback 사용:', err.message);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Firebase 데이터 로드 시도
  await loadFirebaseData();

  renderCalendar();
  renderProducts();
  renderNotices();
  renderQna();
  initHeader();
  initSearch();
  initSort();
  updateCartBadge();
  checkLoginState();
  handleHashRoute();
  initScrollAnimations();
});

// URL 해시 라우팅
window.addEventListener('hashchange', handleHashRoute);
function handleHashRoute() {
  const hash = location.hash;
  if (hash.startsWith('#product/')) {
    const id = hash.replace('#product/', '');
    setTimeout(() => showProductDetail(id), 100);
  }
}

// 스크롤 애니메이션 (IntersectionObserver)
function initScrollAnimations() {
  const sections = document.querySelectorAll('.section, .partner-section, .why-section, .trust-banner');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  sections.forEach(s => {
    s.classList.add('fade-in-section');
    observer.observe(s);
  });
}

// Login state (Firebase Auth 또는 localStorage fallback)
function checkLoginState() {
  if (USE_FIREBASE && auth) {
    auth.onAuthStateChanged(user => {
      const loginBtn = document.getElementById('login-btn');
      if (!loginBtn) return;
      if (user) {
        localStorage.setItem('toysangdan_logged_in', 'true');
        localStorage.setItem('toysangdan_user', JSON.stringify({
          id: user.uid, name: user.displayName || user.email?.split('@')[0] || '회원',
          email: user.email, store: user.displayName || ''
        }));
        loginBtn.textContent = user.displayName || user.email?.split('@')[0] || '마이페이지';
        loginBtn.href = '#mypage';
        loginBtn.onclick = (e) => { e.preventDefault(); showMyPage(); };
        renderProducts(); // 로그인 후 가격 표시 업데이트
      } else {
        localStorage.removeItem('toysangdan_logged_in');
        loginBtn.textContent = '로그인';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
      }
    });
  } else {
    const isLoggedIn = localStorage.getItem('toysangdan_logged_in') === 'true';
    const loginBtn = document.getElementById('login-btn');
    if (isLoggedIn && loginBtn) {
      const user = JSON.parse(localStorage.getItem('toysangdan_user') || '{}');
      loginBtn.textContent = escapeHtml(user.name) || '마이페이지';
      loginBtn.href = '#mypage';
      loginBtn.onclick = (e) => { e.preventDefault(); showMyPage(); };
    }
  }
}

// ===== 마이페이지 =====
function showMyPage() {
  const user = JSON.parse(localStorage.getItem('toysangdan_user') || '{}');
  const userOrders = ORDERS.filter(o => o.customer === user.store || o.customerId === user.id);

  document.getElementById('product-detail-content').innerHTML = `
    <div style="padding:32px;">
      <h2 style="margin-bottom:24px;">👤 마이페이지</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;padding:20px;background:var(--bg);border-radius:var(--radius-md);border:1px solid var(--border);">
        <div><span style="color:var(--text-secondary);font-size:13px;">매장명</span><div style="font-weight:700;">${escapeHtml(user.store) || '-'}</div></div>
        <div><span style="color:var(--text-secondary);font-size:13px;">대표자</span><div style="font-weight:700;">${escapeHtml(user.name) || '-'}</div></div>
        <div><span style="color:var(--text-secondary);font-size:13px;">등급</span><div style="font-weight:700;">${escapeHtml(user.grade?.toUpperCase()) || '-'}</div></div>
        <div><span style="color:var(--text-secondary);font-size:13px;">아이디</span><div style="font-weight:700;">${escapeHtml(user.id) || '-'}</div></div>
      </div>
      <h3 style="margin-bottom:16px;">📋 주문 내역</h3>
      ${userOrders.length > 0 ? `
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:2px solid var(--border);">
              <th style="text-align:left;padding:10px 12px;font-size:13px;color:var(--text-secondary);">주문번호</th>
              <th style="text-align:left;padding:10px 12px;font-size:13px;color:var(--text-secondary);">날짜</th>
              <th style="text-align:left;padding:10px 12px;font-size:13px;color:var(--text-secondary);">상품</th>
              <th style="text-align:left;padding:10px 12px;font-size:13px;color:var(--text-secondary);">금액</th>
              <th style="text-align:left;padding:10px 12px;font-size:13px;color:var(--text-secondary);">상태</th>
            </tr>
          </thead>
          <tbody>
            ${userOrders.map(o => `
              <tr style="border-bottom:1px solid var(--border-light);">
                <td style="padding:12px;font-size:13px;font-weight:600;">${escapeHtml(o.id)}</td>
                <td style="padding:12px;font-size:14px;">${escapeHtml(o.date)}</td>
                <td style="padding:12px;font-size:13px;">${o.items.map(i => escapeHtml(i.name)).join(', ')}</td>
                <td style="padding:12px;font-weight:700;">₩${o.total.toLocaleString()}</td>
                <td style="padding:12px;"><span class="status-badge status-${o.status}">${{pending:'입금대기',confirmed:'입금확인',shipped:'발송완료',completed:'거래완료'}[o.status]||o.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div style="text-align:center;padding:40px;color:var(--text-light);">주문 내역이 없습니다.</div>'}
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:flex-end;">
        <button class="btn btn-danger" onclick="if(confirm('로그아웃 하시겠습니까?')){localStorage.removeItem('toysangdan_logged_in');localStorage.removeItem('toysangdan_user');location.reload();}">로그아웃</button>
        <button class="btn btn-outline" onclick="closeProductModal()">닫기</button>
      </div>
    </div>
  `;
  document.getElementById('product-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Header scroll effect
function initHeader() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Category filter
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const cat = link.dataset.cat || link.textContent.trim();
      renderProducts(cat === '전체' ? null : cat);
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
      // 모바일 메뉴 닫기
      const nav = document.querySelector('.nav-menu');
      if (nav.classList.contains('mobile-open')) toggleMobileMenu();
    });
  });
}

// Search
function initSearch() {
  const input = document.getElementById('search-input');
  let timeout;
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      renderProducts(null, q);
    }, 300);
  });
}

// Sort
function initSort() {
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderProducts();
    });
  }
}

function sortProducts(list) {
  const sorted = [...list];
  switch (currentSort) {
    case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
    case 'stock-desc': return sorted.sort((a, b) => b.stock - a.stock);
    case 'new': return sorted.sort((a, b) => (b.badge === '신상' ? 1 : 0) - (a.badge === '신상' ? 1 : 0));
    default: return sorted;
  }
}

// Calendar
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  grid.innerHTML = CALENDAR_EVENTS.map(ev => {
    const d = new Date(ev.date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const isIncoming = ev.type === 'incoming';
    return `
      <div class="calendar-card animate-in">
        <div class="calendar-date" style="${isIncoming ? '' : 'background: linear-gradient(135deg, #FDCB6E, #E17055);'}">
          <span class="day">${day}</span>
          <span class="month">${month}월</span>
        </div>
        <div class="calendar-info">
          <h4>${escapeHtml(ev.title)}</h4>
          <p>${isIncoming ? ev.items + '종 입고 예정' : '알림'}</p>
          <span class="tag ${isIncoming ? 'tag-incoming' : 'tag-notice'}">${isIncoming ? '📦 입고' : '📋 공지'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Products
function renderProducts(category, search) {
  const isLoggedIn = localStorage.getItem('toysangdan_logged_in') === 'true';

  let filtered = PRODUCTS.filter(p => {
    if (category && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search)) return false;
    return true;
  });

  filtered = sortProducts(filtered);

  // Trend products (인기 + 한정)
  const trendEl = document.getElementById('trend-products');
  if (trendEl) {
    const trendItems = filtered.filter(p => p.badge === '인기' || p.badge === '한정');
    trendEl.innerHTML = trendItems.length > 0 ? trendItems.map(p => productCard(p, isLoggedIn)).join('') : emptyState();
  }

  // Domestic (당일출고)
  const domesticEl = document.getElementById('domestic-products');
  if (domesticEl) {
    const domesticItems = filtered.filter(p => p.shipping === 'domestic');
    domesticEl.innerHTML = domesticItems.length > 0 ? domesticItems.map(p => productCard(p, isLoggedIn)).join('') : emptyState();
  }

  // New (신상)
  const newEl = document.getElementById('new-products');
  if (newEl) {
    const newItems = filtered.filter(p => p.badge === '신상');
    newEl.innerHTML = newItems.length > 0 ? newItems.map(p => productCard(p, isLoggedIn)).join('') : emptyState();
  }

  // All products
  const allEl = document.getElementById('all-products');
  if (allEl) {
    allEl.innerHTML = filtered.length > 0 ? filtered.map(p => productCard(p, isLoggedIn)).join('') : emptyState();
  }
}

function productCard(p, isLoggedIn) {
  const badgeClass = {
    '인기': 'badge-popular', '신상': 'badge-new', '당일출고': 'badge-domestic',
    '한정': 'badge-limited', '품절': 'badge-soldout'
  }[p.badge] || '';

  const stockPercent = Math.min(100, (p.stock / 1000) * 100);
  const isLow = p.stock < 100;
  const isSoldOut = p.stock === 0;

  return `
    <div class="product-card" onclick="showProductDetail('${escapeHtml(p.id)}')" role="button" tabindex="0" aria-label="${escapeHtml(p.name)} 상품 상세보기">
      <div class="product-img">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
        ${p.badge ? `<span class="product-badge ${badgeClass}">${escapeHtml(p.badge)}</span>` : ''}
        ${!isSoldOut ? `<button class="product-quick" onclick="event.stopPropagation(); addToCart('${escapeHtml(p.id)}')" aria-label="장바구니에 담기">🛒</button>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${escapeHtml(p.category)}</div>
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-price-area">
          ${isLoggedIn
            ? `<span class="product-price">₩${p.price.toLocaleString()}</span>
               <span class="product-vat">${p.vat ? 'VAT포함' : 'VAT별도'}</span>`
            : `<span class="product-price-blur">₩X,XXX</span>
               <span class="product-price-label">🔒 회원 전용</span>`
          }
        </div>
        ${!isSoldOut ? `
          <div class="product-stock-bar">
            <div class="product-stock-fill ${isLow ? 'low' : ''}" style="width: ${stockPercent}%"></div>
          </div>
          <div style="font-size:12px; color: ${isLow ? 'var(--danger)' : 'var(--text-light)'}; margin-top:4px;">
            ${isLow ? '⚠️ 잔여 ' + p.stock + '개' : '재고 ' + p.stock + '개'}
          </div>
        ` : `<div style="font-size:13px; color:var(--danger); font-weight:600; margin-top:8px;">품절</div>`}
      </div>
    </div>
  `;
}

function emptyState() {
  return `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-light);">
    <div style="font-size:64px; margin-bottom:16px;">📦</div>
    <p style="font-size:16px;margin-bottom:8px;">해당 조건의 상품이 없습니다.</p>
    <p style="font-size:13px;">다른 카테고리를 선택하거나 검색어를 변경해 보세요.</p>
  </div>`;
}

// ===== PRODUCT DETAIL MODAL =====
function showProductDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const isLoggedIn = localStorage.getItem('toysangdan_logged_in') === 'true';

  // 해시 라우팅 업데이트
  history.replaceState(null, '', '#product/' + id);

  const allImages = p.images && p.images.length > 0 ? p.images : [p.image];

  document.getElementById('product-detail-content').innerHTML = `
    <div class="pd-layout">
      <div class="pd-images">
        <div class="pd-main-img" id="pd-main-img">
          <img src="${escapeHtml(allImages[0])}" alt="${escapeHtml(p.name)}" id="pd-main-photo">
        </div>
        ${allImages.length > 1 ? `
          <div class="pd-thumb-row">
            ${allImages.map((img, i) => `
              <div class="pd-thumb ${i === 0 ? 'active' : ''}" onclick="changeProductImage('${escapeHtml(img)}', this)">
                <img src="${escapeHtml(img)}" alt="thumbnail ${i+1}">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="pd-info">
        <div class="pd-category">${escapeHtml(p.category)} ${p.badge ? `· <span style="color:${p.badge==='품절'?'var(--danger)':'var(--accent)'};">${escapeHtml(p.badge)}</span>` : ''} ${p.shipping === 'domestic' ? '· <span style="color:var(--success);">🚀 당일출고</span>' : ''}</div>
        <h2 class="pd-name">${escapeHtml(p.name)}</h2>

        ${isLoggedIn ? `
          <div class="pd-price-area">
            <div class="pd-price-row">
              <span class="pd-price-label">도매가</span>
              <span class="pd-price">₩${p.price.toLocaleString()}</span>
              ${p.retailPrice ? `<span class="pd-retail">소비자가 ₩${p.retailPrice.toLocaleString()}</span>` : ''}
            </div>
            <span class="pd-vat-tag">${p.vat ? '✓ 부가세 포함' : '⚠️ 부가세 별도'}</span>
          </div>
        ` : `
          <div class="pd-price-area" style="text-align:center;">
            ${p.retailPrice ? `<p style="font-size:14px;color:var(--text-light);margin-bottom:8px;">소비자가 <span style="text-decoration:line-through;">₩${p.retailPrice.toLocaleString()}</span></p>` : ''}
            <p style="font-size:16px;color:var(--text-secondary);margin-bottom:12px;">🔒 도매가는 사업자 인증 회원만 확인 가능합니다.</p>
            <a href="login.html" class="btn btn-primary" style="text-decoration:none;">사업자 회원가입 →</a>
          </div>
        `}

        <p class="pd-desc">${escapeHtml(p.desc || '')}</p>

        <div class="pd-specs">
          <h4>📋 상품 정보</h4>
          ${p.spec ? p.spec.split(' | ').map(s => {
            const [label, ...val] = s.split(': ');
            return `<div class="pd-spec-row"><span class="pd-spec-label">${escapeHtml(label)}</span><span class="pd-spec-value">${escapeHtml(val.join(': ') || label)}</span></div>`;
          }).join('') : ''}
          <div class="pd-spec-row"><span class="pd-spec-label">최소주문</span><span class="pd-spec-value">${p.minOrder || '-'}개</span></div>
          <div class="pd-spec-row"><span class="pd-spec-label">포장단위</span><span class="pd-spec-value">${escapeHtml(p.boxQty || '-')}</span></div>
          <div class="pd-spec-row"><span class="pd-spec-label">배송</span><span class="pd-spec-value">${p.shipping === 'domestic' ? '국내 창고 당일출고' : '해외배송 7~14일'}</span></div>
          <div class="pd-spec-row"><span class="pd-spec-label">재고</span><span class="pd-spec-value" style="color:${p.stock < 100 ? 'var(--danger)' : 'var(--text-primary)'};font-weight:700;">${p.stock === 0 ? '품절' : p.stock + '개'}</span></div>
        </div>

        ${p.memo ? `<div class="pd-memo">💬 관리자 메모: ${escapeHtml(p.memo)}</div>` : ''}

        ${isLoggedIn && p.stock > 0 ? `
          <div class="pd-order-area">
            <input type="number" class="pd-qty-input" id="pd-qty" value="${p.minOrder || 1}" min="${p.minOrder || 1}" max="${p.stock}" aria-label="주문 수량">
            <button class="pd-order-btn" onclick="addToCartFromDetail('${escapeHtml(p.id)}')">🛒 장바구니 담기</button>
          </div>
          <p style="font-size:12px;color:var(--text-light);margin-top:8px;">최소 주문: ${p.minOrder || 1}개 | ${escapeHtml(p.boxQty || '')}</p>
        ` : ''}

        <button class="btn btn-outline" style="width:100%;justify-content:center;margin-top:12px;" onclick="copyProductLink('${escapeHtml(p.id)}')">🔗 상품 링크 복사</button>
      </div>
    </div>
  `;

  document.getElementById('product-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function copyProductLink(id) {
  const url = location.origin + location.pathname + '#product/' + id;
  navigator.clipboard.writeText(url).then(() => {
    showToast('🔗 상품 링크가 복사되었습니다!');
  }).catch(() => {
    showToast('링크: ' + url);
  });
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('show');
  document.body.style.overflow = '';
  history.replaceState(null, '', location.pathname);
}

function changeProductImage(src, thumb) {
  document.getElementById('pd-main-photo').src = src;
  document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function addToCartFromDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const qtyInput = document.getElementById('pd-qty');
  const qty = parseInt(qtyInput?.value || 1);

  // 최소 주문수량 검증
  if (p.minOrder && qty < p.minOrder) {
    showToast(`⚠️ 최소 주문수량은 ${p.minOrder}개입니다.`);
    qtyInput.value = p.minOrder;
    return;
  }

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name: p.name, price: p.price, qty });
  }
  saveCart();
  updateCartBadge();
  showToast(`✅ ${escapeHtml(p.name)} ${qty}개가 장바구니에 추가되었습니다!`);
  closeProductModal();
}

// ===== NOTICES (모달로 개선) =====
function renderNotices() {
  const list = document.getElementById('notice-list');
  if (!list) return;
  list.innerHTML = NOTICES.map(n => `
    <div class="notice-item" onclick="showNoticeDetail(${n.id})" role="button" tabindex="0" aria-label="${escapeHtml(n.title)}">
      ${n.pinned ? '<span class="notice-pin">필독</span>' : '<span style="width:35px;flex-shrink:0;"></span>'}
      <span class="notice-title">${escapeHtml(n.title)}</span>
      <span class="notice-date">${escapeHtml(n.date)}</span>
    </div>
  `).join('');
}

function showNoticeDetail(id) {
  const n = NOTICES.find(x => x.id === id);
  if (!n) return;
  document.getElementById('product-detail-content').innerHTML = `
    <div style="padding:32px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        ${n.pinned ? '<span class="notice-pin">필독</span>' : ''}
        <span style="font-size:13px;color:var(--text-light);">${escapeHtml(n.date)}</span>
      </div>
      <h2 style="font-size:22px;font-weight:800;margin-bottom:20px;">${escapeHtml(n.title)}</h2>
      <div style="font-size:15px;color:var(--text-secondary);line-height:1.8;padding:20px;background:var(--bg);border-radius:var(--radius-md);">
        ${escapeHtml(n.content)}
      </div>
      <div style="margin-top:24px;display:flex;justify-content:flex-end;">
        <button class="btn btn-outline" onclick="closeProductModal()">닫기</button>
      </div>
    </div>
  `;
  document.getElementById('product-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

// ===== QNA =====
function renderQna() {
  const list = document.getElementById('qna-list');
  if (!list) return;
  list.innerHTML = QNA_LIST.map(q => `
    <div class="qna-item" id="qna-${q.id}">
      <div class="qna-question" onclick="toggleQna(${q.id})" role="button" tabindex="0" aria-label="${escapeHtml(q.title)}">
        <span class="qna-q-badge">Q</span>
        <span class="qna-q-title">${escapeHtml(q.title)}</span>
        <span class="qna-q-meta">
          <span>${escapeHtml(q.author)}</span>
          <span>${escapeHtml(q.date)}</span>
        </span>
        <span class="qna-arrow">▼</span>
      </div>
      <div class="qna-answer">
        <div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:12px;">
          <p style="font-size:14px;color:var(--text-primary);line-height:1.7;">${escapeHtml(q.content)}</p>
        </div>
        ${q.reply ? `
          <div class="qna-a-badge">✅ 답변완료</div>
          <p class="qna-a-text">${escapeHtml(q.reply)}</p>
          <p class="qna-a-date">답변일: ${escapeHtml(q.replyDate)}</p>
        ` : `
          <div style="padding:12px;background:#FFF3E0;border-radius:8px;font-size:13px;color:#E65100;">
            ⏳ 답변 대기 중입니다.
          </div>
        `}
      </div>
    </div>
  `).join('');
}

function toggleQna(id) {
  const item = document.getElementById('qna-' + id);
  if (item) item.classList.toggle('open');
}

function showQnaForm() {
  const isLoggedIn = localStorage.getItem('toysangdan_logged_in') === 'true';
  if (!isLoggedIn) {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
      window.location.href = 'login.html';
    }
    return;
  }
  document.getElementById('qna-form-content').innerHTML = `
    <h2>💬 질문하기</h2>
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">제목</label>
      <input type="text" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="질문 제목을 입력하세요" id="qna-title-input" maxlength="100">
    </div>
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">내용</label>
      <textarea style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;min-height:120px;resize:vertical;" placeholder="질문 내용을 작성하세요..." id="qna-content-input" maxlength="1000"></textarea>
    </div>
    <div style="display:flex;gap:12px;justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeQnaModal()">취소</button>
      <button class="btn btn-primary" onclick="submitQna()">✏️ 질문 등록</button>
    </div>
  `;
  document.getElementById('qna-modal').classList.add('show');
}

function closeQnaModal() {
  document.getElementById('qna-modal').classList.remove('show');
}

async function submitQna() {
  const title = document.getElementById('qna-title-input')?.value?.trim();
  const content = document.getElementById('qna-content-input')?.value?.trim();
  if (!title || !content) {
    showToast('⚠️ 제목과 내용을 모두 입력해주세요.');
    return;
  }
  if (title.length > 100 || content.length > 1000) {
    showToast('⚠️ 입력 길이를 초과했습니다.');
    return;
  }
  const user = JSON.parse(localStorage.getItem('toysangdan_user') || '{}');
  const qnaData = {
    author: user.store || user.name || '나의 매장',
    title, content
  };

  if (USE_FIREBASE) {
    try {
      await QnaService.create(qnaData);
      const allQna = await QnaService.getAll();
      QNA_LIST.length = 0;
      allQna.forEach(q => QNA_LIST.push(q));
    } catch (e) { console.warn('Firebase QNA 저장 실패:', e); }
  } else {
    QNA_LIST.unshift({
      id: QNA_LIST.length + 1,
      ...qnaData,
      date: new Date().toISOString().slice(0, 10),
      reply: null, replyDate: null
    });
  }
  showToast('✅ 질문이 등록되었습니다!');
  closeQnaModal();
  renderQna();
}

// ===== PARTNER FORM =====
function showPartnerForm(type) {
  const titles = {
    partnership: '🤝 제휴사 문의',
    buystock: '📦 재고 매입 문의',
    sourcing: '🏭 사입 대행 / 대량 매입 문의'
  };

  document.getElementById('partner-form-content').innerHTML = `
    <h2>${titles[type] || '문의'}</h2>
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">업체명 / 매장명</label>
      <input type="text" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="업체명을 입력하세요" maxlength="50">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div>
        <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">담당자명</label>
        <input type="text" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="홍길동" maxlength="20">
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">연락처</label>
        <input type="tel" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="010-0000-0000" maxlength="15">
      </div>
    </div>
    ${type === 'sourcing' ? `
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">원하시는 상품 설명</label>
        <textarea style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;min-height:100px;resize:vertical;" placeholder="원하시는 상품의 사진, 중국 사이트 링크, 상품명 등을 알려주세요." maxlength="2000"></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">희망 수량</label>
          <input type="text" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="예: 500개">
        </div>
        <div>
          <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">희망 납기</label>
          <input type="text" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="예: 2주 이내">
        </div>
      </div>
    ` : `
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">문의 내용</label>
        <textarea style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;min-height:120px;resize:vertical;" placeholder="${type === 'buystock' ? '매입 희망 상품명, 수량, 상태 등을 알려주세요.' : '제휴 희망 내용을 자유롭게 작성해주세요.'}" maxlength="2000"></textarea>
      </div>
    `}
    <div style="display:flex;gap:12px;justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closePartnerModal()">취소</button>
      <button class="btn btn-primary" onclick="submitPartnerForm()">📤 문의 보내기</button>
    </div>
    <p style="font-size:12px;color:var(--text-light);margin-top:16px;text-align:center;">💬 빠른 상담은 카카오톡 채널로 문의해주세요!</p>
  `;
  document.getElementById('partner-modal').classList.add('show');
}

function closePartnerModal() {
  document.getElementById('partner-modal').classList.remove('show');
}

function submitPartnerForm() {
  showToast('✅ 문의가 접수되었습니다! 영업일 기준 1일 이내 연락드리겠습니다.');
  closePartnerModal();
}

// Cart
function addToCart(id) {
  const isLoggedIn = localStorage.getItem('toysangdan_logged_in') === 'true';
  if (!isLoggedIn) {
    if (confirm('회원 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
      window.location.href = 'login.html';
    }
    return;
  }
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += (p.minOrder || 1);
  } else {
    cart.push({ id, name: p.name, price: p.price, qty: p.minOrder || 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`🛒 ${escapeHtml(p.name)} 장바구니 추가!`);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = cart.length;
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const nav = document.querySelector('.nav-menu');
  const btn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-menu-overlay');
  nav.classList.toggle('mobile-open');
  btn.classList.toggle('open');
  overlay.classList.toggle('show');
}

// ===== CART DRAWER =====
function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  const isOpen = drawer.classList.contains('open');
  if (isOpen) {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
  } else {
    renderCartDrawer();
    drawer.classList.add('open');
    overlay.classList.add('show');
  }
}

function renderCartDrawer() {
  const body = document.getElementById('cart-drawer-body');
  const footer = document.getElementById('cart-drawer-footer');

  if (cart.length === 0) {
    body.innerHTML = '<div class="cart-empty-state"><div style="font-size:64px;margin-bottom:16px;">📦</div><p style="font-size:15px;">장바구니가 비어있습니다.</p><p style="font-size:13px;color:var(--text-light);margin-top:4px;">상품을 둘러보고 담아보세요!</p></div>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  body.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    const minOrder = p?.minOrder || 1;
    const isUnderMin = item.qty < minOrder;
    return `
      <div class="cart-drawer-item">
        <div class="cart-drawer-item-img">
          <img src="${escapeHtml(p?.image || '')}" alt="${escapeHtml(item.name)}">
        </div>
        <div class="cart-drawer-item-info">
          <div class="cart-drawer-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-drawer-item-price">₩${(item.price * item.qty).toLocaleString()}</div>
          ${isUnderMin ? `<div style="font-size:11px;color:var(--danger);margin-top:2px;">⚠️ 최소 ${minOrder}개</div>` : ''}
        </div>
        <div class="cart-drawer-item-qty">
          <button class="cart-qty-btn" onclick="updateCartQty('${escapeHtml(item.id)}', -1)" aria-label="수량 감소">-</button>
          <span style="font-size:14px;font-weight:700;min-width:24px;text-align:center;">${item.qty}</span>
          <button class="cart-qty-btn" onclick="updateCartQty('${escapeHtml(item.id)}', 1)" aria-label="수량 증가">+</button>
        </div>
        <button class="cart-drawer-item-remove" onclick="removeCartItem('${escapeHtml(item.id)}')" aria-label="삭제">✕</button>
      </div>
    `;
  }).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('cart-drawer-total-price').textContent = '₩' + total.toLocaleString();
}

function updateCartQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }
  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function removeCartItem(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function clearCart() {
  if (confirm('장바구니를 비우시겠습니까?')) {
    cart = [];
    saveCart();
    updateCartBadge();
    renderCartDrawer();
    showToast('🗑️ 장바구니가 비워졌습니다.');
  }
}

function submitCartOrder() {
  if (cart.length === 0) return;
  const isLoggedIn = localStorage.getItem('toysangdan_logged_in') === 'true';
  if (!isLoggedIn) {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
      window.location.href = 'login.html';
    }
    return;
  }

  // 최소주문수량 확인
  const underMin = cart.filter(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    return p && p.minOrder && item.qty < p.minOrder;
  });
  if (underMin.length > 0) {
    showToast(`⚠️ ${escapeHtml(underMin[0].name)} 최소 주문수량을 확인해주세요.`);
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cart.length;
  const user = JSON.parse(localStorage.getItem('toysangdan_user') || '{}');

  // Firebase에 주문 저장
  if (USE_FIREBASE) {
    try {
      await OrderService.create({
        customer: user.store || user.name || '회원',
        customerId: user.id || '',
        items: cart.map(item => ({ product: item.id, name: item.name, qty: item.qty, price: item.price })),
        total,
        memo: '',
        payment: 'bank'
      });
    } catch (e) { console.warn('Firebase 주문 저장 실패:', e); }
  }

  alert(`주문이 접수되었습니다!\n\n상품 ${itemCount}종 / 합계 ₩${total.toLocaleString()}\n\n입금 확인 후 발송 처리됩니다.\n카카오톡 채널로 주문 상세를 안내드리겠습니다.`);
  cart = [];
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  toggleCartDrawer();
}

// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
