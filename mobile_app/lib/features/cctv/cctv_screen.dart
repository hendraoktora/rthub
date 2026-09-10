import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class CctvScreen extends StatefulWidget {
  const CctvScreen({super.key});

  @override
  State<CctvScreen> createState() => _CctvScreenState();
}

class _CctvScreenState extends State<CctvScreen> {
  Map<String, dynamic>? _user;
  List<dynamic> _cctvList = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    setState(() => _isLoading = true);
    final user = await ApiService.getUserData();
    List<dynamic> list = [];
    try {
      list = await ApiService.getCctvList();
    } catch (_) {}

    if (list.isEmpty) {
      list = [
        {
          'id': 'cctv-1',
          'namaTitik': 'Gerbang Utama & Pos Ronda RT 05',
          'streamUrl': 'https://www.youtube.com/watch?v=live_demo_1',
          'thumbnailUrl': '',
          'isActive': true,
        },
        {
          'id': 'cctv-2',
          'namaTitik': 'Pertigaan Blok B & Taman Warga',
          'streamUrl': 'https://www.youtube.com/watch?v=live_demo_2',
          'thumbnailUrl': '',
          'isActive': true,
        },
        {
          'id': 'cctv-3',
          'namaTitik': 'Pintu Belakang & Lapangan Olahraga',
          'streamUrl': 'https://www.youtube.com/watch?v=live_demo_3',
          'thumbnailUrl': '',
          'isActive': true,
        },
      ];
    }

