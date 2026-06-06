// ===== ADMIN.JS =====

let currentFilter = 'semua';
let selectedOrderId = null;

// --------- TABS ---------
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));

  document.getElementById('tab-' + tab).classList.add('active');
  event.currentTarget.classList.add('active');

  const titles = {
    dashboard: ['Dashboard', 'Ringkasan aktivitas toko Anda'],
    pesanan: ['Daftar Pesanan', 'Kelola semua pesanan masuk'],
    menu: ['Kelola Menu', 'Tambah, edit, atau hapus menu'],
    pengaturan: ['Pengaturan', 'Konfigurasi toko Anda']
  };
  document.getElementById('pageTitle').textContent = titles[tab][0];
  document.getElementById('pageSub').textContent = titles[tab][1];

  if (tab === 'dashboard') renderDashboard();
  if (tab === 'pesanan') renderOrders();
  if (tab === 'menu') renderMenuAdmin();
  if (tab === 'pengaturan') loadSettings();
}

// --------- DASHBOARD ---------
function renderDashboard() {
  const orders = Storage.getOrders();
  const total = orders.length;
  const baru = orders.filter(o => o.status === 'baru').length;
  const selesai = orders.filter(o => o.status === 'selesai').length;
  const revenue = orders
    .filter(o => o.status !== 'dibatalkan')
    .reduce((s, o) => s + o.total, 0);

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statBaru').textContent = baru;
  document.getElementById('statSelesai').textContent = selesai;
  document.getElementById('statRevenue').textContent = formatRp(revenue);
  document.getElementById('badgePesanan').textContent = baru || '';

  // Recent orders
  const recentEl = document.getElementById('recentOrders');
  const recent = orders.slice(0, 5);
  if (recent.length === 0) {
    recentEl.innerHTML = '<p style="color:#a07850;font-size:0.85rem;text-align:center;padding:1.5rem 0;">Belum ada pesanan</p>';
  } else {
    recentEl.innerHTML = recent.map(o => `
      <div class="recent-order-row" onclick="showOrderDetail('${o.id}')">
        <span class="order-status-dot dot-${o.status}"></span>
        <span class="recent-nama">${o.nama}</span>
        <span class="recent-harga">${formatRp(o.total)}</span>
      </div>
    `).join('');
  }

  // Top menu
  const menuCount = {};
  orders.forEach(o => {
    o.items.forEach(i => {
      menuCount[i.nama] = (menuCount[i.nama] || { count: 0, emoji: i.emoji });
      menuCount[i.nama].count += i.qty;
    });
  });
  const sorted = Object.entries(menuCount)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const topEl = document.getElementById('topMenu');
  if (sorted.length === 0) {
    topEl.innerHTML = '<p style="color:#a07850;font-size:0.85rem;text-align:center;padding:1.5rem 0;">Belum ada data</p>';
  } else {
    topEl.innerHTML = sorted.map(([nama, data]) => `
      <div class="top-menu-item">
        <span class="top-menu-emoji">${data.emoji}</span>
        <span class="top-menu-name">${nama}</span>
        <span class="top-menu-count">${data.count} terjual</span>
      </div>
    `).join('');
  }
}

// --------- ORDERS ---------
function filterOrders(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrders();
}

function renderOrders() {
  const orders = Storage.getOrders();
  const search = (document.getElementById('searchOrder')?.value || '').toLowerCase();

  let filtered = orders.filter(o => {
    const matchFilter = currentFilter === 'semua' || o.status === currentFilter;
    const matchSearch = !search ||
      o.nama.toLowerCase().includes(search) ||
      o.id.toLowerCase().includes(search) ||
      o.wa.includes(search);
    return matchFilter && matchSearch;
  });

  const container = document.getElementById('ordersTable');
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-emoji">📭</div>
        <p>Tidak ada pesanan ditemukan</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(o => `
    <div class="order-card" onclick="showOrderDetail('${o.id}')">
      <span class="order-status-dot dot-${o.status}"></span>
      <div class="order-main">
        <p class="order-nama">${o.nama}</p>
        <p class="order-meta">${formatDate(o.createdAt)} · ${o.wa}</p>
        <p class="order-items-preview">${o.items.map(i => `${i.emoji} ${i.nama} x${i.qty}`).join(', ')}</p>
      </div>
      <div class="order-right">
        <p class="order-harga">${formatRp(o.total)}</p>
        <span class="order-status-pill pill-${o.status}">${statusLabel(o.status)}</span>
      </div>
    </div>
  `).join('');
}

function statusLabel(s) {
  const map = { baru: '🟡 Baru', diproses: '🔵 Diproses', selesai: '🟢 Selesai', dibatalkan: '🔴 Dibatalkan' };
  return map[s] || s;
}

