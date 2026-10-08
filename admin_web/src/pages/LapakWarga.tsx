import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  ExternalLink, 
  Phone, 
  RefreshCw, 
  Loader2, 
  Sparkles, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { api, UserSession } from '../services/api';
import { showAlert } from '../services/swal';

interface LapakProps {
  user?: UserSession | null;
}

export const LapakWarga: React.FC<LapakProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '04';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;
  const userName = user?.name || 'Warga RT';
  const userPhone = user?.phone || '081211110006';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Pasang Iklan Sponsor Duitku
  const [selectedAdProduct, setSelectedAdProduct] = useState<any | null>(null);
  const [adDuration, setAdDuration] = useState<number>(7);
  const [adPaymentMethod, setAdPaymentMethod] = useState<string>('SP');
  const [adCheckoutResult, setAdCheckoutResult] = useState<any | null>(null);
  const [isCheckoutAd, setIsCheckoutAd] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  const [lapakList, setLapakList] = useState<any[]>([
    {
      id: '1',
      seller: `Dapur Mama Nadia (${wilayahLabel})`,
      judul: 'Nasi Kuning Komplit & Tumpeng Mini',
      deskripsi: 'Menerima pesanan catering arisan, syukuran, sarapan pagi. Higienis dan lezat.',
      harga: 18000,
      kategori: 'KULINER',
      kontakWa: '081234567890',
      status: 'TERSEDIA',
      isPromoted: true,
      promotedBadge: 'IKLAN AKTIF (DUITKU)',
    },
    {
      id: '2',
      seller: `Bpk. Hendra (${wilayahLabel})`,
      judul: 'Jasa Cuci AC & Servis Elektronik',
      deskripsi: 'Cuci AC split 0.5 - 2 PK, tambah freon, perbaikan kulkas & mesin cuci bergaransi.',
      harga: 65000,
      kategori: 'JASA',
      kontakWa: '081288880001',
      status: 'TERSEDIA',
    },
    {
      id: '3',
      seller: `Ibu Retno (${wilayahLabel})`,
      judul: 'Sewa Paviliun Kontrakan 2 Kamar Siap Huni',
      deskripsi: 'Listrik 1300W token, air PDAM jernih, parkir mobil aman, lingkungan tenang dan asri.',
      harga: 1200000,
      kategori: 'KONTRAKAN',
      kontakWa: '081398765432',
      status: 'TERSEDIA',
    }
  ]);

  const getSellerName = (item: any): string => {
    if (!item) return 'Warga RT';
    if (typeof item.seller === 'string') return item.seller;
    if (item.seller?.profile?.namaLengkap) return `${item.seller.profile.namaLengkap} (${wilayahLabel})`;
    if (item.sellerNama) return `${item.sellerNama} (${wilayahLabel})`;
    if (item.seller?.phone) return `${item.seller.phone} (${wilayahLabel})`;
    if (item.sellerPhone) return `${item.sellerPhone} (${wilayahLabel})`;
    return `Warga (${wilayahLabel})`;
  };

  const loadLapak = async () => {
    try {
      setLoading(true);
      const res = await api.getLapakList();
      if (Array.isArray(res) && res.length > 0) {
        setLapakList(res);
      } else if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setLapakList(res.data);
      }
    } catch (err) {
      console.warn('Menggunakan fallback data lokal untuk lapak warga:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLapak();
  }, [user]);

  const [newProduk, setNewProduk] = useState({
    judul: '',
    deskripsi: '',
    harga: '',
    kategori: 'KULINER',
    kontakWa: userPhone,
  });

  const handleAddProduk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduk.judul || !newProduk.harga || !newProduk.kontakWa) return;

    setIsSubmitting(true);
    const payload = {
      namaProduk: newProduk.judul,
      deskripsi: newProduk.deskripsi,
      harga: Number(newProduk.harga),
      kategori: newProduk.kategori,
      kontakWa: newProduk.kontakWa,
    };

    try {
      await api.createLapak(payload);
    } catch (err) {
      console.warn('API createLapak error, using local fallback:', err);
    }

    setLapakList([
      {
        id: Date.now().toString(),
        seller: `${userName} (${wilayahLabel})`,
        judul: newProduk.judul,
        deskripsi: newProduk.deskripsi,
        harga: Number(newProduk.harga),
        kategori: newProduk.kategori,
        kontakWa: newProduk.kontakWa,
        status: 'TERSEDIA',
      },
      ...lapakList,
    ]);

    setIsSubmitting(false);
    setShowAddModal(false);
    setNewProduk({ judul: '', deskripsi: '', harga: '', kategori: 'KULINER', kontakWa: userPhone });
    showAlert.success('Produk Terpasang!', 'Produk UMKM berhasil ditambahkan ke feed warga.');
  };

  const handleCheckoutAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdProduct) return;

    setIsCheckoutAd(true);
    setAdError(null);
    setAdCheckoutResult(null);

    const priceMap: Record<number, number> = {
      3: 15000,
      7: 30000,
      14: 50000,
      30: 99000,
    };
    const nominal = priceMap[adDuration] || 30000;

    try {
      const payload = {
        lapakId: selectedAdProduct.id,
        productTitle: selectedAdProduct.judul,
        durasiHari: adDuration,
        amount: nominal,
        customerName: userName,
        customerEmail: user?.email || 'warga@rthub.id',
        customerPhone: userPhone,
        paymentMethodCode: adPaymentMethod,
      };

      const res = await api.checkoutAds(payload);
      setAdCheckoutResult(res);
      showAlert.success(
        'Invoice Duitku Siap!',
        `Silakan selesaikan pembayaran Rp ${nominal.toLocaleString('id-ID')} via Duitku Sandbox.`
      );
    } catch (err: any) {
      setAdError(err.message || 'Gagal membuat tagihan Duitku Sandbox');
      showAlert.error('Gagal Checkout Iklan', err.message || 'Terjadi gangguan gateway');
    } finally {
      setIsCheckoutAd(false);
    }
  };

  const filtered = lapakList.filter((item) => {
    const matchCategory = selectedCategory === 'ALL' || item.kategori === selectedCategory;
    const sellerStr = getSellerName(item);
    const matchSearch =
      (item.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.deskripsi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      sellerStr.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Lapak Warga &amp; Pasar UMKM</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold">
              {wilayahLabel}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Marketplace digital lingkungan warga untuk jual-beli kuliner, jasa, sewa rumah &amp; promosi iklan sponsor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadLapak}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 transition shadow-sm"
            title="Muat Ulang"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#065F46] hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Plus size={16} /> <span>+ Pasang Produk / Jasa</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari menu makanan, jasa, atau produk UMKM..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'KULINER', 'JASA', 'KONTRAKAN', 'PRODUK'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const sellerName = getSellerName(item);
          const isPromoted = Boolean(item.isPromoted);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border ${
                isPromoted ? 'border-amber-400 ring-2 ring-amber-100 shadow-md' : 'border-slate-200/80 shadow-sm'
              } p-5 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold">
                      {item.kategori}
                    </span>
                    {isPromoted && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-[9px] font-extrabold flex items-center gap-1 shadow-sm">
                        <Sparkles size={10} /> SPONSOR
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[150px]">{sellerName}</span>
                </div>

                <h4 className="text-base font-bold text-slate-900 leading-snug">{item.judul}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.deskripsi}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Harga</p>
                    <p className="text-base font-extrabold text-blue-600">
                      Rp {(Number(item.harga) || 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/${item.kontakWa || '081234567890'}?text=Halo,%20saya%20tertarik%20dengan%20produk/jasa%20"${encodeURIComponent(
                      item.judul || ''
                    )}"%20di%20Lapak%20RtHub`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Phone size={14} /> Hubungi Penjual
                  </a>
                </div>

                {/* Tombol Pasang Iklan Sponsor Duitku */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdProduct(item);
                    setAdCheckoutResult(null);
                    setAdError(null);
                  }}
                  className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles size={13} className="text-amber-600" />
                  <span>Pasang Iklan Sponsor (Duitku Sandbox)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Pasang Iklan Sponsor Duitku */}
      {selectedAdProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pasang Iklan Sponsor UMKM</h3>
                  <p className="text-[11px] text-slate-500">Integrasi Duitku Sandbox Payment Gateway</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {adError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{adError}</span>
              </div>
            )}

            {!adCheckoutResult ? (
              <form onSubmit={handleCheckoutAd} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Produk yang Diiklankan</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedAdProduct.judul}</p>
                  <p className="text-[11px] text-slate-500">{getSellerName(selectedAdProduct)}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pilih Durasi Penayangan Iklan</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { durasi: 3, label: '3 Hari', price: 15000 },
                      { durasi: 7, label: '7 Hari (Favorit)', price: 30000 },
                      { durasi: 14, label: '14 Hari', price: 50000 },
                      { durasi: 30, label: '30 Hari Penuh', price: 99000 },
                    ].map((plan) => (
                      <button
                        type="button"
                        key={plan.durasi}
                        onClick={() => setAdDuration(plan.durasi)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          adDuration === plan.durasi
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">{plan.label}</p>
                        <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                          Rp {plan.price.toLocaleString('id-ID')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Metode Pembayaran (Duitku Sandbox)</label>
                  <select
                    value={adPaymentMethod}
                    onChange={(e) => setAdPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SP">QRIS (ShopeePay / GoPay / OVO / Dana / LinkAja)</option>
                    <option value="BC">BCA Virtual Account (Sandbox)</option>
                    <option value="M2">Mandiri Virtual Account (Sandbox)</option>
                    <option value="BR">BRI Virtual Account (Sandbox)</option>
                    <option value="I1">BNI Virtual Account (Sandbox)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAdProduct(null)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isCheckoutAd}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    {isCheckoutAd && <Loader2 size={14} className="animate-spin" />}
                    <span>{isCheckoutAd ? 'Menghubungi Duitku...' : 'Bayar via Duitku Sandbox'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Tagihan Iklan Duitku Terbit!</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Order ID: {adCheckoutResult.merchantOrderId}</p>
                  <p className="text-base font-extrabold text-emerald-700 mt-1">
                    Rp {(adCheckoutResult.amount || 0).toLocaleString('id-ID')}
                  </p>
                </div>

                {adCheckoutResult.qrString ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto space-y-2">
                    <p className="text-[11px] font-semibold text-slate-600">Scan QRIS Sandbox Duitku:</p>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          adCheckoutResult.qrString
                        )}`}
                        alt="QRIS Sandbox"
                        className="w-44 h-44 mx-auto"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Gunakan simulator Duitku untuk tes bayar</p>
                  </div>
                ) : adCheckoutResult.vaNumber ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-xs text-slate-500 font-semibold">Nomor Virtual Account:</p>
                    <p className="text-xl font-mono font-bold text-slate-900 tracking-wider">
                      {adCheckoutResult.vaNumber}
                    </p>
                  </div>
                ) : null}

                {adCheckoutResult.paymentUrl && (
                  <div>
                    <a
                      href={adCheckoutResult.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <span>Buka Halaman Pembayaran Duitku</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAdProduct(null);
                      loadLapak();
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Tutup &amp; Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Pasang Produk Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Pasang Produk / Jasa ({wilayahLabel})</h3>
            <form onSubmit={handleAddProduk} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Produk / Jasa *</label>
                <input
                  type="text"
                  required
                  value={newProduk.judul}
                  onChange={(e) => setNewProduk({ ...newProduk, judul: e.target.value })}
                  placeholder="Contoh: Katering Nasi Kotak Ayam Bakar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori</label>
                  <select
                    value={newProduk.kategori}
                    onChange={(e) => setNewProduk({ ...newProduk, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="KULINER">Kuliner / Makanan</option>
                    <option value="JASA">Jasa &amp; Service</option>
                    <option value="PRODUK">Produk / Barang</option>
                    <option value="KONTRAKAN">Sewa Kontrakan / Kos</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={newProduk.harga}
                    onChange={(e) => setNewProduk({ ...newProduk, harga: e.target.value })}
                    placeholder="Contoh: 25000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">No. WhatsApp Penjual *</label>
                <input
                  type="tel"
                  required
                  value={newProduk.kontakWa}
                  onChange={(e) => setNewProduk({ ...newProduk, kontakWa: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Deskripsi Lengkap *</label>
                <textarea
                  required
                  rows={3}
                  value={newProduk.deskripsi}
                  onChange={(e) => setNewProduk({ ...newProduk, deskripsi: e.target.value })}
                  placeholder="Jelaskan spesifikasi produk, porsi, menu, atau ketentuan sewa..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{isSubmitting ? 'Mempublikasikan...' : 'Publikasikan ke Lapak'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
