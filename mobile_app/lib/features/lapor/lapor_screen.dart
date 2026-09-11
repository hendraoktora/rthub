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

  void _showBuatLaporanModal() {
    final messenger = ScaffoldMessenger.of(context);
    final judulController = TextEditingController();
    final deskripsiController = TextEditingController();
    final customTargetController = TextEditingController();
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
                const Text('Buat Laporan / Pengaduan Lingkungan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const Text('Laporan dapat ditujukan ke Pengurus RT, Seksi Khusus, atau Warga/Tetangga tertentu',
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                const SizedBox(height: 16),

                DropdownButtonFormField<String>(
                  initialValue: tujuan,
                  decoration: const InputDecoration(
                    labelText: 'Ditujukan Kepada *',
                    prefixIcon: Icon(Icons.person_pin_rounded),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'KETUA_RT', child: Text('👑 Ketua RT (Bpk. Hendra)')),
                    DropdownMenuItem(value: 'SEKRETARIS_RT', child: Text('📝 Sekretaris RT (Bpk. Aditya)')),
                    DropdownMenuItem(value: 'BENDAHARA_RT', child: Text('💰 Bendahara RT (Ibu Siti)')),
                    DropdownMenuItem(value: 'KEAMANAN', child: Text('🛡️ Seksi Keamanan & Ronda Malam')),
                    DropdownMenuItem(value: 'KEBERSIHAN', child: Text('🧹 Seksi Kebersihan Lingkungan')),
                    DropdownMenuItem(value: 'PEMBANGUNAN', child: Text('🏗️ Seksi Pembangunan & Sarana')),
                    DropdownMenuItem(value: 'PENGURUS_RW', child: Text('🏛️ Pengurus RW Lingkungan')),
                    DropdownMenuItem(value: 'WARGA_SPESIFIK', child: Text('👤 Warga / Tetangga Tertentu')),
                    DropdownMenuItem(value: 'UMUM', child: Text('🏢 Pengurus RT Umum / Semua')),
                  ],
                  onChanged: (val) {
                    if (val != null) setModalState(() => tujuan = val);
                  },
                ),
                if (tujuan == 'WARGA_SPESIFIK') ...[
                  const SizedBox(height: 12),
                  TextField(
                    controller: customTargetController,
                    decoration: const InputDecoration(
                      labelText: 'Nama & Blok Rumah Warga yang Dituju *',
                      hintText: 'Contoh: Bpk. Budi (Blok A3 No. 12)',
                      prefixIcon: Icon(Icons.home_work_outlined),
                    ),
                  ),
                ],
                const SizedBox(height: 12),

                TextField(
                  controller: judulController,
                  decoration: const InputDecoration(
                    labelText: 'Judul Masalah / Permohonan *',
                    hintText: 'Contoh: Lampu Jalan Gang 3 Mati Total',
                    prefixIcon: Icon(Icons.title_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: kategori,
                  decoration: const InputDecoration(
                    labelText: 'Kategori Masalah',
                    prefixIcon: Icon(Icons.category_outlined),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'FASILITAS_UMUM', child: Text('Fasilitas Umum & Jalan')),
                    DropdownMenuItem(value: 'KEBERSIHAN', child: Text('Kebersihan & Sampah')),
                    DropdownMenuItem(value: 'KEAMANAN', child: Text('Keamanan Lingkungan')),
                    DropdownMenuItem(value: 'KETERTIBAN', child: Text('Ketertiban & Kebisingan')),
                    DropdownMenuItem(value: 'ADMINISTRASI', child: Text('Administrasi & Surat Pengantar')),
                    DropdownMenuItem(value: 'SOSIAL_WARGA', child: Text('Sosial & Bantuan Warga')),
                    DropdownMenuItem(value: 'LAINNYA', child: Text('Lainnya')),
                  ],
                  onChanged: (val) {
                    if (val != null) setModalState(() => kategori = val);
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: deskripsiController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Rincian Keluhan & Lokasi Kejadian *',
                    hintText: 'Jelaskan detail kendala, kronologi, atau lokasi yang perlu ditindaklanjuti...',
                    prefixIcon: Icon(Icons.notes_rounded),
                  ),
                ),
                const SizedBox(height: 12),

                // Foto Bukti Kejadian
                const Text('Foto Bukti Kejadian (Opsional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
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
                              final img = await _picker.pickImage(
                                source: ImageSource.camera,
                                imageQuality: 50,
                                maxWidth: 600,
                                maxHeight: 600,
                              );
                              if (img != null) {
                                final bytes = await img.readAsBytes();
                                setModalState(() {
                                  fotoBase64 = 'data:image/jpeg;base64,${base64Encode(bytes)}';
                                });
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
                              final img = await _picker.pickImage(
                                source: ImageSource.gallery,
                                imageQuality: 50,
                                maxWidth: 600,
                                maxHeight: 600,
                              );
                              if (img != null) {
                                final bytes = await img.readAsBytes();
                                setModalState(() {
                                  fotoBase64 = 'data:image/jpeg;base64,${base64Encode(bytes)}';
                                });
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
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      final judul = judulController.text.trim();
                      final desc = deskripsiController.text.trim();
                      final customTarget = customTargetController.text.trim();

                      if (judul.isEmpty || desc.isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Judul dan rincian keluhan wajib diisi!'), backgroundColor: AppTheme.alertRed),
                        );
                        return;
                      }

                      if (tujuan == 'WARGA_SPESIFIK' && customTarget.isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Nama / Blok rumah penerima wajib diisi!'), backgroundColor: AppTheme.alertRed),
                        );
                        return;
                      }

                      Navigator.pop(modalContext);

                      String targetLabel = 'Ketua RT';
                      if (tujuan == 'SEKRETARIS_RT') targetLabel = 'Sekretaris RT';
                      if (tujuan == 'BENDAHARA_RT') targetLabel = 'Bendahara RT';
                      if (tujuan == 'KEAMANAN') targetLabel = 'Seksi Keamanan';
                      if (tujuan == 'KEBERSIHAN') targetLabel = 'Seksi Kebersihan';
                      if (tujuan == 'PEMBANGUNAN') targetLabel = 'Seksi Pembangunan';
                      if (tujuan == 'PENGURUS_RW') targetLabel = 'Pengurus RW';
                      if (tujuan == 'WARGA_SPESIFIK') targetLabel = customTarget;
                      if (tujuan == 'UMUM') targetLabel = 'Pengurus RT';

                      try {
                        await ApiService.createLaporan({
                          'judul': judul,
                          'deskripsi': desc,
                          'kategori': kategori,
                          'tujuan': targetLabel,
                          'isAnonymous': isAnonymous,
                          'fotoUrl': fotoBase64,
                        });
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text('✅ Laporan berhasil dikirim ke $targetLabel!'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                        _loadLaporanFromDb();
                      } catch (e) {
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text('⚠️ ${e.toString().replaceAll('Exception: ', '')}'),
                            backgroundColor: AppTheme.alertRed,
                          ),
                        );
                      }
                    },
                    child: const Text('Kirim Laporan & Teruskan ke Pihak Terkait'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showTindakLanjutModal(dynamic item) {
    final messenger = ScaffoldMessenger.of(context);
    final currentStatus = (item['status'] ?? 'PENDING').toString().toUpperCase();
    String newStatus = currentStatus == 'PENDING' ? 'DIPROSES' : (currentStatus == 'DIPROSES' ? 'SELESAI' : 'SELESAI');
    
    final defaultHandler = _user?['profile']?['namaLengkap'] ?? _user?['phone'] ?? 'Pihak Dituju';
    final handlerController = TextEditingController(text: item['tanggapanBy'] ?? defaultHandler);
    final tanggapanController = TextEditingController(text: item['tanggapanRT'] ?? '');

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
                    decoration: BoxDecoration(
                      color: AppTheme.slateBorder,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.electricBlue.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.handyman_rounded, color: AppTheme.electricBlue, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Tindak Lanjut & Respon Laporan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          Text(item['judul'] ?? 'Laporan', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                const Text('Perbarui Status Laporan *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: newStatus,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.rule_folder_outlined)),
                  items: const [
                    DropdownMenuItem(value: 'DIPROSES', child: Text('🔄 Sedang Ditangani / Dalam Pengerjaan')),
                    DropdownMenuItem(value: 'SELESAI', child: Text('✓ Selesai & Dituntaskan')),
                    DropdownMenuItem(value: 'DITOLAK', child: Text('✗ Tidak Valid / Dibatalkan')),
                  ],
                  onChanged: (val) {
                    if (val != null) setModalState(() => newStatus = val);
                  },
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: handlerController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Penindak Lanjut / Jabatan *',
                    hintText: 'Contoh: Ketua RT / Seksi Keamanan',
                    prefixIcon: Icon(Icons.badge_outlined),
                  ),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: tanggapanController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Catatan Tindak Lanjut & Solusi *',
                    hintText: 'Tuliskan tindakan yang telah atau sedang dilakukan...',
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
                            content: Text(newStatus == 'SELESAI' ? '✅ Laporan berhasil dituntaskan!' : '✅ Status tindak lanjut berhasil diperbarui!'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                        _loadLaporanFromDb();
                      } catch (e) {
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text('⚠️ Gagal update tindak lanjut: $e'),
                            backgroundColor: AppTheme.alertRed,
                          ),
                        );
                      }
                    },
                    icon: const Icon(Icons.send_rounded, size: 18),
                    label: const Text('Simpan & Publikasikan Tindak Lanjut', style: TextStyle(fontWeight: FontWeight.bold)),
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
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Lapor & Pengaduan Warga (Live DB)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh DB',
            onPressed: _loadLaporanFromDb,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showBuatLaporanModal,
        backgroundColor: AppTheme.primaryNavy,
        icon: const Icon(Icons.campaign_rounded, color: Colors.white),
        label: const Text('Buat Laporan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadLaporanFromDb,
          child: _isLoading && _laporanList.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : _laporanList.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(height: MediaQuery.of(context).size.height * 0.15),
                        Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.mark_email_read_outlined, size: 48, color: AppTheme.textMuted),
                              const SizedBox(height: 12),
                              const Text('Belum Ada Laporan Keluhan di Lingkungan RT',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(height: 4),
                              const Text('Jika Anda menemukan fasilitas rusak atau kendala kebersihan, laporkan langsung di sini.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: _showBuatLaporanModal,
                                icon: const Icon(Icons.add, size: 16),
                                label: const Text('Buat Laporan Baru'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: _laporanList.length,
                      itemBuilder: (context, index) {
                        final l = _laporanList[index];
                        final statusStr = (l['status'] ?? 'PENDING').toString().toUpperCase();
                        final isResolved = statusStr == 'RESOLVED' || statusStr == 'SELESAI';
                        final isInProgress = statusStr == 'IN_PROGRESS' || statusStr == 'DIPROSES';
                        final isRejected = statusStr == 'REJECTED' || statusStr == 'DITOLAK';
                        final isAnonymous = l['isAnonymous'] == true;
                        final fotoUrl = l['fotoUrl'] as String?;

                        String pelaporName = isAnonymous
                            ? 'Warga Anonim'
                            : (l['user']?['profile']?['namaLengkap'] ?? l['pelapor'] ?? 'Warga RT');

                        String targetLabel = l['tujuan'] ?? 'Pengurus RT';
                        if (targetLabel.isEmpty) targetLabel = 'Pengurus RT';

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
                                          ? '✓ Selesai'
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

                              // Target and Reporter Information Pills
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                    decoration: BoxDecoration(
                                      color: AppTheme.electricBlue.withValues(alpha: 0.08),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.2)),
                                    ),
                                    child: Text('🎯 Ditujukan ke: $targetLabel',
                                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppTheme.electricBlue)),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                    decoration: BoxDecoration(
                                      color: AppTheme.slateLight,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text('👤 Pelapor: $pelaporName',
                                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w500, color: AppTheme.textSecondary)),
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
                                              'Tanggapan & Tindak Lanjut (${l['tanggapanBy'] ?? targetLabel}):',
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
                                    ],
                                  ),
                                ),
                              ],

                              const SizedBox(height: 12),
                              const Divider(height: 1),
                              const SizedBox(height: 8),

                              // Follow up button
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Kategori: ${l['kategori'] ?? 'Fasilitas'}',
                                    style: const TextStyle(fontSize: 10.5, color: AppTheme.textMuted, fontWeight: FontWeight.w500),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed: () => _showTindakLanjutModal(l),
                                    icon: const Icon(Icons.handyman_outlined, size: 14, color: AppTheme.electricBlue),
                                    label: Text(
                                      l['tanggapanRT'] != null ? 'Edit Tindak Lanjut' : '🛠️ Tindak Lanjuti',
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.electricBlue),
                                    ),
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(color: AppTheme.electricBlue),
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                      minimumSize: Size.zero,
                                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                  ),
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
