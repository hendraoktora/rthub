import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class LaporScreen extends StatefulWidget {
  const LaporScreen({super.key});

  @override
  State<LaporScreen> createState() => _LaporScreenState();
}

class _LaporScreenState extends State<LaporScreen> {
  List<dynamic> _laporanList = [];
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _loadLaporanFromDb();
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
                const Text('Buat Laporan / Keluhan Warga', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const Text('Laporan Anda akan langsung diterima & ditindaklanjuti oleh pengurus RT',
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
                    DropdownMenuItem(value: 'UMUM', child: Text('🏛️ Pengurus RT Umum / Semua')),
                  ],
                  onChanged: (val) {
                    if (val != null) setModalState(() => tujuan = val);
                  },
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: judulController,
                  decoration: const InputDecoration(
                    labelText: 'Judul Masalah *',
                    hintText: 'Contoh: Lampu Jalan Padam',
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
                    labelText: 'Rincian Keluhan & Lokasi *',
                    hintText: 'Jelaskan detail kendala dan lokasi kejadian...',
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

                      if (judul.isEmpty || desc.isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Judul dan rincian keluhan wajib diisi!'), backgroundColor: AppTheme.alertRed),
                        );
                        return;
                      }
                      Navigator.pop(modalContext);

                      String tujuanLabel = 'Ketua RT';
                      if (tujuan == 'SEKRETARIS_RT') tujuanLabel = 'Sekretaris RT';
                      if (tujuan == 'BENDAHARA_RT') tujuanLabel = 'Bendahara RT';
                      if (tujuan == 'UMUM') tujuanLabel = 'Pengurus RT';

                      final judulFinal = '[$tujuanLabel] $judul';

                      try {
                        await ApiService.createLaporan({
                          'judul': judulFinal,
                          'deskripsi': desc,
                          'kategori': kategori,
                          'isAnonymous': isAnonymous,
                          'fotoUrl': fotoBase64,
                        });
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text('✅ Laporan berhasil dikirim ke $tujuanLabel!'),
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
                    child: const Text('Kirim Laporan ke Pengurus RT'),
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
    if (urlOrBase64.startsWith('data:image') || urlOrBase64.length > 200) {
      try {
        final cleanBase64 = urlOrBase64.contains(',') ? urlOrBase64.split(',')[1] : urlOrBase64;
        final bytes = base64Decode(cleanBase64.trim());
        return Image.memory(
          bytes,
          height: height,
          width: width,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
        );
      } catch (_) {
        return const SizedBox.shrink();
      }
    } else if (urlOrBase64.startsWith('http')) {
      return Image.network(
        urlOrBase64,
        height: height,
        width: width,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
      );
    }
    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Lapor & Pengaduan RT (Live DB)'),
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
                        final isResolved = statusStr == 'RESOLVED';
                        final isInProgress = statusStr == 'IN_PROGRESS';
                        final isAnonymous = l['isAnonymous'] == true;
                        final fotoUrl = l['fotoUrl'] as String?;

                        String pelaporName = isAnonymous
                            ? 'Warga Anonim'
                            : (l['user']?['profile']?['namaLengkap'] ?? l['pelapor'] ?? 'Warga RT');

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
                                              : AppTheme.warningAmber.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      isResolved
                                          ? '✓ Ditangani'
                                          : isInProgress
                                              ? '⏳ Diproses'
                                              : '🕒 Menunggu Respon',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: isResolved
                                            ? AppTheme.successGreen
                                            : isInProgress
                                                ? AppTheme.electricBlue
                                                : AppTheme.warningAmber,
                                      ),
                                    ),
                                  ),
                                  Text(createdAtStr, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(l['judul'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(height: 4),
                              Text(l['deskripsi'] ?? '-', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                              
                              if (fotoUrl != null && fotoUrl.isNotEmpty) ...[
                                const SizedBox(height: 10),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: _buildImageWidget(fotoUrl, height: 140, width: double.infinity),
                                ),
                              ],

                              const SizedBox(height: 8),
                              Text('Kategori: ${l['kategori'] ?? 'Umum'} • Pelapor: $pelaporName',
                                  style: const TextStyle(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.w500)),
                              if (l['tanggapanRT'] != null && l['tanggapanRT'].toString().isNotEmpty) ...[
                                const SizedBox(height: 10),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: AppTheme.successGreen.withValues(alpha: 0.08),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.2)),
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Icon(Icons.check_circle_outline_rounded, color: AppTheme.successGreen, size: 16),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          'Respon RT: ${l['tanggapanRT']}',
                                          style: const TextStyle(fontSize: 11, color: Color(0xFF166534), fontWeight: FontWeight.w600),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
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
