// ===== 토이상단 메인 스토어 JS (v2 - 상세페이지, QNA, 파트너십) =====

let cart = JSON.parse(localStorage.getItem('toysangdan_cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  renderProducts();
  renderNotices();
  renderQna();
  initHeader();
  initSearch();
  updateCartBadge();
  checkLoginState();
});

// Login state
function checkLoginState() {
  const isLoggedIn = localStorage.getItem('toysangdan_logged_in') === 'true';
  const loginBtn = document.getElementById('login-btn');
  if (isLoggedIn && loginBtn) {
    const user = JSON.parse(localStorage.getItem('toysangdan_user') || '{}');
    loginBtn.textContent = user.name || '마이페이지';
    loginBtn.href = '#';
    loginBtn.onclick = () => {
      if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('toysangdan_logged_in');
        localStorage.removeItem('toysangdan_user');
        location.reload();
      }
    };
  }
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
          <h4>${ev.title}</h4>
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

  const filtered = PRODUCTS.filter(p => {
    if (category && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search)) return false;
    return true;
  });

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
    <div class="product-card" onclick="showProductDetail('${p.id}')">
      <div class="product-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="product-badge ${badgeClass}">${p.badge}</span>` : ''}
        ${!isSoldOut ? `<button class="product-quick" onclick="event.stopPropagation(); addToCart('${p.id}')">🛒</button>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price-area">
          ${isLoggedIn
            ? `<span class="product-price">₩${p.price.toLocaleString()}</span>
               <span class="product-vat">${p.vat ? 'VAT포함' : 'VAT별도'}</span>`
            : `<span class="product-price-label">🔒 회원가 공개</span>`
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
    <div style="font-size:48px; margin-bottom:12px;">🔍</div>
    <p>해당 조건의 상품이 없습니다.</p>
  </div>`;
}

