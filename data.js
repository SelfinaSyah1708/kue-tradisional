// ===== DATA.JS — Shared Storage & Menu Data =====

// --------- DEFAULT MENU ---------
const DEFAULT_MENU = [
  {
    id: 'm1', emoji: '🟢', nama: 'Klepon Pandan',
    harga: 25000, satuan: 'per porsi (10 pcs)',
    deskripsi: 'Bola ketan isi gula merah, dibalut kelapa parut segar. Sensasi manis yang meledak di mulut.',
    kategori: 'Jajanan Pasar', stok: true
  },
  {
    id: 'm2', emoji: '🟤', nama: 'Onde-Onde Wijen',
    harga: 28000, satuan: 'per porsi (8 pcs)',
    deskripsi: 'Kue goreng bersalut wijen renyah, berisi kacang hijau manis yang lembut.',
    kategori: 'Jajanan Pasar', stok: true
  },
  {
    id: 'm3', emoji: '🟡', nama: 'Kue Lumpur Kentang',
    harga: 35000, satuan: 'per kotak (12 pcs)',
    deskripsi: 'Tekstur lembut dan creamy dari kentang pilihan, topping kismis manis di atasnya.',
    kategori: 'Kue Basah', stok: true
  },
  {
    id: 'm4', emoji: '🟠', nama: 'Putu Ayu Pandan',
    harga: 30000, satuan: 'per kotak (10 pcs)',
    deskripsi: 'Kue kukus harum pandan dengan kelapa parut, cantik dan menggoda.',
    kategori: 'Kue Basah', stok: true
  },
  {
    id: 'm5', emoji: '🔴', nama: 'Serabi Solo',
    harga: 22000, satuan: 'per porsi (5 pcs)',
    deskripsi: 'Pancake tradisional Solo yang kenyal dan harum santan, dengan kuah kinca gula jawa.',
    kategori: 'Jajanan Pasar', stok: true
  },
  {
    id: 'm6', emoji: '⚪', nama: 'Wajik Ketan Merah',
    harga: 45000, satuan: 'per loyang kecil',
    deskripsi: 'Ketan merah yang dimasak dengan santan dan gula merah pilihan, legit dan tahan lama.',
    kategori: 'Kue Basah', stok: true
  },
  {
    id: 'm7', emoji: '🟤', nama: 'Bakpia Cokelat',
    harga: 55000, satuan: 'per kotak (20 pcs)',
    deskripsi: 'Kulit tipis renyah berisi cokelat susu yang lezat, oleh-oleh favorit.',
    kategori: 'Kue Kering', stok: true
  },
  {
    id: 'm8', emoji: '🟣', nama: 'Nagasari Pisang',
    harga: 20000, satuan: 'per porsi (6 pcs)',
    deskripsi: 'Kue tepung beras berisi pisang raja manis, dibungkus daun pisang nan harum.',
    kategori: 'Kue Basah', stok: false
  }
];

// --------- STORAGE HELPERS ---------
const Storage = {
  getMenu() {
    const saved = localStorage.getItem('kue_menu');
    return saved ? JSON.parse(saved) : [...DEFAULT_MENU];
  },
  saveMenu(menu) {
    localStorage.setItem('kue_menu', JSON.stringify(menu));
  },
  getOrders() {
    const saved = localStorage.getItem('kue_orders');
    return saved ? JSON.parse(saved) : [];
  },
  saveOrders(orders) {
    localStorage.setItem('kue_orders', JSON.stringify(orders));
  },
  addOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
    // Trigger cross-tab sync
    localStorage.setItem('kue_new_order', JSON.stringify({ ts: Date.now(), id: order.id }));
  },
  updateOrder(id, updates) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...updates };
      this.saveOrders(orders);
    }
  },
  getSettings() {
    const defaults = {
      namaToko: 'Dapur Kue Nusantara',
      waAdmin: '6281234567890',
      jam: '08.00 – 20.00 WIB',
      ongkir: 15000
    };
    const saved = localStorage.getItem('kue_settings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  },
  saveSettings(s) {
    localStorage.setItem('kue_settings', JSON.stringify(s));
  }
};

// --------- HELPERS ---------
function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function generateId() {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
