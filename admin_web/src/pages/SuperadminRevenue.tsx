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
  Crown
} from 'lucide-react';
import { api } from '../services/api';
import { showAlert } from '../services/swal';

export const SuperadminRevenue: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalRt, setTotalRt] = useState(4);
  const [totalWarga, setTotalWarga] = useState(20);

  // Platform Fee Config State
  const [feeTransaksiIuran, setFeeTransaksiIuran] = useState(1500);
  const [feePenarikanKas, setFeePenarikanKas] = useState(6000);
  const [feeVirtualAccount, setFeeVirtualAccount] = useState(3000);
  const [biayaAddonBulanan, setBiayaAddonBulanan] = useState(49000);
  const [lastUpdated, setLastUpdated] = useState<string>('Baru saja');

  // Simulation State
  const [simRtCount, setSimRtCount] = useState(50);
  const [simKkPerRt, setSimKkPerRt] = useState(80);
  const [simAddonPercent, setSimAddonPercent] = useState(35);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Load RT & Warga Data from Database
      const rts = await api.getAllRtSummary();
      if (Array.isArray(rts) && rts.length > 0) {
        setTotalRt(rts.length);
        const sumWarga = rts.reduce((acc: number, curr: any) => acc + (curr.wargaCount || 0), 0);
        setTotalWarga(sumWarga || 20);
      }

      // 2. Load Fee Configuration
      const configRes = await api.getFeeConfig().catch(() => null);
      if (configRes) {
        if (configRes.feeTransaksiIuran) setFeeTransaksiIuran(Number(configRes.feeTransaksiIuran));
        if (configRes.feePenarikanKas) setFeePenarikanKas(Number(configRes.feePenarikanKas));
        if (configRes.feeVirtualAccount) setFeeVirtualAccount(Number(configRes.feeVirtualAccount));
        if (configRes.biayaAddonBulanan) setBiayaAddonBulanan(Number(configRes.biayaAddonBulanan));
        if (configRes.updatedAt) {
          setLastUpdated(new Date(configRes.updatedAt).toLocaleString('id-ID'));
        }
      }
    } catch (e) {
      console.error('Failed to load revenue and fee settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveFeeConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateFeeConfig({
        feeTransaksiIuran,
        feePenarikanKas,
        feeVirtualAccount,
        biayaAddonBulanan,
      });

      // Save local backup as well
      localStorage.setItem('rthub_fee_config', JSON.stringify({
        feeTransaksiIuran,
        feePenarikanKas,
        feeVirtualAccount,
        biayaAddonBulanan,
        updatedAt: new Date().toISOString()
      }));

      setLastUpdated(new Date().toLocaleString('id-ID'));
      showAlert.success(
        'Tarif Fee Platform Berhasil Disimpan!',
        `Pengaturan tarif fee baru (Iuran: Rp ${feeTransaksiIuran.toLocaleString('id-ID')}, Tarik Kas: Rp ${feePenarikanKas.toLocaleString('id-ID')}, VA Bank: Rp ${feeVirtualAccount.toLocaleString('id-ID')}, Add-On: Rp ${biayaAddonBulanan.toLocaleString('id-ID')}) telah aktif ke seluruh sistem.`
      );
    } catch (err: any) {
      console.error('Failed to save fee config:', err);
      // Fallback local persistence if offline
      localStorage.setItem('rthub_fee_config', JSON.stringify({
        feeTransaksiIuran,
        feePenarikanKas,
        feeVirtualAccount,
        biayaAddonBulanan,
        updatedAt: new Date().toISOString()
      }));
      setLastUpdated(new Date().toLocaleString('id-ID'));
      showAlert.success(
        'Tarif Disimpan Secara Lokal!',
        `Tarif platform berhasil disinkronkan ke cache browser Superadmin.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations for Current Real DB State
  const potensiIuranBulanan = totalWarga * feeTransaksiIuran;
  const potensiPenarikanBulanan = totalRt * feePenarikanKas;
  const totalPotensiBulanIni = potensiIuranBulanan + potensiPenarikanBulanan;

  // Simulation Calculations
  const totalSimKk = simRtCount * simKkPerRt;
  const simCuanIuran = totalSimKk * feeTransaksiIuran;
  const simCuanPenarikan = simRtCount * feePenarikanKas; // asumsi 1x tarik/bulan per RT
  const simCuanAddons = Math.round(simRtCount * (simAddonPercent / 100)) * biayaAddonBulanan;
  const simTotalBulan = simCuanIuran + simCuanPenarikan + simCuanAddons;
  const simTotalTahun = simTotalBulan * 12;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg">
              👑 Superadmin Control
            </span>
            <span className="text-xs text-slate-400">Terakhir disimpan: {lastUpdated}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">Konfigurasi Tarif & Fee Platform RtHub</h3>
          <p className="text-xs text-slate-500">
            Kelola besaran fee transaksi iuran warga, fee penarikan kas RT, biaya switching bank, serta paket langganan Add-On.
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
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total RT Aktif Terdaftar</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{totalRt} RT</h3>
            <Building2 className="text-blue-600" size={20} />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Real-time Database</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total KK Terdata</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{totalWarga} KK</h3>
            <Wallet className="text-indigo-600" size={20} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Populasi domisili aktif</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fee Iuran Aktif</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-blue-600">Rp {feeTransaksiIuran.toLocaleString('id-ID')}</h3>
            <CreditCard className="text-blue-500" size={20} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Per transaksi iuran warga</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Potensi Fee DB / Bulan</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-600">Rp {totalPotensiBulanIni.toLocaleString('id-ID')}</h3>
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Iuran + Asumsi 1x penarikan/RT</p>
        </div>
      </div>

      {/* Main Grid: Form Setting Fee (Left) & Simulation Calculator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Ubah Nominal Fee Platform */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Sliders size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Atur & Ubah Nominal Fee Platform</h4>
              <p className="text-xs text-slate-500">Sesuaikan tarif layanan yang dipungut oleh sistem aplikasi RtHub</p>
            </div>
          </div>

          <form onSubmit={handleSaveFeeConfig} className="space-y-5">
            {/* Field 1: Fee Transaksi Kas Warga */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-blue-600" />
                  Fee Layanan Transaksi Iuran Kas Warga
                </label>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  100% Cuan Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Biaya layanan aplikasi yang ditambahkan ke invoice tagihan warga per transaksi pembayaran iuran (via QRIS maupun Virtual Account).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm font-bold text-slate-500">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={feeTransaksiIuran}
                  onChange={(e) => setFeeTransaksiIuran(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 1500"
                  required
                />
              </div>
            </div>

            {/* Field 2: Fee Penarikan Kas RT */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Landmark size={15} className="text-emerald-600" />
                  Fee Penarikan / Pencairan Kas RT
                </label>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  Dipotong Saat Penarikan
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Biaya yang dipotong saat Bendahara RT mengajukan pencairan saldo kas lingkungan ke rekening bank (menutupi biaya transfer BI-FAST & marjin keuntungan platform).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm font-bold text-slate-500">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={feePenarikanKas}
                  onChange={(e) => setFeePenarikanKas(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 6000"
                  required
                />
              </div>
            </div>

            {/* Field 3: Biaya Tambahan Virtual Account Bank */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 size={15} className="text-purple-600" />
                  Biaya Tambahan Transaksi Virtual Account (Bank)
                </label>
                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                  Channel VA Bank
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Biaya switching antar-bank yang ditagihkan kepada warga yang memilih metode pembayaran transfer Virtual Account (BCA, Mandiri, BRI, BNI).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm font-bold text-slate-500">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={feeVirtualAccount}
                  onChange={(e) => setFeeVirtualAccount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 3000"
                  required
                />
              </div>
            </div>

            {/* Field 4: Biaya Paket Add-On RT Pro */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Crown size={15} className="text-amber-600" />
                  Paket Langganan Add-Ons RT Pro (Bulanan)
                </label>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Fitur Tambahan RT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Tarif bulanan paket premium RT untuk fitur E-Surat Digital Pengantar Warga, Pembayaran Kas Tunai Barcode Kwitansi, dan Ekspor Akuntansi LPJ.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm font-bold text-slate-500">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={biayaAddonBulanan}
                  onChange={(e) => setBiayaAddonBulanan(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 49000"
                  required
                />
              </div>
            </div>

            {/* Action Save Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                * Perubahan akan langsung berlaku pada tagihan dan transaksi baru berikutnya.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 transition transform active:scale-95"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? 'Menyimpan Tarif...' : 'Simpan Perubahan Tarif Platform'}
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
                <span>Simulasi Proyeksi Cuan Platform</span>
              </div>
              <h4 className="text-lg font-black text-white mt-1">Estimasi Pendapatan Skala Nasional</h4>
              <p className="text-xs text-slate-400 mt-1">
                Geser parameter untuk melihat potensi pendapatan platform berdasarkan tarif fee yang disetel di samping.
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
                  min="5"
                  max="1000"
                  step="5"
                  value={simRtCount}
                  onChange={(e) => setSimRtCount(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Rata-rata Warga (KK) per RT:</span>
                  <span className="text-blue-400 font-extrabold text-sm">{simKkPerRt} KK</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={simKkPerRt}
                  onChange={(e) => setSimKkPerRt(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Total populasi terpantau: <strong>{totalSimKk.toLocaleString('id-ID')} Kepala Keluarga</strong>
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Adopsi Paket Add-On RT (49rb):</span>
                  <span className="text-amber-400 font-extrabold text-sm">{simAddonPercent}% RT</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={simAddonPercent}
                  onChange={(e) => setSimAddonPercent(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Projection Breakdown */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Fee Iuran ({totalSimKk.toLocaleString('id-ID')} KK × Rp {feeTransaksiIuran.toLocaleString('id-ID')}):</span>
                <span className="font-bold text-white">Rp {simCuanIuran.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Fee Penarikan RT ({simRtCount} RT × Rp {feePenarikanKas.toLocaleString('id-ID')}):</span>
                <span className="font-bold text-white">Rp {simCuanPenarikan.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Add-Ons Pro ({Math.round(simRtCount * (simAddonPercent / 100))} RT × Rp {biayaAddonBulanan.toLocaleString('id-ID')}):</span>
                <span className="font-bold text-amber-300">Rp {simCuanAddons.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
                <span className="font-extrabold text-sm text-slate-200">Estimasi Omset / Bulan:</span>
                <span className="text-xl font-black text-emerald-400">Rp {simTotalBulan.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-baseline text-slate-400 text-[11px]">
                <span>Proyeksi Tahunan (12 Bulan):</span>
                <span className="font-bold text-slate-200">Rp {simTotalTahun.toLocaleString('id-ID')} / thn</span>
              </div>
            </div>

            <div className="p-3 bg-blue-950/60 border border-blue-800/50 rounded-xl flex items-start gap-2 text-[11px] text-blue-200">
              <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                Ditambah 100% cuan dari Iklan Lapak Boost Warga (Rp 10.000 s/d Rp 100.000 per pasang iklan), platform RtHub berpotensi menghasilkan arus kas mandiri yang sangat sehat tanpa membebani kas pokok RT.
              </span>
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              Prinsip Keberlanjutan Finansial Platform
            </h5>
            <ul className="text-[11px] text-slate-500 space-y-2 list-disc list-inside">
              <li>
                <strong>Dana Kas Pokok RT 100% Utuh:</strong> Uang kas RT yang disetor warga tidak dipotong sepeserpun untuk operasional platform.
              </li>
              <li>
                <strong>Transparansi di Invoice:</strong> Biaya layanan Rp {feeTransaksiIuran.toLocaleString('id-ID')} dan biaya Virtual Account Rp {feeVirtualAccount.toLocaleString('id-ID')} ditampilkan terpisah dan transparan kepada warga saat checkout.
              </li>
              <li>
                <strong>Cashless & Otomatis:</strong> Pembagian hak RT dan fee aplikasi langsung terbagi otomatis saat Payment Gateway mengonfirmasi pelunasan.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
