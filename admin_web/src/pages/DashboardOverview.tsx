import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Search, 
  Share2, 
  ShieldCheck, 
  Check, 
  MessageCircle, 
  TrendingUp, 
  Loader2, 
  Crown, 
  Clock, 
  Megaphone,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Building,
  CheckCircle2,
  Users,
  Receipt,
  FileText,
  Copy,
  ChevronDown,
  BarChart3,
  Sparkles,
  QrCode
} from 'lucide-react';
import { api, UserSession } from '../services/api';
import { showAlert } from '../services/swal';
import { generateWaInviteText } from '../utils/inviteHelper';

interface DashboardProps {
  user?: UserSession | null;
}

export const DashboardOverview: React.FC<DashboardProps> = ({ user }) => {
  const [kasData, setKasData] = useState<{
    saldoKas: number;
    saldoKasTunai: number;
    saldoKasBank: number;
    totalPemasukan: number;
    totalPengeluaran: number;
    recentTransactions: any[];
  }>({
    saldoKas: 0,
    saldoKasTunai: 0,
    saldoKasBank: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0,
    recentTransactions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'PEMASUKAN' | 'PENGELUARAN'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipSummary, setMembershipSummary] = useState<any>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [timeView, setTimeView] = useState<'monthly' | 'annually'>('monthly');

  const [newMutasi, setNewMutasi] = useState({
    tipe: 'PENGELUARAN',
    metodeKas: 'BANK',
    kategori: 'Perbaikan Fasilitas & Lampu PJU',
    nominal: '',
    keterangan: '',
    picPengurus: user?.name || 'Bendahara RT',
    noBuktiNota: '',
  });

  const loadKasSummary = async () => {
    setIsLoading(true);
    try {
      const data = await api.getKasSummary();
      setKasData(data);
    } catch (e) {
      console.error('Error fetching kas summary:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembership = async () => {
    try {
      const data = await api.getMembershipSummary();
      setMembershipSummary(data);
    } catch (e) {
      console.error('Error fetching membership summary:', e);
    }
  };

  const handleRenewPro = async () => {
    const sisa = membershipSummary?.subscription?.sisaHari || 0;
    const confirm = window.confirm(
      `Perpanjang Langganan RTHub Pro (Rp 99.000 / Bulan)?\n\nSisa durasi aktif Anda (${sisa} hari) akan diakumulasikan dan ditambah 30 hari penuh secara otomatis.`
    );
    if (!confirm) return;

    setIsRenewing(true);
    try {
      await api.renewRtPro(30);
      showAlert.success(
        'Langganan Diperpanjang!',
        'Masa aktif RTHub Pro Anda berhasil diperpanjang (+30 hari akumulatif).'
      );
      loadMembership();
    } catch (err: any) {
      showAlert.error('Gagal Memperpanjang', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsRenewing(false);
    }
  };

  useEffect(() => {
    loadKasSummary();
    loadMembership();
  }, [user]);

  const handleCatatKas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMutasi.nominal || !newMutasi.keterangan) {
      showAlert.error('Input Tidak Lengkap', 'Nominal dan rincian transaksi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const keteranganFull = `${newMutasi.keterangan}${
        newMutasi.noBuktiNota ? ` [Nota: ${newMutasi.noBuktiNota}]` : ''
      } (PIC: ${newMutasi.picPengurus})`;

      await (api.catatKas as any)({
        tipe: newMutasi.tipe,
        kategori: newMutasi.kategori,
        nominal: Number(newMutasi.nominal),
        keterangan: keteranganFull,
        metodeKas: newMutasi.metodeKas,
      });

      setShowModal(false);
      loadKasSummary();
      const isOut = newMutasi.tipe === 'PENGELUARAN';
      showAlert.success(
        'Berhasil Dicatat!',
        isOut
          ? `Pengeluaran kas sebesar Rp ${Number(newMutasi.nominal).toLocaleString('id-ID')} berhasil dicatat & dipublikasikan ke warga.`
          : `Pemasukan kas sebesar Rp ${Number(newMutasi.nominal).toLocaleString('id-ID')} berhasil dicatat & masuk pembukuan RT.`
      );
      setNewMutasi({
        tipe: 'PENGELUARAN',
        metodeKas: 'BANK',
        kategori: 'Perbaikan Fasilitas & Lampu PJU',
        nominal: '',
        keterangan: '',
        picPengurus: user?.name || 'Bendahara RT',
        noBuktiNota: '',
      });
      await loadKasSummary();
    } catch (err: any) {
      showAlert.error('Gagal Mencatat Kas', err.message || 'Terjadi kesalahan saat mencatat mutasi kas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rtLabel = user?.wilayah || 'RT 03 / RW 05';

  // Format Broadcast WA message for Transparansi Warga
  const waBroadcastText = `*📢 LAPORAN TRANSPARANSI KAS ${rtLabel.toUpperCase()}*\n\n` +
    `📅 *Periode:* ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}\n` +
    `💰 *Total Saldo Kas Berjalan:* Rp ${kasData.saldoKas.toLocaleString('id-ID')}\n` +
    `📥 *Total Pemasukan (Iuran/Donasi):* Rp ${kasData.totalPemasukan.toLocaleString('id-ID')}\n` +
    `📤 *Total Pengeluaran Kas:* Rp ${kasData.totalPengeluaran.toLocaleString('id-ID')}\n\n` +
    `*📋 Ringkasan Pengeluaran Terakhir:*\n` +
    (kasData.recentTransactions || [])
      .filter((t: any) => t.tipe === 'PENGELUARAN')
      .slice(0, 3)
      .map((t: any, i: number) => `${i + 1}. ${t.kategori}: Rp ${Number(t.nominal).toLocaleString('id-ID')} (${t.keterangan})`)
      .join('\n') +
    `\n\n_Seluruh rincian pembukuan dan nota kas RT dapat dipantau langsung secara terbuka oleh seluruh warga di aplikasi RtHub. Transparan, Akuntabel, dan Terpercaya!_ ✨`;

  const filteredTransactions = (kasData.recentTransactions || []).filter((tx: any) => {
    const matchType = filterType === 'ALL' || tx.tipe === filterType;
    const matchSearch =
      (tx.kategori || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const getGreetingName = () => {
    if (!user?.name) return 'Pengurus RT';
    return user.name.split(' ')[0];
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-10">
      {/* SVG Definitions for Striped Bar Chart Patterns */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <pattern id="greenStripes" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#94DFC0" strokeWidth="4.5" />
            <line x1="5" y1="0" x2="5" y2="10" stroke="#DCFCE7" strokeWidth="5.5" />
          </pattern>
          <linearGradient id="areaCurveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#10B981" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Greeting & Controls Row (matches reference) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">
            Welcome Back, <span className="font-bold text-slate-900">{getGreetingName()}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Sistem Operasional Digital Kas Lingkungan ({rtLabel})</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker Pill (matches reference) */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] text-xs font-semibold text-slate-700">
            <Calendar size={14} className="text-slate-400" />
            <span>01 Okt, 2026 - 31 Okt, 2026</span>
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </div>

          {/* Action Button "+ Catat Mutasi Kas" */}
          <button
            onClick={() => {
              setNewMutasi({
                tipe: 'PENGELUARAN',
                metodeKas: 'BANK',
                kategori: 'Perbaikan Fasilitas & Lampu PJU',
                nominal: '',
                keterangan: '',
                picPengurus: user?.name || 'Bendahara RT',
                noBuktiNota: '',
              });
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-full border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] text-xs font-bold transition hover:border-emerald-600"
          >
            <span>+ Catat Mutasi Kas</span>
          </button>

          {/* Broadcast WA Pill */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(waBroadcastText)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#065F46] hover:bg-emerald-800 text-white rounded-full shadow-sm text-xs font-bold transition"
            title="Bagikan Ringkasan Kas ke Grup WhatsApp Warga"
          >
            <MessageCircle size={14} />
            <span>Broadcast LPJ WA</span>
          </a>

          {/* Sebar Undangan Warga Pill */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 text-xs font-bold transition"
          >
            <Share2 size={14} />
            <span>Undang Warga</span>
          </button>
        </div>
      </div>

      {/* Subscription Alert Banner if Expiring */}
      {membershipSummary?.alerts && membershipSummary.alerts.length > 0 && (
        <div className="space-y-2">
          {membershipSummary.alerts.map((alert: any) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/90 text-amber-900 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold">{alert.title}</h4>
                  <p className="text-[11px] text-amber-800">{alert.message}</p>
                </div>
              </div>
              <button
                onClick={handleRenewPro}
                disabled={isRenewing}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-bold shadow-sm transition shrink-0"
              >
                {isRenewing ? 'Memproses...' : alert.actionText}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN BENTO GRID (Matches Pinterest: Card 1, Card 2, Cards 3&4) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= CARD 1: KAS RT DIGITAL CARD (Col 4) ================= */}
        <div className="lg:col-span-4 bg-white rounded-[26px] p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Kas RT Digital</h3>
                <p className="text-[11px] text-slate-400">Total saldo berjalan</p>
              </div>
              <button
                onClick={() => {
                  setNewMutasi({
                    tipe: 'PEMASUKAN',
                    metodeKas: 'BANK',
                    kategori: 'Iuran Warga',
                    nominal: '',
                    keterangan: '',
                    picPengurus: user?.name || 'Bendahara RT',
                    noBuktiNota: '',
                  });
                  setShowModal(true);
                }}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-800 flex items-center justify-center transition"
                title="Tambah Kas Masuk"
              >
                <ArrowUpRight size={15} />
              </button>
            </div>

            {/* Forest Green Debit Card Mockup (Matches Pinterest Reference) */}
            <div className="w-full rounded-2xl p-5 text-white bg-gradient-to-br from-[#065F46] via-[#047857] to-[#087252] shadow-lg shadow-emerald-900/20 relative overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
              {/* Background Geometric Watermark Accent */}
              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute right-6 top-6 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs font-black tracking-widest text-emerald-100">KAS RT-HUB</span>
                <span className="text-sm font-bold tracking-widest opacity-80">)))</span>
              </div>

              <div className="mb-4 relative z-10">
                <p className="text-[10px] text-emerald-200/90 font-medium">Kas Utama Lingkungan</p>
                <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
                  Rp {kasData.saldoKas.toLocaleString('id-ID')}
                </h2>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-emerald-100/90 pt-1 border-t border-emerald-600/40 relative z-10">
                <span>•••• 882901</span>
                <span className="text-[9px] uppercase font-bold text-emerald-200">EXP ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Under-Card Metric (Weekly/Monthly Revenue) */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Pemasukan Bulan Ini</p>
              <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">
                +Rp {kasData.totalPemasukan.toLocaleString('id-ID')}
              </h4>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 text-xs font-bold flex items-center gap-1">
              <TrendingUp size={13} />
              <span>+12.8%</span>
            </div>
          </div>
        </div>

        {/* ================= CARD 2: ENGAGEMENT / TREN KEUANGAN RT (Col 5) ================= */}
        <div className="lg:col-span-5 bg-white rounded-[26px] p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header with Switcher Pill (Monthly / Annually) */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <BarChart3 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Arus Keuangan & Iuran RT</h3>
                  <p className="text-[11px] text-slate-400">Statistik penerimaan kas warga</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switcher Pill (Monthly / Annually) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-full text-[11px] font-bold">
                  <button
                    onClick={() => setTimeView('monthly')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      timeView === 'monthly'
                        ? 'bg-[#065F46] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setTimeView('annually')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      timeView === 'annually'
                        ? 'bg-[#065F46] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Annually
                  </button>
                </div>

                <button
                  className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-800 flex items-center justify-center transition"
                  title="Lihat Detail Statistik"
                >
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>

            {/* Striped Bar Chart Graphic (Faithful to Pinterest Reference) */}
            <div className="relative pt-6 pb-2">
              {/* Y-Axis Grid Lines & Labels */}
              <div className="relative h-44 flex items-end justify-between px-3">
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100" />
                <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100" />
                <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100" />
                <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100" />
                <div className="absolute inset-x-0 bottom-0 border-b border-slate-200" />

                {/* Bar 1: Mei (2.2k) */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="w-9 rounded-full transition-all duration-300 hover:opacity-90"
                    style={{
                      height: '70px',
                      background: 'url(#greenStripes)',
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-2">MEI</span>
                </div>

                {/* Bar 2: Jun (4.1k) */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="w-9 rounded-full transition-all duration-300 hover:opacity-90"
                    style={{
                      height: '115px',
                      background: 'url(#greenStripes)',
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-2">JUN</span>
                </div>

                {/* Bar 3: Jul (3.2k) */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="w-9 rounded-full transition-all duration-300 hover:opacity-90"
                    style={{
                      height: '92px',
                      background: 'url(#greenStripes)',
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-2">JUL</span>
                </div>

                {/* Bar 4: Agu / Peak Month (Solid Dark Green with Floating Badge) */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Floating Tag "+17.8%" above peak bar */}
                  <div className="absolute -top-7 flex flex-col items-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#065F46] text-white text-[10px] font-bold shadow-sm whitespace-nowrap">
                      +17.8%
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#065F46] mt-0.5" />
                  </div>

                  <div
                    className="w-9 rounded-full bg-[#065F46] shadow-md shadow-emerald-900/25 transition-all duration-300 hover:bg-emerald-800"
                    style={{ height: '142px' }}
                  />
                  <span className="text-[10px] font-bold text-slate-800 mt-2">AGU</span>
                </div>

                {/* Bar 5: Sep (3.8k) */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="w-9 rounded-full transition-all duration-300 hover:opacity-90"
                    style={{
                      height: '110px',
                      background: 'url(#greenStripes)',
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-2">SEP</span>
                </div>

                {/* Bar 6: Okt (3.4k) */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="w-9 rounded-full transition-all duration-300 hover:opacity-90"
                    style={{
                      height: '98px',
                      background: 'url(#greenStripes)',
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-2">OKT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
            <span>Tingkat partisipasi warga: <strong className="text-emerald-700">92% Lunas Tepat Waktu</strong></span>
            <span className="text-emerald-600 font-bold">Periode Aktif 2026</span>
          </div>
        </div>

        {/* ================= CARDS 3 & 4 (Col 3): AREA CHART & PARTICIPATION ================= */}
        <div className="lg:col-span-3 flex flex-col gap-6 justify-between">
          
          {/* Card 3: Saldo Bank & Area Curve */}
          <div className="bg-white rounded-[26px] p-5 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kas Bank & QRIS</h4>
                  <p className="text-[10px] text-slate-400">Total balance digital</p>
                </div>
                <button
                  className="w-7 h-7 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-800 flex items-center justify-center transition"
                  title="Detail Kas Bank"
                >
                  <ArrowUpRight size={13} />
                </button>
              </div>

              {/* Balance */}
              <div className="mt-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Digital</span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Rp {(kasData.saldoKasBank || kasData.saldoKas).toLocaleString('id-ID')}
                </h3>
              </div>

              {/* Smooth Spline Area Chart (matches reference) */}
              <div className="relative h-16 w-full my-2 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 240 70" preserveAspectRatio="none">
                  {/* Fill Area */}
                  <path
                    d="M 0 45 C 30 20, 50 65, 80 25 C 110 -10, 130 50, 160 18 C 190 -5, 210 38, 240 20 L 240 70 L 0 70 Z"
                    fill="url(#areaCurveGrad)"
                  />
                  {/* Line Curve */}
                  <path
                    d="M 0 45 C 30 20, 50 65, 80 25 C 110 -10, 130 50, 160 18 C 190 -5, 210 38, 240 20"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Quick Pill Buttons: Send & Receive (matches Send / Receive pill in ref) */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => {
                  setNewMutasi({
                    tipe: 'PEMASUKAN',
                    metodeKas: 'BANK',
                    kategori: 'Iuran Warga',
                    nominal: '',
                    keterangan: '',
                    picPengurus: user?.name || 'Bendahara RT',
                    noBuktiNota: '',
                  });
                  setShowModal(true);
                }}
                className="py-2 px-3 rounded-full bg-[#065F46] hover:bg-emerald-800 text-white text-[11px] font-bold shadow-sm transition flex items-center justify-center gap-1"
              >
                <span>Kas Masuk</span>
                <ArrowUp size={12} />
              </button>

              <button
                onClick={() => {
                  setNewMutasi({
                    tipe: 'PENGELUARAN',
                    metodeKas: 'BANK',
                    kategori: 'Perbaikan Fasilitas & Lampu PJU',
                    nominal: '',
                    keterangan: '',
                    picPengurus: user?.name || 'Bendahara RT',
                    noBuktiNota: '',
                  });
                  setShowModal(true);
                }}
                className="py-2 px-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Pengeluaran</span>
                <ArrowDown size={12} />
              </button>
            </div>
          </div>

          {/* Card 4: Kepatuhan Warga & Citizen Avatars Stack */}
          <div className="bg-white rounded-[26px] p-5 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Receipt size={16} />
              </div>
              <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-0.5">
                <span>+12.8%</span>
              </div>
            </div>

            <div className="my-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Tingkat Partisipasi Iuran</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                94.2% <span className="text-xs font-semibold text-slate-500">Tertagih</span>
              </h3>
            </div>

            {/* Warga Lunas Avatars Stack (Matches Pinterest Reference) */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Warga Lunas Terverifikasi</p>
                <div className="flex items-center -space-x-2 mt-1.5">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                    BD
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                    ST
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                    JK
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#065F46] text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-white">
                    +18
                  </div>
                </div>
              </div>

              <button
                className="w-7 h-7 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-800 flex items-center justify-center transition"
                title="Buka Data Warga"
              >
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* BOTTOM ROW: PAYMENT HISTORY & STATUS LISENSI PRO               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= CARD 5: PAYMENT HISTORY (Col 8) ================= */}
        <div className="lg:col-span-8 bg-white rounded-[26px] p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Payment History</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {filteredTransactions.length} Transaksi
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Mutasi kas & pembayaran iuran warga terbaru</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    filterType === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterType('PEMASUKAN')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    filterType === 'PEMASUKAN'
                      ? 'bg-[#065F46] text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Masuk (+)
                </button>
                <button
                  onClick={() => setFilterType('PENGELUARAN')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    filterType === 'PENGELUARAN'
                      ? 'bg-rose-700 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Keluar (-)
                </button>
              </div>
            </div>

            {/* Clean Table List (Matches Pinterest Row Style with Logos & Status) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-semibold">
                    <th className="pb-3 font-normal">Nama / Keterangan</th>
                    <th className="pb-3 font-normal">Tanggal</th>
                    <th className="pb-3 font-normal">Waktu</th>
                    <th className="pb-3 font-normal">Status</th>
                    <th className="pb-3 font-normal text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.slice(0, 6).map((tx: any, idx: number) => {
                    const isMasuk = tx.tipe === 'PEMASUKAN';
                    const txDate = new Date(tx.createdAt || Date.now());

                    return (
                      <tr key={tx.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name with Circular Icon */}
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                isMasuk
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {isMasuk ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                            </div>
                            <div className="max-w-[220px]">
                              <p className="font-bold text-slate-900 truncate">
                                {tx.kategori || (isMasuk ? 'Iuran Warga' : 'Pengeluaran')}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {tx.keterangan || 'Pembukuan Kas'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 text-slate-600 font-medium whitespace-nowrap">
                          {txDate.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Time */}
                        <td className="py-3 text-slate-400 whitespace-nowrap">
                          {txDate.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} WIB
                        </td>

                        {/* Status (green dot Successful like in Pinterest reference) */}
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 font-bold text-[11px] text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{isMasuk ? 'Successful' : 'Dicatat'}</span>
                          </span>
                        </td>

                        {/* Amount */}
                        <td className={`py-3 text-right font-bold whitespace-nowrap ${
                          isMasuk ? 'text-emerald-700' : 'text-slate-800'
                        }`}>
                          {isMasuk ? '+' : '−'}Rp {Number(tx.nominal).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Belum ada mutasi yang tercatat untuk filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Transparansi Kas Digital RT-Hub OS</span>
            <span className="text-emerald-700 font-semibold">Tersinkronisasi Realtime</span>
          </div>
        </div>

        {/* ================= CARD 6: STATUS AKUN PRO & AUDIT TERBUKA (Col 4) ================= */}
        <div className="lg:col-span-4 bg-white rounded-[26px] p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Crown size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">RTHub Pro License</h4>
                  <p className="text-[10px] text-slate-400">Status langganan pengurus</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                membershipSummary?.subscription?.isPro
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {membershipSummary?.subscription?.isPro ? 'PRO AKTIF' : 'BASIC'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Sisa Masa Aktif:</span>
                <span className="font-extrabold text-slate-900">
                  {membershipSummary?.subscription?.sisaHari || 0} Hari
                </span>
              </div>
              <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-500">Masa Berlaku:</span>
                <span className="font-bold text-slate-700">
                  {membershipSummary?.subscription?.expiredAt
                    ? new Date(membershipSummary.subscription.expiredAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Belum aktif'}
                </span>
              </div>
            </div>

            <button
              onClick={handleRenewPro}
              disabled={isRenewing}
              className="w-full py-2.5 px-4 rounded-full bg-[#065F46] hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
            >
              {isRenewing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Memproses Perpanjangan...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Perpanjang Pro (Rp 99.000)</span>
                </>
              )}
            </button>
          </div>

          {/* Audit Terbuka Notice */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Setiap transaksi tercatat terenkripsi & dipublikasikan langsung ke warga.</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* MODAL CATAT MUTASI KAS                                         */}
      {/* ============================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {newMutasi.tipe === 'PEMASUKAN' ? 'Tambah Kas Masuk RT' : 'Catat Pengeluaran Kas RT'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCatatKas} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setNewMutasi({ ...newMutasi, tipe: 'PENGELUARAN' })}
                  className={`py-2 rounded-xl font-bold transition ${
                    newMutasi.tipe === 'PENGELUARAN'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengeluaran (−)
                </button>
                <button
                  type="button"
                  onClick={() => setNewMutasi({ ...newMutasi, tipe: 'PEMASUKAN' })}
                  className={`py-2 rounded-xl font-bold transition ${
                    newMutasi.tipe === 'PEMASUKAN'
                      ? 'bg-[#065F46] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pemasukan (+)
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 150000"
                  value={newMutasi.nominal}
                  onChange={(e) => setNewMutasi({ ...newMutasi, nominal: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Transaksi</label>
                <select
                  value={newMutasi.kategori}
                  onChange={(e) => setNewMutasi({ ...newMutasi, kategori: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                >
                  {newMutasi.tipe === 'PENGELUARAN' ? (
                    <>
                      <option value="Perbaikan Fasilitas & Lampu PJU">Perbaikan Fasilitas & Lampu PJU</option>
                      <option value="Kebersihan & Angkut Sampah">Kebersihan & Angkut Sampah</option>
                      <option value="Honor Satpam & Petugas Kebersihan">Honor Satpam & Petugas Kebersihan</option>
                      <option value="Kegiatan Warga & Rapat Pleno">Kegiatan Warga & Rapat Pleno</option>
                      <option value="Kas Tak Terduga / Sosial Lingkungan">Kas Tak Terduga / Sosial Lingkungan</option>
                      <option value="Pengeluaran Lainnya">Pengeluaran Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Iuran Kas Warga">Iuran Kas Warga</option>
                      <option value="Donasi & Sumbangan Sukarela">Donasi & Sumbangan Sukarela</option>
                      <option value="Pemasukan Sewa Fasilitas Umum">Pemasukan Sewa Fasilitas Umum</option>
                      <option value="Pemasukan Lainnya">Pemasukan Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Metode Penyimpanan Kas</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMutasi({ ...newMutasi, metodeKas: 'BANK' })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                      newMutasi.metodeKas === 'BANK'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Building size={14} /> Bank / QRIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMutasi({ ...newMutasi, metodeKas: 'TUNAI' })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                      newMutasi.metodeKas === 'TUNAI'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <CreditCard size={14} /> Kas Tunai (Fisik)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rincian Keterangan *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Pembelian 3 bohlam lampu LED jalan Blok C"
                  value={newMutasi.keterangan}
                  onChange={(e) => setNewMutasi({ ...newMutasi, keterangan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Nota / Bukti Fisik (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: NOTA-TB-08812"
                  value={newMutasi.noBuktiNota}
                  onChange={(e) => setNewMutasi({ ...newMutasi, noBuktiNota: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full bg-[#065F46] hover:bg-emerald-800 text-white font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan & Publikasikan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL UNDANG WARGA KE WHATSAPP                                 */}
      {/* ============================================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Sebar Undangan Warga</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Kirimkan teks resmi pendaftaran warga ke grup WhatsApp lingkungan ({rtLabel}) agar warga dapat mengunduh aplikasi dan mendaftarkan rumahnya.
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] font-mono text-slate-700 max-h-36 overflow-y-auto">
              {generateWaInviteText(user)}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateWaInviteText(user));
                  showAlert.success('Tersalin!', 'Teks undangan berhasil disalin ke clipboard.');
                }}
                className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>Salin Teks</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(generateWaInviteText(user))}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-full bg-[#065F46] hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <MessageCircle size={14} />
                <span>Kirim ke WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
