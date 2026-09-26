import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  QrCode, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck,
  RefreshCw
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
  totalHakKasRt: number;
  totalCuanPlatform: number;
  totalFeeBankVa: number;
  totalTransaksi: number;
}

export const SuperadminUangMasuk: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalBruto: 0,
    totalHakKasRt: 0,
    totalCuanPlatform: 0,
    totalFeeBankVa: 0,
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
    merchantCode: 'Belum diatur',
    callbackUrl: 'https://api.rthub.id/api/payment/duitku/callback',
    returnUrl: 'https://rthub.id/payment-success',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/kas/superadmin/uang-masuk');
      if (res && Array.isArray(res.transactions)) {
        setTransactions(res.transactions);
        setSummary(res.summary || {
          totalBruto: 0,
          totalHakKasRt: 0,
          totalCuanPlatform: 0,
          totalFeeBankVa: 0,
          totalTransaksi: 0,
        });
        if (res.gatewayInfo) setGatewayInfo(res.gatewayInfo);
      } else {
        setTransactions([]);
        setSummary({
          totalBruto: 0,
          totalHakKasRt: 0,
          totalCuanPlatform: 0,
          totalFeeBankVa: 0,
          totalTransaksi: 0,
        });
      }
    } catch {
      setTransactions([]);
      setSummary({
        totalBruto: 0,
        totalHakKasRt: 0,
        totalCuanPlatform: 0,
        totalFeeBankVa: 0,
        totalTransaksi: 0,
      });
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
      (filterTipe === 'IURAN' && t.tipe.includes('Iuran')) ||
      (filterTipe === 'IKLAN' && t.tipe.includes('Iklan'));

    const matchMetode =
      filterMetode === 'SEMUA' ||
      (filterMetode === 'QRIS' && t.metode === 'QRIS') ||
      (filterMetode === 'VA' && t.metode.startsWith('VA_')) ||
      (filterMetode === 'CASH' && t.metode === 'CASH');

    return matchQuery && matchTipe && matchMetode;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Monitoring Arus Uang Masuk Platform (Payment Gateway)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan realtime seluruh transaksi masuk dari iuran warga dan boost iklan lapak se-Indonesia beserta rincian pembagian fee.
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
          <div className={`p-2.5 rounded-xl ${gatewayInfo.configured ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Payment Gateway: Duitku</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                gatewayInfo.configured
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {gatewayInfo.configured ? `TERHUBUNG (${gatewayInfo.environment.toUpperCase()})` : 'MODE SANDBOX / SIMULASI'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Merchant Code: <span className="font-mono font-semibold text-slate-700">{gatewayInfo.merchantCode}</span> • Webhook: <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">{gatewayInfo.callbackUrl}</code>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => {
              navigator.clipboard.writeText(gatewayInfo.callbackUrl);
              alert('Callback URL Webhook berhasil disalin ke clipboard!');
            }}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5"
          >
            Salin Webhook URL
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Uang Masuk Bruto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uang Masuk Bruto (PG)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            Rp {summary.totalBruto.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Total dana masuk ke akun Duitku/Midtrans
          </p>
        </div>

        {/* Hak Kas RT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hak Kas RT (Titipan)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-blue-600 mt-2">
            Rp {summary.totalHakKasRt.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Dana iuran pokok milik RT yang dapat ditarik
          </p>
        </div>

        {/* Cuan Bersih Platform RTHub */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Cuan Platform RTHub</span>
            <div className="p-2 bg-white/10 text-white rounded-xl backdrop-blur-sm">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-2">
            Rp {summary.totalCuanPlatform.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-emerald-100 mt-1">
            Fee Iuran (Rp 1.500/trx) + 100% Iklan Lapak
          </p>
        </div>

        {/* Biaya Switching Bank / VA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Biaya Channel Bank (VA)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mt-2">
            Rp {summary.totalFeeBankVa.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Rp 3.000 / transaksi VA ke mitra switching
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ID, nama pembayar, atau RT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="SEMUA">Semua Kategori</option>
              <option value="IURAN">Iuran Warga</option>
              <option value="IKLAN">Iklan Lapak</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterMetode}
              onChange={(e) => setFilterMetode(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="SEMUA">Semua Metode</option>
              <option value="QRIS">QRIS</option>
              <option value="VA">Virtual Account</option>
              <option value="CASH">Tunai / Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">
            Rincian Log Transaksi Uang Masuk ({filteredTransactions.length} Transaksi)
          </h4>
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Status: Realtime Settlement
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">ID & Waktu</th>
                <th className="px-4 py-3.5">Wilayah & Pembayar</th>
                <th className="px-4 py-3.5">Peruntukan</th>
                <th className="px-4 py-3.5">Metode</th>
                <th className="px-4 py-3.5 text-right">Hak Kas RT</th>
                <th className="px-4 py-3.5 text-right font-bold text-emerald-600">Fee RTHub</th>
                <th className="px-4 py-3.5 text-right">Fee VA</th>
                <th className="px-4 py-3.5 text-right font-black text-slate-900">Total Bayar</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const dateObj = new Date(tx.waktu);
                  const formattedTime = dateObj.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

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
                        <div className="text-[11px] text-slate-500 mt-0.5">{tx.pembayar}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          tx.tipe.includes('Iklan')
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {tx.tipe}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          {tx.metode === 'QRIS' ? (
                            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {tx.metode}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-medium">
                        Rp {tx.nominalPokok.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-emerald-600">
                        +Rp {tx.feePlatform.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-4 text-right text-slate-400">
                        {tx.feeBankVa > 0 ? `Rp ${tx.feeBankVa.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-4 py-4 text-right font-black text-slate-900">
                        Rp {tx.totalBayar.toLocaleString('id-ID')}
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
