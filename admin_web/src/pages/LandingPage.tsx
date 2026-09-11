import React from 'react';
import { 
  ShieldAlert, 
  Wallet, 
  ShoppingBag, 
  Video, 
  Calendar, 
  Users, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  LayoutDashboard, 
  Building2, 
  Bell, 
  QrCode, 
  Clock, 
  Lock,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                Rt<span className="text-blue-500">Hub</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">v2.0</span>
              </span>
              <p className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">Smart Community Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#fitur" className="hover:text-blue-400 transition-colors">Fitur Unggulan</a>
            <a href="#ekosistem" className="hover:text-blue-400 transition-colors">Aplikasi Warga & Web Admin</a>
            <a href="#keamanan" className="hover:text-blue-400 transition-colors">Keamanan</a>
            <a href="#download" className="hover:text-blue-400 transition-colors">Download APK</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center gap-2 group"
            >
              <span>Login Pengurus</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 animate-pulse">
            <Sparkles size={14} />
            <span>Platform Digitalisasi RT & RW #1 Terlengkap & Terintegrasi</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Kelola Kas, Iuran & Keamanan Lingkungan Jadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">Transparan</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Satu ekosistem cerdas untuk menghubungkan <strong>Warga</strong> dan <strong>Pengurus RT/RW</strong>. Bebas ribet catat buku manual, tagihan terbit otomatis, dan respons darurat dalam hitungan detik.
          </p>

          {/* CTA Group */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/RTHub-Latest-Release.apk"
              download
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"
            >
              <Download size={20} />
              <span>Download APK Warga (Android)</span>
            </a>

            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-base flex items-center justify-center gap-3 transition-all hover:border-slate-500"
            >
              <LayoutDashboard size={20} className="text-blue-400" />
              <span>Portal Admin Web Pengurus</span>
            </button>
          </div>

          {/* Highlights Mini Badge */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Buku Kas 100% Terbuka Real-Time</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Panic Button Siskamling Satpam</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Tagihan QRIS & Pengingat WA</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Preview Showcase */}
        <div className="mt-16 max-w-5xl mx-auto px-4">
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-2xl shadow-blue-950/50 backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">app.rthub.hendraoktora.com</span>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold text-[10px]">
                ● Live Production Server Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* Card 1: Kas */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Buku Kas RT 03/05</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">✓ LUNAS</span>
                </div>
                <p className="text-2xl font-black text-emerald-400">Rp 38.450.000</p>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Pemasukan Sep 2026:</span>
                    <span className="text-white font-semibold">+Rp 6.850.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pengeluaran Operasional:</span>
                    <span className="text-rose-400 font-semibold">-Rp 1.400.000</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Panic Button */}
              <div className="bg-gradient-to-br from-red-950/40 to-slate-950 p-5 rounded-2xl border border-red-900/30 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-red-400 font-bold flex items-center gap-1.5">
                    <ShieldAlert size={16} /> Panic Button Darurat
                  </span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full text-[10px] font-bold animate-pulse">24/7 Siaga</span>
                </div>
                <p className="text-xs text-slate-300">
                  Siaran darurat maling, kebakaran, atau medis langsung berbunyi keras di pos satpam & HP seluruh pengurus.
                </p>
                <div className="p-2.5 rounded-xl bg-red-900/30 border border-red-700/40 text-[11px] text-red-200 font-bold flex items-center justify-between">
                  <span>🚨 Respon Satpam Siaga</span>
                  <span>&lt; 30 Detik</span>
                </div>
              </div>

              {/* Card 3: Lapak Warga */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Lapak UMKM Warga</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold">Pesan via WA</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 font-black">
                    🛍️
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Nasi Uduk Betawi Mpok Siti</h5>
                    <p className="text-xs text-emerald-400 font-bold">Rp 15.000 • Blok C3/04</p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Pesan langsung diantar ke rumah</span>
                  <span className="text-emerald-400 font-bold">✓ Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Showcase Grid */}
      <section id="fitur" className="py-24 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Fitur Terlengkap</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Semua Kebutuhan Rukun Tetangga Dalam 1 Aplikasi</h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Dirancang khusus untuk menyesuaikan alur kerja kepengurusan RT/RW di Indonesia, mulai dari penagihan iuran hingga sistem keamanan terpadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Wallet size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Buku Kas Terbuka & Otomatis</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Setiap rupiah yang masuk dan keluar tercatat dengan detail tanggal, kategori, dan bukti transaksi. Warga dapat melihat saldo kas RT secara real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-red-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
                <ShieldAlert size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Tombol Panik & Siskamling</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tombol panik darurat melayang di layar aplikasi warga. Memicu sirene instan ke pos satpam lengkap dengan nama, nomor rumah, dan titik lokasi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <QrCode size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Iuran Digital QRIS & VA</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Warga membayar tagihan iuran sampah, keamanan, dan kas RT lewat QRIS / Virtual Account BCA & Mandiri, atau setor tunai dengan kuitansi otomatis.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <ShoppingBag size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Lapak UMKM Warga</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Dorong ekonomi sirkular warga lingkungan. Warga dapat memasang produk jualan dan menerima pesanan langsung melalui WhatsApp secara instan.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                <Video size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Monitoring CCTV Lingkungan</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pantau kamera keamanan gerbang utama, taman bermain, dan pos satpam langsung dari genggaman ponsel warga dan petugas ronda malam.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Calendar size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Agenda Kegiatan & Laporan RT</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Kalender dinamis kegiatan kerja bakti, rapat bulanan warga, posyandu, dan formulir lapor keluhan fasilitas umum dengan foto lampiran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ekosistem: Mobile App vs Web Admin */}
      <section id="ekosistem" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Mobile App Warga */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                <Smartphone size={16} />
                <span>Untuk Warga Lingkungan</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white">
                Aplikasi Mobile Flutter Cepat & Ringan
              </h3>
              <p className="text-slate-300 text-base leading-relaxed">
                Warga tidak perlu login berbelit-belit. Cukup masukkan nomor WhatsApp untuk mengakses semua informasi lingkungan, status iuran bulanan yang sudah lunas, kalender agenda RT mingguan, hingga pesan makanan di Lapak Warga.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">✓</div>
                  <span>Notifikasi Real-time tagihan iuran & status lunas</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">✓</div>
                  <span>Floating Panic Button darurat yang selalu siap ditekan</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">✓</div>
                  <span>Order langsung ke WhatsApp penjual UMKM RT</span>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href="/RTHub-Latest-Release.apk"
                  download
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Download size={18} />
                  <span>Download APK (RTHub-Latest-Release.apk)</span>
                </a>
              </div>
            </div>

            {/* Right: Dashboard Web Pengurus */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                <LayoutDashboard size={16} />
                <span>Untuk Pengurus RT, RW & Superadmin</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Dashboard Web Lengkap & Kuat
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Kelola data sensus KK & warga, atur besaran tarif tagihan bulanan, pencatatan kas masuk & keluar, hingga monitoring multi-wilayah RT dengan laporan terperinci.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">✓</div>
                  <span>Pencatatan kas masuk & keluar dengan sweetalert konfirmasi</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">✓</div>
                  <span>Monitoring wilayah RT interaktif (klik card untuk cek data warga & tagihan)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">✓</div>
                  <span>Pengiriman notifikasi pengingat iuran otomatis via WhatsApp</span>
                </div>
              </div>

              <button
                onClick={onGoToLogin}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <span>Buka Dashboard Pengurus RT</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Download Section Banner */}
      <section id="download" className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Mulai Digitalisasi Lingkungan RT Anda Sekarang
            </h3>
            <p className="mt-4 text-blue-100 text-base sm:text-lg max-w-2xl mx-auto">
              Tingkatkan kenyamanan, transparansi, dan keamanan warga hanya dengan beberapa langkah mudah.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/RTHub-Latest-Release.apk"
                download
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-base shadow-xl flex items-center justify-center gap-3 transition hover:scale-105"
              >
                <Download size={20} className="text-blue-700" />
                <span>Unduh File APK Android</span>
              </a>

              <button
                onClick={onGoToLogin}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-950/60 hover:bg-blue-950 text-white border border-white/20 font-bold text-base flex items-center justify-center gap-2 transition"
              >
                <span>Login Pengurus RT / RW</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <span className="font-bold text-slate-300">RtHub Community Platform</span>
            <span>• Solusi Cerdas Manajemen RT/RW Modern</span>
          </div>

          <p>© 2026 RtHub. All rights reserved. Made for Indonesia's RT/RW communities.</p>
        </div>
      </footer>
    </div>
  );
};
