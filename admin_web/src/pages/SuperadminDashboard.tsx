import React, { useState, useEffect } from 'react';
import { Building2, Users, Receipt, UserCheck, TrendingUp, Filter, RefreshCw, CheckCircle2, Phone } from 'lucide-react';

interface RTItem {
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
  createdAt: string;
}

export const SuperadminDashboard: React.FC = () => {
  const [selectedRt, setSelectedRt] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [rts, setRts] = useState<RTItem[]>([
    {
      id: 'cff664ca-dd41-4b82-987b-e1eb087d8274',
      nomor: '03',
      namaJalan: 'Jl. Melati Raya Kompleks Sukamaju Asri',
      rwNomor: '05',
      kelurahanNama: 'Sukamaju',
      kota: 'Depok',
      label: 'RT 03 / RW 05 (Sukamaju)',
      wargaCount: 14,
      rumahCount: 13,
      ketua: 'Bpk. Hendra Gunawan',
      phone: '081234567890',
      saldoKas: 38450000,
      createdAt: '2026-09-08T14:41:56.177Z',
    },
  ]);

  const fetchRts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/wilayah/rt-summary-all');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRts(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch RTs from DB:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRts();
  }, []);

  const transactions = [
    { id: 't1', rt: 'RT 03', tanggal: '8 Sep 2026, 14:20', warga: 'Bpk. Hendra Gunawan (Blok C3/12)', nominal: 50000, fee: 2000, tipe: 'Iuran Kas & Sampah', status: 'SUCCESS' },
    { id: 't2', rt: 'RT 03', tanggal: '8 Sep 2026, 11:05', warga: 'Bpk. Ahmad Fauzi (Blok C3/01)', nominal: 50000, fee: 2000, tipe: 'Iuran Kas & Sampah', status: 'SUCCESS' },
    { id: 't3', rt: 'RT 04', tanggal: '8 Sep 2026, 16:03', warga: 'Pendaftaran Mandiri (RT 04/04)', nominal: 50000, fee: 2000, tipe: 'Set Up Tagihan Awal', status: 'SUCCESS' },
    { id: 't4', rt: 'RT 03', tanggal: '8 Sep 2026, 09:15', warga: 'Bpk. Bambang Soediro (Blok C3/02)', nominal: 50000, fee: 2000, tipe: 'Iuran Kas & Sampah', status: 'SUCCESS' },
  ];

  const filteredTransactions = selectedRt === 'ALL' ? transactions : transactions.filter(t => t.rt === selectedRt);

  return (
    <div className="space-y-6">
      {/* Top Action Bar with Real-Time Refresh */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Daftar Lingkungan RT Terdaftar (Real-time DB)</h4>
            <p className="text-xs text-slate-400">Total {rts.length} Rukun Tetangga (RT) aktif di platform RtHub</p>
          </div>
        </div>

        <button
          onClick={fetchRts}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Menyinkronkan...' : '🔄 Sinkronkan Data DB'}
        </button>
      </div>

      {/* RT Filter Strip */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={18} className="text-blue-600" />
          <span className="text-xs font-bold text-slate-700">Pilih RT:</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setSelectedRt('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedRt === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua RT ({rts.length})
          </button>
          {rts.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRt(`RT ${r.nomor}`)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedRt === `RT ${r.nomor}` ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              RT {r.nomor} ({r.kelurahanNama})
            </button>
          ))}
        </div>
      </div>

      {/* Overview per RT Cards (Dynamic from DB) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rts.map(r => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg block w-fit mb-1">
                  {r.label}
                </span>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]" title={r.namaJalan}>
                  📍 {r.namaJalan}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                ✓ Aktif
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Ketua RT:</span>
              <span className="font-bold text-slate-800">{r.ketua} ({r.phone})</span>
            </div>

            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Warga</span>
                <p className="text-xl font-bold text-slate-900">{r.wargaCount} KK</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Saldo Kas RT</span>
                <p className="text-base font-extrabold text-emerald-600">Rp {r.saldoKas.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaksi Filtered */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-bold text-slate-900 text-sm">Log Transaksi Pembayaran & Fee Admin ({selectedRt === 'ALL' ? 'Semua RT' : selectedRt})</h4>
          <span className="text-xs font-bold text-blue-600">Fee Admin Rp 2.000 / Trx</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Wilayah RT</th>
              <th className="px-6 py-4">Warga & Keterangan</th>
              <th className="px-6 py-4">Kategori Tagihan</th>
              <th className="px-6 py-4">Nominal Pokok RT</th>
              <th className="px-6 py-4">Fee Admin RtHub</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-blue-700 text-xs">{t.rt}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 text-xs">{t.warga}</p>
                  <p className="text-[11px] text-slate-400">{t.tanggal}</p>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-700">{t.tipe}</td>
                <td className="px-6 py-4 font-bold text-slate-900 text-xs">Rp {t.nominal.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 font-extrabold text-blue-600 text-xs">+Rp {t.fee.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">✓ Settle</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
