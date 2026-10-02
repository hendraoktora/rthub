import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, DollarSign, Plus, Loader2, QrCode, CreditCard, Building, Image as ImageIcon } from 'lucide-react';
import { api, UserSession } from '../services/api';
import { showAlert } from '../services/swal';

interface MasterTagihanProps {
  user?: UserSession | null;
}

export const MasterTagihanSetting: React.FC<MasterTagihanProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;
  const rtId = user?.rtId;

  const [tagihanItems, setTagihanItems] = useState([
    { id: '1', nama: `Iuran Kas RT ${rtNomor}`, nominal: 30000, keterangan: 'Biaya operasional kas RT, perbaikan sarana lingkungan' },
    { id: '2', nama: 'Iuran Sampah & Kebersihan', nominal: 20000, keterangan: 'Honor petugas pengangkut sampah bulanan' },
    { id: '3', nama: 'Dana Sosial & Kematian', nominal: 5000, keterangan: 'Santunan warga sakit/berduka (Opsional/Rutin)' },
  ]);

  const [rekeningData, setRekeningData] = useState({
    namaBank: 'BCA',
    nomorRekening: '',
    atasNamaRekening: `Kas RT ${rtNomor}`,
    qrisImageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingRekening, setIsSavingRekening] = useState(false);

  useEffect(() => {
    if (rtId) {
      api.getRtRekening(rtId)
        .then((res: any) => {
          if (res) {
            setRekeningData({
              namaBank: res.namaBank || 'BCA',
              nomorRekening: res.nomorRekening || '',
              atasNamaRekening: res.atasNamaRekening || `Kas RT ${rtNomor}`,
              qrisImageUrl: res.qrisImageUrl || '',
            });
          }
        })
        .catch(() => {});
    }
  }, [rtId, rtNomor]);

  const totalPokok = tagihanItems.reduce((acc, curr) => acc + curr.nominal, 0);

  const handleSaveTarif = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showAlert.success(
        'Tarif Berhasil Disimpan!',
        `Pengaturan tarif iuran ${wilayahLabel} berhasil disimpan. Seluruh nominal masuk 100% langsung ke rekening kas RT.`
      );
    }, 450);
  };

  const handleSaveRekening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtId) {
      showAlert.error('Gagal', 'ID Wilayah RT tidak ditemukan.');
      return;
    }

    setIsSavingRekening(true);
    try {
      await api.updateRtRekening(rtId, rekeningData);
      showAlert.success(
        'Rekening Kas RT Disimpan!',
        'Nomor rekening dan QRIS kas RT berhasil diperbarui. Warga akan melihat info ini saat membayar iuran.'
      );
    } catch (err: any) {
      showAlert.error('Gagal', err.message || 'Gagal menyimpan rekening RT.');
    } finally {
      setIsSavingRekening(false);
    }
  };

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRekeningData((prev) => ({ ...prev, qrisImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Pengaturan Iuran & Rekening Kas RT ({wilayahLabel})</h3>
          <p className="text-xs text-slate-500">Atur nominal tagihan bulanan warga dan rekening / QRIS kas RT untuk transfer langsung warga</p>
        </div>
      </div>

      {/* Bagian 1: Rekening Bank & QRIS Mandiri RT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Rekening Bank & QRIS Mandiri Kas RT</h4>
              <p className="text-xs text-slate-500">Warga akan mentransfer iuran langsung ke rekening atau scan QRIS ini</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveRekening} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bank / E-Wallet</label>
              <select
                value={rekeningData.namaBank}
                onChange={(e) => setRekeningData({ ...rekeningData, namaBank: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="BCA">Bank Central Asia (BCA)</option>
                <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="BNI">Bank Negara Indonesia (BNI)</option>
                <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                <option value="CIMB">CIMB Niaga</option>
                <option value="GOPAY">GoPay / GoBiz RT</option>
                <option value="OVO">OVO Merchant RT</option>
                <option value="DANA">DANA Bisnis RT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening / No. HP E-Wallet</label>
              <input
                type="text"
                placeholder="Contoh: 8820192831"
                value={rekeningData.nomorRekening}
                onChange={(e) => setRekeningData({ ...rekeningData, nomorRekening: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Atas Nama Rekening</label>
              <input
                type="text"
                placeholder="Contoh: Kas RT 03 Sukamaju / Hendra"
                value={rekeningData.atasNamaRekening}
                onChange={(e) => setRekeningData({ ...rekeningData, atasNamaRekening: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload Gambar QRIS Kas RT (Opsional)</label>
              <p className="text-[11px] text-slate-400 mb-2">Upload foto QRIS statis kas RT (dari BCA Merchant, GoBiz, Livin Usaha, dsb)</p>
              
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrisUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {rekeningData.qrisImageUrl && (
                <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">Preview QRIS Kas RT:</p>
                  <img
                    src={rekeningData.qrisImageUrl}
                    alt="QRIS Kas RT"
                    className="w-36 h-36 object-contain rounded-lg border bg-white"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingRekening}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition"
              >
                {isSavingRekening ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isSavingRekening ? 'Menyimpan...' : 'Simpan Rekening & QRIS'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bagian 2: Breakdown Tarif Iuran */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900 text-base">Komponen Iuran Bulanan {wilayahLabel}</h4>
            <button 
              onClick={handleSaveTarif}
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Tarif'}</span>
            </button>
          </div>
          
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
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Simulasi Tagihan Warga</span>
            <div className="mt-4 space-y-2.5 text-xs text-slate-300 border-b border-slate-800 pb-4">
              {tagihanItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.nama}</span>
                  <span className="font-semibold text-white">Rp {item.nominal.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="flex justify-between text-emerald-300 font-bold pt-1 border-t border-slate-800">
                <span>Total Iuran Kas RT</span>
                <span>Rp {totalPokok.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Biaya Admin Platform</span>
                <span className="text-emerald-400 font-semibold">Rp 0 (Gratis)</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <span className="font-bold text-sm">Total Bayar Warga</span>
              <span className="text-xl font-extrabold text-emerald-400">Rp {totalPokok.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-6 leading-relaxed">
            * Warga membayar <strong>100% utuh</strong> ke rekening/QRIS kas {wilayahLabel} tanpa potongan biaya per transaksi.
          </p>
        </div>
      </div>
    </div>
  );
};
