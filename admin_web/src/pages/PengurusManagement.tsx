import React, { useState } from 'react';
import { ShieldCheck, Plus, UserCheck, Phone, Mail, Edit3, Trash2, HeartHandshake, Sparkles, Users2, Shield, Trees, Baby, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { UserSession } from '../services/api';
import { showAlert } from '../services/swal';

interface PengurusProps {
  user?: UserSession | null;
}

interface PengurusItem {
  id: string;
  jabatan: string;
  kategori: string;
  nama: string;
  phone: string;
  email: string;
  rumah: string;
  status: string;
  icon?: string;
}

export const PengurusManagement: React.FC<PengurusProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const ketuaNama = user?.name || 'Ketua RT';
  const ketuaPhone = user?.phone || '081234567890';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;

  const [pengurusList, setPengurusList] = useState<PengurusItem[]>([
    { id: '1', jabatan: `Ketua RT ${rtNomor}`, kategori: 'INTI', nama: ketuaNama, phone: ketuaPhone, email: `ketua.rt${rtNomor}@rthub.id`, rumah: 'Rumah Ketua RT', status: 'AKTIF', icon: 'ShieldCheck' },
    { id: '2', jabatan: `Sekretaris RT ${rtNomor}`, kategori: 'INTI', nama: 'Sekretaris RT Terdaftar', phone: '081211112222', email: `sekretaris.rt${rtNomor}@rthub.id`, rumah: 'Blok Utama No. 02', status: 'AKTIF', icon: 'UserCheck' },
    { id: '3', jabatan: `Bendahara RT ${rtNomor}`, kategori: 'INTI', nama: 'Bendahara Kas RT', phone: '081398765432', email: `bendahara.rt${rtNomor}@rthub.id`, rumah: 'Blok Kas No. 05', status: 'AKTIF', icon: 'UserCheck' },
    { id: '4', jabatan: 'Seksi Keamanan & Ketertiban', kategori: 'SEKSI', nama: 'Koordinator Keamanan', phone: '081211110002', email: `keamanan.rt${rtNomor}@rthub.id`, rumah: 'Pos Jaga Utama', status: 'AKTIF', icon: 'Shield' },
    { id: '5', jabatan: 'Seksi Kebersihan & Lingkungan', kategori: 'SEKSI', nama: 'Koordinator Kebersihan', phone: '081211110004', email: `kebersihan.rt${rtNomor}@rthub.id`, rumah: 'Blok B No. 12', status: 'AKTIF', icon: 'Trees' },
    { id: '6', jabatan: 'Seksi Sosial, Kematian & Humas', kategori: 'SEKSI', nama: 'Koordinator Sosial', phone: '081211110007', email: `humas.rt${rtNomor}@rthub.id`, rumah: 'Blok C No. 08', status: 'AKTIF', icon: 'HeartHandshake' },
    { id: '7', jabatan: 'Ketua Tim Penggerak PKK & Posyandu', kategori: 'PKK', nama: 'Koordinator PKK', phone: '081233445566', email: `pkk.rt${rtNomor}@rthub.id`, rumah: 'Posyandu RT', status: 'AKTIF', icon: 'Baby' },
    { id: '8', jabatan: 'Seksi Pemuda & Karang Taruna', kategori: 'PEMUDA', nama: 'Ketua Pemuda RT', phone: '081299881122', email: `pemuda.rt${rtNomor}@rthub.id`, rumah: 'Sekretariat Pemuda', status: 'AKTIF', icon: 'Users2' },
    { id: '9', jabatan: 'Seksi Kerohanian & Keagamaan', kategori: 'SEKSI', nama: 'Koordinator Keagamaan', phone: '081399001122', email: `rohani.rt${rtNomor}@rthub.id`, rumah: 'Musholla / Sarana Ibadah', status: 'AKTIF', icon: 'Sparkles' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    jabatan: '', 
    kategori: 'SEKSI', 
    nama: '', 
    phone: '', 
    email: '', 
    rumah: '', 
    status: 'AKTIF' 
  });
  const [editingPengurus, setEditingPengurus] = useState<PengurusItem | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.jabatan) {
      showAlert.error('Input Tidak Lengkap', 'Nama Pejabat dan Nama Jabatan wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const newItem: PengurusItem = {
        id: Date.now().toString(),
        jabatan: formData.jabatan,
        kategori: formData.kategori,
        nama: formData.nama,
        phone: formData.phone || '-',
        email: formData.email || `${formData.nama.toLowerCase().replace(/\s+/g, '.')}@rthub.id`,
        rumah: formData.rumah || '-',
        status: formData.status || 'AKTIF',
        icon: 'UserCheck',
      };
      setPengurusList([...pengurusList, newItem]);
      setShowAddModal(false);
      setFormData({ jabatan: '', kategori: 'SEKSI', nama: '', phone: '', email: '', rumah: '', status: 'AKTIF' });
      setIsSubmitting(false);
      showAlert.success('Berhasil Ditambahkan', `Posisi "${newItem.jabatan}" berhasil ditambahkan ke struktur.`);
    }, 400);
  };

  const handleStartEdit = (item: PengurusItem) => {
    setEditingPengurus({ ...item });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPengurus) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setPengurusList(
        pengurusList.map((p) => (p.id === editingPengurus.id ? editingPengurus : p))
      );
      const jbt = editingPengurus.jabatan;
      setEditingPengurus(null);
      setIsSubmitting(false);
      showAlert.success('Berhasil Diperbarui', `Data "${jbt}" berhasil diperbarui.`);
    }, 400);
  };

  const handleDelete = async (id: string, nama: string) => {
    const confirmed = await showAlert.confirm(
      'Hapus Posisi Pengurus?',
      `Apakah Anda yakin ingin menghapus pengurus "${nama}"?`,
      'Ya, Hapus'
    );
    if (!confirmed) return;

    setPengurusList(pengurusList.filter((p) => p.id !== id));
    showAlert.toastSuccess(`Pengurus "${nama}" telah dihapus.`);
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Struktur Kepengurusan Lengkap ({wilayahLabel})</h3>
          <p className="text-xs text-slate-500">Kelola dan edit data pejabat pengurus RT, seksi operasional, PKK posyandu, dan pemuda</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ jabatan: '', kategori: 'SEKSI', nama: '', phone: '', email: '', rumah: '', status: 'AKTIF' });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={16} /> + Tambah Posisi Pengurus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pengurusList.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-start justify-between mb-3 gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  p.kategori === 'INTI' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  p.kategori === 'PKK' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                  p.kategori === 'PEMUDA' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {p.jabatan}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    p.status === 'AKTIF' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.status === 'AKTIF' ? '✓ Aktif' : 'Nonaktif'}
                  </span>
                  
                  {/* Edit & Delete Action Buttons */}
                  <button 
                    onClick={() => handleStartEdit(p)}
                    title="Edit Pengurus"
                    className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition border border-slate-200/60"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id, p.jabatan)}
                    title="Hapus Pengurus"
                    className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition border border-slate-200/60"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <h4 className="font-bold text-slate-900 text-base">{p.nama}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span>🏠 {p.rumah}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1 font-medium text-slate-700">
                <Phone size={13} className="text-slate-400" />
                <span>{p.phone}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Mail size={13} />
                <span className="truncate max-w-[120px]">{p.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit Pengurus */}
      {editingPengurus && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Edit Data Pengurus RT</h3>
              </div>
              <button 
                onClick={() => setEditingPengurus(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={editingPengurus.jabatan}
                    onChange={(e) => setEditingPengurus({ ...editingPengurus, jabatan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori Jabatan</label>
                  <select
                    value={editingPengurus.kategori}
                    onChange={(e) => setEditingPengurus({ ...editingPengurus, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="INTI">Pengurus Inti (Ketua/Sekretaris/Bendahara)</option>
                    <option value="SEKSI">Seksi Operasional Lingkungan</option>
                    <option value="PKK">PKK & Posyandu</option>
                    <option value="PEMUDA">Pemuda & Karang Taruna</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Pejabat / Warga *</label>
                <input
                  type="text"
                  required
                  value={editingPengurus.nama}
                  onChange={(e) => setEditingPengurus({ ...editingPengurus, nama: e.target.value })}
                  placeholder="Contoh: Bpk. Bambang Soediro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">No. WhatsApp / HP</label>
                  <input
                    type="tel"
                    value={editingPengurus.phone}
                    onChange={(e) => setEditingPengurus({ ...editingPengurus, phone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Email Resmi RT</label>
                  <input
                    type="email"
                    value={editingPengurus.email}
                    onChange={(e) => setEditingPengurus({ ...editingPengurus, email: e.target.value })}
                    placeholder="email@rthub.id"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Blok / Nomor Rumah</label>
                  <input
                    type="text"
                    value={editingPengurus.rumah}
                    onChange={(e) => setEditingPengurus({ ...editingPengurus, rumah: e.target.value })}
                    placeholder="Contoh: Blok C3 No. 05"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Status Keaktifan</label>
                  <select
                    value={editingPengurus.status}
                    onChange={(e) => setEditingPengurus({ ...editingPengurus, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="AKTIF">Aktif Menjabat</option>
                    <option value="NONAKTIF">Nonaktif / Cuti</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPengurus(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Check size={14} /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengurus */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Tambah Jabatan Pengurus RT</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Jabatan *</label>
                <input
                  type="text"
                  required
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  placeholder="Contoh: Seksi Olahraga & Seni"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori Jabatan</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="INTI">Pengurus Inti</option>
                  <option value="SEKSI">Seksi Operasional Lingkungan</option>
                  <option value="PKK">PKK & Posyandu</option>
                  <option value="PEMUDA">Pemuda & Karang Taruna</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Pejabat / Warga *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Bpk. Gunawan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Blok / No. Rumah</label>
                  <input
                    type="text"
                    value={formData.rumah}
                    onChange={(e) => setFormData({ ...formData, rumah: e.target.value })}
                    placeholder="Contoh: Blok B2/10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengurus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
