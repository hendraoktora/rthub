import React from 'react';
import { Bell, MapPin } from 'lucide-react';
import { UserSession } from '../services/api';

interface HeaderProps {
  title: string;
  subtitle: string;
  user?: UserSession | null;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, user }) => {
  const wilayahLabel = user?.wilayah || 'RT 03 / RW 05 - Kel. Sukamaju';

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 shadow-sm">
          <MapPin size={14} className="text-blue-600" />
          <span>{wilayahLabel}</span>
        </div>

        <div className="relative">
          <button className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 relative transition">
            <Bell size={18} />
            <span className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2 ring-2 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
