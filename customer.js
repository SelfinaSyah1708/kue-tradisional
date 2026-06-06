// ===== CUSTOMER.JS =====

let cart = {}; // { menuId: qty }

// --------- RENDER MENU ---------
function renderMenu() {
  const menu = Storage.getMenu();
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';

  menu.forEach(item => {
    const qty = cart[item.id] || 0;
    const card = document.createElement('div');
    card.className = 'menu-card' + (item.stok ? '' : ' habis');
    card.innerHTML = `
      <div class="menu-emoji">${item.emoji}</div>
      <span class="menu-badge">${item.kategori}</span>
      <h3 class="menu-name">${item.nama}</h3>
      <p class="menu-desc">${item.deskripsi}</p>
      <div class="menu-footer">
        <div>
          <span class="menu-price">${formatRp(item.harga)}</span>
          <span class="menu-satuan">${item.satuan}</span>
        </div>
        ${item.stok
          ? (qty === 0
            ? `<button class="btn-add-cart" onclick="addToCart('${item.id}')">+</button>`
            : `<div class="qty-control">
                <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
                <span class="qty-num">${qty}</span>
                <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
               </div>`)
          : `<span class="badge-habis">Habis</span>`
        }
      </div>
    `;
    grid.appendChild(card);
  });
}

// --------- CART LOGIC ---------
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartUI();
  renderMenu();
  showToast('✅ Ditambahkan ke keranjang!');
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateCartUI();
  renderMenu();
}

function updateCartUI() {
  const menu = Storage.getMenu();
  const cartBar = document.getElementById('cartBar');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.find(m => m.id === id);
    return sum + (item ? item.harga * qty : 0);
  }, 0);

  cartCount.textContent = `${totalItems} item`;
  cartTotal.textContent = formatRp(totalPrice);

  if (totalItems > 0) cartBar.classList.add('visible');
  else cartBar.classList.remove('visible');
}

// --------- CHECKOUT ---------
function openCheckout() {
  if (Object.keys(cart).length === 0) return;

  const menu = Storage.getMenu();
  const overlay = document.getElementById('checkoutModal');
  const itemsEl = document.getElementById('orderItems');
  const totalEl = document.getElementById('modalTotal');

  let html = '';
  let total = 0;

  Object.entries(cart).forEach(([id, qty]) => {
    const item = menu.find(m => m.id === id);
    if (!item) return;
    const subtotal = item.harga * qty;
    total += subtotal;
    html += `
      <div class="order-item">
        <span class="order-item-emoji">${item.emoji}</span>
        <div class="order-item-info">
          <p class="order-item-name">${item.nama}</p>
          <p class="order-item-sub">${qty} × ${formatRp(item.harga)}</p>
        </div>
        <span class="order-item-price">${formatRp(subtotal)}</span>
      </div>
    `;
  });

  const settings = Storage.getSettings();
  total += settings.ongkir;
  html += `
    <div class="order-item" style="padding:0.5rem 0; font-size:0.85rem; color:#a07850;">
      <span class="order-item-emoji">🚚</span>
      <div class="order-item-info"><p class="order-item-name">Ongkos Kirim</p></div>
      <span class="order-item-price">${formatRp(settings.ongkir)}</span>
    </div>
  `;

  itemsEl.innerHTML = html;
  totalEl.textContent = formatRp(total);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.body.style.overflow = '';
}

// --------- SUBMIT ORDER ---------
function submitOrder() {
  const nama = document.getElementById('namaInput').value.trim();
  const wa = document.getElementById('waInput').value.trim();
  const alamat = document.getElementById('alamatInput').value.trim();
  const catatan = document.getElementById('catatanInput').value.trim();
  const bayar = document.getElementById('pembayaranInput').value;

  if (!nama) { showToast('⚠️ Nama wajib diisi!'); return; }
  if (!wa) { showToast('⚠️ Nomor WhatsApp wajib diisi!'); return; }
  if (!alamat) { showToast('⚠️ Alamat wajib diisi!'); return; }

  const menu = Storage.getMenu();
  const settings = Storage.getSettings();
  const orderId = generateId();

  const items = Object.entries(cart).map(([id, qty]) => {
    const item = menu.find(m => m.id === id);
    return { id, nama: item.nama, emoji: item.emoji, qty, harga: item.harga, subtotal: item.harga * qty };
  });

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const total = subtotal + settings.ongkir;

  const order = {
    id: orderId,
    nama, wa, alamat, catatan, bayar,
    items,
    subtotal, ongkir: settings.ongkir, total,
    status: 'baru',
    createdAt: new Date().toISOString()
  };

  Storage.addOrder(order);

  // Build WhatsApp message
  const itemLines = items.map(i => `  • ${i.emoji} ${i.nama} x${i.qty} = ${formatRp(i.subtotal)}`).join('\n');
  const msg = `🍰 *PESANAN BARU — ${settings.namaToko}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *ID Pesanan:* ${orderId}\n` +
    `👤 *Nama:* ${nama}\n` +
    `📱 *WhatsApp:* ${wa}\n` +
    `📍 *Alamat:* ${alamat}\n` +
    `💳 *Pembayaran:* ${bayar}\n` +
    (catatan ? `📝 *Catatan:* ${catatan}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🛒 *Detail Pesanan:*\n${itemLines}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🚚 Ongkir: ${formatRp(settings.ongkir)}\n` +
    `💰 *TOTAL: ${formatRp(total)}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Terima kasih sudah memesan! Kami akan segera memproses pesanan Anda. 🙏`;

  const waNum = settings.waAdmin.replace(/\D/g, '');
  const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

  // Reset
  cart = {};
  updateCartUI();
  renderMenu();
  closeCheckout();
  showToast('✅ Pesanan berhasil! Mengarahkan ke WhatsApp...');

  setTimeout(() => { window.open(waUrl, '_blank'); }, 1000);
}

// --------- INIT ---------
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();

  // Listen for real-time menu updates from admin
  window.addEventListener('storage', (e) => {
    if (e.key === 'kue_menu') renderMenu();
  });
});
