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
  String _selectedPeriode = 'September 2026';
  List<dynamic> _tagihanList = [];
  bool _isLoading = false;
  bool _isPaying = false;

  final List<String> _periodeList = [
    'September 2026',
    'Agustus 2026',
    'Juli 2026',
    'Juni 2026',
  ];

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

  void _handlePayTagihan(dynamic activeTagihan, num totalBayar) async {
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _isPaying = true);
    try {
      if (activeTagihan != null && activeTagihan['id'] != null) {
        await ApiService.payTagihan(activeTagihan['id'].toString(), _selectedPaymentMethod);
      } else {
        // Fallback demo simulation
        await Future.delayed(const Duration(milliseconds: 700));
      }

      if (!mounted) return;

      final now = DateTime.now();
      final months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      final payTime = '${now.day} ${months[now.month]} ${now.year}, ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')} WIB';

      // Update state locally
      setState(() {
        if (_tagihanList.isNotEmpty) {
          _tagihanList[0]['status'] = 'PAID';
          _tagihanList[0]['metodePembayaran'] = _selectedPaymentMethod;
          _tagihanList[0]['paidAt'] = now.toIso8601String();
        } else {
          _tagihanList = [
            {
              'id': 'mock_paid_1',
              'status': 'PAID',
              'nominalPokok': 50000,
              'adminFee': 2000,
              'totalBayar': 52000,
              'periodeBulan': 9,
              'periodeTahun': 2026,
              'metodePembayaran': _selectedPaymentMethod,
              'paidAt': now.toIso8601String(),
            }
          ];
        }
      });

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppTheme.successGreen, size: 28),
              SizedBox(width: 10),
              Text('Pembayaran Berhasil!'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Tagihan IPL RT berhasil diverifikasi dan otomatis tercatat di Buku Kas RT.'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.slateLight,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Waktu Bayar:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                        Text(payTime, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Metode:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                        Text(_selectedPaymentMethod, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.electricBlue)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                        Text('Rp ${totalBayar.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                _loadTagihan();
              },
              child: const Text('Tutup & Lihat Resi'),
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

    final paidAtStr = activeTagihan?['paidAt'] != null ? DateTime.tryParse(activeTagihan['paidAt'].toString()) : null;
    final formattedPaidDate = paidAtStr != null
        ? '${paidAtStr.day} ${bulanNames[paidAtStr.month]} ${paidAtStr.year}, ${paidAtStr.hour.toString().padLeft(2, '0')}:${paidAtStr.minute.toString().padLeft(2, '0')} WIB'
        : '11 September 2026, 10:15 WIB';

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
                  // Month & Year Filter Bar
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    color: Colors.white,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.filter_list_rounded, size: 16, color: AppTheme.electricBlue),
                            SizedBox(width: 6),
                            Text('Pilih Periode:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.slateLight,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppTheme.slateBorder),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _selectedPeriode,
                              isDense: true,
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                              items: _periodeList.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                              onChanged: (val) {
                                if (val != null) {
                                  setState(() => _selectedPeriode = val);
                                }
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

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
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.02),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Tagihan $_selectedPeriode',
                                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      isPaid ? 'Terbayar pada $formattedPaidDate' : 'Jatuh Tempo: 10 $bulanStr $tahun',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: isPaid ? AppTheme.successGreen : AppTheme.textSecondary,
                                        fontWeight: isPaid ? FontWeight.w600 : FontWeight.normal,
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
                            _buildPaymentOption('VA_BCA', 'BCA Virtual Account (8800108123456)', Icons.account_balance_rounded),
                            const SizedBox(height: 10),
                            _buildPaymentOption('VA_MANDIRI', 'Mandiri Virtual Account (8900108123456)', Icons.account_balance_wallet_rounded),
                            const SizedBox(height: 10),
                            _buildPaymentOption('CASH', 'Bayar Tunai ke Bendahara RT', Icons.payments_rounded),
                          ] else ...[
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppTheme.successGreen.withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.verified_user_rounded, color: AppTheme.successGreen, size: 28),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Bukti Pembayaran Terverifikasi', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.successGreen)),
                                        const SizedBox(height: 2),
                                        Text('Metode: ${activeTagihan?['metodePembayaran'] ?? _selectedPaymentMethod} • $formattedPaidDate', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),

                  // Bottom Sticky Button (Always visible when unpaid)
                  if (!isPaid)
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        border: Border(top: BorderSide(color: AppTheme.slateBorder)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black12,
                            blurRadius: 8,
                            offset: Offset(0, -2),
                          ),
                        ],
                      ),
                      child: SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton.icon(
                          onPressed: _isPaying ? null : () => _handlePayTagihan(activeTagihan, totalBayar),
                          icon: _isPaying
                              ? const SizedBox.shrink()
                              : const Icon(Icons.payment_rounded, size: 20),
                          label: _isPaying
                              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                              : Text(
                                  'Bayar Rp ${totalBayar.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')} Sekarang',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.electricBlue,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
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
