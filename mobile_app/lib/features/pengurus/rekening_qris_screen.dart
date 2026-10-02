import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class RekeningQrisScreen extends StatefulWidget {
  const RekeningQrisScreen({super.key});

  @override
  State<RekeningQrisScreen> createState() => _RekeningQrisScreenState();
}

class _RekeningQrisScreenState extends State<RekeningQrisScreen> {
  final _namaBankController = TextEditingController(text: 'BCA');
  final _nomorRekController = TextEditingController();
  final _atasNamaController = TextEditingController();
  String? _qrisImageUrl;

  bool _isLoading = true;
  bool _isSaving = false;
  bool _isBendahara = true;
  String _userRole = 'BENDAHARA_RT';
  String? _rtId;

  final ImagePicker _picker = ImagePicker();

  final List<String> _bankOptions = [
    'BCA',
    'Mandiri',
    'BRI',
    'BNI',
    'BSI',
    'Bank Jago',
    'CIMB Niaga',
    'Permata',
    'Danamon',
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _namaBankController.dispose();
    _nomorRekController.dispose();
    _atasNamaController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = await ApiService.getCurrentUser();
      if (user != null) {
        final role = user['role']?.toString().toUpperCase() ?? 'WARGA';
        _userRole = role;
        _isBendahara = role == 'BENDAHARA_RT' ||
            role == 'BENDAHARA' ||
            role == 'ADMIN_RT' ||
            role == 'SUPERADMIN';
        _rtId = user['rtId']?.toString();
      }

      final rek = await ApiService.getRtRekening(_rtId ?? '');
      _namaBankController.text = rek['namaBank']?.toString() ?? 'BCA';
      _nomorRekController.text = rek['nomorRekening']?.toString() ?? '';
      _atasNamaController.text = rek['atasNamaRekening']?.toString() ?? '';
      _qrisImageUrl = rek['qrisImageUrl']?.toString();
    } catch (_) {
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );
      if (image == null) return;

      final bytes = await image.readAsBytes();
      final base64String = 'data:image/jpeg;base64,${base64Encode(bytes)}';