    if (mounted) {
      setState(() {
        _user = user;
        _cctvList = list;
        _isLoading = false;
      });
    }
  }

  bool get _canManageCctv {
    final role = _user?['role']?.toString().toUpperCase() ?? '';
    return role == 'ADMIN_RT' || role == 'SEKRETARIS_RT' || role == 'SUPERADMIN';
  }

  void _showAddCctvDialog() {
    final namaCtrl = TextEditingController();
    final urlCtrl = TextEditingController();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
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
              const Row(
                children: [
                  Icon(Icons.videocam_rounded, color: AppTheme.primaryNavy, size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Tambah Titik CCTV Lingkungan',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Khusus Ketua RT & Sekretaris untuk menyambungkan kamera IP/RTSP/YouTube Live warga.',
                style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: namaCtrl,
                decoration: InputDecoration(
                  labelText: 'Nama Titik / Lokasi CCTV *',
                  hintText: 'Contoh: Gerbang Pos Satpam RW 08',
                  prefixIcon: const Icon(Icons.location_on_outlined, size: 20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: urlCtrl,
                decoration: InputDecoration(
                  labelText: 'Link URL Streaming CCTV *',
                  hintText: 'https://... atau rtsp://...',
                  prefixIcon: const Icon(Icons.link_rounded, size: 20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton.icon(
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          final messenger = ScaffoldMessenger.of(context);
                          final nama = namaCtrl.text.trim();
                          final url = urlCtrl.text.trim();
                          if (nama.isEmpty || url.isEmpty) {
                            messenger.showSnackBar(
                              const SnackBar(
                                content: Text('Nama titik dan Link URL streaming wajib diisi!'),
                                backgroundColor: AppTheme.alertRed,
                              ),
                            );
                            return;
                          }

                          setModalState(() => isSubmitting = true);
                          try {
                            await ApiService.createCctv({
                              'namaTitik': nama,
                              'streamUrl': url,
                            });
                            if (ctx.mounted) Navigator.pop(ctx);
                            messenger.showSnackBar(
                              const SnackBar(
                                content: Text('Titik CCTV berhasil ditambahkan!'),
                                backgroundColor: AppTheme.successGreen,
                              ),
                            );
                            _loadData();
                          } catch (e) {
                            setModalState(() => isSubmitting = false);
                            messenger.showSnackBar(
                              SnackBar(
                                content: Text('Error: $e'),
                                backgroundColor: AppTheme.alertRed,
                              ),
                            );
                          }
                        },
                  icon: isSubmitting
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.add_circle_outline, color: Colors.white),
                  label: Text(
                    isSubmitting ? 'Menyimpan...' : 'Simpan Titik CCTV',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryNavy,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openStream(String streamUrl, String title) async {
    final uri = Uri.tryParse(streamUrl);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                const Icon(Icons.videocam_rounded, color: AppTheme.primaryNavy),
                const SizedBox(width: 8),
                Expanded(child: Text(title, style: const TextStyle(fontSize: 15))),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Alamat Stream URL:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.slateLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: SelectableText(
                    streamUrl,
                    style: const TextStyle(fontSize: 12, color: AppTheme.primaryNavy),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Gunakan aplikasi VLC Media Player atau Browser untuk streaming langsung.',
                  style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                ),
              ],
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Tutup')),
            ],
          ),
        );
      }
    }
  }

  void _confirmDeleteCctv(String id, String nama) {
    final messenger = ScaffoldMessenger.of(context);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Hapus CCTV?'),
        content: Text('Apakah Anda yakin ingin menghapus kamera "$nama"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await ApiService.deleteCctv(id);
                messenger.showSnackBar(
                  const SnackBar(content: Text('CCTV berhasil dihapus'), backgroundColor: AppTheme.successGreen),
                );
                _loadData();
              } catch (e) {
                messenger.showSnackBar(
                  SnackBar(content: Text('Gagal: $e'), backgroundColor: AppTheme.alertRed),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.alertRed),
            child: const Text('Hapus', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'CCTV Lingkungan RT',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        actions: [
          if (_canManageCctv)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: IconButton(
                icon: const Icon(Icons.add_photo_alternate_rounded, color: Colors.white),
                tooltip: 'Tambah Titik CCTV',
                onPressed: _showAddCctvDialog,
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async => _loadData(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Info Card Header
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.videocam_rounded, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Text(
                                    'Live Monitoring RT & RW',
                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                  SizedBox(width: 6),
                                  Icon(Icons.circle, color: AppTheme.alertRed, size: 8),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _canManageCctv
                                    ? 'Anda memiliki hak akses untuk menambah & mengatur kamera streaming.'
                                    : 'Akses pantauan keamanan 24 jam untuk seluruh warga lingkungan.',
                                style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.8)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Daftar Kamera (${_cctvList.length})',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                      ),
                      if (_canManageCctv)
                        TextButton.icon(
                          onPressed: _showAddCctvDialog,
                          icon: const Icon(Icons.add, size: 16, color: AppTheme.primaryNavy),
                          label: const Text(
                            'Tambah CCTV',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  if (_cctvList.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 40),
                        child: Column(
                          children: [
                            Icon(Icons.videocam_off_outlined, size: 56, color: AppTheme.slateBorder),
                            SizedBox(height: 12),
                            Text('Belum ada titik CCTV yang terpasang', style: TextStyle(color: AppTheme.textSecondary)),
                          ],
                        ),
                      ),
                    )
                  else
                    ..._cctvList.map((cctv) {
                      final nama = cctv['namaTitik'] ?? 'CCTV Titik RT';
                      final url = cctv['streamUrl'] ?? '';
                      final id = cctv['id']?.toString() ?? '';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.slateBorder),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Video Stream Placeholder with Overlay
                            Stack(
                              children: [
                                Container(
                                  height: 160,
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    color: Colors.black,
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                    gradient: LinearGradient(
                                      colors: [Colors.grey[900]!, Colors.grey[800]!],
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                    ),
                                  ),
                                  child: Center(
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: Colors.white.withValues(alpha: 0.15),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 36),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          'Klik untuk Memutar Live Stream',
                                          style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: 10,
                                  left: 10,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppTheme.alertRed,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.circle, color: Colors.white, size: 6),
                                        SizedBox(width: 4),
                                        Text(
                                          'LIVE 1080P',
                                          style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                if (_canManageCctv && id.isNotEmpty)
                                  Positioned(
                                    top: 6,
                                    right: 6,
                                    child: CircleAvatar(
                                      backgroundColor: Colors.black.withValues(alpha: 0.5),
                                      radius: 16,
                                      child: IconButton(
                                        padding: EdgeInsets.zero,
                                        icon: const Icon(Icons.delete_outline, color: Colors.white, size: 18),
                                        onPressed: () => _confirmDeleteCctv(id, nama),
                                      ),
                                    ),
                                  ),
                              ],
                            ),

                            Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    nama,
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.link, size: 13, color: AppTheme.textSecondary),
                                      const SizedBox(width: 4),
                                      Expanded(
                                        child: Text(
                                          url,
                                          style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  SizedBox(
                                    width: double.infinity,
                                    height: 38,
                                    child: ElevatedButton.icon(
                                      onPressed: () => _openStream(url, nama),
                                      icon: const Icon(Icons.visibility_rounded, size: 16, color: Colors.white),
                                      label: const Text(
                                        'Tonton Live Streaming',
                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                                      ),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppTheme.primaryNavy,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
    );
  }
}
