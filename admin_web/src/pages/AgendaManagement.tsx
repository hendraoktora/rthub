import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Edit3, Trash2, MapPin, Clock, RefreshCw } from 'lucide-react';
import { api, UserSession } from '../services/api';

interface AgendaProps {
  user?: UserSession | null;
}

export const AgendaManagement: React.FC<AgendaProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;

  const [agendaList, setAgendaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('SEMUA');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'KERJA_BAKTI',
    tanggalMulai: '',
    jamMulai: '08:00',
    tanggalSelesai: '',
    jamSelesai: '11:00',
    lokasi: '',
    deskripsi: '',
    scope: 'RT',
  });

  const loadAgenda = async () => {
    try {
      setLoading(true);
      const res = await api.getAgendaList();
      if (Array.isArray(res)) {
        setAgendaList(res);
      }
    } catch (err) {
      console.warn('Gagal memuat agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgenda();
  }, [user]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      judul: '',
      kategori: 'KERJA_BAKTI',
      tanggalMulai: today,
      jamMulai: '08:00',
      tanggalSelesai: today,
      jamSelesai: '11:00',
      lokasi: `Lingkungan RT ${rtNomor}`,
      deskripsi: '',
      scope: 'RT',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEditing(true);
    setEditingId(item.id);
    const start = new Date(item.tanggalMulai);
    const tglMulai = start.toISOString().split('T')[0];
    const jmMulai = start.toTimeString().substring(0, 5);

    let tglSelesai = tglMulai;
    let jmSelesai = '12:00';
    if (item.tanggalSelesai) {
      const end = new Date(item.tanggalSelesai);
      tglSelesai = end.toISOString().split('T')[0];
      jmSelesai = end.toTimeString().substring(0, 5);
    }

    setFormData({
      judul: item.judul || '',
      kategori: item.kategori || 'KERJA_BAKTI',
      tanggalMulai: tglMulai,
      jamMulai: jmMulai,
      tanggalSelesai: tglSelesai,
      jamSelesai: jmSelesai,
      lokasi: item.lokasi || '',
      deskripsi: item.deskripsi || '',
      scope: item.scope || 'RT',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.tanggalMulai) {
      alert('Judul agenda dan tanggal mulai wajib diisi.');
      return;
    }

    const startDateTime = new Date(`${formData.tanggalMulai}T${formData.jamMulai || '08:00'}:00`).toISOString();
    const endDateTime = formData.tanggalSelesai 
      ? new Date(`${formData.tanggalSelesai}T${formData.jamSelesai || '11:00'}:00`).toISOString()
      : undefined;

    const payload = {
      judul: formData.judul,
      kategori: formData.kategori,
      tanggalMulai: startDateTime,
      tanggalSelesai: endDateTime,
      lokasi: formData.lokasi,
      deskripsi: formData.deskripsi,
      scope: formData.scope,
    };

    try {
      if (isEditing && editingId) {
        await api.updateAgenda(editingId, payload);
      } else {
        await api.createAgenda(payload);
      }
      setShowModal(false);
      await loadAgenda();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan agenda kegiatan');
    }
  };

  const handleDelete = async (id: string, judul: string) => {
    if (!window.confirm(`Yakin ingin menghapus agenda "${judul}"?`)) return;
    try {
      await api.deleteAgenda(id);
      await loadAgenda();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus agenda kegiatan');
    }
  };

  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case 'KERJA_BAKTI':
        return { label: 'Kerja Bakti', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'RAPAT_RT':
      case 'RAPAT':
        return { label: 'Rapat RT', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'POSYANDU':
        return { label: 'Posyandu', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'KESEHATAN':
      case 'FOGGING':
        return { label: 'Kesehatan & Fogging', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'RONDA':
        return { label: 'Siskamling', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: kategori, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatJamIndo = (startStr: string, endStr?: string) => {
    if (!startStr) return '-';
    const start = new Date(startStr);
    const startFormatted = start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (!endStr) return `${startFormatted} WIB`;
    const end = new Date(endStr);
    const endFormatted = end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${startFormatted} - ${endFormatted} WIB`;
  };

  const filteredList = agendaList.filter((item) => {
    const matchCat = filterCategory === 'SEMUA' || item.kategori === filterCategory;
    const matchSearch =
      item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Agenda Kegiatan Lingkungan ({wilayahLabel})</h3>
              <p className="text-xs text-slate-500">
                Kelola jadwal kerja bakti, rapat pleno, posyandu, fogging, dan kegiatan warga secara real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAgenda}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
            title="Muat Ulang"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus size={16} />
            + Buat Agenda RT Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'SEMUA', label: 'Semua Kategori' },
            { id: 'KERJA_BAKTI', label: 'Kerja Bakti' },
            { id: 'RAPAT_RT', label: 'Rapat RT' },
            { id: 'POSYANDU', label: 'Posyandu' },
            { id: 'FOGGING', label: 'Kesehatan/Fogging' },
            { id: 'RONDA', label: 'Siskamling' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari agenda atau lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Agenda Cards List */}
      {filteredList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-700">Belum Ada Agenda Kegiatan Terjadwal</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Klik tombol "+ Buat Agenda RT Baru" untuk menambahkan agenda kerja bakti, rapat pleno, atau kegiatan lingkungan lainnya.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Buat Agenda Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => {
            const badge = getKategoriBadge(item.kategori);
            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Category & Scope Header */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Level {item.scope || 'RT'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-slate-900 text-base leading-snug">{item.judul}</h4>

                  {/* Date, Time & Location */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500 shrink-0" />
                      <span className="font-semibold text-slate-800">{formatTanggalIndo(item.tanggalMulai)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-amber-500 shrink-0" />
                      <span>{formatJamIndo(item.tanggalMulai, item.tanggalSelesai)}</span>
                    </div>
                    {item.lokasi && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{item.lokasi}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {item.deskripsi && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl line-clamp-3">
                      {item.deskripsi}
                    </p>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                    title="Ubah Agenda"
                  >
                    <Edit3 size={14} />
                    <span>Ubah</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.judul)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                    title="Hapus Agenda"
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Agenda */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? '✏️ Ubah Agenda Kegiatan' : '📅 Tambah Agenda Kegiatan Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama / Judul Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kerja Bakti Saluran Got Blok C"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Kegiatan</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="KERJA_BAKTI">🧹 Kerja Bakti Lingkungan</option>
                    <option value="RAPAT_RT">📋 Rapat Pleno / Evaluasi RT</option>
                    <option value="POSYANDU">👶 Posyandu Balita & Lansia</option>
                    <option value="FOGGING">🦟 Fogging / Kesehatan Lingkungan</option>
                    <option value="RONDA">🌙 Jadwal Siskamling Ronda</option>
                    <option value="KEAGAMAAN">🕌 Pengajian / Acara Keagamaan</option>
                    <option value="HARI_BESAR">🇮🇩 Peringatan Hari Besar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Wilayah (Scope)</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="RT">Tingkat RT {rtNomor}</option>
                    <option value="RW">Tingkat RW Serentak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={formData.jamMulai}
                    onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.tanggalSelesai}
                    onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={formData.jamSelesai}
                    onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Kegiatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Balai Warga RT 03 / Jl. Melati Blok C"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi / Catatan Tambahan</label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Diharapkan membawa cangkul, sapu lidi, atau karung beras bekas..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/20"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Terbitkan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
