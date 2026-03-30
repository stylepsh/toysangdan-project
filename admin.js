// ===== 토이상단 관리자 JS =====

// XSS 방지
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 관리자 인증
const ADMIN_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // sha256("password")
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkAdminAuth() {
  const token = sessionStorage.getItem('toysangdan_admin_auth');
  if (token !== 'authenticated') {
    document.querySelector('.admin-layout').style.display = 'none';
    showAdminLogin();
    return false;
  }
  return true;
}

function showAdminLogin() {
  const overlay = document.createElement('div');
  overlay.id = 'admin-auth-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:#F8F9FE;z-index:9999;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;padding:48px 40px;border-radius:24px;box-shadow:0 8px 40px rgba(0,0,0,0.12);max-width:400px;width:100%;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">🔐</div>
      <h2 style="font-size:24px;font-weight:800;margin-bottom:8px;">관리자 인증</h2>
      <p style="font-size:14px;color:#636E72;margin-bottom:24px;">관리자 비밀번호를 입력하세요.</p>
      <input type="password" id="admin-pw-input" style="width:100%;padding:14px 16px;border:1.5px solid #E9ECEF;border-radius:12px;font-size:15px;text-align:center;margin-bottom:16px;" placeholder="비밀번호" autofocus>
      <button onclick="verifyAdminPassword()" style="width:100%;padding:14px;border-radius:12px;background:#6C5CE7;color:#fff;font-size:16px;font-weight:700;border:none;cursor:pointer;">인증하기</button>
      <p id="admin-auth-error" style="color:#E17055;font-size:13px;margin-top:12px;display:none;">비밀번호가 올바르지 않습니다.</p>
      <a href="index.html" style="display:block;margin-top:20px;font-size:13px;color:#B2BEC3;">← 스토어로 돌아가기</a>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('admin-pw-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifyAdminPassword();
  });
}

async function verifyAdminPassword() {
  const pw = document.getElementById('admin-pw-input').value;
  const hash = await sha256(pw);
  if (hash === ADMIN_HASH) {
    sessionStorage.setItem('toysangdan_admin_auth', 'authenticated');
    document.getElementById('admin-auth-overlay')?.remove();
    document.querySelector('.admin-layout').style.display = 'flex';
  } else {
    document.getElementById('admin-auth-error').style.display = 'block';
    document.getElementById('admin-pw-input').value = '';
    document.getElementById('admin-pw-input').focus();
  }
}

let salesChart;

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAdminAuth()) return;
  // Fix sidebar badges (template literals don't work in HTML attributes)
  fixSidebarBadges();
  initDashboard();
  renderAdminProducts();
  renderOrders();
  renderMembers();
  renderKakaoHistory();
  renderAdminQna();
  renderAdminNotices();
  renderAdminCalendar();
});

function fixSidebarBadges() {
  const navItems = document.querySelectorAll('.admin-nav-item .nav-badge');
  if (navItems[0]) navItems[0].textContent = ORDERS.filter(o => o.status === 'pending').length;
  if (navItems[1]) navItems[1].textContent = MEMBERS.filter(m => m.status === 'pending').length;
}

// ===== TAB NAVIGATION =====
function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  
  const tabEl = document.getElementById('tab-' + tab);
  if (tabEl) tabEl.classList.add('active');
  
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabMap = ['dashboard','products','orders','members','kakao','qna','notices','calendar','tax','settings'];
  const idx = tabMap.indexOf(tab);
  if (idx >= 0 && navItems[idx]) navItems[idx].classList.add('active');
}

// ===== DASHBOARD =====
function initDashboard() {
  // KPIs
  const todayOrders = ORDERS.filter(o => o.date === '2026-03-29');
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const activeMembers = MEMBERS.filter(m => m.status === 'active').length;
  const lowStock = PRODUCTS.filter(p => p.stock < 100 && p.stock > 0).length;
  
  animateCounter('kpi-orders', todayOrders.length);
  document.getElementById('kpi-revenue').textContent = '₩' + todayRevenue.toLocaleString();
  animateCounter('kpi-members', activeMembers);
  animateCounter('kpi-lowstock', lowStock);

  // Todo Banner (Client Appeal)
  const pendingOrders = ORDERS.filter(o => o.status === 'pending').length;
  const shippingReady = ORDERS.filter(o => o.status === 'confirmed').length;
  const pendingMembers = MEMBERS.filter(m => m.status === 'pending').length;
  document.getElementById('todo-pending').textContent = pendingOrders;
  document.getElementById('todo-shipping').textContent = shippingReady;
  document.getElementById('todo-members').textContent = pendingMembers;

  // Chart
  initChart();

  // Top products
  renderTopProducts();

  // Recent orders
  renderRecentOrders();
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 30);
}

