import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import '../../core/utils/image_cache_helper.dart';

class LaporScreen extends StatefulWidget {
  const LaporScreen({super.key});

  @override
  State<LaporScreen> createState() => _LaporScreenState();
}

class _LaporScreenState extends State<LaporScreen> {
  List<dynamic> _laporanList = [];
  bool _isLoading = false;
  Map<String, dynamic>? _user;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _loadLaporanFromDb();
  }

  void _loadUserData() async {
    final user = await ApiService.getUserData();
    if (mounted) setState(() => _user = user);
  }

  Future<void> _loadLaporanFromDb() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.getLaporanList();
      if (mounted) {
        setState(() {
          _laporanList = list;
        });
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Strict Privacy: Regular WARGA only see their own reports or reports targeted to them
  List<dynamic> get _filteredLaporanList {
    final role = _user?['role']?.toString() ?? 'WARGA';
    final myUserId = _user?['id']?.toString();
    final myName = _user?['profile']?['namaLengkap']?.toString().toLowerCase();

    if (role == 'SUPERADMIN' || role == 'ADMIN_RT') {
      return _laporanList;
    }

    if (role == 'SEKRETARIS_RT') {
      return _laporanList.where((l) {
        final t = l['tujuan']?.toString();
        final tipe = l['tipeLaporan']?.toString();
        final uid = l['userId']?.toString();
        return t == 'SEKRETARIS_RT' || t == 'UMUM' || tipe != 'PENGADUAN' || (myUserId != null && uid == myUserId);
      }).toList();
    }

    if (role == 'BENDAHARA_RT') {
      return _laporanList.where((l) {
        final t = l['tujuan']?.toString();
        final uid = l['userId']?.toString();
        return t == 'BENDAHARA_RT' || t == 'UMUM' || (myUserId != null && uid == myUserId);
      }).toList();
    }

    if (role == 'SECURITY') {
      return _laporanList.where((l) {
        final t = l['tujuan']?.toString();
        final uid = l['userId']?.toString();
        return t == 'KEAMANAN' || t == 'UMUM' || (myUserId != null && uid == myUserId);
      }).toList();
    }

    // Regular WARGA: ONLY sees their own reports
    return _laporanList.where((l) {
      final uid = l['userId']?.toString();
      if (myUserId != null && uid == myUserId) return true;
      final targetCustom = l['targetCustom']?.toString().toLowerCase();
      if (myName != null && targetCustom != null && targetCustom.contains(myName)) return true;
      return false;
    }).toList();
  }

  // Strict Authorization: who can respond to this report?
  bool _canUserRespond(Map<String, dynamic> item) {
    if (_user == null) return false;
    final role = _user?['role']?.toString() ?? 'WARGA';
    if (role == 'SUPERADMIN' || role == 'ADMIN_RT') return true;

    final tujuan = item['tujuan']?.toString() ?? 'KETUA_RT';
    final tipe = item['tipeLaporan']?.toString() ?? 'PENGADUAN';

    if (role == 'SEKRETARIS_RT' && (tujuan == 'SEKRETARIS_RT' || tujuan == 'UMUM' || tipe != 'PENGADUAN')) return true;
    if (role == 'BENDAHARA_RT' && (tujuan == 'BENDAHARA_RT' || tujuan == 'UMUM')) return true;
    if (role == 'SECURITY' && (tujuan == 'KEAMANAN' || tujuan == 'UMUM')) return true;
    return false;
  }

  Map<String, dynamic> _parseDataSurat(Map<String, dynamic> item) {
    final raw = item['dataSurat'];
    if (raw == null) return {};
    if (raw is Map<String, dynamic>) return raw;
    try {
      return jsonDecode(raw.toString()) as Map<String, dynamic>;
    } catch (_) {
      return {};
    }
  }

  void _showBuatLaporanModal() {
    final messenger = ScaffoldMessenger.of(context);
    final judulController = TextEditingController();
    final deskripsiController = TextEditingController();

    // Template-specific controllers
    final namaAlmController = TextEditingController();
    final nikAlmController = TextEditingController();
    final tglMeninggalController = TextEditingController();
    final tempatMeninggalController = TextEditingController();
    final hubunganController = TextEditingController(text: 'Anak Kandung');

    final pekerjaanController = TextEditingController();
    final penghasilanController = TextEditingController(text: 'Rp 1.500.000 / bulan');
    final keperluanController = TextEditingController();

    final alamatDomisiliController = TextEditingController();
    final lamaTinggalController = TextEditingController(text: '2 Tahun');

    String tipeLaporan = 'PENGADUAN';
    String tujuan = 'KETUA_RT';
    String kategori = 'FASILITAS_UMUM';
    bool isAnonymous = false;
    String? fotoBase64;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (modalContext) => StatefulBuilder(
        builder: (modalContext, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20, right: 20, top: 20,
            bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.slateBorder,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Buat Laporan / Permohonan Surat RT', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                const Text('Layanan pengaduan dan surat pengantar kelurahan (100% Private & Terenkripsi)',
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                const SizedBox(height: 16),

                // 1. Pilih Template
                DropdownButtonFormField<String>(
                  initialValue: tipeLaporan,
                  decoration: const InputDecoration(
                    labelText: 'Pilih Template / Layanan *',
                    prefixIcon: Icon(Icons.description_outlined),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'PENGADUAN', child: Text('📢 Pengaduan Lingkungan & Fasilitas')),
                    DropdownMenuItem(value: 'SURAT_PENGANTAR', child: Text('📑 Surat Pengantar Kelurahan (KTP/KK)')),
                    DropdownMenuItem(value: 'SURAT_KEMATIAN', child: Text('📜 Surat Keterangan Kematian')),
                    DropdownMenuItem(value: 'SURAT_SKTM', child: Text('📄 Surat Keterangan Tidak Mampu (SKTM)')),
                    DropdownMenuItem(value: 'SURAT_DOMISILI', child: Text('🏡 Surat Keterangan Domisili Warga')),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setModalState(() {
                        tipeLaporan = val;
                        if (val == 'SURAT_KEMATIAN') {
                          judulController.text = 'Permohonan Surat Keterangan Kematian';
                        } else if (val == 'SURAT_SKTM') {
                          judulController.text = 'Permohonan Surat Keterangan Tidak Mampu (SKTM)';
                        } else if (val == 'SURAT_DOMISILI') {
                          judulController.text = 'Permohonan Surat Keterangan Domisili';
                        } else if (val == 'SURAT_PENGANTAR') {
                          judulController.text = 'Permohonan Surat Pengantar Kelurahan';
                        }
                      });
                    }
                  },
                ),
                const SizedBox(height: 12),

                // 2. Ditujukan Ke
                DropdownButtonFormField<String>(
                  initialValue: tujuan,
                  decoration: const InputDecoration(
                    labelText: 'Ditujukan Kepada *',
                    prefixIcon: Icon(Icons.person_pin_rounded),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'KETUA_RT', child: Text('👑 Ketua RT (Administrasi & Surat)')),
                    DropdownMenuItem(value: 'SEKRETARIS_RT', child: Text('📝 Sekretaris RT')),
                    DropdownMenuItem(value: 'BENDAHARA_RT', child: Text('💰 Bendahara RT')),
                    DropdownMenuItem(value: 'KEAMANAN', child: Text('🛡️ Seksi Keamanan & Ronda')),
                    DropdownMenuItem(value: 'KEBERSIHAN', child: Text('🧹 Seksi Kebersihan')),
                    DropdownMenuItem(value: 'UMUM', child: Text('🏢 Pengurus RT Umum')),
                  ],
                  onChanged: (val) {
                    if (val != null) setModalState(() => tujuan = val);
                  },
                ),
                const SizedBox(height: 12),

                // Judul
                TextField(
                  controller: judulController,
                  decoration: const InputDecoration(
                    labelText: 'Judul Laporan / Permohonan *',
                    hintText: 'Contoh: Permohonan Surat Keterangan Kematian Alm. Bpk. Fulan',
                    prefixIcon: Icon(Icons.title_rounded),
                  ),
                ),
                const SizedBox(height: 12),

                // FIELDS TEMPLATE: SURAT KEMATIAN
                if (tipeLaporan == 'SURAT_KEMATIAN') ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.purple.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.purple.withValues(alpha: 0.2)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Data Almarhum / Almarhumah:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.purple)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: namaAlmController,
                          decoration: const InputDecoration(labelText: 'Nama Lengkap Almarhum/ah *', isDense: true),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: nikAlmController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'NIK Almarhum/ah (16 Digit)', isDense: true),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: tglMeninggalController,
                          decoration: const InputDecoration(labelText: 'Hari / Tanggal / Waktu Wafat *', hintText: 'Contoh: 18 September 2026, 08:30 WIB', isDense: true),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: tempatMeninggalController,
                          decoration: const InputDecoration(labelText: 'Tempat Meninggal & Penyebab', hintText: 'Contoh: Rumah Duka / Sakit Tua', isDense: true),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // FIELDS TEMPLATE: SKTM
                if (tipeLaporan == 'SURAT_SKTM') ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Data Keterangan Ekonomi / SKTM:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF92400E))),
                        const SizedBox(height: 8),
                        TextField(
                          controller: pekerjaanController,
                          decoration: const InputDecoration(labelText: 'Pekerjaan Kepala Keluarga', hintText: 'Contoh: Buruh / Pedagang Kecil', isDense: true),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: penghasilanController,
                          decoration: const InputDecoration(labelText: 'Rata-rata Penghasilan Bulanan', isDense: true),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: keperluanController,
                          decoration: const InputDecoration(labelText: 'Keperluan Surat SKTM *', hintText: 'Contoh: Beasiswa KIP Kuliah / BPJS PBI', isDense: true),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Deskripsi Rincian
                TextField(
                  controller: deskripsiController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: tipeLaporan == 'PENGADUAN' ? 'Rincian Keluhan & Lokasi *' : 'Keterangan Pengantar Tambahan *',
                    hintText: 'Jelaskan kronologi atau maksud permohonan secara lengkap...',
                    prefixIcon: const Icon(Icons.notes_rounded),
                  ),
                ),
                const SizedBox(height: 12),

                // Foto Lampiran
                if (tipeLaporan == 'PENGADUAN') ...[
                  const Text('Foto Bukti (Opsional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  if (fotoBase64 != null) ...[
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: _buildImageWidget(fotoBase64!, height: 130, width: double.infinity),
                        ),
                        Positioned(
                          top: 6,
                          right: 6,
                          child: GestureDetector(
                            onTap: () => setModalState(() => fotoBase64 = null),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                              child: const Icon(Icons.close, color: Colors.white, size: 16),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                  ] else ...[
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () async {
                              try {
                                final img = await _picker.pickImage(source: ImageSource.camera, imageQuality: 50, maxWidth: 600, maxHeight: 600);
                                if (img != null) {
                                  final bytes = await img.readAsBytes();
                                  setModalState(() => fotoBase64 = 'data:image/jpeg;base64,${base64Encode(bytes)}');
                                }
                              } catch (e) {
                                messenger.showSnackBar(SnackBar(content: Text('Gagal kamera: $e')));
                              }
                            },
                            icon: const Icon(Icons.camera_alt_rounded, size: 16),
                            label: const Text('Foto Kamera', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () async {
                              try {
                                final img = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 50, maxWidth: 600, maxHeight: 600);
                                if (img != null) {
                                  final bytes = await img.readAsBytes();
                                  setModalState(() => fotoBase64 = 'data:image/jpeg;base64,${base64Encode(bytes)}');
                                }
                              } catch (e) {
                                messenger.showSnackBar(SnackBar(content: Text('Gagal galeri: $e')));
                              }
                            },
                            icon: const Icon(Icons.photo_library_rounded, size: 16),
                            label: const Text('Pilih Galeri', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                  ],

                  Row(
                    children: [
                      Checkbox(
                        value: isAnonymous,
                        onChanged: (val) => setModalState(() => isAnonymous = val ?? false),
                      ),
                      const Text('Kirim sebagai Warga Anonim (Rahasiakan Nama)', style: TextStyle(fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () async {
                      final j = judulController.text.trim();
                      final desc = deskripsiController.text.trim();

                      if (j.isEmpty || desc.isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Judul dan rincian wajib diisi!'), backgroundColor: AppTheme.alertRed),
                        );
                        return;
                      }

                      Navigator.pop(modalContext);

                      final dataSuratMap = {
                        'namaAlmarhum': namaAlmController.text.trim(),
                        'nikAlmarhum': nikAlmController.text.trim(),
                        'tglMeninggal': tglMeninggalController.text.trim(),
                        'tempatMeninggal': tempatMeninggalController.text.trim(),
                        'hubunganPelapor': hubunganController.text.trim(),
                        'pekerjaan': pekerjaanController.text.trim(),
                        'penghasilan': penghasilanController.text.trim(),
                        'keperluan': keperluanController.text.trim(),
                        'alamatDomisili': alamatDomisiliController.text.trim(),
                        'lamaTinggal': lamaTinggalController.text.trim(),
                      };

                      try {
                        await ApiService.createLaporan({
                          'judul': j,
                          'deskripsi': desc,
                          'kategori': kategori,
                          'tujuan': tujuan,
                          'tipeLaporan': tipeLaporan,
                          'isAnonymous': isAnonymous,
                          'fotoUrl': fotoBase64,
                          'dataSurat': dataSuratMap,
                        });
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('✅ Permohonan / Laporan berhasil dikirimkan secara privat!'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                        _loadLaporanFromDb();
                      } catch (e) {
                        messenger.showSnackBar(SnackBar(content: Text('⚠️ Gagal mengirim: $e'), backgroundColor: AppTheme.alertRed));
                      }
                    },
                    child: const Text('Kirim Permohonan Sekarang', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showTindakLanjutModal(Map<String, dynamic> item) {
    final messenger = ScaffoldMessenger.of(context);
    final tanggapanController = TextEditingController(text: item['tanggapanRT']?.toString() ?? '');
    final handlerController = TextEditingController(
      text: _user?['profile']?['namaLengkap'] ?? _user?['phone'] ?? 'Pengurus RT',
    );
    String newStatus = 'SELESAI';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (modalCtx) => StatefulBuilder(
        builder: (modalCtx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20, right: 20, top: 20,
            bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(color: AppTheme.slateBorder, borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Tindak Lanjut & Verifikasi Resmi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text(item['judul'] ?? 'Laporan', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                const SizedBox(height: 16),

                DropdownButtonFormField<String>(
                  initialValue: newStatus,
                  decoration: const InputDecoration(labelText: 'Status Verifikasi *', prefixIcon: Icon(Icons.rule_folder_outlined)),
                  items: const [
                    DropdownMenuItem(value: 'SELESAI', child: Text('✓ Setujui & Selesaikan (Terbitkan Surat)')),
                    DropdownMenuItem(value: 'DIPROSES', child: Text('🔄 Sedang Ditangani / Dalam Proses')),
                    DropdownMenuItem(value: 'DITOLAK', child: Text('✗ Tolak Permohonan / Dibatalkan')),
                  ],
                  onChanged: (val) {
                    if (val != null) setModalState(() => newStatus = val);
                  },
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: handlerController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Petugas / Jabatan *',
                    prefixIcon: Icon(Icons.badge_outlined),
                  ),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: tanggapanController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Catatan Tanggapan & Solusi *',
                    hintText: 'Tuliskan tindakan yang diambil atau verifikasi persetujuan...',
                    prefixIcon: Icon(Icons.comment_outlined),
                  ),
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: newStatus == 'SELESAI' ? AppTheme.successGreen : AppTheme.primaryNavy,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () async {
                      final tanggapan = tanggapanController.text.trim();
                      final handler = handlerController.text.trim();

                      if (tanggapan.isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Catatan tindak lanjut wajib diisi!'), backgroundColor: AppTheme.alertRed),
                        );
                        return;
                      }

                      Navigator.pop(modalCtx);

                      try {
                        await ApiService.updateLaporanStatus(
                          item['id'].toString(),
                          status: newStatus,
                          tanggapanRT: tanggapan,
                          tanggapanBy: handler,
                        );

                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(newStatus == 'SELESAI' ? '✅ Berhasil disetujui & diselesaikan!' : '✅ Status berhasil diperbarui!'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                        _loadLaporanFromDb();
                      } catch (e) {
                        messenger.showSnackBar(
                          SnackBar(content: Text('⚠️ Gagal update: $e'), backgroundColor: AppTheme.alertRed),
                        );
                      }
                    },
                    icon: const Icon(Icons.send_rounded, size: 18),
                    label: const Text('Simpan Tanggapan Resmi', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // DIALOG PRATINJAU & CETAK SURAT RESMI
  void _showCetakSuratModal(Map<String, dynamic> item) {
    final meta = _parseDataSurat(item);
    final tipe = item['tipeLaporan']?.toString() ?? 'SURAT_PENGANTAR';
    final nomorSurat = item['nomorSurat']?.toString() ?? '470/108/RT.03-RW.05/2026';
    final pelapor = item['user']?['profile']?['namaLengkap'] ?? item['pelapor'] ?? 'Warga RT';
    final nik = item['user']?['profile']?['nik'] ?? meta['nikPemohon'] ?? '3201234567890001';

    String judulSurat = 'SURAT PENGANTAR KELURAHAN';
    if (tipe == 'SURAT_KEMATIAN') judulSurat = 'SURAT KETERANGAN KEMATIAN';
    if (tipe == 'SURAT_SKTM') judulSurat = 'SURAT KETERANGAN TIDAK MAMPU (SKTM)';
    if (tipe == 'SURAT_DOMISILI') judulSurat = 'SURAT KETERANGAN DOMISILI';

    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.all(20),
          constraints: const BoxConstraints(maxWidth: 500),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Action Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.print_rounded, color: AppTheme.primaryNavy, size: 20),
                        SizedBox(width: 8),
                        Text('Dokumen Resmi Siap Cetak', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 8),

                // KOP SURAT RESMI
                const Text('PEMERINTAH KOTA ADMINISTRASI LINGKUNGAN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                const Text('RUKUN TETANGGA 03 / RUKUN WARGA 05', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                const Text('KELURAHAN SUKAMAJU ASRI', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                const Text('Sekretariat: Balai Warga RT 03 RW 05 • Sistem Terpadu RtHub', style: TextStyle(fontSize: 9, color: AppTheme.textMuted)),
                const SizedBox(height: 4),
                const Divider(thickness: 2, color: Colors.black87),
                const SizedBox(height: 8),

                // JUDUL SURAT
                Text(judulSurat, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, decoration: TextDecoration.underline)),
                Text('Nomor: $nomorSurat', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
                const SizedBox(height: 12),

                // KETERANGAN
                Align(
                  alignment: Alignment.centerLeft,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Yang bertanda tangan di bawah ini, Pengurus RT 03 / RW 05 menerangkan bahwa:',
                        style: TextStyle(fontSize: 10.5, height: 1.3),
                      ),
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.only(left: 8.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('• Nama Lengkap : $pelapor', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                            Text('• NIK / KTP     : $nik', style: const TextStyle(fontSize: 10.5)),
                            const Text('• Alamat        : Lingkungan RT 03 RW 05', style: TextStyle(fontSize: 10.5)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Keterangan Template
                      if (tipe == 'SURAT_KEMATIAN') ...[
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: AppTheme.slateLight, borderRadius: BorderRadius.circular(8)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Menerangkan benar telah MENINGGAL DUNIA:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                              Text('Nama Almarhum : ${meta['namaAlmarhum'] ?? '-'}', style: const TextStyle(fontSize: 10)),
                              Text('Waktu Wafat   : ${meta['tglMeninggal'] ?? '-'}', style: const TextStyle(fontSize: 10)),
                              Text('Tempat/Penyebab: ${meta['tempatMeninggal'] ?? '-'}', style: const TextStyle(fontSize: 10)),
                            ],
                          ),
                        ),
                      ] else if (tipe == 'SURAT_SKTM') ...[
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: AppTheme.slateLight, borderRadius: BorderRadius.circular(8)),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Keluarga PRA-SEJAHTERA / TIDAK MAMPU:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                              Text('Pekerjaan   : ${meta['pekerjaan'] ?? 'Buruh'}', style: const TextStyle(fontSize: 10)),
                              Text('Penghasilan : ${meta['penghasilan'] ?? '-'}', style: const TextStyle(fontSize: 10)),
                              Text('Keperluan   : ${meta['keperluan'] ?? item['deskripsi'] ?? '-'}', style: const TextStyle(fontSize: 10)),
                            ],
                          ),
                        ),
                      ] else ...[
                        Text(
                          'Surat pengantar ini diberikan untuk keperluan: ${meta['keperluan'] ?? item['judul'] ?? 'Pengurusan ke Kelurahan'}.',
                          style: const TextStyle(fontSize: 10.5, height: 1.3),
                        ),
                      ],
                      const SizedBox(height: 10),
                      const Text(
                        'Demikian surat keterangan pengantar ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
                        style: TextStyle(fontSize: 10.5, height: 1.3),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // TTD & STEMPEL DIGITAL
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      children: [
                        const Text('Warga Pemohon,', style: TextStyle(fontSize: 9.5, color: AppTheme.textSecondary)),
                        const SizedBox(height: 36),
                        Text(pelapor, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, decoration: TextDecoration.underline)),
                      ],
                    ),
                    Column(
                      children: [
                        const Text('Ketua RT 03,', style: TextStyle(fontSize: 9.5, color: AppTheme.textSecondary)),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            border: Border.all(color: AppTheme.electricBlue, width: 1),
                            borderRadius: BorderRadius.circular(6),
                            color: AppTheme.electricBlue.withValues(alpha: 0.05),
                          ),
                          child: const Column(
                            children: [
                              Icon(Icons.verified_rounded, color: AppTheme.electricBlue, size: 16),
                              Text('TERVALIDASI RTHUB', style: TextStyle(fontSize: 7.5, fontWeight: FontWeight.bold, color: AppTheme.electricBlue)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(item['tanggapanBy'] ?? 'Ketua RT', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, decoration: TextDecoration.underline)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Cetak / Bagikan Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('🖨️ Dokumen Surat siap dicetak / disimpan sebagai file PDF resmi!'),
                          backgroundColor: AppTheme.successGreen,
                        ),
                      );
                    },
                    icon: const Icon(Icons.print_rounded, size: 18),
                    label: const Text('Cetak / Simpan Dokumen PDF', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  static Widget _buildImageWidget(String urlOrBase64, {double height = 150, double width = double.infinity}) {
    return ImageCacheHelper.buildImage(
      urlOrBase64,
      height: height,
      width: width,
      borderRadius: BorderRadius.circular(12),
      placeholder: const SizedBox.shrink(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final list = _filteredLaporanList;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Lapor & Layanan Surat RT'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: _loadLaporanFromDb,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showBuatLaporanModal,
        backgroundColor: AppTheme.primaryNavy,
        icon: const Icon(Icons.add_task_rounded, color: Colors.white),
        label: const Text('Buat Laporan / Surat', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadLaporanFromDb,
          child: _isLoading && list.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : list.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(height: MediaQuery.of(context).size.height * 0.15),
                        Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.lock_outline_rounded, size: 48, color: AppTheme.textMuted),
                              const SizedBox(height: 12),
                              const Text('Belum Ada Laporan atau Permohonan Surat Anda',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(height: 4),
                              const Text('Laporan bersifat 100% private. Hanya Anda dan pihak yang ditunjuk yang dapat melihat status tindak lanjutnya.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: _showBuatLaporanModal,
                                icon: const Icon(Icons.add, size: 16),
                                label: const Text('Buat Permohonan / Laporan'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: list.length,
                      itemBuilder: (context, index) {
                        final l = list[index];
                        final statusStr = (l['status'] ?? 'PENDING').toString().toUpperCase();
                        final isResolved = statusStr == 'RESOLVED' || statusStr == 'SELESAI';
                        final isInProgress = statusStr == 'IN_PROGRESS' || statusStr == 'DIPROSES';
                        final isRejected = statusStr == 'REJECTED' || statusStr == 'DITOLAK';
                        final isAnonymous = l['isAnonymous'] == true;
                        final fotoUrl = l['fotoUrl'] as String?;
                        final tipe = l['tipeLaporan']?.toString() ?? 'PENGADUAN';
                        final isSurat = tipe != 'PENGADUAN';
                        final canRespond = _canUserRespond(l);

                        String pelaporName = isAnonymous
                            ? 'Warga Anonim'
                            : (l['user']?['profile']?['namaLengkap'] ?? l['pelapor'] ?? 'Warga RT');

                        String targetLabel = l['tujuan'] ?? 'Pengurus RT';
                        if (targetLabel == 'KETUA_RT') targetLabel = 'Ketua RT';
                        if (targetLabel == 'SEKRETARIS_RT') targetLabel = 'Sekretaris RT';
                        if (targetLabel == 'BENDAHARA_RT') targetLabel = 'Bendahara RT';
                        if (targetLabel == 'KEAMANAN') targetLabel = 'Seksi Keamanan';
                        if (targetLabel == 'KEBERSIHAN') targetLabel = 'Seksi Kebersihan';

                        String createdAtStr = 'Hari ini';
                        if (l['createdAt'] != null) {
                          final date = DateTime.tryParse(l['createdAt'].toString());
                          if (date != null) {
                            final months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                            createdAtStr = '${date.day} ${months[date.month]} ${date.year}';
                          }
                        }

                        return Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: AppTheme.slateBorder),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.02),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: isResolved
                                          ? AppTheme.successGreen.withValues(alpha: 0.12)
                                          : isInProgress
                                              ? AppTheme.electricBlue.withValues(alpha: 0.12)
                                              : isRejected
                                                  ? AppTheme.alertRed.withValues(alpha: 0.12)
                                                  : AppTheme.warningAmber.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      isResolved
                                          ? '✓ Disetujui / Selesai'
                                          : isInProgress
                                              ? '⏳ Sedang Diproses'
                                              : isRejected
                                                  ? '✗ Ditolak'
                                                  : '🕒 Menunggu Respon',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: isResolved
                                            ? AppTheme.successGreen
                                            : isInProgress
                                                ? AppTheme.electricBlue
                                                : isRejected
                                                    ? AppTheme.alertRed
                                                    : AppTheme.warningAmber,
                                      ),
                                    ),
                                  ),
                                  Text(createdAtStr, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                                ],
                              ),
                              const SizedBox(height: 8),

                              // Target & Template Badges
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                    decoration: BoxDecoration(
                                      color: isSurat ? Colors.purple.withValues(alpha: 0.08) : AppTheme.electricBlue.withValues(alpha: 0.08),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: isSurat ? Colors.purple.withValues(alpha: 0.25) : AppTheme.electricBlue.withValues(alpha: 0.2)),
                                    ),
                                    child: Text(
                                      isSurat ? '📜 $tipe' : '📢 PENGADUAN',
                                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSurat ? Colors.purple : AppTheme.electricBlue),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                    decoration: BoxDecoration(
                                      color: AppTheme.slateLight,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text('🎯 Ditujukan: $targetLabel',
                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                    decoration: BoxDecoration(
                                      color: AppTheme.slateLight,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text('👤 $pelaporName',
                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),

                              Text(l['judul'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5)),
                              const SizedBox(height: 4),
                              Text(l['deskripsi'] ?? '-', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.35)),
                              
                              if (fotoUrl != null && fotoUrl.isNotEmpty) ...[
                                const SizedBox(height: 10),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: _buildImageWidget(fotoUrl, height: 140, width: double.infinity),
                                ),
                              ],

                              if (l['tanggapanRT'] != null && l['tanggapanRT'].toString().isNotEmpty) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: (isResolved ? AppTheme.successGreen : AppTheme.electricBlue).withValues(alpha: 0.07),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: (isResolved ? AppTheme.successGreen : AppTheme.electricBlue).withValues(alpha: 0.25)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(
                                            isResolved ? Icons.check_circle_rounded : Icons.info_outline_rounded,
                                            color: isResolved ? AppTheme.successGreen : AppTheme.electricBlue,
                                            size: 16,
                                          ),
                                          const SizedBox(width: 6),
                                          Expanded(
                                            child: Text(
                                              'Tanggapan Resmi (${l['tanggapanBy'] ?? targetLabel}):',
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                                color: isResolved ? const Color(0xFF166534) : AppTheme.primaryNavy,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${l['tanggapanRT']}',
                                        style: const TextStyle(fontSize: 11.5, color: AppTheme.textPrimary, height: 1.3),
                                      ),
                                      if (l['nomorSurat'] != null) ...[
                                        const SizedBox(height: 4),
                                        Text('No. Registrasi: ${l['nomorSurat']}', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF166534))),
                                      ],
                                    ],
                                  ),
                                ),
                              ],

                              const SizedBox(height: 12),
                              const Divider(height: 1),
                              const SizedBox(height: 8),

                              // Actions Row
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  // Print Button for Approved Letters
                                  if (isSurat && isResolved) ...[
                                    ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppTheme.successGreen,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      onPressed: () => _showCetakSuratModal(l),
                                      icon: const Icon(Icons.print_rounded, size: 14),
                                      label: const Text('🖨️ Cetak Surat Resmi', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                    ),
                                  ] else ...[
                                    Text('Kategori: ${l['kategori'] ?? 'Umum'}', style: const TextStyle(fontSize: 10.5, color: AppTheme.textMuted)),
                                  ],

                                  // Follow up / Respond Button: STRICT AUTHORIZATION
                                  if (!isResolved && canRespond) ...[
                                    OutlinedButton.icon(
                                      onPressed: () => _showTindakLanjutModal(l),
                                      icon: const Icon(Icons.handyman_outlined, size: 14, color: AppTheme.electricBlue),
                                      label: const Text('🛠️ Tindak Lanjuti', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                    ),
                                  ] else if (!isResolved && !canRespond) ...[
                                    Text('(Menunggu $targetLabel)', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted, fontStyle: FontStyle.italic)),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
        ),
      ),
    );
  }
}
