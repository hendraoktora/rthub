import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, Phone, Tag, ShoppingBag, RefreshCw } from 'lucide-react';
import { api, UserSession } from '../services/api';

interface LapakWargaProps {
  user?: UserSession | null;
}

export const LapakWarga: React.FC<LapakWargaProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;
  const userName = user?.name || 'Warga RT';
  const userPhone = user?.phone || '081234567890';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [lapakList, setLapakList] = useState<any[]>([
    {
      id: '1',
      seller: `Warga (${wilayahLabel})`,
      judul: 'Katering Nasi Kotak & Tumpeng Mini',
      deskripsi: 'Menerima pesanan katering nasi box, tumpeng syukuran, dan snack box arisan. Rasa dijamin lezat!',
      harga: 25000,
      kategori: 'KULINER',
      kontakWa: userPhone,
      status: 'TERSEDIA',
    },
    {
      id: '2',
      seller: `Warga (${wilayahLabel})`,
      judul: 'Jasa Servis & Cuci AC Rumah',
      deskripsi: 'Melayani cuci AC, tambah freon, dan perbaikan AC split bergaransi wilayah sekitar.',
      harga: 75000,
      kategori: 'JASA',
      kontakWa: '081211110004',
      status: 'TERSEDIA',
    },
  ]);

  const loadLapak = async () => {
    try {
      setLoading(true);
      const res = await api.getLapakList();
      if (res && res.data && res.data.length > 0) {
        setLapakList(res.data);
      }
    } catch (err) {
      console.warn('Using local state for lapak:', err);
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

    setShowAddModal(false);
    setNewProduk({ judul: '', deskripsi: '', harga: '', kategori: 'KULINER', kontakWa: userPhone });
  };

  const filtered = lapakList.filter((item) => {
    const matchCategory = selectedCategory === 'ALL' || item.kategori === selectedCategory;
    const matchSearch =
      (item.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.deskripsi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.seller || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Lapak Warga & Pasar UMKM ({wilayahLabel})</h3>
          <p className="text-xs text-slate-500">Marketplace terintegrasi untuk jual-beli produk, makanan, jasa & sewa hunian</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadLapak}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50"
            title="Muat Ulang"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> + Pasang Produk / Jasa Baru
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
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'KULINER', 'JASA', 'KONTRAKAN', 'PRODUK'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold">
                  {item.kategori}
                </span>
                <span className="text-xs text-slate-400 font-medium">{item.seller}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{item.judul}</h4>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.deskripsi}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Harga</p>
                <p className="text-base font-extrabold text-blue-600">
                  Rp {(item.harga || 0).toLocaleString('id-ID')}
                </p>
              </div>

              <a
                href={`https://wa.me/${item.kontakWa}?text=Halo,%20saya%20tertarik%20dengan%20produk/jasa%20"${encodeURIComponent(
                  item.judul || ''
                )}"%20di%20Lapak%20RtHub`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Phone size={14} /> Hubungi WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Produk */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori</label>
                  <select
                    value={newProduk.kategori}
                    onChange={(e) => setNewProduk({ ...newProduk, kategori: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="KULINER">Kuliner / Makanan</option>
                    <option value="JASA">Jasa & Service</option>
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  Publikasikan ke Lapak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
