import React, { useState } from 'react';
import { AlertCircle, Radio, BellRing, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { UserSession } from '../services/api';

interface PanicAlertProps {
  user?: UserSession | null;
}

export const PanicAlertBroadcast: React.FC<PanicAlertProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;

  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">🚨 Siskamling Digital - Panic Alert System ({wilayahLabel})</h3>
          <p className="text-xs text-slate-500">Alarm darurat aktif yang langsung berbunyi di HP Satpam, Pengurus, dan <strong>SEMUA Warga {wilayahLabel}</strong></p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-bold animate-pulse">
          <Radio size={14} />
          <span>Live Monitoring Aktif</span>
        </div>
      </div>

      {activeAlerts.length > 0 ? (
        activeAlerts.map((alert) => (
          <div key={alert.id} className="p-6 bg-red-600 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white text-red-700 rounded-full text-xs font-extrabold tracking-wide uppercase">
                  🚨 ALARM AKTIF DARI RUMAH WARGA
                </span>
                <span className="text-xs text-red-100">{alert.waktu}</span>
              </div>
              <h4 className="text-2xl font-extrabold">{alert.rumah} - {alert.warga}</h4>
              <p className="text-xs text-red-100 flex items-center gap-3">
                <span className="flex items-center gap-1"><MapPin size={14} /> {wilayahLabel}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {alert.phone}</span>
              </p>
              <div className="p-3 bg-red-700/60 rounded-xl text-xs text-white border border-red-500/50 mt-2">
                🔔 Notifikasi darurat dan alarm suara telah disiarkan serentak ke HP <strong>Satpam Pos Ronda</strong> dan <strong>Warga {wilayahLabel}</strong>.
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
              <button className="px-6 py-3 bg-white text-red-700 rounded-xl text-xs font-extrabold hover:bg-red-50 shadow-md">
                Hubungi {alert.warga}
              </button>
              <button 
                onClick={() => setActiveAlerts([])}
                className="px-6 py-3 bg-red-800/80 border border-red-400 text-white rounded-xl text-xs font-bold hover:bg-red-800"
              >
                ✓ Tandai Sudah Tertangani
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Situasi Lingkungan {wilayahLabel} Aman & Kondusif</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada tombol panik yang sedang ditekan. Sistem siap menerima dan membunyikan alarm jika ada warga yang membutuhkan pertolongan cepat.
          </p>
        </div>
      )}
    </div>
  );
};
