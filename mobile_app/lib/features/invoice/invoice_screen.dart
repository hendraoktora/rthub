import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class InvoiceScreen extends StatefulWidget {
  const InvoiceScreen({super.key});

  @override
  State<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends State<InvoiceScreen> {
  String _selectedPaymentMethod = 'QRIS';
  List<dynamic> _tagihanList = [];
  bool _isLoading = false;
  bool _isPaying = false;

  @override
  void initState() {
    super.initState();
    _loadTagihan();
  }

  Future<void> _loadTagihan() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.getTagihanSaya();
      if (mounted) {
        setState(() {
          _tagihanList = list;
        });
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handlePayTagihan(dynamic activeTagihan) async {
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _isPaying = true);
    try {
      final tagihanId = activeTagihan['id'];
      await ApiService.payTagihan(tagihanId, _selectedPaymentMethod);
      if (!mounted) return;

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppTheme.successGreen),
              SizedBox(width: 8),
              Text('Pembayaran Berhasil!'),
            ],
          ),
          content: const Text(
            'Tagihan IPL Anda telah berhasil dibayar dan tercatat di Buku Kas RT.',
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                _loadTagihan();
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } catch (e) {
      messenger.showSnackBar(
        SnackBar(content: Text('⚠️ Pembayaran gagal: $e'), backgroundColor: AppTheme.alertRed),
      );
    } finally {
      if (mounted) setState(() => _isPaying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeTagihan = _tagihanList.isNotEmpty ? _tagihanList[0] : null;
    final isPaid = activeTagihan?['status'] == 'PAID';
    final nominalPokok = activeTagihan?['nominalPokok'] != null ? double.tryParse(activeTagihan['nominalPokok'].toString()) ?? 50000 : 50000;
    final adminFee = activeTagihan?['adminFee'] != null ? double.tryParse(activeTagihan['adminFee'].toString()) ?? 2000 : 2000;
    final totalBayar = activeTagihan?['totalBayar'] != null ? double.tryParse(activeTagihan['totalBayar'].toString()) ?? 52000 : (nominalPokok + adminFee);
    final bulan = activeTagihan?['periodeBulan'] ?? 9;
    final tahun = activeTagihan?['periodeTahun'] ?? 2026;

    final bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    final bulanStr = bulan >= 1 && bulan <= 12 ? bulanNames[bulan] : 'September';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Rincian Tagihan Iuran (Live DB)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh DB',
            onPressed: _loadTagihan,
          ),
        ],
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Status Badge Card
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: isPaid ? AppTheme.successGreen.withValues(alpha: 0.3) : AppTheme.slateBorder),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Tagihan $bulanStr $tahun',
                                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      isPaid ? 'Sudah Lunas Terverifikasi' : 'Jatuh Tempo: 10 $bulanStr $tahun',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: isPaid ? AppTheme.successGreen : AppTheme.textSecondary,
                                        fontWeight: isPaid ? FontWeight.bold : FontWeight.normal,
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: (isPaid ? AppTheme.successGreen : AppTheme.warningAmber).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    isPaid ? '✓ LUNAS' : 'Belum Lunas',
                                    style: TextStyle(
                                      color: isPaid ? AppTheme.successGreen : AppTheme.warningAmber,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Rincian Biaya
                          const Text(
                            'Rincian Komponen Iuran',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: AppTheme.slateBorder),
                            ),
                            child: Column(
                              children: [
                                _buildPriceRow('Iuran Pokok Kas & Kebersihan RT', 'Rp ${nominalPokok.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}'),
                                const Divider(height: 20, color: AppTheme.slateLight),
                                _buildPriceRow(
                                  'Biaya Layanan Aplikasi',
                                  'Rp ${adminFee.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                                  info: 'Biaya admin pemeliharaan platform RtHub',
                                ),
                                const Divider(height: 24, thickness: 1.5, color: AppTheme.slateBorder),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text(
                                      'Total Tagihan',
                                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                                    ),
                                    Text(
                                      'Rp ${totalBayar.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w800,
                                        color: isPaid ? AppTheme.successGreen : AppTheme.electricBlue,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          if (!isPaid) ...[
                            // Metode Pembayaran
                            const Text(
                              'Pilih Metode Pembayaran',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 12),
                            _buildPaymentOption('QRIS', 'QRIS (GoPay, OVO, Dana, ShopeePay, BCA)', Icons.qr_code_2_rounded),
                            const SizedBox(height: 10),
                            _buildPaymentOption('VA_BCA', 'BCA Virtual Account', Icons.account_balance_rounded),
                            const SizedBox(height: 10),
                            _buildPaymentOption('VA_MANDIRI', 'Mandiri Virtual Account', Icons.account_balance_wallet_rounded),
                            const SizedBox(height: 10),
                            _buildPaymentOption('CASH', 'Bayar Tunai ke Bendahara RT', Icons.payments_rounded),
                          ],
                        ],
                      ),
                    ),
                  ),

                  // Bottom Sticky Button
                  if (!isPaid && activeTagihan != null)
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        border: Border(top: BorderSide(color: AppTheme.slateBorder)),
                      ),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isPaying ? null : () => _handlePayTagihan(activeTagihan),
                          child: _isPaying
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : Text('Bayar Rp ${totalBayar.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')} Sekarang'),
                        ),
                      ),
                    ),
                ],
              ),
      ),
    );
  }

  Widget _buildPriceRow(String label, String value, {bool isBold = false, String? info}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
                color: isBold ? AppTheme.textPrimary : AppTheme.textSecondary,
              ),
            ),
            Text(
              value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
          ],
        ),
        if (info != null) ...[
          const SizedBox(height: 2),
          Text(
            info,
            style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
          ),
        ],
      ],
    );
  }

  Widget _buildPaymentOption(String id, String label, IconData icon) {
    final isSelected = _selectedPaymentMethod == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedPaymentMethod = id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppTheme.electricBlue : AppTheme.slateBorder,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppTheme.electricBlue : AppTheme.textSecondary),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                ),
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: AppTheme.electricBlue, size: 20),
          ],
        ),
      ),
    );
  }
}
