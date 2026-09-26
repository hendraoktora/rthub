import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  UserCheck, 
  Phone, 
  Mail, 
  Edit3, 
  Trash2, 
  HeartHandshake, 
  Sparkles, 
  Users2, 
  Shield, 
  Trees, 
  Baby, 
  X, 
  Check, 
  AlertCircle, 
  Loader2,
  Share2,
  Copy,
  ExternalLink,
  MessageCircle,
  Users
} from 'lucide-react';
import { api, UserSession } from '../services/api';
import { showAlert } from '../services/swal';
import { generateWaInviteText } from '../utils/inviteHelper';

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

interface WargaOption {
  id: string;
  namaKepala: string;
  phone: string;
  noRumah: string;
}

const JABATAN_PRESETS = [
  { jabatan: 'Sekretaris RT', kategori: 'INTI' },
  { jabatan: 'Bendahara RT', kategori: 'INTI' },
  { jabatan: 'Seksi Keamanan & Ketertiban', kategori: 'SEKSI' },
  { jabatan: 'Seksi Kebersihan & Lingkungan', kategori: 'SEKSI' },
  { jabatan: 'Seksi Sosial, Kematian & Humas', kategori: 'SEKSI' },
  { jabatan: 'Ketua Tim Penggerak PKK & Posyandu', kategori: 'PKK' },
  { jabatan: 'Seksi Pemuda & Karang Taruna', kategori: 'PEMUDA' },
  { jabatan: 'Seksi Kerohanian & Keagamaan', kategori: 'SEKSI' },
  { jabatan: 'Lainnya (Kustom)', kategori: 'SEKSI' },
];

