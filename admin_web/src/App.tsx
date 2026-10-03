import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './pages/DashboardOverview';
import { WargaManagement } from './pages/WargaManagement';
import { TagihanBilling } from './pages/TagihanBilling';
import { SuperadminRevenue } from './pages/SuperadminRevenue';
import { SuperadminDashboard } from './pages/SuperadminDashboard';
import { SuperadminOverview } from './pages/SuperadminOverview';
import { SuperadminUangMasuk } from './pages/SuperadminUangMasuk';
import { SuperadminAddons } from './pages/SuperadminAddons';
import { PengurusManagement } from './pages/PengurusManagement';
import { RondaManagement } from './pages/RondaManagement';
import { MasterTagihanSetting } from './pages/MasterTagihanSetting';
import { SecurityAbsensiLaporan } from './pages/SecurityAbsensiLaporan';
import { PanicAlertBroadcast } from './pages/PanicAlertBroadcast';
import { LaporRT } from './pages/LaporRT';
import { LapakWarga } from './pages/LapakWarga';
import { AgendaManagement } from './pages/AgendaManagement';
import { BeritaManagement } from './pages/BeritaManagement';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { api, UserSession } from './services/api';

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [publicView, setPublicView] = useState<'landing' | 'login'>('landing');

  useEffect(() => {
    const savedUser = api.getUser();
    if (savedUser) {
      setUser(savedUser);
      if (savedUser.role === 'SUPERADMIN') setActiveTab('superadmin_overview');
      else if (savedUser.role === 'SEKRETARIS') setActiveTab('warga');
      else if (savedUser.role === 'BENDAHARA') setActiveTab('dashboard');
      else if (savedUser.role === 'SECURITY') setActiveTab('security');
      else setActiveTab('dashboard');
    }
  }, []);

  const handleLogout = () => {
    api.clearSession();
    setUser(null);
    setPublicView('landing');
  };

  if (!user) {
    if (publicView === 'landing') {
      return <LandingPage onGoToLogin={() => setPublicView('login')} />;
    }

    return (
      <Login
        onBack={() => setPublicView('landing')}
        onLogin={(loggedUser) => {
          setUser(loggedUser);
          if (loggedUser.role === 'SUPERADMIN') setActiveTab('superadmin_overview');
          else if (loggedUser.role === 'SEKRETARIS') setActiveTab('warga');
          else if (loggedUser.role === 'BENDAHARA') setActiveTab('dashboard');
          else if (loggedUser.role === 'SECURITY') setActiveTab('security');
          else setActiveTab('dashboard');
        }}
      />
    );
  }

  const getPageInfo = () => {
    switch (activeTab) {
      case 'superadmin_overview':
        return { title: 'Executive Overview (Nasional)', subtitle: 'Statistik ekosistem RT, warga, KK, saldo kas, dan status langganan RT Pro' };
      case 'superadmin_rt':
        return { title: 'Monitoring Wilayah RT (Superadmin)', subtitle: 'Pilihan & filter data RT, rekening/QRIS mandiri pengurus, serta status lisensi' };
      case 'uang_masuk':
        return { title: 'Arus Kas Pendapatan Platform (Duitku)', subtitle: 'Monitoring pembayaran langganan Paket RT Pro Rp 99.000 dan iklan sponsor lapak warga se-Indonesia' };
      case 'revenue':
        return { title: 'Laporan Pendapatan & MRR Platform', subtitle: 'Analisis Monthly Recurring Revenue (MRR) dari langganan RT Pro & pendapatan iklan sponsor' };
      case 'addons_rt':
        return { title: 'Manajemen Lisensi & Langganan RT Pro', subtitle: 'Monitoring status masa aktif RT Pro, trial 7 hari, dan peringatan auto-deaktivasi' };
      case 'dashboard':
        return { title: 'Buku Kas & Keuangan RT', subtitle: `Pencatatan kas masuk (Bank/Transfer & Tunai) serta transparansi publik (${user.wilayah})` };
      case 'agenda_rt':
        return { title: 'Agenda Kegiatan Lingkungan RT', subtitle: `Jadwal kerja bakti, rapat pleno, dan posyandu (${user.wilayah})` };
      case 'berita_rt':
        return { title: 'Informasi & Pengumuman RT', subtitle: `Publikasi edaran, informasi penting, dan maklumat pengurus (${user.wilayah})` };
      case 'warga':
        return { title: 'Data Warga & Rumah', subtitle: `Data kartu keluarga dan status domisili (${user.wilayah})` };
      case 'pengurus':
        return { title: 'Struktur Pengurus Lengkap RT', subtitle: `Struktur jabatan pengurus (${user.wilayah})` };
      case 'ronda':
        return { title: 'Jadwal Ronda Malam Warga', subtitle: `Pengaturan sistem siskamling bergilir warga (${user.wilayah})` };
      case 'tagihan':
        return { title: 'Tagihan & Monitoring Iuran Warga', subtitle: `Warga transfer langsung ke rekening/QRIS RT & verifikasi kas (${user.wilayah})` };
      case 'setting_iuran':
        return { title: 'Pengaturan Nilai Iuran & Rekening RT', subtitle: `Atur nominal iuran kas RT serta rekening bank / QRIS bendahara (${user.wilayah})` };
      case 'lapor_rt':
        return { title: 'Laporan & Pengaduan Lingkungan', subtitle: `Kanal keluhan fasilitas umum, sampah, dan surat pengantar (${user.wilayah})` };
      case 'lapak_warga':
        return { title: 'Lapak Warga & UMKM Lingkungan', subtitle: `Etalase produk/jasa warga dengan kontak WhatsApp langsung (${user.wilayah})` };
      case 'security':
        return { title: 'Portal Keamanan / Satpam', subtitle: `Absensi pos ronda & laporan patroli (${user.wilayah})` };
      case 'panic_alert':
        return { title: '🚨 Siskamling Digital - Panic Alert', subtitle: `Notifikasi darurat aktif yang berbunyi serentak ke seluruh warga (${user.wilayah})` };
      default:
        return { title: 'Dashboard', subtitle: `RtHub Management OS (${user.wilayah})` };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={user.role} 
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          title={pageInfo.title} 
          subtitle={pageInfo.subtitle} 
          user={user} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          {activeTab === 'superadmin_overview' && <SuperadminOverview onNavigateTab={setActiveTab} />}
          {activeTab === 'superadmin_rt' && <SuperadminDashboard />}
          {activeTab === 'uang_masuk' && <SuperadminUangMasuk />}
          {activeTab === 'revenue' && <SuperadminRevenue />}
          {activeTab === 'addons_rt' && <SuperadminAddons />}
          {activeTab === 'dashboard' && <DashboardOverview user={user} />}
          {activeTab === 'agenda_rt' && <AgendaManagement user={user} />}
          {activeTab === 'berita_rt' && <BeritaManagement user={user} />}
          {activeTab === 'warga' && <WargaManagement user={user} />}
          {activeTab === 'pengurus' && <PengurusManagement user={user} />}
          {activeTab === 'ronda' && <RondaManagement user={user} />}
          {activeTab === 'tagihan' && <TagihanBilling user={user} />}
          {activeTab === 'setting_iuran' && <MasterTagihanSetting user={user} />}
          {activeTab === 'lapor_rt' && <LaporRT user={user} />}
          {activeTab === 'lapak_warga' && <LapakWarga user={user} />}
          {activeTab === 'security' && <SecurityAbsensiLaporan user={user} />}
          {activeTab === 'panic_alert' && <PanicAlertBroadcast user={user} />}
          {activeTab === 'revenue' && <SuperadminRevenue />}
        </main>
      </div>
    </div>
  );
}
