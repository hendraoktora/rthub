import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Calendar, 
  Search, 
  FileText, 
  Share2, 
  Printer, 
  ShieldCheck, 
  Paperclip, 
  Check, 
  X,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api, UserSession } from '../services/api';
import { showAlert } from '../services/swal';

interface DashboardProps {
  user?: UserSession | null;
}

export const DashboardOverview: React.FC<DashboardProps> = ({ user }) => {
  const [kasData, setKasData] = useState<{
    saldoKas: number;
    totalPemasukan: number;
    totalPengeluaran: number;
    recentTransactions: any[];
  }>({
    saldoKas: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0,
    recentTransactions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'PEMASUKAN' | 'PENGELUARAN'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [newMutasi, setNewMutasi] = useState({
    tipe: 'PENGELUARAN',
    kategori: 'Perbaikan Fasilitas & Lampu PJU',
    nominal: '',
    keterangan: '',
    picPengurus: user?.name || 'Bendahara RT',
    noBuktiNota: '',
  });

  const loadKasSummary = async () => {
    setIsLoading(true);
    try {
      const data = await api.getKasSummary();
      setKasData(data);
    } catch (e) {
      console.error('Error fetching kas summary:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKasSummary();
  }, [user]);

  const handleCatatKas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMutasi.nominal || !newMutasi.keterangan) {
      showAlert.error('Input Tidak Lengkap', 'Nominal dan rincian transaksi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const keteranganFull = `${newMutasi.keterangan}${
        newMutasi.noBuktiNota ? ` [Nota: ${newMutasi.noBuktiNota}]` : ''
      } (PIC: ${newMutasi.picPengurus})`;

      await api.catatKas({
        tipe: newMutasi.tipe,
        kategori: newMutasi.kategori,
        nominal: Number(newMutasi.nominal),
        keterangan: keteranganFull,
      });

      setShowModal(false);
      const isOut = newMutasi.tipe === 'PENGELUARAN';
      showAlert.success(
        'Berhasil Dicatat!',
        isOut
          ? `Pengeluaran kas sebesar Rp ${Number(newMutasi.nominal).toLocaleString('id-ID')} berhasil dicatat & dipublikasikan ke warga.`
          : `Pemasukan kas sebesar Rp ${Number(newMutasi.nominal).toLocaleString('id-ID')} berhasil dicatat & masuk pembukuan RT.`
      );
      setNewMutasi({
        tipe: 'PENGELUARAN',
        kategori: 'Perbaikan Fasilitas & Lampu PJU',
        nominal: '',
        keterangan: '',
        picPengurus: user?.name || 'Bendahara RT',
        noBuktiNota: '',
      });
      await loadKasSummary();
    } catch (err: any) {
      showAlert.error('Gagal Mencatat Kas', err.message || 'Terjadi kesalahan saat mencatat mutasi kas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rtLabel = user?.wilayah || 'Lingkungan RT Aktif';

  // Format Broadcast WA message for Transparansi Warga
  const waBroadcastText = `*📢 LAPORAN TRANSPARANSI KAS ${rtLabel.toUpperCase()}*\n\n` +
    `📅 *Periode:* ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}\n` +
    `💰 *Total Saldo Kas Berjalan:* Rp ${kasData.saldoKas.toLocaleString('id-ID')}\n` +
    `📥 *Total Pemasukan (Iuran/Donasi):* Rp ${kasData.totalPemasukan.toLocaleString('id-ID')}\n` +
    `📤 *Total Pengeluaran Kas:* Rp ${kasData.totalPengeluaran.toLocaleString('id-ID')}\n\n` +
    `*📋 Ringkasan Pengeluaran Terakhir:*\n` +
    (kasData.recentTransactions || [])
      .filter((t: any) => t.tipe === 'PENGELUARAN')
      .slice(0, 3)
      .map((t: any, i: number) => `${i + 1}. ${t.kategori}: Rp ${Number(t.nominal).toLocaleString('id-ID')} (${t.keterangan})`)
      .join('\n') +
    `\n\n_Seluruh rincian pembukuan dan nota kas RT dapat dipantau langsung secara terbuka oleh seluruh warga di aplikasi RtHub. Transparan, Akuntabel, dan Terpercaya!_ ✨`;

  const filteredTransactions = (kasData.recentTransactions || []).filter((tx: any) => {
    const matchType = filterType === 'ALL' || tx.tipe === filterType;
    const matchSearch =
      (tx.kategori || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">Buku Kas & Arus Keuangan ({rtLabel})</h3>
            <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> Audit Terbuka
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap pengeluaran kas tercatat dengan nota dan otomatis terpublikasikan transparan ke aplikasi seluruh warga
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh */}
          <button
            onClick={loadKasSummary}
            disabled={isLoading}
            className="p-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition"
            title="Refresh Saldo"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Broadcast WA Transparansi */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(waBroadcastText)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            title="Bagikan Ringkasan Kas ke Grup WhatsApp Warga"
          >
            <MessageCircle size={15} /> <span>Broadcast LPJ Kas</span>
          </a>

          {/* Catat Pengeluaran / Kas */}
          <button
            onClick={() => {
              setNewMutasi({
                tipe: 'PENGELUARAN',
                kategori: 'Perbaikan Fasilitas & Lampu PJU',
                nominal: '',
                keterangan: '',
                picPengurus: user?.name || 'Bendahara RT',
                noBuktiNota: '',
              });
              setShowModal(true);
            }}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <ArrowUpRight size={16} /> - Catat Pengeluaran Kas
          </button>

          {/* Catat Pemasukan */}
          <button
            onClick={() => {
              setNewMutasi({
                tipe: 'PEMASUKAN',
                kategori: 'Iuran Warga',
                nominal: '',
                keterangan: '',
                picPengurus: user?.name || 'Bendahara RT',
                noBuktiNota: '',
              });
              setShowModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={16} /> + Kas Masuk
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Saldo Kas RT</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            Rp {kasData.saldoKas.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
            <CheckCircle2 size={13} /> Saldo Berjalan Siap Pakai
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pemasukan</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            Rp {kasData.totalPemasukan.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-2">Iuran bulanan warga & saldo awal</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengeluaran</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            Rp {kasData.totalPengeluaran.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-2">Operasional sampah, satpam & fasilitas</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Prinsip Transparansi</span>
            <h4 className="text-base font-bold mt-1">100% Akuntabel & Publik</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Warga dapat melihat detail setiap nota & pengeluaran kas langsung dari aplikasi HP.
            </p>
          </div>
          <div className="pt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <span>✓ Terenkripsi & Terverifikasi DB</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Transactions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kategori, keterangan pengeluaran, atau nota..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Mutasi
          </button>
          <button
            onClick={() => setFilterType('PEMASUKAN')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterType === 'PEMASUKAN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <ArrowDownRight size={13} /> Pemasukan (+Iuran)
          </button>
          <button
            onClick={() => setFilterType('PENGELUARAN')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterType === 'PENGELUARAN'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <ArrowUpRight size={13} /> Pengeluaran Kas (-)
          </button>
        </div>
      </div>

      {/* Recent Mutasi Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Riwayat Buku Kas & Pengeluaran Terbuka</h4>
            <p className="text-xs text-slate-500">Pencatatan real-time arus kas lingkungan dari MySQL terverifikasi</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {filteredTransactions.length} Catatan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-5 py-3.5">Waktu Transaksi</th>
                <th className="px-5 py-3.5">Kategori & Rincian Pengeluaran/Masuk</th>
                <th className="px-5 py-3.5">Tipe Arus Kas</th>
                <th className="px-5 py-3.5">Nominal Transaksi</th>
                <th className="px-5 py-3.5">Saldo Berjalan</th>
                <th className="px-5 py-3.5 text-center">Bukti / Transparansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx: any) => {
                  const isMasuk = tx.tipe === 'PEMASUKAN';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4 text-xs font-medium text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 text-xs">{tx.kategori}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{tx.keterangan}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            isMasuk ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {isMasuk ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                          {isMasuk ? 'Kas Masuk' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className={`px-5 py-4 font-bold text-xs ${isMasuk ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isMasuk ? '+' : '-'}Rp {Number(tx.nominal).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 text-xs">
                        Rp {Number(tx.saldoBerjalan).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100 inline-flex items-center gap-1">
                          <Check size={11} /> Terpublikasi ke Warga
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    Tidak ada mutasi kas yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Mutasi Kas / Pengeluaran */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {newMutasi.tipe === 'PENGELUARAN' ? '📤 Catat Pengeluaran Uang Kas RT' : '📥 Catat Pemasukan Kas RT'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCatatKas} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tipe Mutasi *</label>
                  <select
                    value={newMutasi.tipe}
                    onChange={(e) => {
                      const newTipe = e.target.value;
                      setNewMutasi({
                        ...newMutasi,
                        tipe: newTipe,
                        kategori: newTipe === 'PENGELUARAN' ? 'Perbaikan Fasilitas & Lampu PJU' : 'Iuran Warga',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="PENGELUARAN">📤 Pengeluaran (Uang Keluar)</option>
                    <option value="PEMASUKAN">📥 Pemasukan (Uang Masuk)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori Transaksi *</label>
                  <select
                    value={newMutasi.kategori}
                    onChange={(e) => setNewMutasi({ ...newMutasi, kategori: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    {newMutasi.tipe === 'PENGELUARAN' ? (
                      <>
                        <option value="Perbaikan Fasilitas & Lampu PJU">Perbaikan Fasilitas & Lampu PJU</option>
                        <option value="Honor Petugas Kebersihan & Sampah">Honor Petugas Kebersihan & Sampah</option>
                        <option value="Honor & Perlengkapan Keamanan / Satpam">Honor & Perlengkapan Keamanan / Satpam</option>
                        <option value="Dana Sosial & Santunan Warga">Dana Sosial & Santunan Warga</option>
                        <option value="Kegiatan Warga / Kerja Bakti / 17an">Kegiatan Warga / Kerja Bakti / 17an</option>
                        <option value="Konsumsi & Rapat RT">Konsumsi & Rapat RT</option>
                        <option value="Operasional & Administrasi RT">Operasional & Administrasi RT</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Iuran Warga">Iuran Kas Warga Bulanan</option>
                        <option value="Saldo Awal Pembukuan">Saldo Awal Pembukuan Kas</option>
                        <option value="Donasi / Sumbangan Sukarela">Donasi / Sumbangan Sukarela</option>
                        <option value="Sewa Fasilitas / Lapangan RT">Sewa Fasilitas / Lapangan RT</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  value={newMutasi.nominal}
                  onChange={(e) => setNewMutasi({ ...newMutasi, nominal: e.target.value })}
                  placeholder="Contoh: 350000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Penanggung Jawab / PIC</label>
                  <input
                    type="text"
                    value={newMutasi.picPengurus}
                    onChange={(e) => setNewMutasi({ ...newMutasi, picPengurus: e.target.value })}
                    placeholder="Contoh: Bendahara / Seksi Kebersihan"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">No. Bukti Nota / Kwitansi</label>
                  <input
                    type="text"
                    value={newMutasi.noBuktiNota}
                    onChange={(e) => setNewMutasi({ ...newMutasi, noBuktiNota: e.target.value })}
                    placeholder="Contoh: NOTA-PJU-0809"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Rincian Keperluan Transaksi *</label>
                <textarea
                  required
                  rows={2}
                  value={newMutasi.keterangan}
                  onChange={(e) => setNewMutasi({ ...newMutasi, keterangan: e.target.value })}
                  placeholder="Contoh: Pembelian 3 buah lampu LED Philips 20W dan kabel untuk PJU gang C"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck size={14} className="text-blue-600" />
                  <span>Transparansi Otomatis:</span>
                </div>
                <p>
                  Pengeluaran ini akan langsung tercatat di buku kas digital RT dan otomatis dapat dilihat oleh seluruh warga di aplikasi mobile RtHub.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Publikasikan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
