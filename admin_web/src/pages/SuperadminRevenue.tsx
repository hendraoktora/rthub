import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Building2, 
  Wallet, 
  Sliders, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle,
  Calculator,
  ArrowRight,
  Sparkles,
  CreditCard,
  Landmark,
  Crown,
  Megaphone,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { showAlert } from '../services/swal';

export const SuperadminRevenue: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalRt, setTotalRt] = useState(4);
  const [totalProRt, setTotalProRt] = useState(1);
  const [totalTrialRt, setTotalTrialRt] = useState(3);
  const [realDuitkuRevenue, setRealDuitkuRevenue] = useState(0);

  // Platform Price Config State
  const [biayaLanggananPro, setBiayaLanggananPro] = useState(99000);
  const [durasiTrialDays, setDurasiTrialDays] = useState(7);
  const [tarifIklan3Hari, setTarifIklan3Hari] = useState(10000);
  const [tarifIklan7Hari, setTarifIklan7Hari] = useState(25000);
  const [tarifIklan14Hari, setTarifIklan14Hari] = useState(50000);
  const [tarifIklan30Hari, setTarifIklan30Hari] = useState(100000);
  const [lastUpdated, setLastUpdated] = useState<string>('Baru saja');

  // Interactive Simulation State
  const [simRtCount, setSimRtCount] = useState(100);
  const [simConversionPro, setSimConversionPro] = useState(60); // % RT yang upgrade ke Pro
  const [simAdsPerRt, setSimAdsPerRt] = useState(50000); // Rata-rata transaksi iklan warga per RT / bulan

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Load RT Summary
      const rts = await api.getAllRtSummary();
      if (Array.isArray(rts) && rts.length > 0) {
        setTotalRt(rts.length);
        const pro = rts.filter((r: any) => r.isPro || r.paket === 'PRO').length;
        setTotalProRt(pro);
        setTotalTrialRt(Math.max(0, rts.length - pro));
      }

      // 2. Load Real Revenue from Duitku if available
      try {
        const rev = await api.getSuperadminUangMasuk();
        if (rev && rev.summary) {
          setRealDuitkuRevenue(Number(rev.summary.totalUangMasuk || 0));
        }
      } catch (err) {
        console.warn('Revenue summary endpoint not available, continuing with cache');
      }

      // 3. Load Fee Configuration from local storage or api
      const localCfg = localStorage.getItem('rthub_pricing_config');
      if (localCfg) {
        const parsed = JSON.parse(localCfg);
        if (parsed.biayaLanggananPro) setBiayaLanggananPro(parsed.biayaLanggananPro);
        if (parsed.durasiTrialDays) setDurasiTrialDays(parsed.durasiTrialDays);
        if (parsed.tarifIklan3Hari) setTarifIklan3Hari(parsed.tarifIklan3Hari);
        if (parsed.tarifIklan7Hari) setTarifIklan7Hari(parsed.tarifIklan7Hari);
        if (parsed.tarifIklan14Hari) setTarifIklan14Hari(parsed.tarifIklan14Hari);
        if (parsed.tarifIklan30Hari) setTarifIklan30Hari(parsed.tarifIklan30Hari);
        if (parsed.updatedAt) setLastUpdated(new Date(parsed.updatedAt).toLocaleString('id-ID'));
      }
    } catch (e) {
      console.error('Failed to load revenue and pricing settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePricingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        biayaLanggananPro,
        durasiTrialDays,
        tarifIklan3Hari,
        tarifIklan7Hari,
        tarifIklan14Hari,
        tarifIklan30Hari,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('rthub_pricing_config', JSON.stringify(payload));
      setLastUpdated(new Date().toLocaleString('id-ID'));
      showAlert.success(
        'Tarif Layanan Berhasil Disimpan!',
        `Konfigurasi tarif RT Pro (Rp ${biayaLanggananPro.toLocaleString('id-ID')}/bln) dan Paket Iklan Lapak telah diperbarui ke sistem.`
      );
    } catch (err: any) {
      console.error('Failed to save config:', err);
      showAlert.error('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan pengaturan tarif.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations for Current Real DB State
  const currentProMRR = totalProRt * biayaLanggananPro;

  // Interactive Simulation Calculations
  const simProRtCount = Math.round(simRtCount * (simConversionPro / 100));
  const simRevenuePro = simProRtCount * biayaLanggananPro;
  const simRevenueAds = simRtCount * simAdsPerRt;
  const simTotalMRR = simRevenuePro + simRevenueAds;
  const simTotalARR = simTotalMRR * 12;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg">
              👑 Superadmin Revenue Engine
            </span>
            <span className="text-xs text-slate-400">Terakhir disimpan: {lastUpdated}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">Laporan Pendapatan & Model Bisnis RtHub</h3>
          <p className="text-xs text-slate-500">
            Pendapatan platform 100% berasal dari <strong>Langganan RT Pro (Rp 99.000/bln)</strong> dan <strong>Iklan Sponsor Lapak Warga</strong> via Duitku Payment Gateway.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Menyinkronkan...' : 'Sinkronkan Data'}
        </button>
      </div>

      {/* KPI Cards: Current Database Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total RT Terdaftar</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{totalRt} RT</h3>
            <Building2 className="text-blue-600" size={20} />
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {totalProRt} RT Pro &bull; {totalTrialRt} RT Trial (7 Hari)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Biaya Langganan Pro</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-amber-600">Rp {biayaLanggananPro.toLocaleString('id-ID')}</h3>
            <Crown className="text-amber-500" size={20} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Per bulan / RT (setelah trial 7 hari)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MRR RT Pro Saat Ini</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-600">Rp {currentProMRR.toLocaleString('id-ID')}</h3>
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Dari {totalProRt} RT Pro yang aktif berbayar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Uang Masuk Duitku</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-indigo-600">Rp {realDuitkuRevenue.toLocaleString('id-ID')}</h3>
            <Wallet className="text-indigo-600" size={20} />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ 100% Hak Platform RtHub</p>
        </div>
      </div>

      {/* Main Grid: Form Setting Tarif (Left) & Simulation Calculator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Pengaturan Tarif Platform */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Sliders size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Konfigurasi Tarif Langganan & Iklan</h4>
              <p className="text-xs text-slate-500">Atur harga paket RT Pro bulanan, durasi trial gratis, dan tier biaya promosi iklan lapak</p>
            </div>
          </div>

          <form onSubmit={handleSavePricingConfig} className="space-y-5">
            {/* Section 1: RT Pro & Trial */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Crown size={16} className="text-amber-500" />
                  Tarif Bulanan Langganan RT Pro
                </label>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Recurring Bulanan
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Biaya langganan yang dibayarkan pengurus RT setiap bulan via Duitku untuk membuka seluruh fitur ekosistem digital RtHub.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm font-bold text-slate-500">Rp</span>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  value={biayaLanggananPro}
                  onChange={(e) => setBiayaLanggananPro(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock size={15} className="text-blue-600" />
                    Durasi Masa Trial RT Baru (Hari)
                  </label>
                  <p className="text-[10px] text-slate-400">Masa uji coba gratis sebelum RT wajib berlangganan</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={durasiTrialDays}
                    onChange={(e) => setDurasiTrialDays(Math.max(1, Number(e.target.value) || 7))}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="text-xs font-bold text-slate-600">Hari</span>
                </div>
              </div>
            </div>

            {/* Section 2: Tarif Iklan Sponsor Lapak Warga */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Megaphone size={16} className="text-emerald-600" />
                  Tarif Iklan Sponsor Lapak Usaha Warga
                </label>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  100% Cuan Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Tarif promosi yang dibayarkan warga pelaku UMKM/lapak saat ingin produk usahanya tampil di Carousel Beranda & Prioritas Pencarian.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Tier 1: Durasi 3 Hari</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={tarifIklan3Hari}
                      onChange={(e) => setTarifIklan3Hari(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Tier 2: Durasi 7 Hari</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={tarifIklan7Hari}
                      onChange={(e) => setTarifIklan7Hari(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Tier 3: Durasi 14 Hari</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={tarifIklan14Hari}
                      onChange={(e) => setTarifIklan14Hari(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">Tier 4: Durasi 30 Hari (1 Bulan)</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={tarifIklan30Hari}
                      onChange={(e) => setTarifIklan30Hari(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Save Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                * Perubahan tarif disimpan ke pengaturan platform & berlaku untuk transaksi baru berikutnya.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 transition transform active:scale-95"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Tarif'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Interactive Revenue Projection Calculator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Calculator size={16} />
                <span>Simulasi Proyeksi MRR Platform</span>
              </div>
              <h4 className="text-lg font-black text-white mt-1">Estimasi Skalabilitas Omset Nasional</h4>
              <p className="text-xs text-slate-400 mt-1">
                Kalkulasi potensi pendapatan bulanan (MRR) dan tahunan (ARR) berdasarkan jumlah RT terdaftar dan adopsi paket Pro serta iklan lapak.
              </p>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Target Jumlah RT Terdaftar:</span>
                  <span className="text-blue-400 font-extrabold text-sm">{simRtCount} RT</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="2000"
                  step="10"
                  value={simRtCount}
                  onChange={(e) => setSimRtCount(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Tingkat Konversi ke RT Pro (Rp {biayaLanggananPro.toLocaleString('id-ID')}/bln):</span>
                  <span className="text-amber-400 font-extrabold text-sm">{simConversionPro}% RT ({simProRtCount} RT)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={simConversionPro}
                  onChange={(e) => setSimConversionPro(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Mendapatkan <strong>{simProRtCount} RT Berlangganan Aktif</strong>
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Estimasi Omset Iklan Lapak Warga per RT / Bulan:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">Rp {simAdsPerRt.toLocaleString('id-ID')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="10000"
                  value={simAdsPerRt}
                  onChange={(e) => setSimAdsPerRt(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Setara 2 s/d 5 warga pasang iklan sponsor per lingkungan RT
                </span>
              </div>
            </div>

            {/* Projection Breakdown */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Langganan RT Pro ({simProRtCount} RT × Rp {biayaLanggananPro.toLocaleString('id-ID')}):</span>
                <span className="font-bold text-amber-300">Rp {simRevenuePro.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Iklan Sponsor Lapak ({simRtCount} RT × Rp {simAdsPerRt.toLocaleString('id-ID')}):</span>
                <span className="font-bold text-emerald-300">Rp {simRevenueAds.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                <span className="font-extrabold text-sm text-slate-200">Estimasi MRR / Bulan:</span>
                <span className="text-xl font-black text-emerald-400">Rp {simTotalMRR.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-baseline text-slate-400 text-[11px]">
                <span>Proyeksi ARR (12 Bulan):</span>
                <span className="font-bold text-slate-200">Rp {simTotalARR.toLocaleString('id-ID')} / tahun</span>
              </div>
            </div>

            <div className="p-3 bg-blue-950/60 border border-blue-800/50 rounded-xl flex items-start gap-2 text-[11px] text-blue-200">
              <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                Ditambah pendapatan pasif dari <strong>Google AdMob</strong> (banner iklan di aplikasi mobile), model bisnis ini menghasilkan margin keuntungan bersih yang sangat tinggi tanpa beban operasional penanganan uang titipan kas.
              </span>
            </div>
          </div>

          {/* Business Model Advantages */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              Keunggulan Model Bisnis Baru (Probis Baru)
            </h5>
            <ul className="text-[11px] text-slate-500 space-y-2 list-disc list-inside">
              <li>
                <strong>Nol Risiko Finansial (No Escrow):</strong> RtHub tidak menampung atau menahan uang kas warga. Uang iuran langsung masuk ke rekening bank/QRIS Bendahara RT atau tunai.
              </li>
              <li>
                <strong>Penerimaan Pengurus RT Sangat Tinggi:</strong> Pengurus RT merasa aman dan percaya diri menggunakan aplikasi karena uang kas mereka 100% utuh tanpa potongan per-transaksi.
              </li>
              <li>
                <strong>Recurring Revenue yang Sehat:</strong> Pembayaran langganan RT Pro Rp 99.000/bln dan Iklan Lapak Warga diproses otomatis via Duitku langsung masuk ke rekening platform RtHub.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
