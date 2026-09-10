import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, Search, CheckCircle2, Clock, AlertTriangle, MessageCircle, Send, Check, RefreshCw } from 'lucide-react';
import { api, UserSession } from '../services/api';

interface LaporRTProps {
  user?: UserSession | null;
}

export const LaporRT: React.FC<LaporRTProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;
  const userName = user?.name || 'Warga RT';

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<any | null>(null);
  const [tanggapanText, setTanggapanText] = useState('');
  const [loading, setLoading] = useState(false);

  const [laporanList, setLaporanList] = useState<any[]>([
    {
      id: '1',
      pelapor: `Bpk. Warga (${wilayahLabel})`,
      judul: 'Lampu Jalan Dekat Gardu Padam',
      deskripsi: 'Lampu PJU di dekat tiang listrik nomor 3 padam sejak kemarin malam, jalanan cukup gelap.',
      kategori: 'FASILITAS_UMUM',
      status: 'RESOLVED',
      tanggapanRT: 'Sudah diganti dengan bohlam LED baru oleh pengurus RT.',
      createdAt: 'Kemarin, 19:30 WIB',
    },
    {
      id: '2',
      pelapor: `Warga (${wilayahLabel})`,
      judul: 'Dahan Pohon Menutupi Kabel Listrik & Jalan',
      deskripsi: 'Dahan pohon mangga di depan jalan blok menjuntai rendah membahayakan kendaraan yang lewat.',
      kategori: 'KEBERSIHAN',
      status: 'IN_PROGRESS',
      tanggapanRT: 'Petugas kebersihan dijadwalkan merapikan dahan pada kerja bakti besok pagi.',
      createdAt: 'Hari ini, 08:15 WIB',
    }
  ]);

  const loadLaporan = async () => {
    try {
      setLoading(true);
      const res = await api.getLaporanList();
      if (res && res.data && res.data.length > 0) {
        setLaporanList(res.data);
      }
    } catch (err) {
      console.warn('Using local state for laporan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaporan();
  }, [user]);

  const [newLaporan, setNewLaporan] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'FASILITAS_UMUM',
    isAnonymous: false,
  });

  const handleAddLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaporan.judul || !newLaporan.deskripsi) return;

    const payload = {
      judul: newLaporan.judul,
      deskripsi: newLaporan.deskripsi,
      kategori: newLaporan.kategori,
      isAnonymous: newLaporan.isAnonymous,
    };

    try {
      await api.createLaporan(payload);
    } catch (err) {
      console.warn('API createLaporan failed, using local insert', err);
    }

    setLaporanList([
      {
        id: Date.now().toString(),
        pelapor: newLaporan.isAnonymous ? 'Warga Anonim' : `${userName} (${wilayahLabel})`,
        judul: newLaporan.judul,
        deskripsi: newLaporan.deskripsi,
        kategori: newLaporan.kategori,
        status: 'PENDING',
        tanggapanRT: null,
        createdAt: 'Baru saja',
      },
      ...laporanList,
    ]);

    setShowAddModal(false);
    setNewLaporan({ judul: '', deskripsi: '', kategori: 'FASILITAS_UMUM', isAnonymous: false });
  };

  const handleBeriTanggapan = (id: string) => {
    if (!tanggapanText) return;
    setLaporanList(
      laporanList.map((item) =>
        item.id === id ? { ...item, status: 'RESOLVED', tanggapanRT: tanggapanText } : item
      )
    );
    setSelectedLaporan(null);
    setTanggapanText('');
  };

  const filtered = laporanList.filter(
    (l) =>
      (l.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.deskripsi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.pelapor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Laporan & Keluhan Warga ({wilayahLabel})</h3>
          <p className="text-xs text-slate-500">Kanal pengaduan fasilitas, kebersihan, dan ketertiban lingkungan terpadu</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadLaporan}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50"
            title="Muat Ulang"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <MessageSquarePlus size={16} /> + Buat Laporan Baru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul laporan, nama pelapor, atau isi keluhan..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {laporanList.length} Laporan</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((laporan) => (
            <div key={laporan.id} className="p-6 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        laporan.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : laporan.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {laporan.status === 'RESOLVED'
                        ? '✅ Selesai Ditangani'
                        : laporan.status === 'IN_PROGRESS'
                        ? '⏳ Sedang Diproses'
                        : '🕒 Menunggu Respon'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-500">{laporan.kategori}</span>
                    <span className="text-xs font-semibold text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{laporan.createdAt}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800">{laporan.judul}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{laporan.deskripsi}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Pelapor: {laporan.pelapor}</p>

                  {/* Tanggapan RT */}
                  {laporan.tanggapanRT ? (
                    <div className="mt-3 p-3.5 bg-emerald-50/80 border border-emerald-200/60 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-800 mb-0.5">Tanggapan & Tindakan Pengurus {wilayahLabel}:</p>
                        <p className="text-emerald-700">{laporan.tanggapanRT}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedLaporan(laporan)}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5"
                      >
                        <MessageCircle size={14} /> Berikan Tanggapan RT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Buat Laporan */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Buat Laporan / Keluhan ({wilayahLabel})</h3>
            <form onSubmit={handleAddLaporan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Judul Laporan *</label>
                <input
                  type="text"
                  required
                  value={newLaporan.judul}
                  onChange={(e) => setNewLaporan({ ...newLaporan, judul: e.target.value })}
                  placeholder="Contoh: Lampu PJU Padam"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori Masalah</label>
                <select
                  value={newLaporan.kategori}
                  onChange={(e) => setNewLaporan({ ...newLaporan, kategori: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="FASILITAS_UMUM">Fasilitas Umum / Lampu / Jalan</option>
                  <option value="KEBERSIHAN">Kebersihan & Sampah</option>
                  <option value="KEAMANAN">Keamanan Lingkungan</option>
                  <option value="KETERTIBAN">Ketertiban / Parkir Liar</option>
                  <option value="LAINNYA">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Deskripsi & Rincian Lokasi *</label>
                <textarea
                  required
                  rows={3}
                  value={newLaporan.deskripsi}
                  onChange={(e) => setNewLaporan({ ...newLaporan, deskripsi: e.target.value })}
                  placeholder="Jelaskan detail kendala dan lokasi tepatnya..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anon"
                  checked={newLaporan.isAnonymous}
                  onChange={(e) => setNewLaporan({ ...newLaporan, isAnonymous: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="anon" className="text-xs text-slate-600">Kirim sebagai Warga Anonim</label>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tanggapan RT */}
      {selectedLaporan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Tanggapi Laporan Warga</h3>
            <p className="text-xs text-slate-500">{selectedLaporan.judul}</p>
            <div className="space-y-3">
              <textarea
                rows={3}
                value={tanggapanText}
                onChange={(e) => setTanggapanText(e.target.value)}
                placeholder="Tuliskan tindakan yang telah diambil atau jadwal penanganan..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLaporan(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleBeriTanggapan(selectedLaporan.id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1.5"
                >
                  <Send size={14} /> Kirim & Selesaikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
