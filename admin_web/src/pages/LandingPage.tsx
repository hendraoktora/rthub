import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  ShieldAlert, 
  Wallet, 
  ShoppingBag, 
  Video, 
  Calendar, 
  Users, 
  QrCode, 
  PhoneCall, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Bell, 
  Home, 
  Eye, 
  FileText, 
  Sparkles,
  Check,
  X,
  Smartphone,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'warga' | 'pengurus'>('warga');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Apakah warga yang tidak memiliki smartphone tetap bisa terdata?',
      a: 'Tentu bisa. Pengurus RT dapat mencatat data warga secara manual melalui Dashboard Admin Web. Ketika warga tersebut membayar tunai ke bendahara, bendahara cukup mencatatnya di sistem dan kuitansi pembayaran tetap tercatat rapi.'
    },
    {
      q: 'Apakah besaran iuran RT bisa diatur berbeda per tipe rumah atau blok?',
      a: 'Bisa. Bendahara RT dapat mengatur kategori iuran (Iuran Wajib RT, Kebersihan/Sampah, Keamanan Pos Satpam) dan menentukan tarif khusus sesuai tipe rumah (misal: rumah tinggal, tempat usaha, atau rumah kosong).'
    },
    {
      q: 'Bagaimana cara warga mengunduh dan masuk ke aplikasi?',
      a: 'Warga cukup mengunduh file APK Android yang tersedia di halaman ini, lalu masuk menggunakan nomor WhatsApp yang telah terdaftar di database pengurus RT. Tidak perlu mengingat password yang rumit.'
    },
    {
      q: 'Bagaimana keamanan data pribadi warga di platform RtHub?',
      a: 'Data warga terenkripsi dan hanya dapat diakses oleh pengurus RT yang berwenang serta warga di lingkungan yang bersangkutan. Kami tidak membagikan data warga ke pihak ketiga mana pun.'
    },
    {
      q: 'Apakah bisa digunakan untuk perumahan cluster, kompleks, maupun RT perkampungan?',
      a: 'Sangat cocok untuk semua jenis lingkungan! Fitur RtHub dirancang fleksibel untuk perumahan cluster tertutup dengan pos satpam, perumahan subsidi, maupun lingkungan RT/RW perkampungan.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-600 selection:text-white antialiased">
      
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-blue-600 text-white text-xs font-semibold py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="bg-blue-700 text-blue-100 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded">Rilis Terbaru</span>
          <span>Aplikasi RtHub Android v2.0 kini sudah tersedia untuk seluruh warga & pengurus RT!</span>
          <a href="#download" className="underline font-bold hover:text-blue-100 ml-1">Unduh APK Sekarang &rarr;</a>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-500/20">
              Rt
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Rt<span className="text-blue-600">Hub</span>
              </span>
              <p className="text-[10px] font-medium text-slate-500 -mt-0.5">Aplikasi Pengurus & Warga RT/RW</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur Unggulan</a>
            <a href="#perbandingan" className="hover:text-blue-600 transition-colors">Kenapa RtHub?</a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <a href="#testimoni" className="hover:text-blue-600 transition-colors">Testimoni</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">Tanya Jawab</a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <LayoutDashboard size={16} />
              <span>Login Pengurus RT</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold">
                <Sparkles size={14} />
                <span>Solusi Cerdas & Transparan Lingkungan Warga</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Kelola Kas, Iuran & Keamanan RT Jadi <span className="text-blue-600">Terbuka & Praktis.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Tidak ada lagi buku kas manual yang tercecer dan tagih iuran door-to-door. Warga bisa bayar iuran via <strong>QRIS/Transfer</strong>, pantau saldo kas real-time dari HP, dan aktifkan <strong>Tombol Panik Darurat</strong> ke pos satpam dalam satu aplikasi.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="/RTHub-Latest-Release.apk"
                  download
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 flex items-center justify-center gap-3 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download size={20} />
                  <span>Download APK Warga (Android)</span>
                </a>

                <button
                  onClick={onGoToLogin}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-200 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition"
                >
                  <span>Masuk Web Pengurus</span>
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-left">
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p className="text-xs font-medium text-slate-500">Transparansi Buku Kas</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">&lt; 30 Detik</p>
                  <p className="text-xs font-medium text-slate-500">Respon Tombol Panik</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">Otomatis</p>
                  <p className="text-xs font-medium text-slate-500">Pengingat Iuran via WA</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm sm:max-w-md bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-2xl">
                
                {/* Switcher Tab */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold text-slate-600">
                  <button
                    onClick={() => setActivePreviewTab('warga')}
                    className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                      activePreviewTab === 'warga' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
                    }`}
                  >
                    <Smartphone size={14} />
                    Tampilan Warga
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('pengurus')}
                    className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                      activePreviewTab === 'pengurus' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard size={14} />
                    Tampilan Pengurus
                  </button>
                </div>

                {activePreviewTab === 'warga' ? (
                  /* Mobile Preview Card */
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase">Lingkungan Anda</p>
                        <p className="text-sm font-extrabold text-slate-900">RT 03 / RW 05 (Sukamaju Asri)</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        ✓ Warga Terdaftar
                      </span>
                    </div>

                    {/* Saldo Kas */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl text-white space-y-2 shadow-md">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-blue-100 font-medium">Kas RT 03 Terbuka</span>
                        <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 font-bold rounded text-[10px]">
                          ✓ LUNAS (Sep 2026)
                        </span>
                      </div>
                      <p className="text-2xl font-black">Rp 38.450.000</p>
                      <p className="text-[11px] text-blue-100">
                        Tagihan Anda bulan ini: <strong>Lunas Rp 50.000</strong> (Termasuk Sampah & Keamanan)
                      </p>
                    </div>

                    {/* Menu Grid Icons */}
                    <div className="grid grid-cols-4 gap-2 pt-1 text-center text-[10px] font-bold text-slate-700">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-1">
                          <Wallet size={16} />
                        </div>
                        <span>Iuran RT</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-1">
                          <ShoppingBag size={16} />
                        </div>
                        <span>Lapak</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-1">
                          <Calendar size={16} />
                        </div>
                        <span>Agenda</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 mx-auto flex items-center justify-center mb-1">
                          <Video size={16} />
                        </div>
                        <span>CCTV</span>
                      </div>
                    </div>

                    {/* Floating Panic Preview */}
                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
                          <ShieldAlert size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-red-900">Tombol Panik Satpam</p>
                          <p className="text-[10px] text-red-700">Sirene ke pos ronda 24 jam</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-red-700 bg-red-200/60 px-2 py-1 rounded-lg">SIAGA</span>
                    </div>
                  </div>
                ) : (
                  /* Admin Preview Card */
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase">Dashboard Pengurus</p>
                        <p className="text-sm font-extrabold text-slate-900">Ringkasan Kas & Rekap Iuran</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                        Admin RT Aktif
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Iuran Terkumpul Bulan Ini:</span>
                        <span className="font-extrabold text-emerald-600">Rp 6.850.000</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <p className="text-[10px] text-slate-400">11 dari 13 KK telah lunas (85%)</p>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-[11px] font-bold text-slate-600">Aksi Cepat Pengurus:</p>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                        <span className="font-medium text-slate-700">Catat Kas Masuk / Keluar</span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">+ Tambah</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                        <span className="font-medium text-slate-700">Kirim Pengingat Iuran WhatsApp</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">1-Klik WA</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. KENAPA HARUS BERALIH KE RTHUB? (Problem vs Solution) */}
      <section id="perbandingan" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-2">Mengapa Beralih ke RtHub?</h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900">Perbedaan Cara Lama vs Cara Modern RtHub</h3>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Bandingkan repotnya administrasi cara manual dengan kemudahan platform digital terintegrasi RtHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Cara Lama (Merah) */}
            <div className="bg-rose-50/60 border-2 border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-rose-800 pb-3 border-b border-rose-200">
                <div className="w-10 h-10 rounded-xl bg-rose-200/80 flex items-center justify-center font-bold text-rose-800">
                  <X size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg">Cara Manual / Tradisional</h4>
                  <p className="text-xs text-rose-600">Banyak kendala & rawan salah paham</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-rose-950">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Pengurus harus keliling dari rumah ke rumah untuk menagih iuran warga.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Catatan kas di buku tulis rawan hilang, basah, atau kuitansi terselip.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Warga ragu atau tidak tahu transparansi penggunaan dana kas lingkungan.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Keadaan darurat di malam hari sulit mengabari pos satpam dan tetangga cepat.</span>
                </li>
              </ul>
            </div>

            {/* Cara Modern RtHub (Hijau/Biru) */}
            <div className="bg-blue-50/60 border-2 border-blue-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
              <div className="flex items-center gap-3 text-blue-900 pb-3 border-b border-blue-200">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Check size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg">Dengan Platform RtHub</h4>
                  <p className="text-xs text-blue-700">Transparan, otomatis & warga merasa aman</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-800">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Warga bayar mandiri lewat QRIS / VA Transfer bank, bukti bayar digital terbit instan.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Buku kas tercatat otomatis, saldo & mutasi dapat dilihat seluruh warga kapan saja.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Transparansi 100% membangun rasa saling percaya antar warga dan pengurus RT.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>Tombol panik darurat melayang di HP warga langsung siaga ke pos siskamling & pengurus.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 5. 6 FITUR UTAMA LINGKUNGAN */}
      <section id="fitur" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-2">Fitur Terlengkap</h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900">Segala Urusan RT Ada Dalam Satu Genggaman</h3>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Mulai dari urusan keuangan, keamanan siskamling, hingga ekonomi warga RT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Wallet size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Buku Kas & Transparansi</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pencatatan pemasukan dan pengeluaran kas RT lengkap dengan tanggal, kategori, dan foto bukti kuitansi. Warga bisa mengecek saldo secara real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 hover:border-red-500 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <ShieldAlert size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Tombol Panik & Siskamling</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tombol darurat yang selalu siaga di layar HP warga. Bila terjadi kebakaran, bahaya maling, atau darurat medis, sirene langsung membunyikan pos satpam.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <QrCode size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Iuran Digital QRIS & VA</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Warga membayar iuran bulanan tanpa uang pas. Cukup scan QRIS atau transfer rekening. Sistem otomatis menerbitkan tanda lunas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 hover:border-purple-500 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ShoppingBag size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Lapak Warga & UMKM</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Wadah promosi kuliner, jajanan, dan jasa antar-tetangga di dalam perumahan. Pembeli bisa langsung memesan via WhatsApp penjual.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 hover:border-cyan-500 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Video size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Streaming CCTV Lingkungan</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Warga terdaftar dapat memantau kamera keamanan di gerbang utama, pos satpam, dan persimpangan lingkungan untuk memastikan keamanan.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Calendar size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Agenda & Lapor Fasilitas</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Jadwal kerja bakti, posyandu, dan ronda malam. Warga juga bisa melaporkan lampu jalan mati atau tumpukan sampah cukup dengan mengunggah foto.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CARA KERJA (3 LANGKAH MUDAH) */}
      <section id="cara-kerja" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-2">Mudah Digunakan</h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900">3 Langkah Cepat Memulai di Lingkungan Anda</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg mx-auto flex items-center justify-center shadow-md">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900">Pengurus Mendaftarkan RT</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ketua atau Sekretaris RT memasukkan data warga, nomor rumah, dan besaran tarif iuran melalui Dashboard Web.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg mx-auto flex items-center justify-center shadow-md">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900">Warga Mengunduh APK</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Warga mengunduh aplikasi RtHub di smartphone Android dan langsung masuk dengan nomor WhatsApp mereka.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg mx-auto flex items-center justify-center shadow-md">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900">Lingkungan Siap & Rukun</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Iuran terbayar tepat waktu, kas selalu transparan, komunikasi lancar, dan lingkungan semakin aman.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. TESTIMONI PENGURUS & WARGA */}
      <section id="testimoni" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-2">Cerita Warga</h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900">Apa Kata Pengurus & Warga yang Menggunakan RtHub?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Testimoni 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic">
                &ldquo;Dulu tiap akhir bulan bendahara kami pusing bikin laporan kas di Excel dan print kwitansi kertas. Sejak pakai RtHub, tiap ada uang masuk dan keluar langsung update di HP warga. Warga jadi jauh lebih percaya dan iuran selalu lancar.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  HG
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">Bpk. Hendra Gunawan</h5>
                  <p className="text-xs text-slate-500">Ketua RT 03 Kompleks Sukamaju Asri</p>
                </div>
              </div>
            </div>

            {/* Testimoni 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic">
                &ldquo;Fitur yang paling saya suka itu Tombol Panik dan Lapak Warga. Mau pesan sarapan uduk atau lontong sayur buatan tetangga tinggal klik langsung masuk WhatsApp penjualnya. Guyub banget rasanya.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                  RS
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">Ibu Ratna Sari</h5>
                  <p className="text-xs text-slate-500">Warga Penghuni Blok C3</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-2">Pertanyaan Populer</h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((item, idx) => (
              <div 
                key={idx} 
                className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-slate-800 flex justify-between items-center hover:bg-slate-100/80 transition"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? <ChevronUp size={18} className="text-blue-600 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-200 bg-white">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. DOWNLOAD CTA BANNER */}
      <section id="download" className="py-20 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl sm:text-5xl font-black tracking-tight">
            Mulai Digitalisasi Lingkungan RT Anda Hari Ini
          </h3>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Tingkatkan kenyamanan, transparansi keuangan, dan keamanan warga Anda bersama platform pintar RtHub.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/RTHub-Latest-Release.apk"
              download
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-3 transition hover:scale-105"
            >
              <Download size={20} className="text-blue-700" />
              <span>Unduh File APK Android (Warga)</span>
            </a>

            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-950/70 hover:bg-blue-950 text-white border border-white/20 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition"
            >
              <span>Masuk Dashboard Pengurus RT</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
              Rt
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">RtHub Indonesia</p>
              <p className="text-[11px] text-slate-500">Platform Komunitas & Administrasi RT/RW Terpadu</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <a href="#fitur" className="hover:text-white transition">Fitur</a>
            <a href="#cara-kerja" className="hover:text-white transition">Panduan</a>
            <a href="#faq" className="hover:text-white transition">Bantuan</a>
            <button onClick={onGoToLogin} className="hover:text-white transition font-bold text-blue-400">
              Portal Admin
            </button>
          </div>

          <p className="text-slate-500 text-center sm:text-right">
            &copy; 2026 RtHub. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </footer>

    </div>
  );
};
