import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class LapakScreen extends StatefulWidget {
  const LapakScreen({super.key});

  @override
  State<LapakScreen> createState() => _LapakScreenState();
}

class _LapakScreenState extends State<LapakScreen> {
  List<dynamic> _lapakList = [];
  bool _isLoading = false;
  Map<String, dynamic>? _user;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _loadLapakFromDb();
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

  void _showTambahProdukModal() {
    final messenger = ScaffoldMessenger.of(context);
    final judulController = TextEditingController();
    final hargaController = TextEditingController();
    final waController = TextEditingController(text: _user?['phone'] ?? '');
    final deskripsiController = TextEditingController();
    String kategori = 'Kuliner';
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
                const Text('Pasang Jualan di Lapak Warga', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const Text('Produk akan tampil ke seluruh warga RT & RW di lingkungan Anda',
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                const SizedBox(height: 16),

                // Upload Foto Produk Section
                const Text('Foto Produk / Jasa *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                if (fotoBase64 != null) ...[
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: _buildImageWidget(fotoBase64!, height: 160, width: double.infinity),
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: GestureDetector(
                          onTap: () => setModalState(() => fotoBase64 = null),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Colors.black54,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.close, color: Colors.white, size: 18),
                          ),
                        ),
                      ),
                    ],
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
                          'Upload Foto Produk Menarik',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        const Text(
                          'Foto membuat jualan Anda lebih menarik bagi calon pembeli',
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
                                icon: const Icon(Icons.photo_library_rounded, size: 16, color: Colors.white),
                                label: const Text('Galeri', style: TextStyle(fontSize: 12, color: Colors.white)),
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
                  decoration: const InputDecoration(labelText: 'Nama Produk / Jasa *', hintText: 'Contoh: Risol Mayo Mama'),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: kategori,
                        decoration: const InputDecoration(labelText: 'Kategori'),
                        items: ['Kuliner', 'Jasa', 'Kontrakan', 'Produk', 'Fashion', 'Elektronik']
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
                        decoration: const InputDecoration(labelText: 'Harga (Rp) *', hintText: '25000'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: waController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'No. WhatsApp Penjual *', hintText: '0812xxxxxxxx'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: deskripsiController,
                  maxLines: 2,
                  decoration: const InputDecoration(labelText: 'Deskripsi Produk *', hintText: 'Jelaskan keunggulan produk atau porsi...'),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
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

                      try {
                        await ApiService.createLapak({
                          'judul': judul,
                          'harga': harga,
                          'kategori': kategori,
                          'kontakWa': phone,
                          'deskripsi': desc,
                          'fotoUrl': fotoBase64,
                        });
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('✅ Produk & Foto berhasil dipasang ke Lapak Warga!'),
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
                    child: const Text('Simpan & Pasang ke Lapak'),
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
        content: Text('Yakin ingin menghapus "$title"?'),
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
          const SnackBar(content: Text('Produk berhasil dihapus'), backgroundColor: AppTheme.successGreen),
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
    if (urlOrBase64.startsWith('data:image') || urlOrBase64.length > 200) {
      try {
        final cleanBase64 = urlOrBase64.contains(',') ? urlOrBase64.split(',')[1] : urlOrBase64;
        final bytes = base64Decode(cleanBase64.trim());
        return Image.memory(
          bytes,
          height: height,
          width: width,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _buildPlaceholder(height, width),
        );
      } catch (_) {
        return _buildPlaceholder(height, width);
      }
    } else if (urlOrBase64.startsWith('http')) {
      return Image.network(
        urlOrBase64,
        height: height,
        width: width,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => _buildPlaceholder(height, width),
      );
    }
    return _buildPlaceholder(height, width);
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
    final userRole = _user?['role']?.toString().toUpperCase() ?? 'WARGA';
    final isPengurus = userRole == 'ADMIN_RT' || userRole == 'KETUA_RT' || userRole == 'SUPERADMIN' || userRole == 'BENDAHARA_RT';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Lapak Warga & UMKM (Live DB)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh DB',
            onPressed: _loadLapakFromDb,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showTambahProdukModal,
        backgroundColor: AppTheme.primaryNavy,
        icon: const Icon(Icons.add_business_rounded, color: Colors.white),
        label: const Text('Jual Produk', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadLapakFromDb,
          child: _isLoading && _lapakList.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : _lapakList.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(height: MediaQuery.of(context).size.height * 0.15),
                        Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.storefront_outlined, size: 48, color: AppTheme.textMuted),
                              const SizedBox(height: 12),
                              const Text('Belum Ada Produk di Lapak Warga',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(height: 4),
                              const Text('Jadilah yang pertama memasarkan produk / makanan / jasa Anda di lingkungan RT & RW!',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: _showTambahProdukModal,
                                icon: const Icon(Icons.add, size: 16),
                                label: const Text('Pasang Jualan Sekarang'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: _lapakList.length,
                      itemBuilder: (context, index) {
                        final item = _lapakList[index];
                        final sellerName = item['seller']?['profile']?['namaLengkap'] ?? item['sellerName'] ?? 'Warga RT';
                        final sellerRt = item['rt']?['nomor'] ?? '03';
                        final hargaNum = item['harga'] != null ? double.tryParse(item['harga'].toString()) ?? 0 : 0;
                        final isOwner = item['sellerId'] == currentUserId || isPengurus;
                        final fotoUrl = item['fotoUrl'] as String?;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: AppTheme.slateBorder),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Gambar Produk Jika Ada
                              if (fotoUrl != null && fotoUrl.isNotEmpty) ...[
                                ClipRRect(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                                  child: _buildImageWidget(fotoUrl, height: 170, width: double.infinity),
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
                                              const SizedBox(width: 4),
                                              GestureDetector(
                                                onTap: () => _handleDeleteLapak(item['id'].toString(), item['judul'] ?? 'Produk'),
                                                child: const Padding(
                                                  padding: EdgeInsets.all(4.0),
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
                      },
                    ),
        ),
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
