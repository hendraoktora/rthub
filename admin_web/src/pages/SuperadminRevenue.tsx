import React, { useState, useEffect } from 'react';
import { TrendingUp, Building2, Wallet, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export const SuperadminRevenue: React.FC = () => {
  const [totalRt, setTotalRt] = useState(2);
  const [totalWarga, setTotalWarga] = useState(15);

  useEffect(() => {
    fetch('http://localhost:3000/api/wilayah/rt-summary-all')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTotalRt(data.length);
          const wargaSum = data.reduce((acc, curr) => acc + (curr.wargaCount || 0), 0);
          setTotalWarga(wargaSum);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const totalFee = totalWarga * 2000;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Monitoring Pendapatan Fee Platform RtHub (Superadmin)</h3>
        <p className="text-xs text-slate-500">Akumulasi fee transaksi admin (Rp 2.000 per transaksi) dari seluruh RT & RW se-Indonesia</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total RT Terdaftar</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{totalRt} RT</h3>
          <p className="text-xs text-emerald-600 font-medium mt-1">Real-time DB Active</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Warga Terdaftar</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{totalWarga} KK</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Terverifikasi di sistem</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potensi Fee Bulanan</span>
          <h3 className="text-2xl font-extrabold text-blue-600 mt-2">Rp {totalFee.toLocaleString('id-ID')}</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Berdasarkan Rp 2.000 / KK / Bln</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Monetisasi</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">Pay-per-Trx</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">0 Biaya Langganan RT</p>
        </div>
      </div>
    </div>
  );
};