      setState(() {
        _qrisImageUrl = base64String;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Foto kode QRIS berhasil dimuat! Tekan "Simpan Pengaturan" di bawah.'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal memilih gambar: $e'),
            backgroundColor: AppTheme.alertRed,
          ),
        );
      }
    }
  }

  void _showImageSourcePicker() {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Upload QRIS Kas RT',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.photo_library_rounded, color: AppTheme.electricBlue),
                title: const Text('Pilih dari Galeri Foto'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt_rounded, color: AppTheme.successGreen),
                title: const Text('Ambil Foto via Kamera'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.camera);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleSave() async {
    final bank = _namaBankController.text.trim();
    final noRek = _nomorRekController.text.trim();
    final atasNama = _atasNamaController.text.trim();

    if (bank.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nama bank wajib diisi!'), backgroundColor: AppTheme.alertRed),
      );
      return;
    }

    if (noRek.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nomor rekening wajib diisi!'), backgroundColor: AppTheme.alertRed),
      );
      return;
    }

    if (atasNama.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nama pemilik rekening (a/n) wajib diisi!'), backgroundColor: AppTheme.alertRed),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      await ApiService.updateRtRekening(
        _rtId ?? '',
        namaBank: bank,
        nomorRekening: noRek,
        atasNamaRekening: atasNama,
        qrisImageUrl: _qrisImageUrl,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Informasi Rekening Bank & QRIS Kas RT berhasil disimpan!'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menyimpan: $e'),
            backgroundColor: AppTheme.alertRed,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Rekening & QRIS Kas RT'),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (!_isBendahara) ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppTheme.warningAmber.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppTheme.warningAmber.withValues(alpha: 0.4)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.lock_outline_rounded, color: AppTheme.warningAmber, size: 22),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Mode Lihat Saja (${_userRole == "ADMIN_RT" ? "Ketua RT" : _userRole == "SEKRETARIS_RT" ? "Sekretaris RT" : "Pengurus"})',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.warningAmber),
                                  ),
                                  const SizedBox(height: 3),
                                  const Text(
                                    'Hanya Bendahara RT dan Ketua RT yang memiliki hak akses untuk mengubah informasi rekening & upload QRIS.',
                                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Info Header Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F5132).withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF0F5132).withValues(alpha: 0.25)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.qr_code_2_rounded, color: Color(0xFF0F5132), size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Rekening & QRIS Resmi Iuran Kas RT',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F5132)),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Warga akan melihat nomor rekening dan kode QRIS ini saat membayar iuran bulanan RT di aplikasi.',
                                  style: TextStyle(color: AppTheme.textPrimary.withValues(alpha: 0.85), fontSize: 12, height: 1.3),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 22),

                    // Section 1: Upload QRIS
                    const Text('1. Kode QRIS Kas RT', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    const Text(
                      'Upload gambar QRIS statis / dinamis merchant kas RT Anda (format JPG/PNG).',
                      style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 12),

                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppTheme.slateBorder),
                      ),
                      child: Column(
                        children: [
                          if (_qrisImageUrl != null && _qrisImageUrl!.isNotEmpty) ...[
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: _qrisImageUrl!.startsWith('data:image')
                                  ? Image.memory(
                                      base64Decode(_qrisImageUrl!.split(',').last),
                                      width: 220,
                                      height: 220,
                                      fit: BoxFit.contain,
                                    )
                                  : Image.network(
                                      _qrisImageUrl!,
                                      width: 220,
                                      height: 220,
                                      fit: BoxFit.contain,
                                    ),
                            ),
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppTheme.successGreen.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                '✓ QRIS Aktif Terpasang',
                                style: TextStyle(color: AppTheme.successGreen, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(height: 12),
                            if (_isBendahara) ...[
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  OutlinedButton.icon(
                                    onPressed: _showImageSourcePicker,
                                    icon: const Icon(Icons.edit_rounded, size: 14),
                                    label: const Text('Ganti Gambar QRIS', style: TextStyle(fontSize: 12)),
                                  ),
                                  const SizedBox(width: 10),
                                  TextButton.icon(
                                    onPressed: () => setState(() => _qrisImageUrl = null),
                                    icon: const Icon(Icons.delete_outline_rounded, size: 14, color: AppTheme.alertRed),
                                    label: const Text('Hapus', style: TextStyle(fontSize: 12, color: AppTheme.alertRed)),
                                  ),
                                ],
                              ),
                            ],
                          ] else ...[
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFFCBD5E1), style: BorderStyle.solid),
                              ),
                              child: Column(
                                children: [
                                  Icon(Icons.qr_code_scanner_rounded, size: 48, color: Colors.grey.shade400),
                                  const SizedBox(height: 10),
                                  const Text(
                                    'Belum Ada Kode QRIS',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    'Upload file QRIS dari Bank/E-Wallet Kas RT Anda',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                                  ),
                                  const SizedBox(height: 14),
                                  if (_isBendahara) ...[
                                    ElevatedButton.icon(
                                      onPressed: _showImageSourcePicker,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF0F5132),
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      ),
                                      icon: const Icon(Icons.upload_file_rounded, size: 16),
                                      label: const Text('Upload Kode QRIS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Section 2: Informasi Rekening Bank
                    const Text('2. Informasi Rekening Bank Kas RT', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    const Text(
                      'Rekening bank resmi untuk opsi transfer manual warga.',
                      style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 12),

                    // Bank quick chips
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _bankOptions.map((bank) {
                          final isSelected = _namaBankController.text.trim().toUpperCase() == bank.toUpperCase();
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(bank),
                              selected: isSelected,
                              onSelected: _isBendahara
                                  ? (selected) {
                                      if (selected) {
                                        setState(() {
                                          _namaBankController.text = bank;
                                        });
                                      }
                                    }
                                  : null,
                              selectedColor: AppTheme.electricBlue.withValues(alpha: 0.15),
                              checkmarkColor: AppTheme.electricBlue,
                              labelStyle: TextStyle(
                                fontSize: 11,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                color: isSelected ? AppTheme.electricBlue : AppTheme.textPrimary,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 14),

                    TextField(
                      controller: _namaBankController,
                      readOnly: !_isBendahara,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                        labelText: 'Nama Bank *',
                        hintText: 'Contoh: BCA / Mandiri / BRI',
                        prefixIcon: Icon(Icons.account_balance_rounded),
                      ),
                    ),
                    const SizedBox(height: 14),

                    TextField(
                      controller: _nomorRekController,
                      readOnly: !_isBendahara,
                      keyboardType: TextInputType.number,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                        labelText: 'Nomor Rekening Kas *',
                        hintText: 'Contoh: 8820192831',
                        prefixIcon: Icon(Icons.pin_rounded),
                      ),
                    ),
                    const SizedBox(height: 14),

                    TextField(
                      controller: _atasNamaController,
                      readOnly: !_isBendahara,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                        labelText: 'Atas Nama Rekening (a/n) *',
                        hintText: 'Contoh: Kas Lingkungan RT 04',
                        prefixIcon: Icon(Icons.badge_rounded),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Section 3: Live Preview
                    const Text('Pratinjau Tampilan di Warga', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.primaryNavy, Color(0xFF1E293B)],
                        ),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('REKENING TUJUAN KAS RT', style: TextStyle(color: AppTheme.skyAzure, fontSize: 11, fontWeight: FontWeight.bold)),
                              Text('✓ Terverifikasi', style: TextStyle(color: AppTheme.successGreen, fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            '${_namaBankController.text.isEmpty ? "BANK" : _namaBankController.text} - ${_nomorRekController.text.isEmpty ? "••••••••" : _nomorRekController.text}',
                            style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'a/n ${_atasNamaController.text.isEmpty ? "Kas RT Lingkungan" : _atasNamaController.text}',
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),

                    if (_isBendahara) ...[
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton.icon(
                          onPressed: _isSaving ? null : _handleSave,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F5132),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          icon: _isSaving
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.save_rounded),
                          label: Text(
                            _isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Rekening & QRIS',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ],
                ),
              ),
      ),
    );
  }
}
