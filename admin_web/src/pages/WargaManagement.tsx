import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, CheckCircle, Home, Phone, ChevronDown, ChevronUp, UserPlus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { api, UserSession } from '../services/api';
import { showAlert } from '../services/swal';

interface WargaProps {
  user?: UserSession | null;
}

export const WargaManagement: React.FC<WargaProps> = ({ user }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wargaList, setWargaList] = useState<any[]>([]);

  const [newWarga, setNewWarga] = useState({
    namaKepala: '',
    istri: '',
    phone: '',
    nik: '',
    noKk: '',
    noRumah: '',
    statusHunian: 'TETAP',
    anggotaKeluarga: '',
  });

  const activeRtId = user?.rtId || 'cff664ca-dd41-4b82-987b-e1eb087d8274';

  const fetchWargaList = async () => {
    if (!activeRtId) return;
    setIsLoading(true);
    try {
      const data = await api.getWargaList(activeRtId);
      if (data && data.rumahList) {
        const mapped = data.rumahList.map((r: any) => {
          const kk = r.kartuKeluarga?.[0];
          const tagihan = r.tagihanWarga?.[0];
          const isLunas = tagihan?.status === 'PAID';
          const anakAnggota = kk?.anggota?.filter((a: any) => a.hubungan === 'ANAK') || [];

          return {
            id: r.id,
            noRumah: r.noRumah,
            namaKepala: kk?.namaKepala || 'Warga Terdaftar',
            istri: kk?.anggota?.find((a: any) => a.hubungan === 'ISTRI')?.nama || '-',
            anak: anakAnggota.length > 0 ? anakAnggota.map((a: any) => a.nama) : ['1 Anggota Keluarga'],
            phone: kk?.anggota?.find((a: any) => a.noHp)?.noHp || user?.phone || '-',
            nik: kk?.anggota?.[0]?.nik || '-',
            kk: kk?.noKk || '-',
            statusHunian: r.statusHunian || 'TETAP',
            tagihanStatus: isLunas ? 'LUNAS' : 'BELUM_BAYAR',
          };
        });
        setWargaList(mapped);
      }
    } catch (e) {
      console.error('Error fetching warga:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWargaList();
  }, [user]);

  const handleAddWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarga.namaKepala || !newWarga.phone || !newWarga.noRumah) {
      showAlert.error('Input Tidak Lengkap', 'Nama Kepala Keluarga, No WhatsApp, dan No Rumah wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const anakList = newWarga.anggotaKeluarga
        ? newWarga.anggotaKeluarga.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await api.addWarga(activeRtId, {
        namaLengkap: newWarga.namaKepala.trim(),
        phone: newWarga.phone.trim(),
        noRumah: newWarga.noRumah.trim(),
        nik: newWarga.nik.trim() || undefined,
        noKk: newWarga.noKk.trim() || undefined,
        statusHunian: newWarga.statusHunian,
        namaIstri: newWarga.istri.trim() || undefined,
        anggotaKeluarga: anakList,
      });

      setShowAddModal(false);
      setNewWarga({
        namaKepala: '',
        istri: '',
        phone: '',
        nik: '',
        noKk: '',
        noRumah: '',
        statusHunian: 'TETAP',
        anggotaKeluarga: '',
      });
      await fetchWargaList();
      showAlert.success('Berhasil Ditambahkan', `Data warga ${newWarga.namaKepala} (Rumah ${newWarga.noRumah}) berhasil disimpan.`);
    } catch (err: any) {
      showAlert.error('Gagal Menyimpan Warga', err.message || 'Terjadi kesalahan saat menyimpan data warga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = wargaList.filter(
    (w) =>
      w.namaKepala.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.noRumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Manajemen Warga & Rumah ({user?.wilayah || 'RT Aktif'})
          </h3>
          <p className="text-xs text-slate-500">Data lengkap KK, anggota keluarga, nomor rumah, dan status tagihan realtime DB</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWargaList}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={16} /> + Tambah Akun Warga Baru
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
              placeholder="Cari nama kepala keluarga, no rumah, atau no WA..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {wargaList.length} KK Terdaftar di DB</span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200/60">
            <tr>
              <th className="px-6 py-4">Kepala Keluarga</th>
              <th className="px-6 py-4">No. Rumah / Blok</th>
              <th className="px-6 py-4">No. WhatsApp</th>
              <th className="px-6 py-4">Status Hunian</th>
              <th className="px-6 py-4">Status Tagihan</th>
              <th className="px-6 py-4">Detail KK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((w) => {
                const isExpanded = expandedId === w.id;
                const isLunas = w.tagihanStatus === 'LUNAS';
                return (
                  <React.Fragment key={w.id}>
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                            {w.namaKepala.replace(/Bpk\.|Ibu/g, '').trim().substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{w.namaKepala}</p>
                            <p className="text-[11px] text-slate-400">NIK: {w.nik}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">{w.noRumah}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{w.phone}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            w.statusHunian === 'TETAP' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {w.statusHunian}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isLunas ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isLunas ? '✓ Lunas' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : w.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          {isExpanded ? 'Tutup' : 'Lihat KK'}
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={6} className="px-6 py-4 border-b border-slate-100">
                          <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-xs font-bold text-slate-800">No. Kartu Keluarga (KK): {w.kk}</span>
                              <span className="text-xs text-slate-400">Unit: {w.noRumah}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                              <div>
                                <span className="text-slate-400 block mb-0.5 font-medium">Istri / Pasangan:</span>
                                <span className="font-bold text-slate-700">{w.istri}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block mb-0.5 font-medium">Anak / Anggota Keluarga:</span>
                                <span className="font-bold text-slate-700">
                                  {Array.isArray(w.anak) ? w.anak.join(', ') : w.anak}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                  {isLoading ? 'Memuat data warga dari database...' : 'Belum ada data warga untuk RT ini. Klik "+ Tambah Akun Warga Baru" untuk menambahkan.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Warga */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Tambah Akun Warga Baru (Simpan ke DB)</h3>
            <form onSubmit={handleAddWarga} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Lengkap Kepala Keluarga *</label>
                <input
                  type="text"
                  required
                  value={newWarga.namaKepala}
                  onChange={(e) => setNewWarga({ ...newWarga, namaKepala: e.target.value })}
                  placeholder="Contoh: Bpk. Budi Santoso"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">No. Rumah / Blok *</label>
                  <input
                    type="text"
                    required
                    value={newWarga.noRumah}
                    onChange={(e) => setNewWarga({ ...newWarga, noRumah: e.target.value })}
                    placeholder="Contoh: Blok C3 No. 15"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">No. WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    required
                    value={newWarga.phone}
                    onChange={(e) => setNewWarga({ ...newWarga, phone: e.target.value })}
                    placeholder="Contoh: 081299990001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nomor NIK (Opsional)</label>
                  <input
                    type="text"
                    value={newWarga.nik}
                    onChange={(e) => setNewWarga({ ...newWarga, nik: e.target.value })}
                    placeholder="327601xxxxxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nomor KK (Opsional)</label>
                  <input
                    type="text"
                    value={newWarga.noKk}
                    onChange={(e) => setNewWarga({ ...newWarga, noKk: e.target.value })}
                    placeholder="327601xxxxxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Istri / Pasangan</label>
                  <input
                    type="text"
                    value={newWarga.istri}
                    onChange={(e) => setNewWarga({ ...newWarga, istri: e.target.value })}
                    placeholder="Contoh: Ibu Rina"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Status Hunian</label>
                  <select
                    value={newWarga.statusHunian}
                    onChange={(e) => setNewWarga({ ...newWarga, statusHunian: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="TETAP">Warga Tetap</option>
                    <option value="KONTRAK">Kontrak / Sewa</option>
                    <option value="KOS">Kos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Anak / Anggota Lain (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={newWarga.anggotaKeluarga}
                  onChange={(e) => setNewWarga({ ...newWarga, anggotaKeluarga: e.target.value })}
                  placeholder="Contoh: Bayu Santoso, Dinda Santoso"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan ke Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
