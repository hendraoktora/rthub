import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Receipt, 
  FileSpreadsheet, 
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
  Calendar
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
      text: `Ubah status paket RT ini menjadi ${status} (${durationDays > 0 ? `${durationDays} hari` : 'Basic/Nonaktif'})? Perubahan langsung berlaku ke aplikasi mobile warga.`,
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
        text: `Paket RT berhasil diperbarui menjadi ${status}.`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false,
      });
      await fetchSubscriptions();
    } catch (e: any) {
      Swal.fire('Gagal', e.message || 'Gagal mengubah paket RT', 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  const activeCount = subscribedRts.filter((r) => r.status === 'AKTIF').length;
  const trialCount = subscribedRts.filter((r) => r.status === 'TRIAL').length;
  const monthlyRevenue = activeCount * 49000;

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
            Manajemen Paket Add-Ons RT (Rp 49.000 / Bulan)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrasi database: Kontrol status aktif langganan E-Surat Digital, cetak resi kas manual, dan ekspor LPJ per unit RT.
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
              Paket Ekosistem Tambahan (Add-Ons Berbayar)
            </span>
            <h3 className="text-2xl font-black tracking-tight">
              Otomasi Administrasi & Pelayanan Warga RT
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tiap RT yang berlangganan Rp 49.000 / bulan otomatis membuka fitur E-Surat Digital (barcode verifikasi), tanda terima pembayaran manual kirim ke HP warga, dan ekspor buku kas LPJ Excel/PDF.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">E-Surat Digital</h4>
                <p className="text-[11px] text-slate-300">Pengantar KTP, KK, SKTM, Kematian</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Kas Manual Resi WA</h4>
                <p className="text-[11px] text-slate-300">Kwitansi digital langsung ke HP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">RT Berlangganan Pro</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {activeCount} <span className="text-xs font-semibold text-slate-400">RT Aktif</span>
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            + {trialCount} RT masa Trial 14 hari
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pendapatan Bulanan (MRR)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 mt-2">
            Rp {monthlyRevenue.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Estimasi pendapatan recurring per bulan
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total RT Terdaftar</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {subscribedRts.length} <span className="text-xs font-semibold text-slate-400">Lingkungan</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {subscribedRts.length - activeCount - trialCount} RT paket Basic Gratis
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Status Server Add-On</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-blue-600 mt-2">
            Sinkron DB
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Proteksi E-Surat backend & mobile aktif
          </p>
        </div>
      </div>

      {/* RT Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Daftar Wilayah RT & Kontrol Paket Add-Ons
            </h4>
            <p className="text-xs text-slate-400">Superadmin dapat mengaktifkan paket Pro, memberikan trial, atau menonaktifkan langganan.</p>
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
                <th className="px-4 py-3.5">Status Paket Saat Ini</th>
                <th className="px-4 py-3.5">Masa Berlaku</th>
                <th className="px-4 py-3.5 text-center">Akses E-Surat Mobile</th>
                <th className="px-4 py-3.5 text-center">Aksi Kontrol Superadmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRts.map((r) => {
                const isProActive = r.status === 'AKTIF' || r.status === 'TRIAL';
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
                        r.status === 'AKTIF'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'TRIAL'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {r.status === 'AKTIF' && <Check className="w-3 h-3 text-emerald-600" />}
                        {r.status === 'AKTIF' ? '👑 PRO AKTIF' : r.status === 'TRIAL' ? '⏳ TRIAL PRO' : '🌱 BASIC (GRATIS)'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-600 font-medium">
                      {r.expiredAt ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{new Date(r.expiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Selamanya (Basic)</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`font-bold text-xs ${
                        isProActive ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {isProActive ? '✓ Terbuka Penuh' : '🔒 Terkunci (Basic)'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          disabled={isUpdatingThis}
                          onClick={() => handleUpdateStatus(r.rtId, 'AKTIF', 30, 'Aktifkan Paket RT Pro (30 Hari)')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-bold border border-emerald-200 transition disabled:opacity-50"
                        >
                          +30 Hari Pro
                        </button>

                        <button
                          disabled={isUpdatingThis}
                          onClick={() => handleUpdateStatus(r.rtId, 'TRIAL', 14, 'Berikan Masa Trial Pro (14 Hari)')}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-lg text-[11px] font-bold border border-amber-200 transition disabled:opacity-50"
                        >
                          Trial 14 Hari
                        </button>

                        {isProActive && (
                          <button
                            disabled={isUpdatingThis}
                            onClick={() => handleUpdateStatus(r.rtId, 'TIDAK_AKTIF', 0, 'Kembalikan ke Paket Basic')}
                            className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-[11px] font-bold border border-rose-200 transition disabled:opacity-50"
                            title="Set ke Basic (Nonaktifkan Pro)"
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
