import React, { useState } from 'react';
import { Moon, Shield, Calendar, Users, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { UserSession } from '../services/api';

interface RondaProps {
  user?: UserSession | null;
}

export const RondaManagement: React.FC<RondaProps> = ({ user }) => {
  const [isRondaEnabled, setIsRondaEnabled] = useState(true);
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;

  const jadwalRonda = [
    { hari: 'Senin Malam', regu: `Regu 1 (RT ${rtNomor})`, koordinator: user?.name || 'Ketua Regu 1', anggota: [user?.name || 'Ketua RT', 'Warga Blok A', 'Warga Blok B'], status: 'JADWAL_RUTIN' },
    { hari: 'Selasa Malam', regu: `Regu 2 (RT ${rtNomor})`, koordinator: 'Koordinator Regu 2', anggota: ['Warga Blok C', 'Warga Blok D'], status: 'JADWAL_RUTIN' },
    { hari: 'Rabu Malam', regu: `Regu 3 (RT ${rtNomor})`, koordinator: 'Koordinator Regu 3', anggota: ['Warga Blok E', 'Warga Blok F'], status: 'JADWAL_RUTIN' },
    { hari: 'Kamis Malam', regu: `Regu 4 (RT ${rtNomor})`, koordinator: 'Koordinator Regu 4', anggota: ['Warga Blok G', 'Warga Blok H'], status: 'JADWAL_RUTIN' },
    { hari: 'Jumat Malam', regu: `Regu 5 (RT ${rtNomor})`, koordinator: 'Petugas Keamanan', anggota: ['Satpam Pos', 'Pemuda RT'], status: 'JADWAL_RUTIN' },
    { hari: 'Sabtu Malam', regu: `Regu Siskamling Akbar (RT ${rtNomor})`, koordinator: 'Koordinator Siskamling', anggota: ['Seluruh Kepala Keluarga Bergilir'], status: 'JADWAL_AKBAR' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Optional Ronda Switch */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Moon size={18} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Jadwal Ronda Malam Siskamling ({wilayahLabel})</h3>
          </div>
          <p className="text-xs text-slate-500">
            Pengaturan sistem giliran ronda malam warga. Dapat diaktifkan jika lingkungan RT menerapkan sistem siskamling bergilir.
          </p>
        </div>

        {/* Optional Toggle Button */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
          <span className="text-xs font-bold text-slate-700">
            {isRondaEnabled ? '🟢 Sistem Ronda Warga: AKTIF' : '⚪ Sistem Ronda Warga: NONAKTIF (Hanya Satpam)'}
          </span>
          <button 
            onClick={() => setIsRondaEnabled(!isRondaEnabled)}
            className="text-blue-600 hover:text-blue-700 transition"
            title="Klik untuk mengubah mode ronda warga"
          >
            {isRondaEnabled ? (
              <ToggleRight size={32} className="text-blue-600" />
            ) : (
              <ToggleLeft size={32} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {isRondaEnabled ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jadwal Regu Ronda Mingguan RT {rtNomor}</span>
            <button className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-sm">
              <Plus size={14} /> Atur Ulang Regu
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jadwalRonda.map((j, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">{j.hari}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    j.status === 'JADWAL_AKBAR' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {j.status === 'JADWAL_AKBAR' ? '★ Ronda Akbar' : 'Jadwal Rutin'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-slate-800">{j.regu}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Koordinator: <strong className="text-slate-700">{j.koordinator}</strong></p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Petugas Bergilir:</span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {j.anggota.map((ang, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {ang}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
            <Shield size={28} />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Mode Keamanan Full Satpam Diaktifkan</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Lingkungan RT {rtNomor} menggunakan penjagaan penuh oleh petugas keamanan resmi (Satpam). Warga tidak dikenakan jadwal giliran ronda malam.
          </p>
        </div>
      )}
    </div>
  );
};
