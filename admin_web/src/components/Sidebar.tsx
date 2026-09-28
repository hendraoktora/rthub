import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Wallet, 
  Building2, 
  TrendingUp, 
  LogOut,
  UserCheck,
  Shield,
  Sliders,
  BellRing,
  Moon,
  MessageSquarePlus,
  Store,
  Calendar,
  Megaphone,
  ArrowDownLeft,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { RtHubLogo } from './RtHubLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: string;
  user: { name: string; role: string; email?: string | null; wilayah: string };
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, user, onLogout }) => {
  // STRICT RBAC MENU RULES:
  // SUPERADMIN: Global Platform, Financial Inflow, Withdrawal Approval & Add-ons
  // ADMIN_RT / KETUA RT: Full RT Operational (Kas, Warga, Pengurus, Ronda, Tagihan, Panic, Lapor RT, Lapak, Agenda, Berita)
  // SEKRETARIS: Warga, Pengurus, Ronda, Lapor RT, Lapak, Agenda, Berita
  // BENDAHARA: Kas, Tagihan, Setting Iuran, Lapor RT, Lapak
  // SECURITY: Absensi Pos, Lapor Patroli, Panic Alert, Lapor RT, Lapak
  const menuItems = [
    // 1. Superadmin Platform Only
    { id: 'superadmin_overview', label: 'Overview Platform', icon: LayoutDashboard, roles: ['SUPERADMIN'] },
    { id: 'superadmin_rt', label: 'Monitoring Wilayah RT', icon: Building2, roles: ['SUPERADMIN'] },
    { id: 'uang_masuk', label: 'Arus Uang Masuk (PG)', icon: ArrowDownLeft, roles: ['SUPERADMIN'] },
    { id: 'approval_penarikan', label: 'Approval Penarikan RT', icon: ShieldCheck, roles: ['SUPERADMIN'] },
    { id: 'revenue', label: 'Fee Platform RtHub', icon: TrendingUp, roles: ['SUPERADMIN'] },
    { id: 'addons_rt', label: 'Paket Add-Ons RT', icon: Crown, roles: ['SUPERADMIN'] },

    // 2. RT Operational (Ketua RT, Sekretaris, Bendahara)
    { id: 'dashboard', label: 'Buku Kas & Keuangan RT', icon: Wallet, roles: ['ADMIN_RT', 'BENDAHARA', 'BENDAHARA_RT'] },
    { id: 'agenda_rt', label: 'Agenda Kegiatan RT', icon: Calendar, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT'] },
    { id: 'berita_rt', label: 'Informasi & Pengumuman', icon: Megaphone, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT'] },
    { id: 'warga', label: 'Data Warga & Rumah', icon: Users, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT'] },
    { id: 'pengurus', label: 'Struktur Pengurus RT', icon: UserCheck, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT'] },
    { id: 'ronda', label: 'Jadwal Ronda Warga', icon: Moon, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT'] },
    { id: 'tagihan', label: 'Tagihan & Billing IPL', icon: Receipt, roles: ['ADMIN_RT', 'BENDAHARA', 'BENDAHARA_RT'] },
    { id: 'setting_iuran', label: 'Atur Nilai Iuran', icon: Sliders, roles: ['BENDAHARA', 'BENDAHARA_RT'] },

    // 3. Layanan Komunitas & UMKM (Semua role kecuali Superadmin)
    { id: 'lapor_rt', label: 'Lapor & Keluhan RT', icon: MessageSquarePlus, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT', 'BENDAHARA', 'BENDAHARA_RT', 'SECURITY'] },
    { id: 'lapak_warga', label: 'Lapak UMKM Warga', icon: Store, roles: ['ADMIN_RT', 'SEKRETARIS', 'SEKRETARIS_RT', 'BENDAHARA', 'BENDAHARA_RT', 'SECURITY'] },

    // 4. Security / Satpam
    { id: 'security', label: 'Absensi & Lapor Patroli', icon: Shield, roles: ['SECURITY'] },

    // 5. Emergency Panic Alert (Ketua RT, Satpam, Bendahara)
    { id: 'panic_alert', label: '🚨 Panic Alert Warga', icon: BellRing, roles: ['ADMIN_RT', 'SECURITY', 'BENDAHARA', 'BENDAHARA_RT'] },
  ];

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'SUPERADMIN': return '👑 Superadmin Platform';
      case 'ADMIN_RT': return '🏛️ Ketua / Pengurus RT';
      case 'SEKRETARIS':
      case 'SEKRETARIS_RT': return '📋 Sekretaris RT';
      case 'BENDAHARA':
      case 'BENDAHARA_RT': return '💰 Bendahara RT';
      case 'SECURITY': return '🛡️ Petugas Keamanan';
      default: return '👤 Warga Lingkungan';
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand */}
        <div className="p-5 flex items-center border-b border-slate-800">
          <RtHubLogo size={38} theme="dark" subtext="Smart Neighborhood OS" />
        </div>

        {/* User Role Badge (Read-Only) */}
        <div className="px-4 py-2.5 bg-slate-800/60 mx-3.5 my-3 rounded-xl border border-slate-700/50 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <div className="overflow-hidden">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Akses Otoritas</span>
            <span className="text-xs font-bold text-white truncate block">{getRoleLabel(role)}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1 mt-2">
          {menuItems.filter(item => item.roles.includes(role)).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.wilayah}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            title="Keluar / Logout"
            className="text-slate-400 hover:text-red-400 p-1.5 transition-colors rounded-lg hover:bg-slate-800 shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
