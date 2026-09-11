import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import '../../core/utils/image_cache_helper.dart';

class LapakScreen extends StatefulWidget {
  const LapakScreen({super.key});

  @override
  State<LapakScreen> createState() => _LapakScreenState();
}

class _LapakScreenState extends State<LapakScreen> with SingleTickerProviderStateMixin {
  List<dynamic> _lapakList = [];
  bool _isLoading = false;
  Map<String, dynamic>? _user;
  final ImagePicker _picker = ImagePicker();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadUserData();
    _loadLapakFromDb();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _loadUserData() async {
    final user = await ApiService.getUserData();
    if (mounted) setState(() => _user = user);
  }

  Future<void> _loadLapakFromDb() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.getLapakList();
      if (mounted) {
        setState(() {
          _lapakList = list;
        });
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<String> _extractImages(dynamic fotoUrl) {
    if (fotoUrl == null) return [];
    if (fotoUrl is List) return fotoUrl.map((e) => e.toString()).toList();
    if (fotoUrl is String) {
      if (fotoUrl.isEmpty) return [];
      if (fotoUrl.startsWith('[') && fotoUrl.endsWith(']')) {
        try {
          final decoded = jsonDecode(fotoUrl);
          if (decoded is List) return decoded.map((e) => e.toString()).toList();
        } catch (_) {}
      }
      if (fotoUrl.contains('|||')) {
        return fotoUrl.split('|||').where((s) => s.isNotEmpty).toList();
      }
      return [fotoUrl];
    }
    return [];
  }

  void _showFormProdukModal({dynamic editItem}) {
    final messenger = ScaffoldMessenger.of(context);
    final isEditing = editItem != null;

    final judulController = TextEditingController(text: editItem?['judul'] ?? '');
    final hargaController = TextEditingController(
      text: editItem?['harga'] != null ? editItem['harga'].toString().replaceAll('.0', '') : '',
    );
    final waController = TextEditingController(
      text: editItem?['kontakWa'] ?? _user?['phone'] ?? '',
    );
    final deskripsiController = TextEditingController(text: editItem?['deskripsi'] ?? '');
    String kategori = editItem?['kategori'] ?? 'Kuliner';
    List<String> fotoList = _extractImages(editItem?['fotoUrl']);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (modalContext) => StatefulBuilder(
        builder: (modalContext, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isEditing ? '✏️ Edit Produk Lapak' : '🏪 Pasang Produk di Lapak Saya',
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.electricBlue.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${fotoList.length} Foto',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.electricBlue),
                      ),
                    ),
                  ],
                ),
                const Text(
                  'Produk dan foto akan tampil ke seluruh warga RT & RW di lingkungan Anda',
                  style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 16),