// ===== PRODUCT DETAIL MODAL =====
function showProductDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const isLoggedIn = localStorage.getItem('toysangdan_logged_in') === 'true';
  
  const allImages = p.images && p.images.length > 0 ? p.images : [p.image];

  document.getElementById('product-detail-content').innerHTML = `
    <div class="pd-layout">
      <div class="pd-images">
        <div class="pd-main-img" id="pd-main-img">
          <img src="${allImages[0]}" alt="${p.name}" id="pd-main-photo">
        </div>
        ${allImages.length > 1 ? `
          <div class="pd-thumb-row">
            ${allImages.map((img, i) => `
              <div class="pd-thumb ${i === 0 ? 'active' : ''}" onclick="changeProductImage('${img}', this)">
                <img src="${img}" alt="thumbnail ${i+1}">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="pd-info">
        <div class="pd-category">${p.category} ${p.badge ? `· <span style="color:${p.badge==='품절'?'var(--danger)':'var(--accent)'};">${p.badge}</span>` : ''} ${p.shipping === 'domestic' ? '· <span style="color:var(--success);">🚀 당일출고</span>' : ''}</div>
        <h2 class="pd-name">${p.name}</h2>
        
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
            <p style="font-size:16px;color:var(--text-secondary);margin-bottom:12px;">🔒 도매가는 사업자 인증 회원만 확인 가능합니다.</p>
            <a href="login.html" class="btn btn-primary" style="text-decoration:none;">사업자 회원가입 →</a>
          </div>
        `}
        
        <p class="pd-desc">${p.desc || ''}</p>
        
        <div class="pd-specs">
          <h4>📋 상품 정보</h4>
          ${p.spec ? p.spec.split(' | ').map(s => {
            const [label, ...val] = s.split(': ');
            return `<div class="pd-spec-row"><span class="pd-spec-label">${label}</span><span class="pd-spec-value">${val.join(': ') || label}</span></div>`;
          }).join('') : ''}
          <div class="pd-spec-row"><span class="pd-spec-label">최소주문</span><span class="pd-spec-value">${p.minOrder || '-'}개</span></div>
          <div class="pd-spec-row"><span class="pd-spec-label">포장단위</span><span class="pd-spec-value">${p.boxQty || '-'}</span></div>
          <div class="pd-spec-row"><span class="pd-spec-label">배송</span><span class="pd-spec-value">${p.shipping === 'domestic' ? '국내 창고 당일출고' : '해외배송 7~14일'}</span></div>
          <div class="pd-spec-row"><span class="pd-spec-label">재고</span><span class="pd-spec-value" style="color:${p.stock < 100 ? 'var(--danger)' : 'var(--text-primary)'};font-weight:700;">${p.stock === 0 ? '품절' : p.stock + '개'}</span></div>
        </div>
        
        ${p.memo ? `<div class="pd-memo">💬 관리자 메모: ${p.memo}</div>` : ''}
        
        ${isLoggedIn && p.stock > 0 ? `
          <div class="pd-order-area">
            <input type="number" class="pd-qty-input" id="pd-qty" value="${p.minOrder || 1}" min="1" max="${p.stock}">
            <button class="pd-order-btn" onclick="addToCartFromDetail('${p.id}')">🛒 장바구니 담기</button>
          </div>
          <p style="font-size:12px;color:var(--text-light);margin-top:8px;">최소 주문: ${p.minOrder || 1}개 | ${p.boxQty || ''}</p>
        ` : ''}
      </div>
    </div>
  `;
  
  document.getElementById('product-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('show');
  document.body.style.overflow = '';
}

function changeProductImage(src, thumb) {
  document.getElementById('pd-main-photo').src = src;
  document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function addToCartFromDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const qty = parseInt(document.getElementById('pd-qty')?.value || 1);
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name: p.name, price: p.price, qty });
  }
  localStorage.setItem('toysangdan_cart', JSON.stringify(cart));
  updateCartBadge();
  showToast(`✅ ${p.name} ${qty}개가 장바구니에 추가되었습니다!`);
  closeProductModal();
}

// Notices
function renderNotices() {
  const list = document.getElementById('notice-list');
  if (!list) return;
  list.innerHTML = NOTICES.map(n => `
    <div class="notice-item" onclick="alert('${n.content.replace(/'/g, "\\'")}')">
      ${n.pinned ? '<span class="notice-pin">필독</span>' : '<span style="width:35px;flex-shrink:0;"></span>'}
      <span class="notice-title">${n.title}</span>
      <span class="notice-date">${n.date}</span>
    </div>
  `).join('');
}

// ===== QNA =====
function renderQna() {
  const list = document.getElementById('qna-list');
  if (!list) return;
  list.innerHTML = QNA_LIST.map(q => `
    <div class="qna-item" id="qna-${q.id}">
      <div class="qna-question" onclick="toggleQna(${q.id})">
        <span class="qna-q-badge">Q</span>
        <span class="qna-q-title">${q.title}</span>
        <span class="qna-q-meta">
          <span>${q.author}</span>
          <span>${q.date}</span>
        </span>
        <span class="qna-arrow">▼</span>
      </div>
      <div class="qna-answer">
        <div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:12px;">
          <p style="font-size:14px;color:var(--text-primary);line-height:1.7;">${q.content}</p>
        </div>
        ${q.reply ? `
          <div class="qna-a-badge">✅ 답변완료</div>
          <p class="qna-a-text">${q.reply}</p>
          <p class="qna-a-date">답변일: ${q.replyDate}</p>
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
      <input type="text" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="질문 제목을 입력하세요" id="qna-title-input">
    </div>
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">내용</label>
      <textarea style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;min-height:120px;resize:vertical;" placeholder="질문 내용을 작성하세요..." id="qna-content-input"></textarea>
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

function submitQna() {
  const title = document.getElementById('qna-title-input')?.value;
  const content = document.getElementById('qna-content-input')?.value;
  if (!title || !content) {
    showToast('⚠️ 제목과 내용을 모두 입력해주세요.');
    return;
  }
  QNA_LIST.unshift({
    id: QNA_LIST.length + 1,
    author: '나의 매장',
    date: new Date().toISOString().slice(0, 10),
    title, content, reply: null, replyDate: null
  });
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
    <h2>${titles[type]}</h2>
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">업체명 / 매장명</label>
      <input type="text" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="업체명을 입력하세요">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div>
        <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">담당자명</label>
        <input type="text" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="홍길동">
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">연락처</label>
        <input type="tel" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;" placeholder="010-0000-0000">
      </div>
    </div>
    ${type === 'sourcing' ? `
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">원하시는 상품 설명 (사진/링크 첨부 가능)</label>
        <textarea style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;min-height:100px;resize:vertical;" placeholder="원하시는 상품의 사진, 중국 사이트 링크, 상품명 등을 알려주세요.&#10;예) 타오바오 링크, 1688 링크, 상품 사진 등"></textarea>
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
        <textarea style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;min-height:120px;resize:vertical;" placeholder="${type === 'buystock' ? '매입 희망 상품명, 수량, 상태 등을 알려주세요.' : '제휴 희망 내용을 자유롭게 작성해주세요.'}"></textarea>
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
  localStorage.setItem('toysangdan_cart', JSON.stringify(cart));
  updateCartBadge();
  showToast(`🛒 ${p.name} 장바구니 추가!`);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = cart.length;
}

// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
