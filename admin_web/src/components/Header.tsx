import React from 'react';
import { Bell, Search, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { UserSession } from '../services/api';
import { RtHubLogo } from './RtHubLogo';

interface HeaderProps {
  title: string;
  subtitle: string;
  user?: UserSession | null;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  activeTab = 'dashboard', 
  setActiveTab 
}) => {
  const isSuperadmin = user?.role === 'SUPERADMIN';
  const isBendahara = user?.role === 'BENDAHARA' || user?.role === 'BENDAHARA_RT';
  const isSekretaris = user?.role === 'SEKRETARIS' || user?.role === 'SEKRETARIS_RT';

  // Navigation pills in the top bar (matches Pinterest top nav pill menu)
  const navPills = isSuperadmin
    ? [
        { id: 'superadmin_overview', label: 'Dashboard' },
        { id: 'superadmin_rt', label: 'Wilayah RT' },
        { id: 'uang_masuk', label: 'Arus Kas' },
        { id: 'revenue', label: 'Laporan MRR' },
        { id: 'addons_rt', label: 'Lisensi Pro' },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'warga', label: 'Data Warga' },
        { id: 'tagihan', label: 'Tagihan IPL' },
        { id: 'agenda_rt', label: 'Agenda & Info' },
        { id: 'lapor_rt', label: 'Lapor RT' },
        { id: 'lapak_warga', label: 'Lapak UMKM' },
      ];

  const wilayahLabel = user?.wilayah || 'RT 03 / RW 05 - Sukamaju';
  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'RT';

  return (
    <header className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/70 px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 transition-all">
      {/* Brand Left */}
      <div className="flex items-center gap-3">
        <RtHubLogo size={36} theme="light" />
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
          Smart OS
        </span>
      </div>

      {/* Center Top Nav Pills */}
      {setActiveTab && (
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
          {navPills.map((pill) => {
            const isActive = activeTab === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setActiveTab(pill.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#065F46] text-white shadow-sm shadow-emerald-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Right User Actions */}
      <div className="flex items-center gap-3">
        {/* Search Icon */}
        <button 
          title="Pencarian Cepat"
          className="w-10 h-10 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition shadow-sm hover:text-emerald-700"
        >
          <Search size={17} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            title="Notifikasi Lingkungan"
            className="w-10 h-10 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition shadow-sm hover:text-emerald-700"
          >
            <Bell size={17} />
            <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-2.5 right-2.5 ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-emerald-100">
            {initials}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name || 'Pengurus RT'}</p>
            <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{wilayahLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
