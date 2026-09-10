import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, DollarSign, Plus, Loader2 } from 'lucide-react';
import { UserSession } from '../services/api';
import { showAlert } from '../services/swal';

interface MasterTagihanProps {
  user?: UserSession | null;
}

export const MasterTagihanSetting: React.FC<MasterTagihanProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;

  const [tagihanItems, setTagihanItems] = useState([
    { id: '1', nama: `Iuran Kas RT ${rtNomor}`, nominal: 30000, keterangan: 'Biaya operasional kas RT, perbaikan sarana lingkungan' },
    { id: '2', nama: 'Iuran Sampah & Kebersihan', nominal: 20000, keterangan: 'Honor petugas pengangkut sampah bulanan' },
    { id: '3', nama: 'Dana Sosial & Kematian', nominal: 5000, keterangan: 'Santunan warga sakit/berduka (Opsional/Rutin)' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const adminFeePlatform = 2000;

  const totalPokok = tagihanItems.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalWargaBayar = totalPokok + adminFeePlatform;

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showAlert.success(
        'Tarif Berhasil Disimpan!',
        `Pengaturan tarif iuran ${wilayahLabel} berhasil disimpan. Tagihan periode berikutnya akan otomatis menggunakan nominal baru ini.`
      );
    }, 450);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Pengaturan Nilai Iuran & Tarif ({wilayahLabel})</h3>
          <p className="text-xs text-slate-500">Ubah nominal komponen iuran kas RT {rtNomor}, kebersihan, keamanan, dan dana sosial</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Tarif'}</span>
        </button>
      </div>

      {/* Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-900 text-base mb-2">Komponen Iuran Bulanan {wilayahLabel}</h4>
          
          {tagihanItems.map((item, index) => (
            <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  value={item.nama}
                  onChange={(e) => {
                    const updated = [...tagihanItems];
                    updated[index].nama = e.target.value;
                    setTagihanItems(updated);
                  }}
                  className="font-bold text-slate-900 text-sm bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none w-full mb-1"
                />
                <input 
                  type="text" 
                  value={item.keterangan}
                  onChange={(e) => {
                    const updated = [...tagihanItems];
                    updated[index].keterangan = e.target.value;
                    setTagihanItems(updated);
                  }}
                  className="text-xs text-slate-400 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Rp</span>
                <input 
                  type="number" 
                  value={item.nominal}
                  onChange={(e) => {
                    const updated = [...tagihanItems];
                    updated[index].nominal = Number(e.target.value) || 0;
                    setTagihanItems(updated);
                  }}
                  className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 text-right focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live Calculation Preview */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Simulasi Invoice Warga</span>
            <div className="mt-4 space-y-2.5 text-xs text-slate-300 border-b border-slate-800 pb-4">
              {tagihanItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.nama}</span>
                  <span className="font-semibold text-white">Rp {item.nominal.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="flex justify-between text-blue-300 font-bold pt-1">
                <span>Subtotal Masuk Kas RT</span>
                <span>Rp {totalPokok.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Biaya Layanan RtHub</span>
                <span>Rp {adminFeePlatform.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <span className="font-bold text-sm">Total Bayar Warga</span>
              <span className="text-xl font-extrabold text-emerald-400">Rp {totalWargaBayar.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-6 leading-relaxed">
            * Dari Rp {totalWargaBayar.toLocaleString('id-ID')}, sebesar <strong>Rp {totalPokok.toLocaleString('id-ID')}</strong> masuk 100% utuh ke Kas {wilayahLabel}.
          </p>
        </div>
      </div>
    </div>
  );
};
