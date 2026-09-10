import React, { useState } from 'react';
import { Shield, Clock, MapPin, CheckCircle, FileText, Send, AlertTriangle } from 'lucide-react';
import { UserSession } from '../services/api';

interface SecurityProps {
  user?: UserSession | null;
}

export const SecurityAbsensiLaporan: React.FC<SecurityProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const [laporanTitle, setLaporanTitle] = useState('');
  const [laporanDesc, setLaporanDesc] = useState('');
  const [laporanList, setLaporanList] = useState([
    { id: '1', waktu: 'Kemarin, 23:30', judul: `Patroli Malam Wilayah ${wilayahLabel} Selesai`, desc: 'Situasi aman terkendali, pintu gerbang utama telah dipantau.', status: 'TERKIRIM_KE_RT' },
    { id: '2', waktu: 'Kemarin, 21:15', judul: 'Tamu Menginap Terdata', desc: 'Tamu keluarga warga lapor 1x24 jam ke pos satpam.', status: 'TERKIRIM_KE_RT' },
  ]);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    setCheckInTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleSendLaporan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!laporanTitle || !laporanDesc) return;
    setLaporanList([
      {
        id: Date.now().toString(),
        waktu: 'Baru saja',
        judul: laporanTitle,
        desc: laporanDesc,
        status: 'TERKIRIM_KE_RT',
      },
      ...laporanList,
    ]);
    setLaporanTitle('');
    setLaporanDesc('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Portal Petugas Keamanan / Satpam ({wilayahLabel})</h3>
        <p className="text-xs text-slate-500">Absensi kehadiran pos jaga dan pembuatan laporan patroli malam ke Pengurus RT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Absensi Shift Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Absensi Pos Jaga</h4>
              <p className="text-xs text-slate-400">Shift Malam (20:00 - 06:00 WIB)</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="text-slate-500">Petugas: <strong className="text-slate-900">Petugas Jaga {wilayahLabel}</strong></p>
            <p className="text-slate-500">Lokasi: <strong className="text-slate-900">Pos Ronda Gerbang RT {rtNomor}</strong></p>
          </div>

          {!isCheckedIn ? (
            <button 
              onClick={handleCheckIn}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/30"
            >
              <Clock size={16} /> Check-In Masuk Jaga
            </button>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
              <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                <CheckCircle size={15} /> Sudah Check-In Pukul {checkInTime} WIB
              </span>
              <p className="text-[11px] text-emerald-600">Status: Sedang Bertugas</p>
            </div>
          )}
        </div>

        {/* Form Lapor ke RT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            <span>Buat Laporan / Log Patroli ke Pengurus RT</span>
          </h4>

          <form onSubmit={handleSendLaporan} className="space-y-3">
            <div>
              <input 
                type="text" 
                placeholder="Judul laporan (contoh: Patroli Keliling Jam 02:00 / Tamu Asing)"
                value={laporanTitle}
                onChange={(e) => setLaporanTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <textarea 
                rows={3}
                placeholder="Rincian laporan kejadian atau kondisi lingkungan saat patroli..."
                value={laporanDesc}
                onChange={(e) => setLaporanDesc(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Send size={14} /> Kirim Laporan ke Ketua RT
            </button>
          </form>
        </div>
      </div>

      {/* Riwayat Log Laporan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-xs uppercase tracking-wider">
          Riwayat Laporan Petugas Keamanan ({wilayahLabel})
        </div>
        <div className="divide-y divide-slate-100">
          {laporanList.map((log) => (
            <div key={log.id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400">{log.waktu}</span>
                <h5 className="font-bold text-slate-900 text-sm mt-0.5">{log.judul}</h5>
                <p className="text-xs text-slate-600 mt-1">{log.desc}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full shrink-0">
                ✓ Diterima RT
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
