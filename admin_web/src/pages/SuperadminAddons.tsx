import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Zap, 
  Crown,
  Search,
  Check,
  ShieldCheck,
  DollarSign,
  RefreshCw,
  Power,
  Calendar,
  AlertTriangle,
  XCircle,
  BellRing
} from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../services/api';

interface SubscribedRt {
  rtId: string;
  nomorRt: string;
  nomorRw: string;
  kelurahan: string;
  kota?: string;
  namaJalan?: string;
  ketua?: string;
  phone?: string;
  paket: 'BASIC' | 'PRO';
  status: 'AKTIF' | 'TRIAL' | 'TIDAK_AKTIF';
  expiredAt: string | null;
  wargaCount?: number;
  rumahCount?: number;
}

export const SuperadminAddons: React.FC = () => {
  const [subscribedRts, setSubscribedRts] = useState<SubscribedRt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAddonSubscriptions();
      if (Array.isArray(data)) {
        setSubscribedRts(data);
      }
    } catch (e) {
      console.error('Failed to load subscriptions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleUpdateStatus = async (
    rtId: string, 
    status: 'AKTIF' | 'TRIAL' | 'TIDAK_AKTIF', 
    durationDays: number,
    label: string
  ) => {
    const result = await Swal.fire({
      title: `${label}?`,
      text: `Ubah status lisensi RT ini menjadi ${status} (${durationDays > 0 ? `+${durationDays} hari (diakumulasikan)` : 'Nonaktif'})? Perubahan langsung sinkron ke aplikasi mobile pengurus & warga.`,
      icon: status === 'TIDAK_AKTIF' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Terapkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: status === 'TIDAK_AKTIF' ? '#dc2626' : '#2563eb',
    });

    if (!result.isConfirmed) return;

    setIsUpdating(rtId);
    try {
      await api.updateAddonSubscription({
        rtId,
        status,
        durationDays,
        paket: status === 'TIDAK_AKTIF' ? 'BASIC' : 'PRO',
      });
      Swal.fire({
        title: 'Berhasil!',
        text: `Lisensi RT berhasil diperbarui menjadi ${status}.`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      });
      await fetchSubscriptions();
    } catch (e: any) {
      Swal.fire('Gagal', e.message || 'Gagal mengubah lisensi RT', 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  const getRemainingDays = (expiredAt: string | null) => {
    if (!expiredAt) return 0;
    const exp = new Date(expiredAt).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeCount = subscribedRts.filter((r) => r.status === 'AKTIF').length;
  const trialCount = subscribedRts.filter((r) => r.status === 'TRIAL').length;
  const inactiveCount = subscribedRts.filter((r) => r.status === 'TIDAK_AKTIF' || getRemainingDays(r.expiredAt) <= 0).length;
  const monthlyRevenue = activeCount * 99000;

  const filteredRts = subscribedRts.filter(
    (r) =>
      r.nomorRt?.includes(searchQuery) ||
      r.nomorRw?.includes(searchQuery) ||
      r.kelurahan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ketua?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Manajemen Lisensi & Langganan RT Pro (Rp 99.000 / Bulan)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem Lisensi RT Pro: Masa trial 7 hari, peringatan banner H-3 sebelum kedaluwarsa, dan pembekuan otomatis jika masa aktif habis.
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Menyinkronkan...' : 'Sinkronkan DB'}
        </button>
      </div>

      {/* Feature Bundle Showcase Cards */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Aturan Bisnis Lisensi RT Pro (Probis Baru)
            </span>
            <h3 className="text-2xl font-black tracking-tight">
              Model Langganan Mandiri & Perlindungan Akun
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              RT baru mendapatkan <strong>Trial Gratis 7 Hari</strong>. Memasuki <strong>H-3 kedaluwarsa</strong>, banner notifikasi peringatan muncul di homescreen. Ketika masa aktif habis, seluruh isi akun RT otomatis dinonaktifkan sampai langganan diperpanjang (Rp 99.000 / bulan). Sisa durasi akan bertambah secara akumulatif.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Banner Peringatan H-3</h4>
                <p className="text-[11px] text-slate-300">Notifikasi otomatis di beranda app</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold shrink-0">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Auto Deaktivasi</h4>
                <p className="text-[11px] text-slate-300">Kunci akses bila langganan expired</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">RT Pro Aktif</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {activeCount} <span className="text-xs font-semibold text-slate-400">RT Aktif</span>
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Berlangganan Rp 99.000/bln
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">RT Masa Trial (7 Hari)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-blue-600 mt-2">
            {trialCount} <span className="text-xs font-semibold text-slate-400">RT Trial</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Uji coba fitur penuh sebelum berlangganan
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estimasi MRR RT Pro</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 mt-2">
            Rp {monthlyRevenue.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Pendapatan langganan berulang bulanan
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">RT Kedaluwarsa / Nonaktif</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-600 mt-2">
            {inactiveCount} <span className="text-xs font-semibold text-slate-400">RT Nonaktif</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Fitur terkunci menunggu perpanjangan
          </p>
        </div>
      </div>

      {/* RT Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Daftar Lisensi Wilayah RT & Kontrol Status Akun
            </h4>
            <p className="text-xs text-slate-400">Pantau sisa durasi aktif, status banner peringatan H-3, serta lakukan perpanjangan lisensi manual.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor RT, RW, Kelurahan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Wilayah RT / RW</th>
                <th className="px-4 py-3.5">Ketua RT & Kontak</th>
                <th className="px-4 py-3.5">Status Lisensi</th>
                <th className="px-4 py-3.5">Masa Berlaku</th>
                <th className="px-4 py-3.5 text-center">Status Peringatan & Akses</th>
                <th className="px-4 py-3.5 text-center">Aksi Superadmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRts.map((r) => {
                const remainingDays = getRemainingDays(r.expiredAt);
                const isExpired = remainingDays <= 0 || r.status === 'TIDAK_AKTIF';
                const isWarningH3 = remainingDays > 0 && remainingDays <= 3;
                const isProActive = !isExpired && (r.status === 'AKTIF' || r.status === 'TRIAL');
                const isUpdatingThis = isUpdating === r.rtId;

                return (
                  <tr key={r.rtId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900 text-sm">
                        RT {r.nomorRt} / RW {r.nomorRw}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Kel. {r.kelurahan} {r.kota ? `(${r.kota})` : ''}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-800 block">{r.ketua || 'Pengurus RT'}</span>
                      <span className="text-[11px] text-slate-400">{r.phone || '-'}</span>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        r.status === 'AKTIF' && !isExpired
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'TRIAL' && !isExpired
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {r.status === 'AKTIF' && !isExpired && <Check className="w-3 h-3 text-emerald-600" />}
                        {r.status === 'AKTIF' && !isExpired 
                          ? '👑 PRO AKTIF' 
                          : r.status === 'TRIAL' && !isExpired 
                          ? '⏳ TRIAL (7 HARI)' 
                          : '⛔ NONAKTIF / EXPIRED'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-600 font-medium">
                      {r.expiredAt ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                            <Calendar size={12} className="text-slate-400" />
                            <span>{new Date(r.expiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="text-[10px]">
                            {remainingDays > 0 ? (
                              <span className={isWarningH3 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-semibold'}>
                                Sisa {remainingDays} hari lagi
                              </span>
                            ) : (
                              <span className="text-rose-600 font-bold">
                                Kedaluwarsa ({Math.abs(remainingDays)} hari lalu)
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Belum diaktifkan</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          <XCircle size={11} /> Akun Terkunci (Nonaktif)
                        </span>
                      ) : isWarningH3 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                          <AlertTriangle size={11} /> Banner H-3 Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={11} /> Akses Berjalan Normal
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          disabled={isUpdatingThis}
                          onClick={() => handleUpdateStatus(r.rtId, 'AKTIF', 30, 'Perpanjang Langganan RT Pro (+30 Hari)')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-bold border border-emerald-200 transition disabled:opacity-50"
                          title="Tambah durasi 30 hari secara akumulatif"
                        >
                          +30 Hari Pro
                        </button>

                        <button
                          disabled={isUpdatingThis}
                          onClick={() => handleUpdateStatus(r.rtId, 'TRIAL', 7, 'Berikan Masa Trial RT (+7 Hari)')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold border border-blue-200 transition disabled:opacity-50"
                          title="Beri masa uji coba trial 7 hari"
                        >
                          +7 Hari Trial
                        </button>

                        {isProActive && (
                          <button
                            disabled={isUpdatingThis}
                            onClick={() => handleUpdateStatus(r.rtId, 'TIDAK_AKTIF', 0, 'Nonaktifkan Akun RT Ini')}
                            className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-[11px] font-bold border border-rose-200 transition disabled:opacity-50"
                            title="Segera nonaktifkan seluruh akses RT ini"
                          >
                            Nonaktifkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
