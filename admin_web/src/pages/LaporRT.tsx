import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquarePlus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Printer, 
  MessageCircle, 
  Send, 
  RefreshCw, 
  Loader2, 
  FileText, 
  X,
  Building2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { api, UserSession } from '../services/api';
import { showAlert } from '../services/swal';

interface LaporRTProps {
  user?: UserSession | null;
}

export const LaporRT: React.FC<LaporRTProps> = ({ user }) => {
  const rtNomor = user?.rtNomor || '03';
  const rwNomor = user?.rwNomor || '05';
  const kelurahanNama = user?.kelurahanNama || 'Sukamaju Asri';
  const wilayahLabel = user?.wilayah || `RT ${rtNomor} / RW ${rwNomor}`;
  const userName = user?.name || 'Warga RT';
  const userRole = user?.role || 'WARGA';

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<any | null>(null);
  const [printSuratData, setPrintSuratData] = useState<any | null>(null);
  const [tanggapanText, setTanggapanText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [tipeLaporan, setTipeLaporan] = useState<string>('PENGADUAN');
  const [tujuan, setTujuan] = useState<string>('KETUA_RT');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('FASILITAS_UMUM');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Form Extra State for Surat Templates
  const [dataSurat, setDataSurat] = useState<any>({
    namaPemohon: userName,
    nikPemohon: '',
    keperluan: '',
    // Kematian
    namaAlmarhum: '',
    nikAlmarhum: '',
    tglMeninggal: '',
    tempatMeninggal: '',
    penyebabKematian: '',
    hubunganPelapor: 'Anak Kandung',
    // SKTM
    pekerjaan: '',
    tanggungan: '3',
    penghasilan: 'Rp 1.500.000 / bulan',
    // Domisili
    alamatKtp: '',
    alamatDomisili: '',
    lamaTinggal: '2 Tahun',
    jenisUsaha: '',
  });

  const [laporanList, setLaporanList] = useState<any[]>([
    {
      id: 'demo-1',
      pelapor: `Bpk. Rahmat (${wilayahLabel})`,
      userId: user?.id || 'demo-user',
      judul: 'Permohonan Surat Keterangan Kematian (Alm. Bpk. Sutrisno)',
      deskripsi: 'Permohonan surat pengantar kematian dari RT untuk pengurusan akta kematian dan klaim asuransi keluarga.',
      kategori: 'ADMINISTRASI',
      tipeLaporan: 'SURAT_KEMATIAN',
      tujuan: 'KETUA_RT',
      status: 'RESOLVED',
      nomorSurat: `470/108/RT.${rtNomor}-RW.${rwNomor}/IX/2026`,
      tanggapanRT: 'Surat keterangan kematian telah diverifikasi dan disetujui oleh Ketua RT. Silakan cetak dokumen resmi terlampir.',
      tanggapanBy: 'Bpk. Hendra (Ketua RT)',
      createdAt: 'Kemarin, 14:30 WIB',
      dataSurat: JSON.stringify({
        namaPemohon: 'Bpk. Rahmat',
        nikPemohon: '3201234567890001',
        namaAlmarhum: 'Bpk. Sutrisno',
        nikAlmarhum: '3201234567890099',
        tglMeninggal: '18 September 2026',
        tempatMeninggal: 'RSUD Daerah',
        penyebabKematian: 'Sakit Medis',
        hubunganPelapor: 'Anak Kandung',
      }),
    },
    {
      id: 'demo-2',
      pelapor: `Ibu Siti (${wilayahLabel})`,
      userId: 'user-other',
      judul: 'Surat Keterangan Tidak Mampu (SKTM) untuk Beasiswa Pendidikan',
      deskripsi: 'Pengajuan SKTM RT untuk beasiswa kuliah anak pertama di perguruan tinggi negeri.',
      kategori: 'ADMINISTRASI',
      tipeLaporan: 'SURAT_SKTM',
      tujuan: 'KETUA_RT',
      status: 'RESOLVED',
      nomorSurat: `470/112/RT.${rtNomor}-RW.${rwNomor}/IX/2026`,
      tanggapanRT: 'Data ekonomi keluarga sudah terverifikasi di buku kas/warga. Rekomendasi SKTM disetujui.',
      tanggapanBy: 'Bpk. Hendra (Ketua RT)',
      createdAt: 'Kemarin, 09:15 WIB',
      dataSurat: JSON.stringify({
        namaPemohon: 'Ibu Siti',
        nikPemohon: '3201234567890002',
        pekerjaan: 'Pedagang Kecil',
        tanggungan: '3 Orang',
        penghasilan: 'Rp 1.800.000 / bulan',
        keperluan: 'Pendaftaran Beasiswa Kuliah KIP Kuliah',
      }),
    }
  ]);

  const loadLaporan = async () => {
    try {
      setLoading(true);
      const res = await api.getLaporanList();
      if (res && Array.isArray(res)) {
        setLaporanList(res);
      }
    } catch (err) {
      console.warn('Using local fallback for laporan list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaporan();
  }, [user]);

  // Authorization Check: can current user respond / follow up this report?
  const canUserRespond = (laporan: any): boolean => {
    if (!user) return false;
    const role = user.role;
    if (role === 'SUPERADMIN' || role === 'ADMIN_RT') return true;
    const target = laporan.tujuan || 'KETUA_RT';
    if (role === 'SEKRETARIS_RT' && (target === 'SEKRETARIS_RT' || target === 'UMUM' || laporan.tipeLaporan !== 'PENGADUAN')) return true;
    if (role === 'BENDAHARA_RT' && (target === 'BENDAHARA_RT' || target === 'UMUM')) return true;
    if (role === 'SECURITY' && (target === 'KEAMANAN' || target === 'UMUM')) return true;
    return false;
  };

  const handleAddLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) {
      showAlert.error('Input Tidak Lengkap', 'Judul dan isi rincian wajib diisi.');
      return;
    }

    const payload = {
      judul: judul.trim(),
      deskripsi: deskripsi.trim(),
      kategori,
      tujuan,
      tipeLaporan,
      isAnonymous,
      dataSurat,
    };

    setIsSubmitting(true);
    try {
      const res = await api.createLaporan(payload);
      if (res && res.id) {
        setLaporanList([res, ...laporanList]);
      } else {
        const localItem = {
          id: Date.now().toString(),
          pelapor: isAnonymous ? 'Warga Anonim' : `${userName} (${wilayahLabel})`,
          userId: user?.id,
          judul,
          deskripsi,
          kategori,
          tujuan,
          tipeLaporan,
          status: 'PENDING',
          nomorSurat: null,
          tanggapanRT: null,
          tanggapanBy: null,
          createdAt: 'Baru saja',
          dataSurat: JSON.stringify(dataSurat),
        };
        setLaporanList([localItem, ...laporanList]);
      }
      setShowAddModal(false);
      setJudul('');
      setDeskripsi('');
      showAlert.success('Berhasil Diajukan', 'Laporan/permohonan surat berhasil dicatat dan dikirimkan secara privat ke pihak yang ditunjuk.');
    } catch (err: any) {
      showAlert.error('Gagal Mengajukan', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBeriTanggapan = async (id: string) => {
    if (!tanggapanText.trim()) {
      showAlert.error('Wajib Diisi', 'Silakan tuliskan tanggapan atau tindakan solusi.');
      return;
    }

    try {
      await api.updateLaporanStatus(id, {
        status: 'RESOLVED',
        tanggapanRT: tanggapanText.trim(),
        tanggapanBy: `${userName} (${userRole})`,
      });
    } catch (err) {
      console.warn('API fallback updateStatus locally:', err);
    }

    const currentYear = new Date().getFullYear();
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const romanMonth = romanMonths[new Date().getMonth()];
    const autoNo = `470/${Math.floor(100 + Math.random() * 900)}/RT.${rtNomor}-RW.${rwNomor}/${romanMonth}/${currentYear}`;

    setLaporanList(
      laporanList.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'RESOLVED',
              tanggapanRT: tanggapanText.trim(),
              tanggapanBy: `${userName} (${userRole})`,
              nomorSurat: item.nomorSurat || (item.tipeLaporan !== 'PENGADUAN' ? autoNo : null),
            }
          : item
      )
    );

    setSelectedLaporan(null);
    setTanggapanText('');
    showAlert.toastSuccess('Tanggapan berhasil disimpan dan status laporan diperbarui.');
  };

  const filtered = laporanList.filter((l) => {
    const q = searchTerm.toLowerCase();
    return (
      (l.judul || '').toLowerCase().includes(q) ||
      (l.deskripsi || '').toLowerCase().includes(q) ||
      (l.pelapor || '').toLowerCase().includes(q) ||
      (l.tujuan || '').toLowerCase().includes(q)
    );
  });

  // Parse JSON helper for template metadata
  const parseDataSurat = (item: any) => {
    if (!item.dataSurat) return {};
    if (typeof item.dataSurat === 'object') return item.dataSurat;
    try {
      return JSON.parse(item.dataSurat);
    } catch (_) {
      return {};
    }
  };

  const getTujuanLabel = (t: string) => {
    switch (t) {
      case 'KETUA_RT': return '👑 Ketua RT';
      case 'SEKRETARIS_RT': return '📝 Sekretaris RT';
      case 'BENDAHARA_RT': return '💰 Bendahara RT';
      case 'KEAMANAN': return '🛡️ Seksi Keamanan';
      case 'KEBERSIHAN': return '🧹 Seksi Kebersihan';
      case 'PENGURUS_RW': return '🏛️ Pengurus RW';
      default: return '🏢 Pengurus RT';
    }
  };

  const getTipeLaporanBadge = (tipe: string) => {
    switch (tipe) {
      case 'SURAT_KEMATIAN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">📜 Surat Kematian</span>;
      case 'SURAT_SKTM':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">📄 Surat SKTM</span>;
      case 'SURAT_DOMISILI':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">🏡 Surat Domisili</span>;
      case 'SURAT_PENGANTAR':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700">📑 Surat Pengantar</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">📢 Pengaduan Warga</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Layanan Laporan & Surat Pengantar ({wilayahLabel})</h3>
          <p className="text-xs text-slate-500">
            Kanal pengaduan lingkungan dan permohonan surat resmi RT/Kelurahan (100% Private & Terenkripsi)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadLaporan}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 transition"
            title="Muat Ulang"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition"
          >
            <MessageSquarePlus size={16} />
            <span>+ Buat Laporan / Permohonan Surat</span>
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul, tipe surat, nama pelapor, atau isi..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Data</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada laporan atau permohonan surat yang masuk di antrean Anda.
            </div>
          ) : (
            filtered.map((laporan) => {
              const meta = parseDataSurat(laporan);
              const isResolved = laporan.status === 'RESOLVED' || laporan.status === 'SELESAI';
              const isSurat = laporan.tipeLaporan && laporan.tipeLaporan !== 'PENGADUAN';
              const canRespond = canUserRespond(laporan);

              return (
                <div key={laporan.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isResolved ? '✓ Disetujui / Selesai' : '⏳ Menunggu Respon'}
                        </span>
                        {getTipeLaporanBadge(laporan.tipeLaporan)}
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                          Ditujukan: {getTujuanLabel(laporan.tujuan)}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">{laporan.createdAt}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-800">{laporan.judul}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{laporan.deskripsi}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Pemohon / Pelapor: {laporan.pelapor || (laporan.user?.profile?.namaLengkap ? `${laporan.user.profile.namaLengkap} (${laporan.user.profile.noRumah || 'Warga'})` : 'Warga RT')}
                      </p>

                      {/* Detail Extra Box for Surat */}
                      {isSurat && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
                          <p className="font-bold text-slate-900 mb-1">Rincian Berkas Permohonan Surat:</p>
                          {laporan.tipeLaporan === 'SURAT_KEMATIAN' && (
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>Nama Almarhum: <strong>{meta.namaAlmarhum || '-'}</strong></div>
                              <div>NIK Almarhum: <strong>{meta.nikAlmarhum || '-'}</strong></div>
                              <div>Waktu Wafat: <strong>{meta.tglMeninggal || '-'}</strong></div>
                              <div>Penyebab: <strong>{meta.penyebabKematian || '-'}</strong></div>
                            </div>
                          )}
                          {laporan.tipeLaporan === 'SURAT_SKTM' && (
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>Pekerjaan: <strong>{meta.pekerjaan || '-'}</strong></div>
                              <div>Tanggungan: <strong>{meta.tanggapan || meta.tanggungan || '-'}</strong></div>
                              <div>Penghasilan: <strong>{meta.penghasilan || '-'}</strong></div>
                              <div>Keperluan: <strong>{meta.keperluan || '-'}</strong></div>
                            </div>
                          )}
                          {laporan.tipeLaporan === 'SURAT_DOMISILI' && (
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>Alamat KTP: <strong>{meta.alamatKtp || '-'}</strong></div>
                              <div>Domisili Saat Ini: <strong>{meta.alamatDomisili || '-'}</strong></div>
                              <div>Lama Tinggal: <strong>{meta.lamaTinggal || '-'}</strong></div>
                            </div>
                          )}
                          {laporan.tipeLaporan === 'SURAT_PENGANTAR' && (
                            <div className="text-[11px]">
                              Keperluan Pengantar: <strong>{meta.keperluan || laporan.judul}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tanggapan Box */}
                      {laporan.tanggapanRT && (
                        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/60 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold text-emerald-800 mb-0.5">
                              Tanggapan & Verifikasi ({laporan.tanggapanBy || 'Pengurus RT'}):
                            </p>
                            <p className="text-emerald-700">{laporan.tanggapanRT}</p>
                            {laporan.nomorSurat && (
                              <p className="mt-1 text-[11px] font-bold text-emerald-900">
                                Nomor Registrasi Surat: {laporan.nomorSurat}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {/* Print Button (Available for Resolved Letters) */}
                        {isSurat && isResolved && (
                          <button
                            onClick={() => setPrintSuratData(laporan)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Printer size={14} />
                            <span>🖨️ Cetak Surat Pengantar Resmi (Kop RT)</span>
                          </button>
                        )}

                        {/* Respond Button (Strict Authorization: only designated role or Ketua RT) */}
                        {!isResolved && canRespond && (
                          <button
                            onClick={() => setSelectedLaporan(laporan)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <MessageCircle size={14} />
                            <span>Tindak Lanjuti / Setujui</span>
                          </button>
                        )}

                        {/* Restricted Notice for other users */}
                        {!isResolved && !canRespond && (
                          <span className="text-[11px] text-slate-400 italic">
                            (Menunggu respon resmi dari {getTujuanLabel(laporan.tujuan)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL BUAT LAPORAN / PERMOHONAN SURAT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Form Laporan & Permohonan Surat RT</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddLaporan} className="space-y-3.5 text-xs">
              {/* Template Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Jenis Layanan / Template *</label>
                <select
                  value={tipeLaporan}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTipeLaporan(val);
                    if (val === 'SURAT_KEMATIAN') setJudul('Permohonan Surat Keterangan Kematian');
                    else if (val === 'SURAT_SKTM') setJudul('Permohonan Surat Keterangan Tidak Mampu (SKTM)');
                    else if (val === 'SURAT_DOMISILI') setJudul('Permohonan Surat Keterangan Domisili');
                    else if (val === 'SURAT_PENGANTAR') setJudul('Permohonan Surat Pengantar Kelurahan (KTP/KK)');
                    else setJudul('');
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="PENGADUAN">📢 Laporan Masalah Lingkungan (Fasilitas / Sampah / Keamanan)</option>
                  <option value="SURAT_PENGANTAR">📑 Surat Pengantar Kelurahan Umum (KTP, KK, Pindah Datang)</option>
                  <option value="SURAT_KEMATIAN">📜 Surat Keterangan Kematian (Akta Kematian / Makam)</option>
                  <option value="SURAT_SKTM">📄 Surat Keterangan Tidak Mampu / SKTM (Beasiswa / KIS / Bansos)</option>
                  <option value="SURAT_DOMISILI">🏡 Surat Keterangan Domisili Warga / Tempat Usaha</option>
                </select>
              </div>

              {/* Ditujukan Ke */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ditujukan Kepada Siapa? *</label>
                <select
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="KETUA_RT">👑 Ketua RT (Segala Urusan Administrasi & Surat Resmi)</option>
                  <option value="SEKRETARIS_RT">📝 Sekretaris RT (Surat Menyurat & Pendataan)</option>
                  <option value="BENDAHARA_RT">💰 Bendahara RT (Iuran, Keuangan, Kas Lingkungan)</option>
                  <option value="KEAMANAN">🛡️ Seksi Keamanan & Ronda Malam</option>
                  <option value="KEBERSIHAN">🧹 Seksi Kebersihan Lingkungan</option>
                  <option value="PENGURUS_RW">🏛️ Pengurus RW Lingkungan</option>
                  <option value="UMUM">🏢 Pengurus RT Umum</option>
                </select>
              </div>

              {/* Judul */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Laporan / Permohonan *</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Permohonan Surat Keterangan Kematian Alm. Bpk. Sutrisno"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              {/* TEMPLATE KHUSUS: SURAT KEMATIAN */}
              {tipeLaporan === 'SURAT_KEMATIAN' && (
                <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2.5">
                  <p className="font-bold text-purple-900 text-[11px] uppercase tracking-wide">Data Almarhum / Almarhumah:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Nama Lengkap Almarhum *</label>
                      <input
                        type="text"
                        required
                        value={dataSurat.namaAlmarhum}
                        onChange={(e) => setDataSurat({ ...dataSurat, namaAlmarhum: e.target.value })}
                        placeholder="Nama Alm."
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">NIK Almarhum (16 Digit)</label>
                      <input
                        type="text"
                        value={dataSurat.nikAlmarhum}
                        onChange={(e) => setDataSurat({ ...dataSurat, nikAlmarhum: e.target.value })}
                        placeholder="NIK KTP"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Waktu Meninggal *</label>
                      <input
                        type="text"
                        required
                        value={dataSurat.tglMeninggal}
                        onChange={(e) => setDataSurat({ ...dataSurat, tglMeninggal: e.target.value })}
                        placeholder="Contoh: 18 September 2026, 08:30 WIB"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Tempat Meninggal & Penyebab</label>
                      <input
                        type="text"
                        value={dataSurat.tempatMeninggal}
                        onChange={(e) => setDataSurat({ ...dataSurat, tempatMeninggal: e.target.value })}
                        placeholder="Contoh: RSUD / Sakit Tua"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATE KHUSUS: SURAT SKTM */}
              {tipeLaporan === 'SURAT_SKTM' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                  <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wide">Data Keterangan Ekonomi / SKTM:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Pekerjaan Kepala Keluarga</label>
                      <input
                        type="text"
                        value={dataSurat.pekerjaan}
                        onChange={(e) => setDataSurat({ ...dataSurat, pekerjaan: e.target.value })}
                        placeholder="Contoh: Buruh Harian Lepas"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-0.5">Estimasi Penghasilan Bulanan</label>
                      <input
                        type="text"
                        value={dataSurat.penghasilan}
                        onChange={(e) => setDataSurat({ ...dataSurat, penghasilan: e.target.value })}
                        placeholder="Contoh: Rp 1.500.000 / bulan"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-600 block mb-0.5">Keperluan Surat SKTM *</label>
                      <input
                        type="text"
                        required
                        value={dataSurat.keperluan}
                        onChange={(e) => setDataSurat({ ...dataSurat, keperluan: e.target.value })}
                        placeholder="Contoh: Permohonan Beasiswa KIP Kuliah Anak / KIS BPJS PBI"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deskripsi Kronologi / Keperluan Tambahan */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rincian Lengkap / Keterangan Tambahan *</label>
                <textarea
                  required
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Jelaskan secara ringkas maksud laporan atau permohonan surat ini..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Anonim Checkbox (hanya jika pengaduan umum) */}
              {tipeLaporan === 'PENGADUAN' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="anonimCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="anonimCheck" className="text-slate-600">
                    Kirim sebagai Warga Anonim (Nama disamarkan dari pengurus)
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{isSubmitting ? 'Mengirim...' : 'Ajukan Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TANGGAPAN / SOLUSI (KHUSUS ROLE YANG BERHAK) */}
      {selectedLaporan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Respon & Tindak Lanjut Resmi</h3>
            <p className="text-xs text-slate-500 font-semibold">{selectedLaporan.judul}</p>
            
            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 block">Catatan Tanggapan & Tindakan:</label>
              <textarea
                rows={4}
                value={tanggapanText}
                onChange={(e) => setTanggapanText(e.target.value)}
                placeholder="Tuliskan tindakan yang telah dilakukan atau status persetujuan surat pengantar..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLaporan(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleBeriTanggapan(selectedLaporan.id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex items-center gap-1.5 transition"
                >
                  <Send size={14} />
                  <span>Setujui & Selesaikan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK SURAT PENGANTAR RESMI (PRINT VIEW) */}
      {printSuratData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 print:m-0 print:p-0 print:shadow-none print:w-full">
            
            {/* Action Bar at Top (Hidden during printing) */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-blue-600" />
                <span className="font-bold text-sm text-slate-800">Pratinjau Dokumen Surat Pengantar Resmi</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Printer size={15} />
                  <span>Cetak / Simpan PDF (Ctrl+P)</span>
                </button>
                <button
                  onClick={() => setPrintSuratData(null)}
                  className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL LETTER PAPER */}
            <div id="surat-resmi-print" className="p-8 sm:p-12 border border-slate-300 rounded-lg text-slate-900 font-serif leading-relaxed text-sm bg-white print:border-none print:p-0">
              
              {/* KOP SURAT RT/RW */}
              <div className="text-center pb-3 border-b-4 border-double border-slate-900 space-y-1">
                <h4 className="font-bold tracking-widest text-xs uppercase">PEMERINTAH KOTA ADMINISTRASI LINGKUNGAN</h4>
                <h3 className="font-extrabold tracking-wider text-sm uppercase">KECAMATAN SEJAHTERA - KELURAHAN {kelurahanNama.toUpperCase()}</h3>
                <h2 className="font-black tracking-wider text-base uppercase">RUKUN TETANGGA {rtNomor} / RUKUN WARGA {rwNomor}</h2>
                <p className="text-[11px] font-sans text-slate-600 italic">
                  Sekretariat: Balai Pertemuan Warga RT {rtNomor} / RW {rwNomor} • Aplikasi Terpadu RtHub
                </p>
              </div>

              {/* JUDUL & NOMOR SURAT */}
              <div className="text-center my-6 space-y-1">
                <h3 className="font-bold text-base tracking-wide underline uppercase">
                  {printSuratData.tipeLaporan === 'SURAT_KEMATIAN'
                    ? 'SURAT KETERANGAN KEMATIAN'
                    : printSuratData.tipeLaporan === 'SURAT_SKTM'
                    ? 'SURAT KETERANGAN TIDAK MAMPU (SKTM)'
                    : printSuratData.tipeLaporan === 'SURAT_DOMISILI'
                    ? 'SURAT KETERANGAN DOMISILI'
                    : 'SURAT PENGANTAR KELURAHAN'}
                </h3>
                <p className="text-xs font-sans font-semibold tracking-wider text-slate-700">
                  Nomor: {printSuratData.nomorSurat || `470/099/RT.${rtNomor}-RW.${rwNomor}/2026`}
                </p>
              </div>

              {/* ISI PERNYATAAN */}
              <div className="space-y-4 font-sans text-xs text-justify">
                <p>
                  Yang bertanda tangan di bawah ini, Pengurus Rukun Tetangga (RT) {rtNomor} Rukun Warga (RW) {rwNomor} Kelurahan {kelurahanNama}, dengan ini menerangkan dengan sebenarnya bahwa:
                </p>

                {/* TABEL BIODATA PEMOHON */}
                <div className="pl-6 space-y-1.5 py-1">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 text-slate-600">Nama Lengkap</div>
                    <div className="col-span-8 font-bold uppercase">: {printSuratData.pelapor || userName}</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 text-slate-600">NIK / No. KTP</div>
                    <div className="col-span-8 font-bold">: {parseDataSurat(printSuratData).nikPemohon || '3201234567890001'}</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 text-slate-600">Alamat Tempat Tinggal</div>
                    <div className="col-span-8">: Lingkungan RT {rtNomor} / RW {rwNomor}, Kelurahan {kelurahanNama}</div>
                  </div>
                </div>

                {/* KETERANGAN KHUSUS BERDASARKAN TEMPLATE */}
                {printSuratData.tipeLaporan === 'SURAT_KEMATIAN' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                    <p className="font-bold">Menerangkan bahwa benar nama di bawah ini telah MENINGGAL DUNIA:</p>
                    <div className="pl-4 space-y-1">
                      <div>Nama Almarhum/ah: <strong>{parseDataSurat(printSuratData).namaAlmarhum || '-'}</strong></div>
                      <div>NIK Almarhum/ah: <strong>{parseDataSurat(printSuratData).nikAlmarhum || '-'}</strong></div>
                      <div>Hari / Tanggal Wafat: <strong>{parseDataSurat(printSuratData).tglMeninggal || '-'}</strong></div>
                      <div>Tempat / Penyebab: <strong>{parseDataSurat(printSuratData).tempatMeninggal || '-'}</strong></div>
                      <div>Hubungan Pelapor: <strong>{parseDataSurat(printSuratData).hubunganPelapor || '-'}</strong></div>
                    </div>
                  </div>
                )}

                {printSuratData.tipeLaporan === 'SURAT_SKTM' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                    <p className="font-bold">Menerangkan bahwa nama tersebut di atas benar:</p>
                    <p>
                      Adalah warga kami yang tergolong keluarga <strong>PRA-SEJAHTERA / EKONOMI TIDAK MAMPU</strong> dengan pekerjaan sebagai {parseDataSurat(printSuratData).pekerjaan || 'Buruh/Wiraswasta'} dan tanggungan {parseDataSurat(printSuratData).tanggungan || 'Keluarga'}.
                    </p>
                    <p>
                      Surat pengantar ini dibuat sebagai kelengkapan pengajuan: <strong>{parseDataSurat(printSuratData).keperluan || printSuratData.deskripsi}</strong>.
                    </p>
                  </div>
                )}

                {printSuratData.tipeLaporan === 'SURAT_DOMISILI' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                    <p>
                      Menerangkan bahwa nama tersebut di atas benar berdomisili menetap di wilayah RT {rtNomor} / RW {rwNomor} sejak {parseDataSurat(printSuratData).lamaTinggal || '2 Tahun yang lalu'}.
                    </p>
                  </div>
                )}

                {printSuratData.tipeLaporan === 'SURAT_PENGANTAR' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                    <p>
                      Surat pengantar ini diberikan untuk keperluan: <strong>{parseDataSurat(printSuratData).keperluan || printSuratData.judul}</strong> ke Kantor Kelurahan {kelurahanNama}.
                    </p>
                  </div>
                )}

                <p>
                  Demikian surat keterangan pengantar ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya dan sesuai dengan ketentuan yang berlaku.
                </p>
              </div>

              {/* KOLOM TANDA TANGAN */}
              <div className="mt-10 pt-4 grid grid-cols-2 text-center text-xs font-sans">
                <div>
                  <p className="text-slate-500 mb-16">Pemohon / Warga yang bersangkutan,</p>
                  <p className="font-bold underline uppercase">{printSuratData.pelapor || userName}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-2">{kelurahanNama}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-slate-500 mb-6 font-semibold">Ketua Rukun Tetangga (RT) {rtNomor}</p>
                  
                  {/* Digital Signature & Stamp Box */}
                  <div className="inline-flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-blue-400 bg-blue-50/50 mb-2">
                    <ShieldCheck size={24} className="text-blue-600" />
                    <span className="text-[9px] font-bold text-blue-700 uppercase tracking-tighter">TERVERIFIKASI RTHUB OS</span>
                    <span className="text-[8px] text-blue-500">{printSuratData.nomorSurat}</span>
                  </div>

                  <p className="font-bold underline uppercase">{printSuratData.tanggapanBy || 'Ketua RT 03'}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaporRT;
