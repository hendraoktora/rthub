import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Wallet, 
  Crown, 
  TrendingUp, 
  RefreshCw, 
  Home, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ArrowDownLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { api } from '../services/api';

interface RTOverviewItem {
  id: string;
  nomor: string;
  namaJalan: string;
  rwNomor: string;
  kelurahanNama: string;
  kota: string;
  label: string;
  wargaCount: number;
  rumahCount: number;
  ketua: string;
  phone: string;
  saldoKas: number;
  paket?: 'BASIC' | 'PRO';
  isPro?: boolean;
}

interface SuperadminOverviewProps {
  onNavigateTab?: (tab: string) => void;
}

export const SuperadminOverview: React.FC<SuperadminOverviewProps> = ({ onNavigateTab }) => {
  const [rts, setRts] = useState<RTOverviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllRtSummary();
      if (Array.isArray(data) && data.length > 0) {
        setRts(data);
      }
    } catch (e) {
      console.error('Failed to load overview data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Aggregated KPI Metrics
  const totalRt = rts.length;
  const totalWarga = rts.reduce((sum, r) => sum + (Number(r.wargaCount) || 0), 0);
  const totalKk = rts.reduce((sum, r) => sum + (Number(r.rumahCount) || 1), 0);
  const totalKas = rts.reduce((sum, r) => sum + (Number(r.saldoKas) || 0), 0);
  const proRts = rts.filter((r) => r.isPro || r.paket === 'PRO');
  const totalPro = proRts.length;
  const totalBasic = totalRt - totalPro;
  const mrrAddons = totalPro * 49000;

  // Max values for chart scaling
  const maxWarga = Math.max(...rts.map(r => r.wargaCount), 1);
  const maxKas = Math.max(...rts.map(r => r.saldoKas), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-400/30">
            <Sparkles size={14} className="text-amber-400" />
            <span>Platform Executive Overview (Nasional)</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Dashboard Demografi & Ekosistem Wilayah
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Monitoring terpusat jumlah RT, total warga & kartu keluarga (KK), perputaran kas lingkungan, dan adopsi paket Add-Ons RT Pro.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          disabled={isLoading}
          className="self-start md:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Menyinkronkan...' : 'Sinkronkan Data DB'}
        </button>
      </div>

      {/* 5 Main Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total RT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wilayah RT</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{totalRt}</span>
            <span className="text-xs text-slate-400 ml-1 font-semibold">Unit RT</span>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> 100% Aktif Beroperasi
            </p>
          </div>
        </div>

        {/* 2. Total Kepala Keluarga (KK) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kepala Keluarga (KK)</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Home size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{totalKk}</span>
            <span className="text-xs text-slate-400 ml-1 font-semibold">KK / Rumah</span>
            <p className="text-[11px] text-indigo-600 font-bold mt-1">
              Rata-rata {totalRt > 0 ? (totalKk / totalRt).toFixed(1) : 0} KK / RT
            </p>
          </div>
        </div>

        {/* 3. Total Warga (Jiwa) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jiwa Warga</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{totalWarga}</span>
            <span className="text-xs text-slate-400 ml-1 font-semibold">Jiwa Terdaftar</span>
            <p className="text-[11px] text-purple-600 font-bold mt-1">
              {totalKk > 0 ? (totalWarga / totalKk).toFixed(1) : 0} Jiwa / KK
            </p>
          </div>
        </div>

        {/* 4. Total Saldo Kas RT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kas Ekosistem RT</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-emerald-600 truncate block">
              Rp {totalKas.toLocaleString('id-ID')}
            </span>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Akumulasi Kas Seluruh RT
            </p>
          </div>
        </div>

        {/* 5. MRR Paket RT Pro Add-Ons */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add-Ons Pro (MRR)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Crown size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-amber-600 truncate block">
              Rp {mrrAddons.toLocaleString('id-ID')}
            </span>
            <p className="text-[11px] text-amber-700 font-bold mt-1">
              {totalPro} RT Pro ({totalBasic} RT Basic)
            </p>
          </div>
        </div>
      </div>

      {/* Main Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distribusi Demografi per Wilayah RT (Jiwa Warga & KK) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                Distribusi Penduduk per Wilayah RT
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Perbandingan Jiwa Warga terdaftar vs Jumlah Unit Rumah / KK</p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {totalRt} Lingkungan
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {rts.map((rt) => {
              const wargaPct = Math.round((rt.wargaCount / maxWarga) * 100);
              const kkCount = rt.rumahCount || 1;
              return (
                <div key={rt.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800">{rt.label}</span>
                    <span className="text-slate-500 font-semibold">
                      <strong className="text-blue-600">{rt.wargaCount}</strong> Jiwa &bull; <strong className="text-indigo-600">{kkCount}</strong> KK
                    </span>
                  </div>
                  {/* Stacked Visual Bar */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(wargaPct, 15)}%` }}
                      title={`Warga: ${rt.wargaCount} Jiwa`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>📍 {rt.namaJalan}</span>
                    <span>Ketua: {rt.ketua}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Komposisi Paket Langganan RT (Basic Free vs Pro Add-Ons) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Crown size={16} className="text-amber-500" />
                  Adopsi Paket Langganan Ekosistem RT
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Komposisi paket RT Basic (Rp 0) vs Paket RT Pro Add-Ons (Rp 49.000/bln)</p>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                Rp 49.000 / bln
              </span>
            </div>

            {/* Visual Ratio Progress */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-700">👑 RT Pro: {totalPro} RT ({totalRt > 0 ? Math.round((totalPro / totalRt) * 100) : 0}%)</span>
                <span className="text-slate-600">🌱 RT Basic: {totalBasic} RT ({totalRt > 0 ? Math.round((totalBasic / totalRt) * 100) : 0}%)</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-500" 
                  style={{ width: `${totalRt > 0 ? (totalPro / totalRt) * 100 : 0}%` }}
                />
                <div 
                  className="bg-slate-300 h-full transition-all duration-500" 
                  style={{ width: `${totalRt > 0 ? (totalBasic / totalRt) * 100 : 100}%` }}
                />
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Paket RT Pro (Add-Ons)</span>
                <p className="text-lg font-black text-amber-900">{totalPro} RT</p>
                <p className="text-[11px] text-amber-700">E-Surat Digital, Kas Manual Cetak Resi, LPJ Excel</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Paket RT Basic (Free)</span>
                <p className="text-lg font-black text-slate-800">{totalBasic} RT</p>
                <p className="text-[11px] text-slate-500">Iuran Online, Kas Digital, Panic Alert, Aduan Lingkungan</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Kelola status aktivasi dan perpanjangan paket RT</span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('addons_rt')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Buka Menu Add-Ons</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Analytics: Perbandingan Saldo Kas & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saldo Kas RT Comparison */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                Peringkat & Keseimbangan Saldo Kas Lingkungan RT
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Total kas mengendap yang dikelola bendahara per masing-masing wilayah RT</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-600">
              Total Rp {totalKas.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {rts.map((rt) => {
              const kasPct = Math.round((rt.saldoKas / maxKas) * 100);
              return (
                <div key={rt.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{rt.label}</span>
                    <span className="font-extrabold text-emerald-600">
                      Rp {rt.saldoKas.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(kasPct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Navigation Cards for Superadmin */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-600" />
              Akses Cepat Pengelolaan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Navigasi langsung ke modul kontrol Superadmin</p>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => onNavigateTab && onNavigateTab('superadmin_rt')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                    Tabel Wilayah RT (List View)
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('uang_masuk')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowDownLeft size={16} className="text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    Arus Uang Masuk (Payment Gateway)
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('approval_penarikan')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt size={16} className="text-purple-600" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                    Approval Penarikan Kas RT
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('addons_rt')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Crown size={16} className="text-amber-600" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700">
                    Paket Add-Ons Ekosistem RT
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 flex items-center gap-2.5 text-[11px] text-blue-800 font-semibold mt-4">
            <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
            <span>Sistem sinkron real-time dengan server database MySQL & Payment Gateway.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