export const PengurusManagement: React.FC<PengurusProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const ketuaNama = user?.name || 'Ketua RT';
  const ketuaPhone = user?.phone || '081234567890';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;

  const [pengurusList, setPengurusList] = useState<PengurusItem[]>([
    { id: '1', jabatan: `Ketua RT ${rtNomor}`, kategori: 'INTI', nama: ketuaNama, phone: ketuaPhone, email: `ketua.rt${rtNomor}@rthub.id`, rumah: 'Rumah Ketua RT', status: 'AKTIF', icon: 'ShieldCheck' },
    { id: '2', jabatan: `Sekretaris RT ${rtNomor}`, kategori: 'INTI', nama: 'Sekretaris RT', phone: '081211112222', email: `sekretaris.rt${rtNomor}@rthub.id`, rumah: 'Blok Utama No. 02', status: 'AKTIF', icon: 'UserCheck' },
    { id: '3', jabatan: `Bendahara RT ${rtNomor}`, kategori: 'INTI', nama: 'Bendahara RT', phone: '081398765432', email: `bendahara.rt${rtNomor}@rthub.id`, rumah: 'Blok Kas No. 05', status: 'AKTIF', icon: 'UserCheck' },
    { id: '4', jabatan: 'Seksi Keamanan & Ketertiban', kategori: 'SEKSI', nama: 'Koordinator Keamanan', phone: '081211110002', email: `keamanan.rt${rtNomor}@rthub.id`, rumah: 'Pos Jaga Utama', status: 'AKTIF', icon: 'Shield' },
    { id: '5', jabatan: 'Seksi Kebersihan & Lingkungan', kategori: 'SEKSI', nama: 'Koordinator Kebersihan', phone: '081211110004', email: `kebersihan.rt${rtNomor}@rthub.id`, rumah: 'Blok B No. 12', status: 'AKTIF', icon: 'Trees' },
    { id: '6', jabatan: 'Seksi Sosial, Kematian & Humas', kategori: 'SEKSI', nama: 'Koordinator Sosial', phone: '081211110007', email: `humas.rt${rtNomor}@rthub.id`, rumah: 'Blok C No. 08', status: 'AKTIF', icon: 'HeartHandshake' },
    { id: '7', jabatan: 'Ketua Tim Penggerak PKK & Posyandu', kategori: 'PKK', nama: 'Koordinator PKK', phone: '081233445566', email: `pkk.rt${rtNomor}@rthub.id`, rumah: 'Posyandu RT', status: 'AKTIF', icon: 'Baby' },
    { id: '8', jabatan: 'Seksi Pemuda & Karang Taruna', kategori: 'PEMUDA', nama: 'Ketua Pemuda RT', phone: '081299881122', email: `pemuda.rt${rtNomor}@rthub.id`, rumah: 'Sekretariat Pemuda', status: 'AKTIF', icon: 'Users2' },
    { id: '9', jabatan: 'Seksi Kerohanian & Keagamaan', kategori: 'SEKSI', nama: 'Koordinator Keagamaan', phone: '081399001122', email: `rohani.rt${rtNomor}@rthub.id`, rumah: 'Musholla / Sarana Ibadah', status: 'AKTIF', icon: 'Sparkles' },
  ]);

  const [wargaOptions, setWargaOptions] = useState<WargaOption[]>([]);
  const [isLoadingWarga, setIsLoadingWarga] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('Sekretaris RT');
  const [selectedWargaId, setSelectedWargaId] = useState<string>('');

  const [formData, setFormData] = useState({ 
    jabatan: 'Sekretaris RT', 
    kategori: 'INTI', 
    nama: '', 
    phone: '', 
    email: '', 
    rumah: '', 
    status: 'AKTIF' 
  });
  const [editingPengurus, setEditingPengurus] = useState<PengurusItem | null>(null);

  // Load Warga RT
  useEffect(() => {
    const fetchWarga = async () => {
      if (!user?.rtId) return;
      setIsLoadingWarga(true);
      try {
        const res = await api.getWargaList(user.rtId);
        if (res && res.rumahList && Array.isArray(res.rumahList)) {
          const list: WargaOption[] = res.rumahList.map((r: any) => {
            const kk = r.kartuKeluarga?.[0];
            return {
              id: r.id,
              namaKepala: kk?.namaKepala || `Warga Rumah ${r.noRumah}`,
              phone: kk?.anggota?.find((a: any) => a.noHp)?.noHp || '-',
              noRumah: r.noRumah || '-',
            };
          });
          setWargaOptions(list);
        }
      } catch (err) {
        console.error('Failed to fetch warga list for pengurus dropdown:', err);
      } finally {
        setIsLoadingWarga(false);
      }
    };

    fetchWarga();
  }, [user?.rtId]);

  const handleSelectWarga = (wargaId: string) => {
    setSelectedWargaId(wargaId);
    if (!wargaId) {
      setFormData(prev => ({ ...prev, nama: '', phone: '', rumah: '', email: '' }));
      return;
    }
    const found = wargaOptions.find(w => w.id === wargaId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        nama: found.namaKepala,
        phone: found.phone !== '-' ? found.phone : '',
        rumah: `Rumah ${found.noRumah}`,
        email: `${found.namaKepala.toLowerCase().replace(/\s+/g, '.')}@rthub.id`,
      }));
    }
  };

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = JABATAN_PRESETS.find(p => p.jabatan === presetName);
    if (presetName === 'Lainnya (Kustom)') {
      setFormData(prev => ({ ...prev, jabatan: '', kategori: 'SEKSI' }));
    } else if (preset) {
      setFormData(prev => ({ ...prev, jabatan: preset.jabatan, kategori: preset.kategori }));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.jabatan) {
      showAlert.error('Input Tidak Lengkap', 'Pilih Warga Terdaftar dan Nama Jabatan.');
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
      setSelectedWargaId('');
      setFormData({ jabatan: 'Sekretaris RT', kategori: 'INTI', nama: '', phone: '', email: '', rumah: '', status: 'AKTIF' });
      setIsSubmitting(false);
      showAlert.success('Berhasil Ditambahkan', `Posisi "${newItem.jabatan}" berhasil ditambahkan ke struktur pengurus.`);
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

  const inviteText = generateWaInviteText(user);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteText);
    showAlert.toastSuccess('Pesan ajakan warga berhasil disalin ke clipboard! Silakan paste di grup WhatsApp.');
  };

  const handleShareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(inviteText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-bold mb-1">
            <Users size={12} />
            <span>Manajemen Kepengurusan Lingkungan</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Struktur Pengurus ({wilayahLabel})</h3>
          <p className="text-xs text-slate-500">Pilih pejabat pengurus langsung dari warga terdaftar di RT/RW Anda</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tombol Sebar Undangan WA untuk Ketua RT */}
          <button 
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <MessageCircle size={16} />
            <span>Sebar Undangan Warga (WA)</span>
          </button>

          <button 
            onClick={() => {
              setSelectedWargaId('');
              setFormData({ jabatan: 'Sekretaris RT', kategori: 'INTI', nama: '', phone: '', email: '', rumah: '', status: 'AKTIF' });
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Plus size={16} />
            <span>+ Tambah Pengurus</span>
          </button>
        </div>
      </div>

      {/* Grid Kartu Pengurus */}
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
              <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {p.email}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit Pengurus */}
      {editingPengurus && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Edit Data Pengurus RT</h3>
              <button 
                onClick={() => setEditingPengurus(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Jabatan</label>
                <input
                  type="text"
                  required
                  value={editingPengurus.jabatan}
                  onChange={(e) => setEditingPengurus({ ...editingPengurus, jabatan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Pejabat</label>
                <input
                  type="text"
                  required
                  value={editingPengurus.nama}
                  onChange={(e) => setEditingPengurus({ ...editingPengurus, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
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

      {/* Modal Tambah Pengurus (Pilih dari Warga Terdaftar) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tambah Pejabat Pengurus RT</h3>
                <p className="text-xs text-slate-500">Pilih dari warga yang sudah terdaftar di {wilayahLabel}</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              {/* Dropdown 1: Pilih Warga Terdaftar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">1. Pilih Warga Terdaftar ({wilayahLabel}) *</label>
                  {isLoadingWarga && (
                    <span className="text-[11px] text-blue-600 flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> Memuat warga...
                    </span>
                  )}
                </div>

                {wargaOptions.length > 0 ? (
                  <select
                    value={selectedWargaId}
                    onChange={(e) => handleSelectWarga(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  >
                    <option value="">-- Pilih Warga Sesuai RT Ini --</option>
                    {wargaOptions.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.namaKepala} (Rumah: {w.noRumah} • Telp: {w.phone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-2">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertCircle size={15} />
                      Belum ada data warga terdaftar di {wilayahLabel}.
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Pengurus RT dipilih dari warga yang telah memiliki akun di RT ini. Anda dapat menyebarkan link undangan pendaftaran warga terlebih dahulu.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowInviteModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <MessageCircle size={13} /> Sebar Undangan Pendaftaran ke WA
                    </button>
                  </div>
                )}
              </div>

              {/* Dropdown 2: Posisi / Jabatan Pengurus */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">2. Posisi / Jabatan Pengurus *</label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white mb-2"
                >
                  {JABATAN_PRESETS.map((p) => (
                    <option key={p.jabatan} value={p.jabatan}>
                      {p.jabatan} ({p.kategori === 'INTI' ? 'Pengurus Inti' : p.kategori === 'PKK' ? 'PKK/Posyandu' : p.kategori === 'PEMUDA' ? 'Pemuda' : 'Seksi Operasional'})
                    </option>
                  ))}
                </select>

                {selectedPreset === 'Lainnya (Kustom)' && (
                  <input
                    type="text"
                    required
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Ketik nama jabatan kustom (contoh: Seksi Informasi & IT)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>

              {/* Data Terisi Otomatis */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data Profil Pengurus (Auto-Filled):</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama:</span>
                    <span className="font-semibold text-slate-800">{formData.nama || '- (Pilih warga)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. WhatsApp:</span>
                    <span className="font-semibold text-slate-800">{formData.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Rumah / Alamat:</span>
                    <span className="font-semibold text-slate-800">{formData.rumah || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kategori:</span>
                    <span className="font-semibold text-blue-600">{formData.kategori}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
                  disabled={isSubmitting || !formData.nama}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{isSubmitting ? 'Menyimpan...' : 'Tetapkan Sebagai Pengurus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Undangan WhatsApp untuk Warga */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pesan Ajakan Pendaftaran Warga</h3>
                  <p className="text-xs text-slate-500">Siap disebarkan ke grup WhatsApp RT {rtNomor}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Salin teks di bawah ini dan bagikan ke grup WhatsApp RT warga Anda agar seluruh warga dapat langsung mendownload aplikasi dan mendaftarkan anggota keluarganya:
            </p>

            {/* Box Preview Teks WhatsApp */}
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
              {inviteText}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyInvite}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Copy size={15} />
                <span>Salin Pesan (Clipboard)</span>
              </button>

              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle size={15} />
                <span>Buka WhatsApp & Kirim</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