                // Multi-Photo Upload Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Foto Produk (Bisa Banyak Foto) *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    Text(
                      '${fotoList.length}/10 Foto',
                      style: const TextStyle(fontSize: 11, color: AppTheme.textMuted, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Horizontal Photo Thumbnails List
                if (fotoList.isNotEmpty) ...[
                  SizedBox(
                    height: 110,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: fotoList.length + (fotoList.length < 10 ? 1 : 0),
                      separatorBuilder: (ctx, idx) => const SizedBox(width: 8),
                      itemBuilder: (ctx, idx) {
                        if (idx == fotoList.length) {
                          // Add more button tile
                          return GestureDetector(
                            onTap: () async {
                              final imgs = await _picker.pickMultiImage(imageQuality: 50, maxWidth: 800, maxHeight: 800);
                              if (imgs.isNotEmpty) {
                                for (var img in imgs) {
                                  final bytes = await img.readAsBytes();
                                  setModalState(() {
                                    fotoList.add('data:image/jpeg;base64,${base64Encode(bytes)}');
                                  });
                                }
                              }
                            },
                            child: Container(
                              width: 90,
                              height: 110,
                              decoration: BoxDecoration(
                                color: AppTheme.slateLight,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: AppTheme.slateBorder, style: BorderStyle.solid),
                              ),
                              child: const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.add_photo_alternate_rounded, color: AppTheme.electricBlue, size: 28),
                                  SizedBox(height: 4),
                                  Text('+ Tambah', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.electricBlue)),
                                ],
                              ),
                            ),
                          );
                        }

                        final photoStr = fotoList[idx];
                        return Stack(
                          children: [
                            Container(
                              width: 90,
                              height: 110,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: idx == 0 ? AppTheme.electricBlue : AppTheme.slateBorder,
                                  width: idx == 0 ? 2 : 1,
                                ),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: _buildImageWidget(photoStr, height: 110, width: 90),
                              ),
                            ),
                            if (idx == 0)
                              Positioned(
                                bottom: 4,
                                left: 4,
                                right: 4,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.electricBlue,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'Foto Utama',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: GestureDetector(
                                onTap: () {
                                  setModalState(() {
                                    fotoList.removeAt(idx);
                                  });
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: Colors.black87,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.close, color: Colors.white, size: 14),
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.slateLight,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.slateBorder),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.add_photo_alternate_outlined, color: AppTheme.electricBlue, size: 36),
                        const SizedBox(height: 6),
                        const Text(
                          'Upload Foto Produk (Bisa Pilih Banyak Sekaligus)',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        const Text(
                          'Semakin lengkap foto produk, semakin menarik bagi pembeli',
                          style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                onPressed: () async {
                                  try {
                                    final img = await _picker.pickImage(
                                      source: ImageSource.camera,
                                      imageQuality: 50,
                                      maxWidth: 800,
                                      maxHeight: 800,
                                    );
                                    if (img != null) {
                                      final bytes = await img.readAsBytes();
                                      setModalState(() {
                                        fotoList.add('data:image/jpeg;base64,${base64Encode(bytes)}');
                                      });
                                    }
                                  } catch (e) {
                                    messenger.showSnackBar(SnackBar(content: Text('Gagal kamera: $e')));
                                  }
                                },
                                icon: const Icon(Icons.camera_alt_rounded, size: 16),
                                label: const Text('Kamera', style: TextStyle(fontSize: 12)),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.primaryNavy,
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                onPressed: () async {
                                  try {
                                    final imgs = await _picker.pickMultiImage(
                                      imageQuality: 50,
                                      maxWidth: 800,
                                      maxHeight: 800,
                                    );
                                    if (imgs.isNotEmpty) {
                                      for (var img in imgs) {
                                        final bytes = await img.readAsBytes();
                                        setModalState(() {
                                          fotoList.add('data:image/jpeg;base64,${base64Encode(bytes)}');
                                        });
                                      }
                                    }
                                  } catch (e) {
                                    messenger.showSnackBar(SnackBar(content: Text('Gagal galeri: $e')));
                                  }
                                },
                                icon: const Icon(Icons.photo_library_rounded, size: 16, color: Colors.white),
                                label: const Text('Galeri (Multi)', style: TextStyle(fontSize: 12, color: Colors.white)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                TextField(
                  controller: judulController,
                  decoration: const InputDecoration(labelText: 'Nama Produk / Jasa *', hintText: 'Contoh: Nasi Uduk Komplit Bu Hendra'),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: kategori,
                        decoration: const InputDecoration(labelText: 'Kategori'),
                        items: ['Kuliner', 'Sembako', 'Minuman', 'Jasa', 'Kontrakan', 'Produk', 'Fashion', 'Elektronik']
                            .map((cat) => DropdownMenuItem(value: cat, child: Text(cat)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setModalState(() => kategori = val);
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: hargaController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Harga (Rp) *', hintText: '15000'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: waController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'No. WhatsApp untuk Terima Pesanan *', hintText: '0812xxxxxxxx'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: deskripsiController,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'Deskripsi & Varian Produk *', hintText: 'Jelaskan porsi, varian rasa, atau waktu buka...'),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryNavy,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () async {
                      final judul = judulController.text.trim();
                      final harga = double.tryParse(hargaController.text.trim()) ?? 0;
                      final phone = waController.text.trim();
                      final desc = deskripsiController.text.trim();

                      if (judul.isEmpty || harga <= 0 || phone.isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Judul, harga, dan nomor WA wajib diisi!'), backgroundColor: AppTheme.alertRed),
                        );
                        return;
                      }
                      Navigator.pop(modalContext);

                      // Save encoded multiple photos
                      final fotoPayload = fotoList.isNotEmpty ? jsonEncode(fotoList) : null;

                      try {
                        if (isEditing && editItem['id'] != null) {
                          await ApiService.deleteLapak(editItem['id'].toString());
                        }

                        await ApiService.createLapak({
                          'judul': judul,
                          'harga': harga,
                          'kategori': kategori,
                          'kontakWa': phone,
                          'deskripsi': desc,
                          'fotoUrl': fotoPayload,
                        });

                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(isEditing ? '✅ Produk berhasil diperbarui!' : '✅ Produk & Foto berhasil dipasang ke Lapak Saya!'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                        _loadLapakFromDb();
                      } catch (e) {
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text('⚠️ ${e.toString().replaceAll('Exception: ', '')}'),
                            backgroundColor: AppTheme.alertRed,
                          ),
                        );
                      }
                    },
                    icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                    label: Text(isEditing ? 'Simpan Perubahan Produk' : 'Pasang Produk ke Lapak Saya', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _handleDeleteLapak(String id, String title) async {
    final messenger = ScaffoldMessenger.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Produk Lapak?'),
        content: Text('Yakin ingin menghapus "$title"? Produk tidak akan tampil lagi di Lapak Warga.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.alertRed),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ApiService.deleteLapak(id);
        messenger.showSnackBar(
          const SnackBar(content: Text('Produk berhasil dihapus dari Lapak'), backgroundColor: AppTheme.successGreen),
        );
        _loadLapakFromDb();
      } catch (e) {
        messenger.showSnackBar(
          SnackBar(content: Text('Gagal menghapus: $e'), backgroundColor: AppTheme.alertRed),
        );
      }
    }
  }

  static Widget _buildImageWidget(String urlOrBase64, {double height = 150, double width = double.infinity}) {
    return ImageCacheHelper.buildImage(
      urlOrBase64,
      height: height,
      width: width,
      borderRadius: BorderRadius.circular(14),
      placeholder: _buildPlaceholder(height, width),
    );
  }

  static Widget _buildPlaceholder(double height, double width) {
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: AppTheme.slateLight,
        borderRadius: BorderRadius.circular(14),
      ),
      child: const Center(
        child: Icon(Icons.storefront_rounded, size: 36, color: AppTheme.textMuted),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentUserId = _user?['id'];
    final userPhone = _user?['phone'] ?? '';
    final userRole = _user?['role']?.toString().toUpperCase() ?? 'WARGA';
    final isPengurus = userRole == 'ADMIN_RT' || userRole == 'KETUA_RT' || userRole == 'SUPERADMIN' || userRole == 'BENDAHARA_RT';

    // Filter my products (products matching sellerId, user phone, or seller name)
    final myProducts = _lapakList.where((item) {
      if (item['sellerId'] == currentUserId && currentUserId != null) return true;
      if (item['kontakWa'] == userPhone && userPhone.isNotEmpty) return true;
      if (item['seller']?['profile']?['namaLengkap'] == _user?['profile']?['namaLengkap'] && _user?['profile']?['namaLengkap'] != null) return true;
      return false;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Lapak Warga & UMKM RT'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primaryNavy,
          unselectedLabelColor: AppTheme.textMuted,
          indicatorColor: AppTheme.electricBlue,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.storefront_rounded, size: 18),
                  const SizedBox(width: 6),
                  Text('Semua Lapak (${_lapakList.length})'),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.store_mall_directory_rounded, size: 18),
                  const SizedBox(width: 6),
                  Text('Lapak Saya (${myProducts.length})'),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh DB',
            onPressed: _loadLapakFromDb,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showFormProdukModal(),
        backgroundColor: AppTheme.primaryNavy,
        icon: const Icon(Icons.add_business_rounded, color: Colors.white),
        label: const Text('+ Pasang Produk', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            // TAB 1: SEMUA PRODUK WARGA
            _buildAllLapakTab(currentUserId, isPengurus),

            // TAB 2: LAPAK SAYA (MANAGE MY PRODUCTS)
            _buildMyLapakTab(myProducts),
          ],
        ),
      ),
    );
  }

  Widget _buildAllLapakTab(dynamic currentUserId, bool isPengurus) {
    return RefreshIndicator(
      onRefresh: _loadLapakFromDb,
      child: _isLoading && _lapakList.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : _lapakList.isEmpty
              ? _buildEmptyLapakView(
                  title: 'Belum Ada Produk di Lapak Warga',
                  subtitle: 'Jadilah yang pertama memasarkan produk / makanan / jasa Anda di lingkungan RT & RW!',
                )
              : ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  itemCount: _lapakList.length,
                  itemBuilder: (context, index) {
                    final item = _lapakList[index];
                    final isOwner = item['sellerId'] == currentUserId || isPengurus;
                    return _buildProductCard(item, isOwner: isOwner);
                  },
                ),
    );
  }

  Widget _buildMyLapakTab(List<dynamic> myProducts) {
    return RefreshIndicator(
      onRefresh: _loadLapakFromDb,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          // Banner Lapak Saya
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F766E), Color(0xFF047857)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0F766E).withValues(alpha: 0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.storefront_rounded, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Kelola Lapak & Jualan Saya',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Total ${myProducts.length} produk jualan Anda sedang aktif tayang ke seluruh warga lingkungan.',
                        style: const TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (myProducts.isEmpty)
            _buildEmptyLapakView(
              title: 'Lapak Anda Masih Kosong',
              subtitle: 'Pasang jualan makanan, sembako, atau jasa Anda sekarang agar tetangga bisa langsung order via WhatsApp.',
            )
          else
            ...myProducts.map((item) => _buildMyProductManagementCard(item)),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildEmptyLapakView({required String title, required String subtitle}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.slateLight,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.storefront_outlined, size: 48, color: AppTheme.textMuted),
          ),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.4),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => _showFormProdukModal(),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryNavy,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            icon: const Icon(Icons.add, size: 18, color: Colors.white),
            label: const Text('Pasang Jualan Baru', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(dynamic item, {required bool isOwner}) {
    final sellerName = item['seller']?['profile']?['namaLengkap'] ?? item['sellerName'] ?? 'Warga RT';
    final sellerRt = item['rt']?['nomor'] ?? '03';
    final hargaNum = item['harga'] != null ? double.tryParse(item['harga'].toString()) ?? 0 : 0;
    final photos = _extractImages(item['fotoUrl']);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
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
          // Gambar Produk Multi-Photo
          if (photos.isNotEmpty) ...[
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  child: photos.length > 1
                      ? SizedBox(
                          height: 180,
                          child: PageView.builder(
                            itemCount: photos.length,
                            itemBuilder: (ctx, pIdx) => _buildImageWidget(photos[pIdx], height: 180, width: double.infinity),
                          ),
                        )
                      : _buildImageWidget(photos.first, height: 180, width: double.infinity),
                ),
                if (photos.length > 1)
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.photo_library_rounded, color: Colors.white, size: 12),
                          const SizedBox(width: 4),
                          Text(
                            '${photos.length} Foto (Geser)',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ],

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.electricBlue.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        item['kategori'] ?? 'PRODUK',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.electricBlue),
                      ),
                    ),
                    Row(
                      children: [
                        Text('$sellerName (RT $sellerRt)',
                            style: const TextStyle(fontSize: 11, color: AppTheme.textMuted, fontWeight: FontWeight.w500)),
                        if (isOwner && item['id'] != null) ...[
                          const SizedBox(width: 6),
                          GestureDetector(
                            onTap: () => _showFormProdukModal(editItem: item),
                            child: const Padding(
                              padding: EdgeInsets.all(2.0),
                              child: Icon(Icons.edit_outlined, size: 16, color: AppTheme.electricBlue),
                            ),
                          ),
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: () => _handleDeleteLapak(item['id'].toString(), item['judul'] ?? 'Produk'),
                            child: const Padding(
                              padding: EdgeInsets.all(2.0),
                              child: Icon(Icons.delete_outline_rounded, size: 16, color: AppTheme.alertRed),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(item['judul'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                if (item['deskripsi'] != null && item['deskripsi'].toString().isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(item['deskripsi'], style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                ],
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Rp ${hargaNum.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppTheme.electricBlue),
                    ),
                    Row(
                      children: [
                        OutlinedButton.icon(
                          onPressed: () => _openWhatsAppChat(item['kontakWa'] ?? '081234567890', item['judul'] ?? 'Produk'),
                          icon: const Icon(Icons.chat_outlined, size: 13, color: AppTheme.successGreen),
                          label: const Text('Chat', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.successGreen),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton.icon(
                          onPressed: () => _showOrderModal(item),
                          icon: const Icon(Icons.shopping_cart_outlined, size: 14),
                          label: const Text('Pesan', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.successGreen,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMyProductManagementCard(dynamic item) {
    final hargaNum = item['harga'] != null ? double.tryParse(item['harga'].toString()) ?? 0 : 0;
    final photos = _extractImages(item['fotoUrl']);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.slateBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo Thumbnail
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: photos.isNotEmpty
                    ? _buildImageWidget(photos.first, height: 75, width: 75)
                    : _buildPlaceholder(75, 75),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.electricBlue.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            item['kategori'] ?? 'PRODUK',
                            style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppTheme.electricBlue),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.successGreen.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('✓ Tayang', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item['judul'] ?? '-',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Rp ${hargaNum.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.electricBlue),
                    ),
                    if (photos.length > 1) ...[
                      const SizedBox(height: 2),
                      Text('📸 Memiliki ${photos.length} foto produk', style: const TextStyle(fontSize: 10.5, color: AppTheme.textMuted)),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 8),

          // Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              OutlinedButton.icon(
                onPressed: () => _handleDeleteLapak(item['id'].toString(), item['judul'] ?? 'Produk'),
                icon: const Icon(Icons.delete_outline_rounded, size: 14, color: AppTheme.alertRed),
                label: const Text('Hapus', style: TextStyle(fontSize: 11, color: AppTheme.alertRed, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.alertRed),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: () => _showFormProdukModal(editItem: item),
                icon: const Icon(Icons.edit_rounded, size: 14),
                label: const Text('Edit Produk & Foto', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryNavy,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
  }

  void _openWhatsAppChat(String rawPhone, String productTitle) async {
    String cleanPhone = rawPhone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62${cleanPhone.substring(1)}';
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62$cleanPhone';
    }

    final message = 'Halo, saya tertarik dengan produk/jasa "$productTitle" di Lapak Warga RtHub. Apakah masih tersedia?';
    final url = 'https://wa.me/$cleanPhone?text=${Uri.encodeComponent(message)}';
    final uri = Uri.parse(url);

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await Clipboard.setData(ClipboardData(text: message));
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Nomor WA: $cleanPhone (Pesan telah disalin ke clipboard)'),
              backgroundColor: AppTheme.successGreen,
            ),
          );
        }
      }
    } catch (_) {
      await Clipboard.setData(ClipboardData(text: message));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Nomor WA: $cleanPhone (Pesan disalin ke clipboard)'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
      }
    }
  }

  void _showOrderModal(dynamic item) {
    final buyerName = _user?['profile']?['namaLengkap'] ?? _user?['phone'] ?? 'Warga RT';
    final buyerHouse = _user?['profile']?['noRumah'] ?? 'Blok C';
    final sellerName = item['seller']?['profile']?['namaLengkap'] ?? item['sellerName'] ?? 'Penjual Lapak';
    final rawPhone = item['kontakWa'] ?? '081234567890';
    final productTitle = item['judul'] ?? 'Produk Lapak';
    final hargaUnit = item['harga'] != null ? double.tryParse(item['harga'].toString()) ?? 0 : 0;
    
    int qty = 1;
    final addressCtrl = TextEditingController(text: buyerHouse);
    final notesCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) => StatefulBuilder(
        builder: (modalContext, setModalState) {
          final totalPrice = hargaUnit * qty;
          final totalFormatted = totalPrice.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');

          return Container(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('🛍️ Formulir Pemesanan Langsung', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          Text('Penjual: $sellerName', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.successGreen.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text('Direct WA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Item Detail Box
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.slateLight,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(productTitle, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              const SizedBox(height: 2),
                              Text('Rp ${hargaUnit.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')} / pcs',
                                  style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                            ],
                          ),
                        ),
                        // Qty Counter
                        Row(
                          children: [
                            GestureDetector(
                              onTap: () {
                                if (qty > 1) {
                                  setModalState(() => qty--);
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppTheme.slateBorder),
                                ),
                                child: const Icon(Icons.remove, size: 14),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              child: Text('$qty', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                            ),
                            GestureDetector(
                              onTap: () => setModalState(() => qty++),
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryNavy,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.add, size: 14, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  const Text('Alamat / Unit Rumah Pemesan *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: addressCtrl,
                    decoration: const InputDecoration(hintText: 'Contoh: Blok C3 No. 12 (RT 03)'),
                  ),
                  const SizedBox(height: 12),

                  const Text('Catatan Khusus Penjual (Opsional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: notesCtrl,
                    decoration: const InputDecoration(hintText: 'Contoh: Pedas sedang, diantar jam 12 siang...'),
                  ),
                  const SizedBox(height: 16),

                  // Total calculation
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Pembayaran', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
                      Text('Rp $totalFormatted', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.successGreen)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        Navigator.pop(modalContext);

                        String cleanPhone = rawPhone.replaceAll(RegExp(r'[^0-9]'), '');
                        if (cleanPhone.startsWith('0')) {
                          cleanPhone = '62${cleanPhone.substring(1)}';
                        } else if (!cleanPhone.startsWith('62')) {
                          cleanPhone = '62$cleanPhone';
                        }

                        final orderMessage = '''Halo Kak *$sellerName*, saya ingin pesan dari *Lapak Warga RtHub*:

📦 *Produk:* $productTitle
🔢 *Jumlah:* $qty pcs
💰 *Total Harga:* Rp $totalFormatted
📍 *Alamat Antar:* ${addressCtrl.text.trim()}
👤 *Pemesan:* $buyerName
${notesCtrl.text.trim().isNotEmpty ? '📝 *Catatan:* ${notesCtrl.text.trim()}\n' : ''}
Mohon konfirmasi ketersediaan dan metode pembayarannya. Terima kasih!''';

                        final url = 'https://wa.me/$cleanPhone?text=${Uri.encodeComponent(orderMessage)}';
                        final uri = Uri.parse(url);

                        try {
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri, mode: LaunchMode.externalApplication);
                          } else {
                            await Clipboard.setData(ClipboardData(text: orderMessage));
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Pesanan berhasil dibuat & disalin ke clipboard!'),
                                  backgroundColor: AppTheme.successGreen,
                                ),
                              );
                            }
                          }
                        } catch (_) {
                          await Clipboard.setData(ClipboardData(text: orderMessage));
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Pesanan berhasil dibuat & disalin ke clipboard!'),
                                backgroundColor: AppTheme.successGreen,
                              ),
                            );
                          }
                        }
                      },
                      icon: const Icon(Icons.send_rounded, size: 18),
                      label: const Text('Kirim Pesanan ke WhatsApp Penjual', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.successGreen,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