function initChart() {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;
  salesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: SALES_DATA.weekly.labels,
      datasets: [{
        label: '매출',
        data: SALES_DATA.weekly.data,
        backgroundColor: 'rgba(108, 92, 231, 0.6)',
        borderColor: 'rgba(108, 92, 231, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => '₩' + ctx.parsed.y.toLocaleString()
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => '₩' + (v / 10000).toLocaleString() + '만' },
          grid: { color: 'rgba(0,0,0,0.04)' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

function updateChart(period) {
  if (!salesChart) return;
  const d = SALES_DATA[period];
  salesChart.data.labels = d.labels;
  salesChart.data.datasets[0].data = d.data;
  salesChart.update();
}

function renderTopProducts() {
  const el = document.getElementById('top-products');
  if (!el) return;
  const sorted = [...PRODUCTS].sort((a, b) => b.stock - a.stock).slice(0, 5);
  el.innerHTML = sorted.map((p, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;${i < 4 ? 'border-bottom:1px solid var(--border-light);' : ''}">
      <span style="width:28px;height:28px;border-radius:50%;background:${['var(--primary)','var(--accent)','var(--warning)','var(--info)','var(--text-light)'][i]};color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">${i+1}</span>
      <img src="${p.image || 'https://picsum.photos/seed/'+p.id+'/40/40'}" alt="" style="width:40px;height:40px;border-radius:8px;object-fit:cover;flex-shrink:0;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
        <div style="font-size:12px;color:var(--text-light);">재고 ${p.stock}개</div>
      </div>
      <span style="font-size:14px;font-weight:700;color:var(--primary);">₩${p.price.toLocaleString()}</span>
    </div>
  `).join('');
}

function renderRecentOrders() {
  const el = document.getElementById('recent-orders');
  if (!el) return;
  el.innerHTML = ORDERS.slice(0, 5).map(o => `
    <tr>
      <td style="font-weight:600;font-size:13px;">${o.id}</td>
      <td>${o.date}</td>
      <td>${o.customer}</td>
      <td style="font-weight:700;">₩${o.total.toLocaleString()}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>
  `).join('');
}

function statusBadge(status) {
  const map = {
    pending: ['입금대기', 'status-pending'],
    confirmed: ['입금확인', 'status-confirmed'],
    shipped: ['발송완료', 'status-shipped'],
    completed: ['거래완료', 'status-completed']
  };
  const [label, cls] = map[status] || ['알수없음', ''];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

// ===== PRODUCTS =====
function renderAdminProducts() {
  const search = (document.getElementById('product-search')?.value || '').toLowerCase();
  const cat = document.getElementById('product-filter-cat')?.value || '';
  
  const filtered = PRODUCTS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search)) return false;
    if (cat && p.category !== cat) return false;
    return true;
  });

  document.getElementById('product-count').textContent = filtered.length;
  
  const el = document.getElementById('product-table');
  if (!el) return;
  el.innerHTML = filtered.map(p => `
    <tr>
      <td><img src="${p.image || 'https://picsum.photos/seed/'+p.id+'/40/40'}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover;"></td>
      <td><div style="font-weight:600;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</div></td>
      <td><span style="font-size:13px;color:var(--primary);font-weight:500;">${p.category}</span></td>
      <td style="font-weight:700;">₩${p.price.toLocaleString()}</td>
      <td><span style="color:${p.stock < 100 ? 'var(--danger)' : 'var(--text-primary)'};font-weight:${p.stock < 100 ? '700' : '400'};">${p.stock}개</span></td>
      <td>${p.vat ? '포함' : '별도'}</td>
      <td>${p.shipping === 'domestic' ? '<span style="color:var(--success);font-weight:600;">당일출고</span>' : '해외배송'}</td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-sm btn-outline" title="상품 복제" onclick="duplicateProduct('${p.id}')">📑</button>
          <button class="btn btn-sm btn-outline" title="수정" onclick="editProduct('${p.id}')">✏️</button>
          <button class="btn btn-sm btn-outline" title="삭제" style="color:var(--danger);border-color:var(--danger);" onclick="deleteProduct('${p.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function duplicateProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  
  // Fill form with copied data
  document.getElementById('pf-name').value = p.name + ' (복사본)';
  document.getElementById('pf-category').value = p.category;
  document.getElementById('pf-price').value = p.price;
  document.getElementById('pf-retail').value = p.retailPrice || 0;
  document.getElementById('pf-stock').value = p.stock;
  document.getElementById('pf-shipping').value = p.shipping;
  
  const vatToggle = document.getElementById('vat-toggle');
  const vatLabel = document.getElementById('vat-label');
  if (p.vat) {
    vatToggle.classList.add('active');
    vatLabel.textContent = '부가세 포함';
  } else {
    vatToggle.classList.remove('active');
    vatLabel.textContent = '부가세 별도';
  }

  document.getElementById('pf-minorder').value = p.minOrder || 1;
  document.getElementById('pf-boxqty').value = p.boxQty || '';
  document.getElementById('pf-desc').value = p.desc || '';
  document.getElementById('pf-spec').value = p.spec || '';
  document.getElementById('pf-memo').value = p.memo || '';

  // Show form and scroll
  const card = document.getElementById('product-form-card');
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth' });
  
  showToast('📑 상품 정보가 복사되었습니다. 수량을 변경하고 등록해주세요!');
}

function toggleProductForm() {
  const card = document.getElementById('product-form-card');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
}

function toggleVat() {
  const toggle = document.getElementById('vat-toggle');
  const label = document.getElementById('vat-label');
  toggle.classList.toggle('active');
  label.textContent = toggle.classList.contains('active') ? '부가세 포함' : '부가세 별도';
}

function previewProductImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('product-image-upload').style.display = 'none';
      const preview = document.getElementById('product-image-preview');
      preview.style.display = 'block';
      preview.innerHTML = `<img src="${e.target.result}" alt="preview"><button class="remove-btn" onclick="removeProductImage()">✕</button>`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function removeProductImage() {
  document.getElementById('product-image-input').value = '';
  document.getElementById('product-image-preview').style.display = 'none';
  document.getElementById('product-image-upload').style.display = 'block';
}

function saveProduct() {
  const name = document.getElementById('pf-name').value;
  const category = document.getElementById('pf-category').value;
  const price = document.getElementById('pf-price').value;
  const stock = document.getElementById('pf-stock').value;

  if (!name || !category || !price || !stock) {
    showToast('⚠️ 필수 항목을 모두 입력해주세요.');
    return;
  }

  PRODUCTS.unshift({
    id: 'TS' + String(PRODUCTS.length + 1).padStart(3, '0'),
    name, category, price: parseInt(price), retailPrice: parseInt(document.getElementById('pf-retail').value || 0),
    stock: parseInt(stock),
    vat: document.getElementById('vat-toggle').classList.contains('active'),
    shipping: document.getElementById('pf-shipping').value,
    image: 'https://picsum.photos/seed/new' + Date.now() + '/400/400',
    images: [],
    badge: '신상',
    memo: document.getElementById('pf-memo').value,
    desc: document.getElementById('pf-desc')?.value || '',
    spec: document.getElementById('pf-spec')?.value || '',
    minOrder: parseInt(document.getElementById('pf-minorder')?.value || 1),
    boxQty: document.getElementById('pf-boxqty')?.value || ''
  });

  showToast('✅ 상품이 등록되었습니다!');
  toggleProductForm();
  renderAdminProducts();
  
  // Clear form
  ['pf-name','pf-price','pf-retail','pf-stock','pf-memo','pf-desc','pf-spec','pf-minorder','pf-boxqty'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// 상품 수정
function editProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modal-content').innerHTML = `
    <h2>✏️ 상품 수정 - ${escapeHtml(p.name)}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div class="admin-form-group"><label>상품명 *</label><input type="text" class="admin-form-input" id="edit-name" value="${escapeHtml(p.name)}"></div>
      <div class="admin-form-group"><label>카테고리 *</label>
        <select class="admin-form-select" id="edit-category">
          ${CATEGORIES.filter(c=>c!=='전체').map(c=>`<option ${c===p.category?'selected':''}>${escapeHtml(c)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
      <div class="admin-form-group"><label>도매가 (원)</label><input type="number" class="admin-form-input" id="edit-price" value="${p.price}"></div>
      <div class="admin-form-group"><label>소비자가 (원)</label><input type="number" class="admin-form-input" id="edit-retail" value="${p.retailPrice||0}"></div>
      <div class="admin-form-group"><label>재고</label><input type="number" class="admin-form-input" id="edit-stock" value="${p.stock}"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div class="admin-form-group"><label>최소 주문수량</label><input type="number" class="admin-form-input" id="edit-minorder" value="${p.minOrder||1}"></div>
      <div class="admin-form-group"><label>포장단위</label><input type="text" class="admin-form-input" id="edit-boxqty" value="${escapeHtml(p.boxQty||'')}"></div>
    </div>
    <div class="admin-form-group" style="margin-bottom:16px;"><label>상세 설명</label><textarea class="admin-form-textarea" id="edit-desc" style="min-height:80px;">${escapeHtml(p.desc||'')}</textarea></div>
    <div class="admin-form-group" style="margin-bottom:16px;"><label>스펙</label><textarea class="admin-form-textarea" id="edit-spec" style="min-height:60px;">${escapeHtml(p.spec||'')}</textarea></div>
    <div class="admin-form-group" style="margin-bottom:16px;"><label>메모</label><textarea class="admin-form-textarea" id="edit-memo">${escapeHtml(p.memo||'')}</textarea></div>
    <div style="display:flex;gap:12px;justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">취소</button>
      <button class="btn btn-primary" onclick="saveEditProduct('${escapeHtml(p.id)}')">💾 저장</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('show');
}

function saveEditProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  p.name = document.getElementById('edit-name').value || p.name;
  p.category = document.getElementById('edit-category').value || p.category;
  p.price = parseInt(document.getElementById('edit-price').value) || p.price;
  p.retailPrice = parseInt(document.getElementById('edit-retail').value) || 0;
  p.stock = parseInt(document.getElementById('edit-stock').value) ?? p.stock;
  p.minOrder = parseInt(document.getElementById('edit-minorder').value) || 1;
  p.boxQty = document.getElementById('edit-boxqty').value || '';
  p.desc = document.getElementById('edit-desc').value || '';
  p.spec = document.getElementById('edit-spec').value || '';
  p.memo = document.getElementById('edit-memo').value || '';
  showToast('✅ 상품이 수정되었습니다!');
  closeModal();
  renderAdminProducts();
}

// 상품 삭제
function deleteProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (confirm(`"${p.name}" 상품을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
    const idx = PRODUCTS.findIndex(x => x.id === id);
    if (idx >= 0) {
      PRODUCTS.splice(idx, 1);
      showToast('🗑️ 상품이 삭제되었습니다.');
      renderAdminProducts();
    }
  }
}

function addExtraImages(input) {
  if (!input.files) return;
  const container = document.getElementById('pf-extra-images');
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.style.cssText = 'width:100px;height:100px;border-radius:8px;overflow:hidden;position:relative;border:1px solid var(--border);';
      div.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;"><button onclick="this.parentElement.remove()" style="position:absolute;top:2px;right:2px;width:20px;height:20px;border-radius:50%;background:var(--danger);color:#fff;border:none;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>`;
      container.insertBefore(div, container.lastElementChild);
    };
    reader.readAsDataURL(file);
  });
}

// ===== ORDERS =====
function renderOrders() {
  const statusFilter = document.getElementById('order-status-filter')?.value || '';
  
  const filtered = ORDERS.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });

  // Stats
  ['pending','confirmed','shipped','completed'].forEach(s => {
    const el = document.getElementById('os-' + s);
    if (el) el.textContent = ORDERS.filter(o => o.status === s).length;
  });

  const el = document.getElementById('order-table');
  if (!el) return;
  el.innerHTML = filtered.map(o => `
    <tr>
      <td><input type="checkbox" class="order-checkbox" value="${o.id}"></td>
      <td style="font-weight:600;font-size:13px;">${o.id}</td>
      <td>${o.date}</td>
      <td>
        <div style="font-weight:600;">${o.customer}</div>
        <div style="font-size:12px;color:var(--text-light);">${o.customerId}</div>
      </td>
      <td>
        ${o.items.map(i => `<div style="font-size:13px;">${i.name} × ${i.qty}</div>`).join('')}
      </td>
      <td style="font-weight:700;">₩${o.total.toLocaleString()}</td>
      <td>
        <select class="admin-form-select" style="min-width:110px;padding:6px 10px;font-size:13px;" onchange="changeOrderStatus('${o.id}', this.value)">
          <option value="pending" ${o.status==='pending'?'selected':''}>입금대기</option>
          <option value="confirmed" ${o.status==='confirmed'?'selected':''}>입금확인</option>
          <option value="shipped" ${o.status==='shipped'?'selected':''}>발송완료</option>
          <option value="completed" ${o.status==='completed'?'selected':''}>거래완료</option>
        </select>
      </td>
      <td><div style="font-size:12px;color:var(--text-secondary);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${o.memo}">${o.memo || '-'}</div></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="showOrderDetail('${o.id}')">상세</button>
      </td>
    </tr>
  `).join('');
}

function applyBulkOrderAction() {
  const checkboxes = document.querySelectorAll('.order-checkbox:checked');
  if (checkboxes.length === 0) {
    showToast('⚠️ 처리할 주문을 선택해주세요.');
    return;
  }
  
  const status = document.getElementById('bulk-action-status').value;
  const statusLabels = {
    'confirmed': '입금확인',
    'shipped': '발송완료(송장등록)'
  };
  
  if (confirm(`선택한 ${checkboxes.length}건의 주문을 '${statusLabels[status]}' 처리하시겠습니까?`)) {
    let count = 0;
    checkboxes.forEach(cb => {
      const orderId = cb.value;
      const order = ORDERS.find(o => o.id === orderId);
      if (order && order.status !== status) {
        order.status = status;
        count++;
      }
    });
    
    // Clear select-all checkbox
    const selectAllCb = document.getElementById('select-all-orders');
    if (selectAllCb) selectAllCb.checked = false;
    
    renderOrders();
    fixSidebarBadges();
    
    if (status === 'shipped') {
      showToast(`📦 ${count}건의 주문이 일괄 발송 처리되었습니다.`);
    } else {
      showToast(`✅ ${count}건의 주문이 ${statusLabels[status]} 처리되었습니다.`);
    }
  }
}

function changeOrderStatus(orderId, newStatus) {
  const order = ORDERS.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    showToast(`주문 ${orderId} 상태가 변경되었습니다.`);
    renderOrders();
    fixSidebarBadges();
  }
}

function showOrderDetail(orderId) {
  const o = ORDERS.find(x => x.id === orderId);
  if (!o) return;
  const member = MEMBERS.find(m => m.id === o.customerId);
  document.getElementById('modal-content').innerHTML = `
    <h2>📋 주문 상세</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
      <div><span style="color:var(--text-secondary);font-size:13px;">주문번호</span><div style="font-weight:700;">${o.id}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">주문일</span><div style="font-weight:700;">${o.date}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">주문자</span><div style="font-weight:700;">${o.customer}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">연락처</span><div style="font-weight:700;">${member?.phone || '-'}</div></div>
    </div>
    <h3 style="font-size:15px;margin-bottom:12px;">주문 상품</h3>
    <table class="admin-table">
      <thead><tr><th>상품</th><th>수량</th><th>단가</th><th>소계</th></tr></thead>
      <tbody>
        ${o.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}개</td><td>₩${i.price.toLocaleString()}</td><td style="font-weight:700;">₩${(i.qty*i.price).toLocaleString()}</td></tr>`).join('')}
      </tbody>
      <tfoot><tr><td colspan="3" style="text-align:right;font-weight:700;">합계</td><td style="font-weight:800;color:var(--primary);font-size:16px;">₩${o.total.toLocaleString()}</td></tr></tfoot>
    </table>
    ${o.memo ? `<div style="margin-top:16px;padding:12px;background:var(--bg);border-radius:8px;font-size:14px;">💬 메모: ${o.memo}</div>` : ''}
    <div style="margin-top:24px;display:flex;gap:12px;justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">닫기</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('show');
}

