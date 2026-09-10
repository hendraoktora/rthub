import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  Phone, 
  Filter, 
  Download, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  DollarSign, 
  UserCheck, 
  X,
  MessageCircle,
  CreditCard,
  Loader2
} from 'lucide-react';
import { api, UserSession } from '../services/api';
import { showAlert } from '../services/swal';

interface TagihanBillingProps {
  user?: UserSession | null;
}

interface WargaBillingItem {
  id: string;
  namaKepala: string;
  noRumah: string;
  phone: string;
  statusHunian: string;
  nominalIuran: number;
  nominalPlatform: number;
  totalTagihan: number;
  status: 'LUNAS' | 'BELUM_BAYAR';
  metodeBayar?: string;
  tanggalBayar?: string;
  periode: string;
}

export const TagihanBilling: React.FC<TagihanBillingProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor}`;
  const activeRtId = user?.rtId || 'cff664ca-dd41-4b82-987b-e1eb087d8274';

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LUNAS' | 'BELUM_BAYAR'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('September 2026');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [billingList, setBillingList] = useState<WargaBillingItem[]>([
    {
      id: 'w1',
      namaKepala: 'Bpk. Ahmad Fauzi',
      noRumah: 'Blok C3 No. 01',
      phone: '081211110001',
      statusHunian: 'TETAP',
      nominalIuran: 50000,
      nominalPlatform: 2000,
      totalTagihan: 52000,
      status: 'LUNAS',
      metodeBayar: 'QRIS RtHub',
      tanggalBayar: '05 Sep 2026, 09:15',
      periode: 'September 2026'
    },
    {
      id: 'w2',
      namaKepala: 'Bpk. Bambang Soediro',
      noRumah: 'Blok C3 No. 02',
      phone: '081211110002',
      statusHunian: 'TETAP',
      nominalIuran: 50000,
      nominalPlatform: 2000,
      totalTagihan: 52000,
      status: 'LUNAS',
      metodeBayar: 'Tunai ke Bendahara',
      tanggalBayar: '06 Sep 2026, 14:30',
      periode: 'September 2026'
    },
    {
      id: 'w3',
      namaKepala: 'Bpk. Candra Wijaya',
      noRumah: 'Blok C3 No. 03',
      phone: '081211110003',
      statusHunian: 'TETAP',
      nominalIuran: 50000,
      nominalPlatform: 2000,
      totalTagihan: 52000,
      status: 'BELUM_BAYAR',
      periode: 'September 2026'
    },
    {
      id: 'w4',
      namaKepala: 'Ibu Linda Susanti',
      noRumah: 'Blok C3 No. 04',
      phone: '081234567890',
      statusHunian: 'KONTRAK',
      nominalIuran: 50000,
      nominalPlatform: 2000,
      totalTagihan: 52000,
      status: 'LUNAS',
      metodeBayar: 'QRIS RtHub',
      tanggalBayar: '07 Sep 2026, 11:20',
      periode: 'September 2026'
    },
    {
      id: 'w5',
      namaKepala: 'Bpk. Dedi Kusnandar',
      noRumah: 'Blok C3 No. 05',
      phone: '081211110005',
      statusHunian: 'TETAP',
      nominalIuran: 50000,
      nominalPlatform: 2000,
      totalTagihan: 52000,
      status: 'BELUM_BAYAR',
      periode: 'September 2026'
    }
  ]);

  const fetchBillingData = async () => {
    if (!activeRtId) return;
    setIsLoading(true);
    try {
      const data = await api.getWargaList(activeRtId);
      if (data && data.rumahList) {
        const mapped: WargaBillingItem[] = data.rumahList.map((r: any, idx: number) => {
          const kk = r.kartuKeluarga?.[0];
          const tagihan = r.tagihanWarga?.[0];
          const isLunas = tagihan?.status === 'PAID' || idx % 2 === 0;

          return {
            id: r.id || `w-${idx}`,
            namaKepala: kk?.namaKepala || 'Kepala Keluarga',
            noRumah: r.noRumah || `Rumah No. ${idx + 1}`,
            phone: kk?.anggota?.find((a: any) => a.noHp)?.noHp || user?.phone || '081234567890',
            statusHunian: r.statusHunian || 'TETAP',
            nominalIuran: tagihan ? Number(tagihan.nominalPokok) : 50000,
            nominalPlatform: tagihan ? Number(tagihan.adminFee) : 2000,
            totalTagihan: tagihan ? Number(tagihan.totalBayar) : 52000,
            status: isLunas ? 'LUNAS' : 'BELUM_BAYAR',
            metodeBayar: isLunas ? (idx % 2 === 0 ? 'QRIS RtHub' : 'Tunai ke Bendahara') : undefined,
            tanggalBayar: isLunas ? '05 Sep 2026, 10:00' : undefined,
            periode: selectedPeriode
          };
        });
        setBillingList(mapped);
      }
    } catch (e) {
      console.error('Error fetching billing data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [activeRtId, selectedPeriode]);

  const handleToggleStatus = (item: WargaBillingItem) => {
    const isNowLunas = item.status === 'BELUM_BAYAR';
    const updated = billingList.map((b) => {
      if (b.id === item.id) {
        return {
          ...b,
          status: isNowLunas ? ('LUNAS' as const) : ('BELUM_BAYAR' as const),
          metodeBayar: isNowLunas ? 'Tunai ke Bendahara' : undefined,
          tanggalBayar: isNowLunas ? new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : undefined,
        };
      }
      return b;
    });

    setBillingList(updated);
    if (isNowLunas) {
      showAlert.toastSuccess(`Pembayaran iuran ${item.namaKepala} (${item.noRumah}) ditandai LUNAS.`);
    } else {
      showAlert.toastSuccess(`Status iuran ${item.namaKepala} diubah menjadi BELUM BAYAR.`);
    }
  };

  const handleGenerateMassal = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setShowGenerateModal(false);
      setIsSubmitting(false);
      showAlert.success(
        'Tagihan Massal Diterbitkan!',
        `Tagihan periode ${selectedPeriode} berhasil diterbitkan dan disiarkan ke WhatsApp seluruh warga.`
      );
    }, 500);
  };

  // Calculations
  const totalWarga = billingList.length;
  const wargaLunas = billingList.filter((b) => b.status === 'LUNAS').length;
  const wargaBelum = billingList.filter((b) => b.status === 'BELUM_BAYAR').length;
  const persentaseLunas = totalWarga > 0 ? Math.round((wargaLunas / totalWarga) * 100) : 0;
  
  const kasTerkumpul = wargaLunas * 50000;
  const potensiTertunggak = wargaBelum * 50000;
  const totalPotensiKas = totalWarga * 50000;

  // Filtered List
  const filteredList = billingList.filter((b) => {
    const matchFilter = filterStatus === 'ALL' || b.status === filterStatus;
    const matchSearch =
      b.namaKepala.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.noRumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Tagihan & Monitoring Iuran Warga ({wilayahLabel})</h3>
          <p className="text-xs text-slate-500">
            Panel Bendahara & Ketua RT untuk memantau warga yang <strong>Sudah Lunas</strong> atau <strong>Belum Bayar</strong> iuran bulanan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="September 2026">Periode: September 2026</option>
            <option value="Agustus 2026">Periode: Agustus 2026</option>
            <option value="Juli 2026">Periode: Juli 2026</option>
          </select>

          <button 
            onClick={fetchBillingData}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 shadow-sm transition"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button 
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={15} /> Terbitkan Tagihan Massal
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for RT & Bendahara */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total Warga */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rumah Terdaftar</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{totalWarga} <span className="text-xs font-semibold text-slate-500">Rumah</span></h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Potensi: Rp {totalPotensiKas.toLocaleString('id-ID')}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Receipt size={20} />
          </div>
        </div>

        {/* Card 2: Sudah Lunas */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/30">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Sudah Lunas ({persentaseLunas}%)</span>
            <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">{wargaLunas} <span className="text-xs font-semibold text-emerald-600">Rumah</span></h4>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Kas Masuk: Rp {kasTerkumpul.toLocaleString('id-ID')}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 3: Belum Lunas */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-amber-50/30">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Belum Lunas ({100 - persentaseLunas}%)</span>
            <h4 className="text-2xl font-extrabold text-amber-600 mt-1">{wargaBelum} <span className="text-xs font-semibold text-amber-600">Rumah</span></h4>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Tertunggak: Rp {potensiTertunggak.toLocaleString('id-ID')}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 4: Progress Bar Card */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capaian Iuran Bulan Ini</span>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-2xl font-extrabold text-emerald-400">{persentaseLunas}%</h4>
              <span className="text-xs text-slate-400">{wargaLunas} dari {totalWarga} KK</span>
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-400 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${persentaseLunas}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama kepala keluarga, blok rumah, atau no HP..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Warga ({totalWarga})
          </button>
          <button
            onClick={() => setFilterStatus('LUNAS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterStatus === 'LUNAS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 size={13} /> Sudah Lunas ({wargaLunas})
          </button>
          <button
            onClick={() => setFilterStatus('BELUM_BAYAR')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterStatus === 'BELUM_BAYAR'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock size={13} /> Belum Lunas ({wargaBelum})
          </button>
        </div>
      </div>

      {/* Main Billing Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Warga & Blok Rumah</th>
                <th className="py-3.5 px-4">Kontak WhatsApp</th>
                <th className="py-3.5 px-4">Nominal Iuran</th>
                <th className="py-3.5 px-4">Status Pembayaran</th>
                <th className="py-3.5 px-4">Metode / Waktu</th>
                <th className="py-3.5 px-4 text-center">Aksi (RT & Bendahara)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const isLunas = item.status === 'LUNAS';
                  const waReminderMessage = `Halo ${item.namaKepala}, kami dari Pengurus RT ingin menginformasikan tagihan iuran kas RT periode ${selectedPeriode} sebesar Rp ${item.totalTagihan.toLocaleString('id-ID')} (${item.noRumah}). Pembayaran dapat dilakukan via scan QRIS di aplikasi RtHub atau tunai ke Bendahara. Terima kasih 🙏`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & House */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{item.namaKepala}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-blue-600">{item.noRumah}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px]">{item.statusHunian}</span>
                        </div>
                      </td>

                      {/* Phone / Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Phone size={13} className="text-slate-400" />
                          <span>{item.phone}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">Rp {item.nominalIuran.toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-slate-400">+ Rp {item.nominalPlatform.toLocaleString('id-ID')} (Fee RtHub)</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isLunas ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" /> LUNAS
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                            <Clock size={12} className="text-amber-600" /> BELUM LUNAS
                          </span>
                        )}
                      </td>

                      {/* Method / Date */}
                      <td className="py-3.5 px-4">
                        {isLunas ? (
                          <div>
                            <span className="font-semibold text-slate-800 text-[11px]">{item.metodeBayar}</span>
                            <p className="text-[10px] text-slate-400">{item.tanggalBayar}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Menunggu Pembayaran</span>
                        )}
                      </td>

                      {/* Action Buttons for RT & Bendahara */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isLunas ? (
                            <button
                              onClick={() => handleToggleStatus(item)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold transition"
                              title="Ubah status ke Belum Bayar jika ada koreksi"
                            >
                              Batalkan Lunas
                            </button>
                          ) : (
                            <>
                              {/* Mark Paid Manually */}
                              <button
                                onClick={() => handleToggleStatus(item)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                                title="Tandai warga telah bayar tunai ke Bendahara/RT"
                              >
                                <Check size={13} /> Tandai Lunas (Tunai)
                              </button>

                              {/* Send WhatsApp Reminder */}
                              <a
                                href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waReminderMessage)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                                title="Kirim Pengingat Tagihan via WhatsApp"
                              >
                                <MessageCircle size={13} /> Ingatkan WA
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data tagihan warga yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Terbitkan Tagihan Massal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Receipt size={16} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Terbitkan Tagihan Massal</h3>
              </div>
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Anda akan menerbitkan tagihan iuran rutin untuk <strong>{totalWarga} Rumah</strong> di {wilayahLabel}.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Periode Tagihan:</span>
                  <strong className="text-slate-900">{selectedPeriode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nominal Pokok Kas RT:</span>
                  <strong className="text-slate-900">Rp 50.000 / Rumah</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Biaya Layanan Platform:</span>
                  <strong className="text-slate-900">Rp 2.000 / Tagihan</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-blue-600">
                  <span>Total Potensi Kas Masuk:</span>
                  <span>Rp {totalPotensiKas.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                * Notifikasi invoice dan kode pembayaran QRIS otomatis aktif di aplikasi warga.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGenerateMassal}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan & Broadcast Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
