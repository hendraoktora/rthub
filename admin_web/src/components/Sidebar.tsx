import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  LogOut,
  Moon,
  MessageSquarePlus,
  Store,
  Calendar,
  Megaphone,
  ArrowDownLeft,
  Crown,
  Building2,
  Sliders,
  ShieldAlert,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: string;
  user: { name: string; role: string; email?: string | null; wilayah: string };
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, onLogout }) => {
  const isSuperadmin = role === 'SUPERADMIN';

  // Navigation icons matching the Pinterest vertical floating rail
  const menuItems = [
    // Superadmin items
    { id: 'superadmin_overview', label: 'Overview Platform', icon: LayoutGrid, roles: ['SUPERADMIN'] },
    { id: 'superadmin_rt', label: 'Monitoring Wilayah RT', icon: Building2, roles: ['SUPERADMIN'] },
    { id: 'uang_masuk', label: 'Arus Kas Pendapatan', icon: ArrowDownLeft, roles: ['SUPERADMIN'] },
    { id: 'revenue', label: 'Laporan Pendapatan & MRR', icon: TrendingUp, roles: ['SUPERADMIN'] },
    { id: 'addons_rt', label: 'Lisensi & Langganan RT Pro', icon: Crown, roles: ['SUPERADMIN'] },

    // RT Operational items
    { id: 'dashboard', label: 'Buku Kas & Transparansi RT', icon: LayoutGrid, roles: ['ADMIN_RT', 'BENDAHARA', 'BENDAHARA_RT', 'WARGA'] },
    { id: 'lapak_warga', label: 'Lapak UMKM Warga', icon: Store, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT', 'BENDAHARA', 'BENDAHARA_RT', 'SECURITY', 'WARGA'] },
    { id: 'warga', label: 'Data Warga & Rumah', icon: Users, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT'] },
    { id: 'tagihan', label: 'Tagihan & Billing IPL', icon: Receipt, roles: ['ADMIN_RT', 'BENDAHARA', 'BENDAHARA_RT'] },
    { id: 'agenda_rt', label: 'Agenda Kegiatan RT', icon: Calendar, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT', 'WARGA'] },
    { id: 'berita_rt', label: 'Informasi & Pengumuman', icon: Megaphone, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT', 'WARGA'] },
    { id: 'ronda', label: 'Jadwal Ronda Warga', icon: Moon, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT', 'WARGA'] },
    { id: 'lapor_rt', label: 'Lapor & Keluhan RT', icon: MessageSquarePlus, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT', 'BENDAHARA', 'BENDAHARA_RT', 'SECURITY', 'WARGA'] },
    { id: 'setting_iuran', label: 'Pengaturan Iuran & Rekening', icon: Sliders, roles: ['BENDAHARA', 'BENDAHARA_RT'] },
    { id: 'security', label: 'Absensi & Lapor Patroli', icon: Shield, roles: ['SECURITY'] },
    { id: 'panic_alert', label: '🚨 Panic Alert Warga', icon: ShieldAlert, roles: ['ADMIN_RT', 'SECURITY', 'BENDAHARA', 'BENDAHARA_RT', 'WARGA'] },
  ];

  const allowedItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-20 my-4 ml-4 shrink-0 flex flex-col justify-between items-center py-5 bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-30 transition-all">
      {/* Top Main Navigation Icons */}
      <div className="flex flex-col items-center gap-3 w-full">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group flex items-center justify-center w-full">
              <button
                onClick={() => setActiveTab(item.id)}
                aria-label={item.label}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#065F46] text-white shadow-md shadow-emerald-900/25 scale-105'
                    : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50/70'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
              </button>

              {/* Floating Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50">
                {item.label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions (Logout & Info) */}
      <div className="flex flex-col items-center gap-2 w-full pt-4 border-t border-slate-100">
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onLogout}
            title="Keluar / Logout"
            className="w-11 h-11 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all duration-200"
          >
            <LogOut size={19} strokeWidth={1.8} />
          </button>
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-rose-950 text-rose-200 text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50">
            Keluar Akun
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-rose-950" />
          </div>
        </div>
      </div>
    </aside>
  );
};
