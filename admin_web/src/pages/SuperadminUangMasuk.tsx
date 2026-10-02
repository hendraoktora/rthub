import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  Wallet, 
  Crown, 
  Megaphone, 
  CreditCard, 
  QrCode, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface TransactionItem {
  id: string;
  waktu: string;
  wilayah: string;
  tipe: string;
  pembayar: string;
  metode: string;
  nominalPokok: number;
  feePlatform: number;
  feeBankVa: number;
  totalBayar: number;
  status: string;
}

interface SummaryData {
  totalBruto: number;
  totalPendapatanPlatform: number;
  totalLanggananPro: number;
  totalIklanSponsor: number;
  totalTransaksi: number;
}

export const SuperadminUangMasuk: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalBruto: 0,
    totalPendapatanPlatform: 0,
    totalLanggananPro: 0,
    totalIklanSponsor: 0,
    totalTransaksi: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipe, setFilterTipe] = useState('SEMUA');
  const [filterMetode, setFilterMetode] = useState('SEMUA');
  const [gatewayInfo, setGatewayInfo] = useState<any>({
    provider: 'Duitku',
    configured: false,
    environment: 'sandbox',
    merchantCode: 'DS35894',
    callbackUrl: 'https://api.rthub.id/api/payment/duitku/callback',
    returnUrl: 'https://rthub.id/payment-success',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/kas/superadmin/uang-masuk');
      if (res && Array.isArray(res.transactions)) {
        setTransactions(res.transactions);
        const totalPro = res.summary?.totalLanggananPro || res.transactions
          .filter((t: any) => t.tipe?.includes('Langganan') || t.tipe?.includes('Pro'))
          .reduce((acc: number, t: any) => acc + (t.totalBayar || t.feePlatform || 0), 0);
        const totalAds = res.summary?.totalIklanSponsor || res.transactions
          .filter((t: any) => t.tipe?.includes('Iklan'))
          .reduce((acc: number, t: any) => acc + (t.totalBayar || t.feePlatform || 0), 0);
        const totalNet = res.summary?.totalPendapatanPlatform || (totalPro + totalAds);

        setSummary({
          totalBruto: totalNet,
          totalPendapatanPlatform: totalNet,
          totalLanggananPro: totalPro,
          totalIklanSponsor: totalAds,
          totalTransaksi: res.summary?.totalTransaksi || res.transactions.length,
        });
        if (res.gatewayInfo) setGatewayInfo(res.gatewayInfo);
      }
    } catch {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchQuery =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.pembayar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tipe.toLowerCase().includes(searchQuery.toLowerCase());

    const matchTipe =
      filterTipe === 'SEMUA' ||
      (filterTipe === 'LANGGANAN' && (t.tipe.includes('Langganan') || t.tipe.includes('Pro'))) ||
      (filterTipe === 'IKLAN' && t.tipe.includes('Iklan'));

    const matchMetode =
      filterMetode === 'SEMUA' ||
      (filterMetode === 'QRIS' && t.metode.includes('QRIS')) ||
      (filterMetode === 'VA' && t.metode.includes('VA'));

    return matchQuery && matchTipe && matchMetode;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            Arus Kas Pendapatan Platform (Duitku Gateway)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring pemasukan murni 100% milik platform RtHub dari langganan RT Pro (Rp 99.000/bln) dan iklan sponsor lapak warga.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Payment Gateway Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Payment Gateway: Duitku Indonesia</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                LIVE PRODUCTION / ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Merchant Code: <span className="font-mono font-semibold text-slate-700">{gatewayInfo.merchantCode}</span> • Webhook Endpoint: <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">{gatewayInfo.callbackUrl}</code>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => {
              navigator.clipboard.writeText(gatewayInfo.callbackUrl);
              alert('Callback URL Webhook Duitku berhasil disalin ke clipboard!');
            }}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5"
          >
            Salin Webhook URL
          </button>
        </div>
      </div>

      {/* Probis Baru Info Notice */}
      <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold">Model Bisnis Baru (Kemandirian Finansial RT & Monetisasi Platform):</span>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            Platform RtHub <b>tidak menampung dana iuran warga</b>. Warga membayar iuran langsung ke rekening bank atau QRIS bendahara RT masing-masing. Seluruh dana yang masuk ke payment gateway di bawah adalah <b>100% hak platform RtHub</b> yang berasal dari paket langganan bulanan RT Pro (Rp 99.000/bln) dan biaya promosi iklan lapak warga.
          </p>
        </div>
      </div>

      {/* KPI Cards (Probis Baru) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendapatan Bersih Platform */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Total Pendapatan Platform</span>
            <div className="p-2 bg-white/10 text-white rounded-xl backdrop-blur-sm">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-2">
            Rp {summary.totalPendapatanPlatform.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-emerald-100 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            100% Cuan Bersih Masuk ke Duitku
          </p>
        </div>

        {/* Pendapatan Langganan RT Pro */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Langganan RT Pro (99rb)</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-indigo-600 mt-2">
            Rp {summary.totalLanggananPro.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Paket bulanan fitur lengkap per RT
          </p>
        </div>

        {/* Pendapatan Iklan Sponsor Lapak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Iklan Sponsor Lapak</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-purple-600 mt-2">
            Rp {summary.totalIklanSponsor.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Promosi produk warga di etalase & carousel
          </p>
        </div>

        {/* Total Transaksi Sukses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transaksi Selesai</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {summary.totalTransaksi} <span className="text-xs font-semibold text-slate-400">Transaksi</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Berhasil diselesaikan via QRIS / VA Duitku
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ID, pembayar, atau RT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Sumber:</span>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="SEMUA">Semua Sumber</option>
              <option value="LANGGANAN">Langganan RT Pro</option>
              <option value="IKLAN">Iklan Sponsor Lapak</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Metode:</span>
            <select
              value={filterMetode}
              onChange={(e) => setFilterMetode(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="SEMUA">Semua Saluran</option>
              <option value="QRIS">QRIS</option>
              <option value="VA">Virtual Account</option>
            </select>
          </div>

          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["ID,Waktu,Wilayah,Sumber,Pembayar,Metode,Nominal,Status"]
                .concat(filteredTransactions.map(t => `"${t.id}","${t.waktu}","${t.wilayah}","${t.tipe}","${t.pembayar}","${t.metode}",${t.totalBayar},"${t.status}"`))
                .join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `arus_kas_pendapatan_rthub_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5 ml-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Transactions Table (Probis Baru) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rincian Transaksi Pendapatan Platform (Duitku)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Menampilkan {filteredTransactions.length} dari total {transactions.length} transaksi pendapatan
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200/70 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-3.5">ID Order & Waktu</th>
                <th className="px-4 py-3.5">Wilayah RT</th>
                <th className="px-4 py-3.5">Sumber Pendapatan</th>
                <th className="px-4 py-3.5">Pembayar</th>
                <th className="px-4 py-3.5">Saluran Pembayaran</th>
                <th className="px-4 py-3.5 text-right">Pendapatan Platform</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Tidak ada transaksi pendapatan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const dateObj = new Date(tx.waktu);
                  const formattedTime = dateObj.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const isSubscription = tx.tipe.includes('Langganan') || tx.tipe.includes('Pro');

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-800 text-[11px]">{tx.id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formattedTime} WIB
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{tx.wilayah}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          isSubscription
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {isSubscription ? <Crown className="w-3 h-3" /> : <Megaphone className="w-3 h-3" />}
                          {tx.tipe}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">{tx.pembayar}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {tx.metode.includes('QRIS') ? (
                            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {tx.metode}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-black text-emerald-600 text-sm">
                          +Rp {tx.totalBayar.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