// --------- ORDER DETAIL ---------
function showOrderDetail(id) {
  const orders = Storage.getOrders();
  const o = orders.find(ord => ord.id === id);
  if (!o) return;
  selectedOrderId = id;

  const content = document.getElementById('orderDetailContent');
  content.innerHTML = `
    <div class="detail-header">
      <p class="detail-label">ID Pesanan</p>
      <p style="font-size:0.85rem;color:#a07850;margin-bottom:0.8rem;">${o.id}</p>
      <p class="detail-nama">${o.nama}</p>
      <a href="https://wa.me/${o.wa.replace(/\D/g,'')}" target="_blank" class="detail-wa">📱 ${o.wa}</a>
    </div>
    <div class="detail-section">
      <p class="detail-label">Alamat</p>
      <p class="detail-value">${o.alamat}</p>
    </div>
    <div class="detail-section">
      <p class="detail-label">Pesanan</p>
      ${o.items.map(i => `
        <div style="display:flex;gap:10px;padding:4px 0;font-size:0.9rem;">
          <span>${i.emoji}</span>
          <span style="flex:1">${i.nama} x${i.qty}</span>
          <span style="color:#8b3c1e">${formatRp(i.subtotal)}</span>
        </div>
      `).join('')}
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#a07850;margin-top:8px;">
        <span>🚚 Ongkir</span><span>${formatRp(o.ongkir)}</span>
      </div>
      <p class="detail-total">${formatRp(o.total)}</p>
    </div>
    <div class="detail-section">
      <p class="detail-label">Pembayaran</p>
      <p class="detail-value">💳 ${o.bayar}</p>
    </div>
    ${o.catatan ? `<div class="detail-section"><p class="detail-label">Catatan</p><p class="detail-value">📝 ${o.catatan}</p></div>` : ''}
    <div class="detail-section">
      <p class="detail-label">Status Saat Ini</p>
      <span class="order-status-pill pill-${o.status}" style="font-size:0.85rem;padding:5px 14px;">${statusLabel(o.status)}</span>
    </div>
    <div class="detail-section">
      <p class="detail-label">Waktu Pesan</p>
      <p class="detail-value">${formatDate(o.createdAt)}</p>
    </div>
    <div class="status-actions">
      <button class="btn-status btn-proses" onclick="updateStatus('diproses')">🔵 Proses</button>
      <button class="btn-status btn-selesai" onclick="updateStatus('selesai')">🟢 Selesai</button>
      <button class="btn-status btn-batal" onclick="updateStatus('dibatalkan')">🔴 Batal</button>
      <button class="btn-status btn-wa-konfirm" onclick="sendWaKonfirmasi('${id}')">📱 Kirim WA</button>
    </div>
  `;

  document.getElementById('orderDetailModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrderDetail() {
  document.getElementById('orderDetailModal').classList.remove('open');
  document.body.style.overflow = '';
  selectedOrderId = null;
}

function updateStatus(status) {
  if (!selectedOrderId) return;
  Storage.updateOrder(selectedOrderId, { status });
  closeOrderDetail();
  renderOrders();
  renderDashboard();
  showToast(`✅ Status diubah ke: ${statusLabel(status)}`);
}

// --------- SEND WA KONFIRMASI ---------
function sendWaKonfirmasi(id) {
  const orders = Storage.getOrders();
  const o = orders.find(ord => ord.id === id);
  if (!o) return;
  const settings = Storage.getSettings();

  const msg = `Halo ${o.nama}! 👋\n\n` +
    `Pesanan Anda *${o.id}* dari *${settings.namaToko}* sedang kami proses ya! 🍰\n\n` +
    `Detail pesanan:\n` +
    o.items.map(i => `• ${i.emoji} ${i.nama} x${i.qty}`).join('\n') + '\n\n' +
    `Total: *${formatRp(o.total)}*\n` +
    `Pembayaran: ${o.bayar}\n\n` +
    `Terima kasih sudah memesan! 🙏`;

  const waNum = o.wa.replace(/\D/g, '');
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

// --------- TEST WA ---------
function testWA() {
  const settings = Storage.getSettings();
  const msg = `🧪 Test notifikasi dari *${settings.namaToko}*\n\nSistem berjalan dengan baik! ✅\nWaktu: ${new Date().toLocaleString('id-ID')}`;
  const waNum = settings.waAdmin.replace(/\D/g, '');
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

// --------- MENU ADMIN ---------
function renderMenuAdmin() {
  const menu = Storage.getMenu();
  const el = document.getElementById('menuAdminGrid');
  el.className = 'menu-admin-grid';
  el.innerHTML = menu.map(item => `
    <div class="menu-admin-card">
      <span class="menu-admin-emoji">${item.emoji}</span>
      <div class="menu-admin-info">
        <p class="menu-admin-nama">${item.nama}</p>
        <p class="menu-admin-harga">${formatRp(item.harga)} <span style="color:#a07850;font-size:0.75rem">${item.satuan}</span></p>
        <span class="menu-admin-badge ${item.stok ? 'available' : 'habis'}">${item.stok ? '✅ Tersedia' : '❌ Habis'}</span>
      </div>
      <div class="menu-admin-actions">
        <button class="btn-icon" onclick="editMenu('${item.id}')" title="Edit">✏️</button>
        <button class="btn-icon danger" onclick="deleteMenu('${item.id}')" title="Hapus">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openMenuForm(id) {
  document.getElementById('menuFormModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('menuFormId').value = '';
  document.getElementById('menuNama').value = '';
  document.getElementById('menuEmoji').value = '🍡';
  document.getElementById('menuHarga').value = '';
  document.getElementById('menuSatuan').value = '';
  document.getElementById('menuDeskripsi').value = '';
  document.getElementById('menuFormTitle').textContent = '+ Tambah Menu';
}

function editMenu(id) {
  const menu = Storage.getMenu();
  const item = menu.find(m => m.id === id);
  if (!item) return;
  document.getElementById('menuFormId').value = id;
  document.getElementById('menuNama').value = item.nama;
  document.getElementById('menuEmoji').value = item.emoji;
  document.getElementById('menuHarga').value = item.harga;
  document.getElementById('menuSatuan').value = item.satuan;
  document.getElementById('menuDeskripsi').value = item.deskripsi;
  document.getElementById('menuKategori').value = item.kategori;
  document.getElementById('menuStok').value = item.stok ? 'true' : 'false';
  document.getElementById('menuFormTitle').textContent = '✏️ Edit Menu';
  document.getElementById('menuFormModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenuForm() {
  document.getElementById('menuFormModal').classList.remove('open');
  document.body.style.overflow = '';
}

function saveMenu() {
  const id = document.getElementById('menuFormId').value;
  const nama = document.getElementById('menuNama').value.trim();
  const emoji = document.getElementById('menuEmoji').value.trim() || '🍡';
  const harga = parseInt(document.getElementById('menuHarga').value);
  const satuan = document.getElementById('menuSatuan').value.trim();
  const deskripsi = document.getElementById('menuDeskripsi').value.trim();
  const kategori = document.getElementById('menuKategori').value;
  const stok = document.getElementById('menuStok').value === 'true';

  if (!nama || !harga) { showToast('⚠️ Nama dan harga wajib diisi!'); return; }

  let menu = Storage.getMenu();

  if (id) {
    const idx = menu.findIndex(m => m.id === id);
    if (idx !== -1) menu[idx] = { ...menu[idx], nama, emoji, harga, satuan, deskripsi, kategori, stok };
  } else {
    menu.push({ id: 'm' + Date.now(), nama, emoji, harga, satuan, deskripsi, kategori, stok });
  }

  Storage.saveMenu(menu);
  closeMenuForm();
  renderMenuAdmin();
  showToast('✅ Menu berhasil disimpan!');
}

function deleteMenu(id) {
  if (!confirm('Yakin hapus menu ini?')) return;
  let menu = Storage.getMenu();
  menu = menu.filter(m => m.id !== id);
  Storage.saveMenu(menu);
  renderMenuAdmin();
  showToast('🗑️ Menu dihapus!');
}

// --------- SETTINGS ---------
function loadSettings() {
  const s = Storage.getSettings();
  document.getElementById('setNamaToko').value = s.namaToko;
  document.getElementById('setWaAdmin').value = s.waAdmin;
  document.getElementById('setJam').value = s.jam;
  document.getElementById('setOngkir').value = s.ongkir;
}

function saveSetting() {
  const s = {
    namaToko: document.getElementById('setNamaToko').value.trim(),
    waAdmin: document.getElementById('setWaAdmin').value.trim(),
    jam: document.getElementById('setJam').value.trim(),
    ongkir: parseInt(document.getElementById('setOngkir').value) || 0
  };
  Storage.saveSettings(s);
  showToast('✅ Pengaturan berhasil disimpan!');
}

// --------- REALTIME POLLING ---------
function startPolling() {
  let lastTs = localStorage.getItem('kue_new_order')
    ? JSON.parse(localStorage.getItem('kue_new_order')).ts : 0;

  setInterval(() => {
    const data = localStorage.getItem('kue_new_order');
    if (!data) return;
    const { ts } = JSON.parse(data);
    if (ts > lastTs) {
      lastTs = ts;
      renderDashboard();
      renderOrders();

      const baru = Storage.getOrders().filter(o => o.status === 'baru').length;
      document.getElementById('badgePesanan').textContent = baru || '';
      showToast('🔔 Pesanan baru masuk!');

      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('🍰 Pesanan Baru!', {
          body: 'Ada pesanan baru masuk ke toko Anda.',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍰</text></svg>'
        });
      }
    }
  }, 2000);
}

// --------- INIT ---------
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();

  // Request browser notification permission
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }

  startPolling();

  // Listen for storage changes (cross-tab realtime)
  window.addEventListener('storage', (e) => {
    if (e.key === 'kue_orders' || e.key === 'kue_new_order') {
      renderDashboard();
      renderOrders();
    }
  });
});
