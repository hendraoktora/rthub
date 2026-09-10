import React, { useState, useEffect } from 'react';
import { Newspaper, Megaphone, Plus, Search, Pin, PinOff, Edit3, Trash2, Globe, Building, Calendar, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { api, UserSession } from '../services/api';
import { showAlert } from '../services/swal';

interface BeritaProps {
  user?: UserSession | null;
}

export const BeritaManagement: React.FC<BeritaProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;

  const [beritaList, setBeritaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    konten: '',
    scope: 'RT',
    coverUrl: '',
    isPinned: false,
  });

  const loadBerita = async () => {
    try {
      setLoading(true);
      const res = await api.getBeritaFeed();
      if (Array.isArray(res)) {
        setBeritaList(res);
      }
    } catch (err) {
      console.warn('Gagal memuat berita:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBerita();
  }, [user]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      judul: '',
      konten: '',
      scope: 'RT',
      coverUrl: '',
      isPinned: false,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      judul: item.judul || '',
      konten: item.konten || '',
      scope: item.scope || 'RT',
      coverUrl: item.coverUrl || '',
      isPinned: !!item.isPinned,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.konten) {
      showAlert.error('Input Tidak Lengkap', 'Judul dan isi pengumuman wajib diisi.');
      return;
    }

    const payload = {
      judul: formData.judul,
      konten: formData.konten,
      scope: formData.scope,
      coverUrl: formData.coverUrl || undefined,
      isPinned: formData.isPinned,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && editingId) {
        await api.updateBerita(editingId, payload);
        showAlert.success('Berhasil Diperbarui', `Pengumuman "${formData.judul}" berhasil diubah.`);
      } else {
        await api.createBerita(payload);
        showAlert.success('Berhasil Dipublikasikan', `Pengumuman "${formData.judul}" berhasil disiarkan ke warga.`);
      }
      setShowModal(false);
      await loadBerita();
    } catch (err: any) {
      showAlert.error('Gagal Menyimpan Pengumuman', err.message || 'Terjadi kesalahan saat menyimpan pengumuman.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, judul: string) => {
    const confirmed = await showAlert.confirm(
      'Hapus Pengumuman?',
      `Apakah Anda yakin ingin menghapus pengumuman "${judul}"?`,
      'Ya, Hapus'
    );
    if (!confirmed) return;

    try {
      await api.deleteBerita(id);
      showAlert.toastSuccess(`Pengumuman "${judul}" telah dihapus.`);
      await loadBerita();
    } catch (err: any) {
      showAlert.error('Gagal Menghapus Pengumuman', err.message || 'Terjadi kesalahan saat menghapus pengumuman.');
    }
  };

  const handleTogglePin = async (item: any) => {
    try {
      await api.updateBerita(item.id, { isPinned: !item.isPinned });
      showAlert.toastSuccess(item.isPinned ? 'Pin dilepas.' : 'Pengumuman disematkan di posisi teratas.');
      await loadBerita();
    } catch (err: any) {
      showAlert.error('Gagal Mengubah Pin', err.message || 'Terjadi kesalahan saat mengubah status pin.');
    }
  };

  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredList = beritaList.filter((item) => {
    return (
      item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.konten?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Megaphone size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Informasi & Pengumuman RT ({wilayahLabel})</h3>
              <p className="text-xs text-slate-500">
                Terbitkan maklumat pengurus, edaran iuran, dan informasi penting langsung ke layar aplikasi seluruh warga.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBerita}
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
            + Buat Pengumuman Baru
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul atau isi pengumuman..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total: {filteredList.length} Pengumuman
        </span>
      </div>

      {/* Announcements List */}
      {filteredList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Megaphone size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-700">Belum Ada Pengumuman Terbit</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Klik tombol "+ Buat Pengumuman Baru" untuk mempublikasikan maklumat, informasi darurat, atau berita lingkungan.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Terbitkan Pengumuman Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const authorName = item.author?.profile?.namaLengkap || 'Pengurus RT';
            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-2xl border transition flex flex-col justify-between ${
                  item.isPinned
                    ? 'border-blue-300 bg-blue-50/20 shadow-sm ring-1 ring-blue-400/20'
                    : 'border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Scope & Pin Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        <Building size={12} />
                        Level {item.scope || 'RT'}
                      </span>
                      {item.isPinned && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1">
                          <Pin size={10} /> Disematkan
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> {formatTanggalIndo(item.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-slate-900 text-base leading-snug">{item.judul}</h4>

                  {/* Content */}
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    {item.konten}
                  </p>

                  <div className="text-[11px] text-slate-400 font-medium">
                    Oleh: <span className="text-slate-700 font-semibold">{authorName}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleTogglePin(item)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                      item.isPinned
                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                        : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {item.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
                    {item.isPinned ? 'Lepas Sematan' : 'Sematkan ke Atas'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                      title="Ubah Pengumuman"
                    >
                      <Edit3 size={14} />
                      <span>Ubah</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.judul)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Berita */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? '✏️ Ubah Informasi / Pengumuman' : '📢 Terbitkan Pengumuman Baru'}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Edaran Pembayaran Iuran & Kerja Bakti"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
                />
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
                  <option value="KELURAHAN">Tingkat Kelurahan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Lengkap Pengumuman *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tuliskan isi maklumat, informasi, atau petunjuk teknis kepada warga..."
                  value={formData.konten}
                  onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="isPinned" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  📌 Sematkan ke posisi paling atas di aplikasi warga (Pinned)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{isSubmitting ? 'Memproses...' : isEditing ? 'Simpan Perubahan' : 'Publikasikan Pengumuman'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
