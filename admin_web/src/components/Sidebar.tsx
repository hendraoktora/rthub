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
  Megaphone
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: string;
  setRole: (role: string) => void;
  user: { name: string; role: string; email?: string | null; wilayah: string };
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, setRole, user, onLogout }) => {
  // STRICT RBAC MENU RULES:
  // SUPERADMIN: ONLY Global Platform & Tenant Overview (No private neighborhood data)
  // ADMIN_RT / KETUA RT: Full RT Operational (Kas, Warga, Pengurus, Ronda, Tagihan, Panic, Lapor RT, Lapak, Agenda, Berita)
  // SEKRETARIS: Warga, Pengurus, Ronda, Lapor RT, Lapak, Agenda, Berita
  // BENDAHARA: Kas, Tagihan, Setting Iuran, Lapor RT, Lapak
  // SECURITY: Absensi Pos, Lapor Patroli, Panic Alert, Lapor RT, Lapak
  const menuItems = [
    // 1. Superadmin Platform Only
    { id: 'superadmin_rt', label: 'Monitoring Wilayah RT', icon: Building2, roles: ['SUPERADMIN'] },
    { id: 'revenue', label: 'Fee Platform RtHub', icon: TrendingUp, roles: ['SUPERADMIN'] },

    // 2. RT Operational (Ketua RT, Sekretaris, Bendahara)
    { id: 'dashboard', label: 'Buku Kas & Keuangan RT', icon: Wallet, roles: ['ADMIN_RT', 'BENDAHARA'] },
    { id: 'agenda_rt', label: 'Agenda Kegiatan RT', icon: Calendar, roles: ['ADMIN_RT', 'SEKRETARIS'] },
    { id: 'berita_rt', label: 'Informasi & Pengumuman', icon: Megaphone, roles: ['ADMIN_RT', 'SEKRETARIS'] },
    { id: 'warga', label: 'Data Warga & Rumah', icon: Users, roles: ['ADMIN_RT', 'SEKRETARIS'] },
    { id: 'pengurus', label: 'Struktur Pengurus RT', icon: UserCheck, roles: ['ADMIN_RT', 'SEKRETARIS'] },
    { id: 'ronda', label: 'Jadwal Ronda Warga', icon: Moon, roles: ['ADMIN_RT', 'SEKRETARIS'] },
    { id: 'tagihan', label: 'Tagihan & Billing IPL', icon: Receipt, roles: ['ADMIN_RT', 'BENDAHARA'] },
    { id: 'setting_iuran', label: 'Atur Nilai Iuran', icon: Sliders, roles: ['BENDAHARA'] },

    // 3. Layanan Komunitas & UMKM (Semua role kecuali Superadmin)
    { id: 'lapor_rt', label: 'Lapor & Keluhan RT', icon: MessageSquarePlus, roles: ['ADMIN_RT', 'SEKRETARIS', 'BENDAHARA', 'SECURITY'] },
    { id: 'lapak_warga', label: 'Lapak UMKM Warga', icon: Store, roles: ['ADMIN_RT', 'SEKRETARIS', 'BENDAHARA', 'SECURITY'] },

    // 4. Security / Satpam
    { id: 'security', label: 'Absensi & Lapor Patroli', icon: Shield, roles: ['SECURITY'] },

    // 5. Emergency Panic Alert (Ketua RT, Satpam, Bendahara)
    { id: 'panic_alert', label: '🚨 Panic Alert Warga', icon: BellRing, roles: ['ADMIN_RT', 'SECURITY', 'BENDAHARA'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
            Rt
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">RtHub Admin</h1>
            <p className="text-xs text-slate-400">Smart Neighborhood OS</p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="px-4 py-3 bg-slate-800/60 m-4 rounded-xl border border-slate-700/50">
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Role Aktif Saat Ini</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="SUPERADMIN">👑 1. Superadmin Platform</option>
            <option value="ADMIN_RT">🏛️ 2. Ketua RT 03</option>
            <option value="SEKRETARIS">📋 3. Sekretaris RT</option>
            <option value="BENDAHARA">💰 4. Bendahara RT</option>
            <option value="SECURITY">🛡️ 5. Satpam Pos Ronda</option>
          </select>
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