function toggleAllOrders(checkbox) {
  document.querySelectorAll('.order-checkbox').forEach(cb => cb.checked = checkbox.checked);
}

function downloadExcel() {
  const statusFilter = document.getElementById('order-status-filter')?.value || '';
  const filtered = ORDERS.filter(o => !statusFilter || o.status === statusFilter);
  
  const rows = [];
  filtered.forEach(o => {
    o.items.forEach(i => {
      rows.push({
        '주문번호': o.id,
        '주문일': o.date,
        '고객명': o.customer,
        '상품명': i.name,
        '수량': i.qty,
        '단가': i.price,
        '소계': i.qty * i.price,
        '총액': o.total,
        '상태': { pending: '입금대기', confirmed: '입금확인', shipped: '발송완료', completed: '거래완료' }[o.status],
        '결제': o.payment === 'bank' ? '무통장입금' : '카드결제',
        '메모': o.memo
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '주문목록');
  XLSX.writeFile(wb, `토이상단_주문목록_${new Date().toISOString().slice(0,10)}.xlsx`);
  showToast('📥 엑셀 파일이 다운로드되었습니다!');
}

function printOrders() {
  window.print();
  showToast('🖨️ 인쇄 페이지가 열렸습니다.');
}

// ===== MEMBERS =====
function renderMembers() {
  const search = (document.getElementById('member-search')?.value || '').toLowerCase();
  const gradeFilter = document.getElementById('member-grade-filter')?.value || '';

  // Pending
  const pendingEl = document.getElementById('pending-members');
  if (pendingEl) {
    const pending = MEMBERS.filter(m => m.status === 'pending');
    if (pending.length === 0) {
      pendingEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-light);">✅ 대기 중인 승인 요청이 없습니다.</div>';
    } else {
      pendingEl.innerHTML = pending.map(m => `
        <div class="member-approval-card">
          <img src="${m.bizCertImage}" alt="사업자등록증" class="biz-cert" onclick="showBizCert('${m.bizCertImage}','${m.store}')">
          <div class="member-approval-info">
            <h4>${m.store} <span class="route-tag">${m.route}</span></h4>
            <p>
              대표: ${m.name} | 연락처: ${m.phone}<br>
              사업자번호: ${m.bizNo} | 이메일: ${m.email}<br>
              가입일: ${m.joinDate}
            </p>
          </div>
          <div class="member-approval-actions">
            <button class="btn btn-success btn-sm" onclick="approveMember('${m.id}')">✅ 승인</button>
            <button class="btn btn-danger btn-sm" onclick="rejectMember('${m.id}')">❌ 거절</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Active members
  const active = MEMBERS.filter(m => {
    if (m.status !== 'active') return false;
    if (search && !m.name.toLowerCase().includes(search) && !m.store.toLowerCase().includes(search)) return false;
    if (gradeFilter && m.grade !== gradeFilter) return false;
    return true;
  });

  const el = document.getElementById('member-table');
  if (!el) return;
  el.innerHTML = active.map(m => `
    <tr>
      <td style="font-weight:600;">${m.store}</td>
      <td>${m.name}</td>
      <td>${m.phone}</td>
      <td><span class="grade-badge grade-${m.grade}">${m.grade.toUpperCase()}</span></td>
      <td><span style="font-size:12px;color:var(--text-secondary);">${m.route}</span></td>
      <td>${m.totalOrders}건</td>
      <td style="font-weight:600;">₩${m.totalAmount.toLocaleString()}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="showMemberDetail('${m.id}')">상세</button>
      </td>
    </tr>
  `).join('');
}

function approveMember(id) {
  const m = MEMBERS.find(x => x.id === id);
  if (m) {
    m.status = 'active';
    m.grade = 'bronze';
    showToast(`✅ ${m.store} (${m.name}) 회원이 승인되었습니다!`);
    renderMembers();
    fixSidebarBadges();
  }
}

function rejectMember(id) {
  if (confirm('정말 이 회원의 가입을 거절하시겠습니까?')) {
    const idx = MEMBERS.findIndex(x => x.id === id);
    if (idx >= 0) {
      const name = MEMBERS[idx].store;
      MEMBERS.splice(idx, 1);
      showToast(`❌ ${name} 회원 가입이 거절되었습니다.`);
      renderMembers();
      fixSidebarBadges();
    }
  }
}

function showBizCert(imgUrl, storeName) {
  document.getElementById('modal-content').innerHTML = `
    <h2>📄 사업자등록증 - ${storeName}</h2>
    <div style="text-align:center;padding:20px;">
      <img src="${imgUrl}" alt="사업자등록증" style="max-width:100%;border-radius:12px;border:1px solid var(--border);">
    </div>
    <div style="margin-top:16px;display:flex;gap:12px;justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">닫기</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('show');
}

function showMemberDetail(id) {
  const m = MEMBERS.find(x => x.id === id);
  if (!m) return;
  document.getElementById('modal-content').innerHTML = `
    <h2>👤 회원 상세 - ${m.store}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div><span style="color:var(--text-secondary);font-size:13px;">매장명</span><div style="font-weight:700;">${m.store}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">대표자</span><div style="font-weight:700;">${m.name}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">연락처</span><div style="font-weight:700;">${m.phone}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">이메일</span><div style="font-weight:700;">${m.email}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">사업자번호</span><div style="font-weight:700;">${m.bizNo}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">가입 경로</span><div style="font-weight:700;">${m.route}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">등급</span><div><span class="grade-badge grade-${m.grade}">${m.grade.toUpperCase()}</span></div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">가입일</span><div style="font-weight:700;">${m.joinDate}</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">총 주문</span><div style="font-weight:700;">${m.totalOrders}건</div></div>
      <div><span style="color:var(--text-secondary);font-size:13px;">총 거래액</span><div style="font-weight:700;color:var(--primary);">₩${m.totalAmount.toLocaleString()}</div></div>
    </div>
    <div style="margin-top:20px;">
      <h3 style="font-size:14px;margin-bottom:8px;">등급 변경</h3>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-sm ${m.grade==='bronze'?'btn-primary':'btn-outline'}" onclick="changeMemberGrade('${m.id}','bronze')">브론즈</button>
        <button class="btn btn-sm ${m.grade==='silver'?'btn-primary':'btn-outline'}" onclick="changeMemberGrade('${m.id}','silver')">실버</button>
        <button class="btn btn-sm ${m.grade==='gold'?'btn-primary':'btn-outline'}" onclick="changeMemberGrade('${m.id}','gold')">골드</button>
      </div>
    </div>
    <div style="margin-top:24px;display:flex;gap:12px;justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">닫기</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('show');
}

function changeMemberGrade(id, grade) {
  const m = MEMBERS.find(x => x.id === id);
  if (m) {
    m.grade = grade;
    showToast(`✅ ${m.store} 등급이 ${grade.toUpperCase()}로 변경되었습니다.`);
    closeModal();
    renderMembers();
  }
}

// ===== KAKAO =====
function renderKakaoHistory() {
  const el = document.getElementById('kakao-history');
  if (!el) return;
  el.innerHTML = KAKAO_MESSAGES.map(m => `
    <div style="padding:16px 0;${m.id < KAKAO_MESSAGES.length ? 'border-bottom:1px solid var(--border-light);' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-weight:700;font-size:14px;">${m.title}</span>
        <span style="font-size:12px;color:var(--text-light);">${m.date}</span>
      </div>
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:6px;">
        ${m.content.substring(0, 80)}${m.content.length > 80 ? '...' : ''}
      </p>
      <div style="display:flex;gap:8px;font-size:12px;">
        <span style="color:var(--success);">✅ 발송완료</span>
        <span style="color:var(--text-light);">수신 ${m.recipients}명</span>
        <span style="color:var(--text-light);">${m.type === 'all' ? '전체' : '등급별'}</span>
      </div>
    </div>
  `).join('');
}

function selectKakaoTarget(btn, target) {
  document.querySelectorAll('.kakao-target-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function sendKakaoMessage() {
  const title = document.getElementById('kakao-title').value;
  const content = document.getElementById('kakao-content').value;
  if (!title || !content) {
    showToast('⚠️ 제목과 내용을 모두 입력해주세요.');
    return;
  }
  const activeTarget = document.querySelector('.kakao-target-btn.active');
  const targetText = activeTarget ? activeTarget.textContent : '전체 회원';
  const recipients = MEMBERS.filter(m => m.status === 'active').length;

  KAKAO_MESSAGES.unshift({
    id: KAKAO_MESSAGES.length + 1,
    date: new Date().toLocaleString('ko-KR'),
    type: 'all',
    title, content,
    sent: true,
    recipients
  });

  showToast(`📤 "${targetText}" ${recipients}명에게 카톡 메시지가 발송되었습니다!`);
  document.getElementById('kakao-title').value = '';
  document.getElementById('kakao-content').value = '';
  renderKakaoHistory();
}

// ===== NOTICES =====
function renderAdminNotices() {
  const el = document.getElementById('admin-notice-table');
  if (!el) return;
  el.innerHTML = NOTICES.map(n => `
    <tr>
      <td>${n.pinned ? '<span class="status-badge status-pending" style="background:#FFF3E0;color:#E65100;">📌 고정</span>' : '<span style="color:var(--text-light);font-size:13px;">일반</span>'}</td>
      <td style="font-weight:600;">${n.title}</td>
      <td>${n.date}</td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-sm btn-outline" onclick="showToast('수정 기능 (데모)')">✏️</button>
          <button class="btn btn-sm btn-outline" style="color:var(--danger);" onclick="deleteNotice(${n.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function toggleNoticeForm() {
  const card = document.getElementById('notice-form-card');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
}

function saveNotice() {
  const title = document.getElementById('notice-title-input').value;
  const content = document.getElementById('notice-content-input').value;
  const pinned = document.getElementById('notice-pin-toggle').classList.contains('active');

  if (!title || !content) {
    showToast('⚠️ 제목과 내용을 모두 입력해주세요.');
    return;
  }

  NOTICES.unshift({
    id: NOTICES.length + 1,
    title, content,
    date: new Date().toISOString().slice(0, 10),
    pinned
  });

  showToast('✅ 공지사항이 등록되었습니다!');
  toggleNoticeForm();
  renderAdminNotices();
  document.getElementById('notice-title-input').value = '';
  document.getElementById('notice-content-input').value = '';
}

function deleteNotice(id) {
  if (confirm('이 공지를 삭제하시겠습니까?')) {
    const idx = NOTICES.findIndex(n => n.id === id);
    if (idx >= 0) {
      NOTICES.splice(idx, 1);
      renderAdminNotices();
      showToast('🗑️ 공지가 삭제되었습니다.');
    }
  }
}

// ===== CALENDAR =====
function renderAdminCalendar() {
  const el = document.getElementById('admin-calendar-table');
  if (!el) return;
  el.innerHTML = CALENDAR_EVENTS.map((ev, i) => `
    <tr>
      <td style="font-weight:600;">${ev.date}</td>
      <td>${ev.title}</td>
      <td>${ev.type === 'incoming' ? '<span class="status-badge status-shipped">📦 입고</span>' : '<span class="status-badge status-pending">📋 공지</span>'}</td>
      <td>${ev.items || '-'}종</td>
      <td>
        <button class="btn btn-sm btn-outline" style="color:var(--danger);" onclick="deleteCalendarEvent(${i})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function toggleCalendarForm() {
  const card = document.getElementById('calendar-form-card');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
}

function saveCalendarEvent() {
  const date = document.getElementById('cal-date').value;
  const title = document.getElementById('cal-title').value;
  const items = parseInt(document.getElementById('cal-items').value || 0);

  if (!date || !title) {
    showToast('⚠️ 날짜와 내용을 입력해주세요.');
    return;
  }

  CALENDAR_EVENTS.push({ date, title, type: 'incoming', items });
  CALENDAR_EVENTS.sort((a, b) => a.date.localeCompare(b.date));
  
  showToast('✅ 입고 일정이 등록되었습니다!');
  toggleCalendarForm();
  renderAdminCalendar();
}

function deleteCalendarEvent(idx) {
  if (confirm('이 일정을 삭제하시겠습니까?')) {
    CALENDAR_EVENTS.splice(idx, 1);
    renderAdminCalendar();
    showToast('🗑️ 일정이 삭제되었습니다.');
  }
}

// ===== QNA MANAGEMENT =====
function renderAdminQna() {
  const filter = document.getElementById('qna-filter')?.value || '';
  const filtered = QNA_LIST.filter(q => {
    if (filter === 'pending') return !q.reply;
    if (filter === 'replied') return !!q.reply;
    return true;
  });

  const countEl = document.getElementById('qna-total-count');
  if (countEl) countEl.textContent = filtered.length;

  const el = document.getElementById('admin-qna-table');
  if (!el) return;
  el.innerHTML = filtered.map(q => `
    <tr>
      <td>${q.reply
        ? '<span class="status-badge status-completed">답변완료</span>'
        : '<span class="status-badge status-pending">미답변</span>'}</td>
      <td style="font-weight:600;">${q.author}</td>
      <td>
        <div style="font-weight:600;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${q.title}</div>
        <div style="font-size:12px;color:var(--text-light);margin-top:2px;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${q.content}</div>
      </td>
      <td>${q.date}</td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-sm btn-primary" onclick="showQnaReplyModal(${q.id})">${q.reply ? '✏️ 수정' : '💬 답변'}</button>
          <button class="btn btn-sm btn-outline" style="color:var(--danger);" onclick="deleteQna(${q.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function showQnaReplyModal(id) {
  const q = QNA_LIST.find(x => x.id === id);
  if (!q) return;
  document.getElementById('modal-content').innerHTML = `
    <h2>💬 Q&A 답변</h2>
    <div style="margin-bottom:20px;padding:16px;background:var(--bg);border-radius:var(--radius-md);border:1px solid var(--border);">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-weight:700;">${q.author}</span>
        <span style="font-size:12px;color:var(--text-light);">${q.date}</span>
      </div>
      <h4 style="margin-bottom:8px;">${q.title}</h4>
      <p style="font-size:14px;color:var(--text-secondary);line-height:1.7;">${q.content}</p>
    </div>
    <div class="admin-form-group" style="margin-bottom:16px;">
      <label>답변 내용</label>
      <textarea class="admin-form-textarea" id="qna-reply-input" style="min-height:120px;" placeholder="답변을 작성하세요...">${q.reply || ''}</textarea>
    </div>
    <div style="display:flex;gap:12px;justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">취소</button>
      <button class="btn btn-primary" onclick="saveQnaReply(${q.id})">💬 답변 등록</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('show');
}

function saveQnaReply(id) {
  const reply = document.getElementById('qna-reply-input')?.value;
  if (!reply) {
    showToast('⚠️ 답변 내용을 입력해주세요.');
    return;
  }
  const q = QNA_LIST.find(x => x.id === id);
  if (q) {
    q.reply = reply;
    q.replyDate = new Date().toISOString().slice(0, 10);
    showToast('✅ 답변이 등록되었습니다!');
    closeModal();
    renderAdminQna();
  }
}

function deleteQna(id) {
  if (confirm('이 질문을 삭제하시겠습니까?')) {
    const idx = QNA_LIST.findIndex(q => q.id === id);
    if (idx >= 0) {
      QNA_LIST.splice(idx, 1);
      renderAdminQna();
      showToast('🗑️ 질문이 삭제되었습니다.');
    }
  }
}

// ===== UTILITIES =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
}

// ===== DARK MODE =====
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('toysangdan_admin_dark', isDark ? 'true' : 'false');
  const icon = document.getElementById('dark-mode-icon');
  if (icon) icon.textContent = isDark ? '☀️' : '🌙';
}

// 다크모드 초기화
(function() {
  if (localStorage.getItem('toysangdan_admin_dark') === 'true') {
    document.body.classList.add('dark-mode');
    setTimeout(() => {
      const icon = document.getElementById('dark-mode-icon');
      if (icon) icon.textContent = '☀️';
    }, 0);
  }
})();
