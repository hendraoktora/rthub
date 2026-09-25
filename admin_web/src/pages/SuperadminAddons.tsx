import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';

interface SubscribedRt {
  id: string;
  nomorRt: string;
  nomorRw: string;
  kelurahan: string;
  adminName: string;
  status: 'AKTIF' | 'TRIAL' | 'TIDAK_AKTIF';
  expiredAt: string;
}

export const SuperadminAddons: React.FC = () => {
  const [subscribedRts, setSubscribedRts] = useState<SubscribedRt[]>([
    {
      id: 'sub-1',
      nomorRt: '03',
      nomorRw: '05',
      kelurahan: 'Sukamaju',
      adminName: 'Bpk. Hendra Gunawan',
      status: 'AKTIF',
      expiredAt: '25 Oktober 2026',
    },
    {
      id: 'sub-2',
      nomorRt: '01',
      nomorRw: '02',
      kelurahan: 'Mekarsari',
      adminName: 'Ibu Ratna Sari',
      status: 'AKTIF',
      expiredAt: '12 Oktober 2026',
    },
    {
      id: 'sub-3',
      nomorRt: '04',
      nomorRw: '05',
      kelurahan: 'Sukamaju',
      adminName: 'Bpk. Rahmat Hidayat',
      status: 'TRIAL',
      expiredAt: '30 September 2026',
    },
    {
      id: 'sub-4',
      nomorRt: '02',
      nomorRw: '01',
      kelurahan: 'Sukamaju',
      adminName: 'Bpk. Susanto',
      status: 'TIDAK_AKTIF',
      expiredAt: '15 September 2026',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const activeCount = subscribedRts.filter((r) => r.status === 'AKTIF').length;
  const trialCount = subscribedRts.filter((r) => r.status === 'TRIAL').length;
  const monthlyRevenue = activeCount * 49000;

  const filteredRts = subscribedRts.filter(
    (r) =>
      r.nomorRt.includes(searchQuery) ||
      r.nomorRw.includes(searchQuery) ||
      r.kelurahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.adminName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          Manajemen Paket Add-Ons RT (Rp 49.000 / Bulan)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Paket fitur premium administrasi RT: Surat Pengantar Digital RT/RW & Pembayaran Iuran Manual Cetak Resi.
        </p>
      </div>

      {/* Feature Bundle Showcase Cards */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Paket Add-Ons Ekosistem RT
            </span>
            <h3 className="text-2xl font-black text-white">
              Administrasi & Surat Pengantar Digital
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Memudahkan pengurus RT melayani permohonan surat kependudukan secara digital dari HP warga serta mencatatkan pembayaran iuran tunai fisik dengan resi barcode otomatis.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center shrink-0">
            <span className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">Tarif Langganan RT</span>
            <div className="text-3xl font-black text-amber-400 mt-1">
              Rp 49.000 <span className="text-xs font-normal text-slate-300">/ bulan</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Per RT per bulan • Recurring SaaS</p>
          </div>
        </div>

        {/* 3 Pillars of Add-on */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10 relative z-10">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="p-2 bg-blue-500/20 text-blue-300 w-fit rounded-lg mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Surat Pengantar RT Digital</h4>
            <p className="text-xs text-slate-400 mt-1">
              Permohonan Domisili, SKCK, Usaha, Kematian & Nikah langsung di-ACC Ketua RT dari HP dan menghasilkan PDF ber-QR code sah.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 w-fit rounded-lg mb-2">
              <Receipt className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Bayar Tunai & Resi Barcode</h4>
            <p className="text-xs text-slate-400 mt-1">
              Pencatatan iuran manual fisik bagi warga yang setor tunai ke bendahara dengan auto-generate kwitansi digital langsung ke aplikasi warga.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="p-2 bg-purple-500/20 text-purple-300 w-fit rounded-lg mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Ekspor Laporan Keuangan</h4>
            <p className="text-xs text-slate-400 mt-1">
              Download format Excel & PDF pembukuan kas RT lengkap standar akuntansi untuk pertanggungjawaban rapat tahunan warga.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RT Langganan Aktif</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {activeCount} RT
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            + {trialCount} RT sedang masa Free Trial 14 hari
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recurring Revenue Add-on</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-600 mt-2">
            Rp {monthlyRevenue.toLocaleString('id-ID')} / bln
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Pendapatan langganan berulang (SaaS Add-on)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tingkat Retensi RT</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-blue-600 mt-2">
            100% Retensi
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Pengurus RT sangat terbantu dengan surat digital
          </p>
        </div>
      </div>

      {/* RT Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h4 className="text-sm font-bold text-slate-900">
            Daftar Wilayah RT & Status Add-on
          </h4>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari RT atau Kelurahan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Wilayah RT / RW</th>
                <th className="px-4 py-3.5">Admin / Ketua RT</th>
                <th className="px-4 py-3.5">Status Paket Add-On</th>
                <th className="px-4 py-3.5">Masa Berlaku</th>
                <th className="px-4 py-3.5 text-center">Fitur Surat & Kas Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">
                      RT {r.nomorRt} / RW {r.nomorRw}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Kel. {r.kelurahan}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {r.adminName}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'AKTIF'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : r.status === 'TRIAL'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {r.status === 'AKTIF' && <Check className="w-3 h-3 text-emerald-600" />}
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-medium">
                    {r.expiredAt}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-bold ${
                      r.status !== 'TIDAK_AKTIF' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {r.status !== 'TIDAK_AKTIF' ? '✓ Aktif Lengkap' : 'Terkunci'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
