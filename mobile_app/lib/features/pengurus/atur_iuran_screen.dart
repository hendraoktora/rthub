import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class AturIuranScreen extends StatefulWidget {
  const AturIuranScreen({super.key});

  @override
  State<AturIuranScreen> createState() => _AturIuranScreenState();
}

class _AturIuranScreenState extends State<AturIuranScreen> {
  final _namaController = TextEditingController(text: 'Iuran Kas RT & Pengelolaan Sampah');
  final _nominalController = TextEditingController(text: '50000');
  final _deskripsiController = TextEditingController(text: 'Iuran wajib bulanan: Kas RT Rp 30.000 + Sampah Rp 20.000');

  bool _isLoading = true;
  bool _isSaving = false;
  bool _isGenerating = false;
  bool _isBendahara = true;
  String _userRole = 'BENDAHARA_RT';
  String? _masterId;

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _loadMasterTagihan();
  }

  void _loadUserRole() async {
    final user = await ApiService.getCurrentUser();
    if (mounted) {
      final role = user?['role']?.toString().toUpperCase() ?? 'WARGA';
      setState(() {
        _userRole = role;
        _isBendahara = role == 'BENDAHARA_RT' || role == 'SUPERADMIN';
      });
    }
  }

  Future<void> _loadMasterTagihan() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.getMasterTagihan();
      if (list.isNotEmpty) {
        final master = list.first;
        _masterId = master['id']?.toString();
        _namaController.text = master['namaTagihan'] ?? _namaController.text;
        _nominalController.text = (double.tryParse(master['nominalPokok']?.toString() ?? '50000')?.toInt() ?? 50000).toString();
        _deskripsiController.text = master['deskripsi'] ?? _deskripsiController.text;
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleSimpanTarif() async {
    final nominalClean = _nominalController.text.replaceAll(RegExp(r'[^0-9]'), '');
    final nominal = int.tryParse(nominalClean);

    if (nominal == null || nominal <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nominal iuran harus lebih dari 0!'), backgroundColor: AppTheme.alertRed),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      await ApiService.setMasterTagihan({
        'namaTagihan': _namaController.text.trim(),
        'nominalPokok': nominal,
        'deskripsi': _deskripsiController.text.trim(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Tarif nilai iuran RT berhasil diperbarui di database!'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
        _loadMasterTagihan();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: AppTheme.alertRed),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _handleGenerateTagihanBulanan() async {
    final now = DateTime.now();
    final bulan = now.month;
    final tahun = now.year;
    final bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Row(
          children: [
            Icon(Icons.send_rounded, color: AppTheme.electricBlue),
            SizedBox(width: 8),
            Text('Terbitkan Tagihan Massal', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Apakah Anda ingin menerbitkan invoice tagihan "${_namaController.text}" periode ${bulanNames[bulan]} $tahun ke seluruh unit rumah di RT?',
          style: const TextStyle(fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryNavy),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Terbitkan Sekarang', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isGenerating = true);
    try {
      final res = await ApiService.generateTagihanBulanan({
        'masterTagihanId': _masterId ?? 'master-tagihan-rt03-default',
        'bulan': bulan,
        'tahun': tahun,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['message'] ?? '✅ Tagihan bulan ini berhasil diterbitkan ke seluruh rumah!'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: AppTheme.alertRed),
        );
      }
    } finally {
      if (mounted) setState(() => _isGenerating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final nominalClean = int.tryParse(_nominalController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
    final totalWarga = nominalClean + 2000;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Atur Nilai Iuran Bulanan RT'),
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
                                    'Hanya Bendahara RT yang memiliki wewenang untuk mengubah nominal tarif iuran dan menerbitkan tagihan bulanan.',
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
                        color: AppTheme.successGreen.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.account_balance_wallet_rounded, color: AppTheme.successGreen, size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Fitur Pengaturan Keuangan Bendahara & RT',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.successGreen),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Perubahan nilai nominal iuran akan otomatis berlaku untuk tagihan bulanan seluruh warga di unit RT Anda.',
                                  style: TextStyle(color: AppTheme.textPrimary.withValues(alpha: 0.85), fontSize: 12, height: 1.3),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Live Breakdown Preview
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.primaryNavy, Color(0xFF1E293B)],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryNavy.withValues(alpha: 0.25),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Total Tagihan per Rumah:', style: TextStyle(color: AppTheme.skyAzure, fontSize: 12, fontWeight: FontWeight.bold)),
                              Text('Periode Tiap Bulan', style: TextStyle(color: Colors.white70, fontSize: 11)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Rp ${totalWarga.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                            style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
                          ),
                          const Divider(color: Colors.white24, height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('• Hak Kas Masuk RT (Pokok):', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              Text(
                                'Rp ${nominalClean.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                                style: const TextStyle(color: AppTheme.successGreen, fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('• Fee Pemeliharaan Sistem / Payment:', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              Text('Rp 2.000', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    const Text('Formulir Master Tagihan Iuran', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),

                    TextField(
                      controller: _namaController,
                      readOnly: !_isBendahara,
                      decoration: const InputDecoration(
                        labelText: 'Nama Tagihan Iuran *',
                        hintText: 'Contoh: Iuran Kas RT & Sampah',
                        prefixIcon: Icon(Icons.receipt_long_rounded),
                      ),
                    ),
                    const SizedBox(height: 14),

                    TextField(
                      controller: _nominalController,
                      readOnly: !_isBendahara,
                      keyboardType: TextInputType.number,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                        labelText: 'Nominal Pokok Kas RT per Rumah (Rp) *',
                        hintText: '50000',
                        prefixIcon: Icon(Icons.payments_outlined),
                        suffixText: 'Rupiah',
                      ),
                    ),
                    const SizedBox(height: 14),

                    TextField(
                      controller: _deskripsiController,
                      readOnly: !_isBendahara,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        labelText: 'Keterangan & Rincian Alokasi Dana',
                        hintText: 'Contoh: Kas RT Rp 30.000 + Pengangkutan Sampah Rp 20.000',
                        prefixIcon: Icon(Icons.notes_rounded),
                      ),
                    ),
                    const SizedBox(height: 24),

                    if (_isBendahara) ...[
                      // Tombol Simpan
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryNavy,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: _isSaving ? null : _handleSimpanTarif,
                          icon: _isSaving
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Icon(Icons.save_rounded, color: Colors.white),
                          label: Text(_isSaving ? 'Menyimpan...' : 'Simpan & Perbarui Nilai Tarif Iuran', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Tombol Terbitkan Massal
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            side: const BorderSide(color: AppTheme.electricBlue),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: _isGenerating ? null : _handleGenerateTagihanBulanan,
                          icon: _isGenerating
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.send_rounded, color: AppTheme.electricBlue),
                          label: Text(_isGenerating ? 'Menerbitkan...' : 'Terbitkan Tagihan Bulan Ini ke Semua Warga', style: const TextStyle(color: AppTheme.electricBlue, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ] else ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Center(
                          child: Text(
                            '🔒 Perubahan tarif & penerbitan tagihan dikunci (Khusus Bendahara RT)',
                            style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                  ],
                ),
              ),
      ),
    );
  }
}
