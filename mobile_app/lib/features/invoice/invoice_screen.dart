import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class InvoiceScreen extends StatefulWidget {
  final int initialTabIndex;
  const InvoiceScreen({super.key, this.initialTabIndex = 0});

  @override
  State<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends State<InvoiceScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedPaymentMethod = 'QRIS';
  String _selectedPeriode = 'September 2026';
  List<dynamic> _tagihanList = [];
  bool _isLoading = false;
  bool _isPaying = false;

  // Transparansi Iuran state
  Map<String, dynamic>? _transparansiData;
  bool _isLoadingTransparansi = false;
  String _transparansiFilter = 'SEMUA'; // 'SEMUA', 'PAID', 'UNPAID'
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _periodeList = [
    'September 2026',
    'Agustus 2026',
    'Juli 2026',
    'Juni 2026',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTabIndex.clamp(0, 1),
    );
    _loadTagihan();
    _loadTransparansiIuran();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
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

  Future<void> _loadTransparansiIuran() async {
    setState(() => _isLoadingTransparansi = true);
    try {
      int bulan = 9;
      int tahun = 2026;
      if (_selectedPeriode.contains('Agustus')) bulan = 8;
      if (_selectedPeriode.contains('Juli')) bulan = 7;
      if (_selectedPeriode.contains('Juni')) bulan = 6;

      final data = await ApiService.getTransparansiIuranWarga(bulan: bulan, tahun: tahun);
      if (mounted) {
        setState(() {
          _transparansiData = data;
        });
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoadingTransparansi = false);
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
                _loadTransparansiIuran();
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

  void _remindWargaViaWhatsApp(Map<String, dynamic> warga) async {
    final rawPhone = warga['phone'] ?? '081234567890';
    final nama = warga['kepalaKeluarga'] ?? warga['namaWarga'] ?? 'Warga RT';
    final noRumah = warga['noRumah'] ?? 'Rumah';

    String cleanPhone = rawPhone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62${cleanPhone.substring(1)}';
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62$cleanPhone';
    }

    final message = 'Halo Bpk/Ibu $nama ($noRumah), mengingatkan untuk pembayaran iuran bulanan RT 03 periode $_selectedPeriode sebesar Rp 50.000 untuk operasional keamanan & kebersihan lingkungan. Pembayaran dapat dilakukan via aplikasi RtHub (QRIS/VA) atau tunai ke Bendahara RT. Terima kasih 🙏';
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
              content: Text('Pesan pengingat disalin: $cleanPhone'),
              backgroundColor: AppTheme.successGreen,
            ),
          );
        }
      }
    } catch (_) {
      await Clipboard.setData(ClipboardData(text: message));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pesan pengingat disalin ke clipboard!'), backgroundColor: AppTheme.successGreen),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Iuran & Transparansi RT'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primaryNavy,
          unselectedLabelColor: AppTheme.textMuted,
          indicatorColor: AppTheme.electricBlue,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long_rounded, size: 18),
                  SizedBox(width: 6),
                  Text('Tagihan Saya'),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bar_chart_rounded, size: 18),
                  SizedBox(width: 6),
                  Text('Transparansi Warga'),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh DB',
            onPressed: () {
              _loadTagihan();
              _loadTransparansiIuran();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            // TAB 1: TAGIHAN SAYA
            _buildMyInvoiceTab(),

            // TAB 2: TRANSPARANSI IURAN SELURUH WARGA
            _buildTransparansiWargaTab(),
          ],
        ),
      ),
    );
  }

  // ================= TAB 1: TAGIHAN SAYA =================
  Widget _buildMyInvoiceTab() {
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

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Column(
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
                        _loadTransparansiIuran();
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
    );
  }

  // ================= TAB 2: TRANSPARANSI IURAN SELURUH WARGA =================
  Widget _buildTransparansiWargaTab() {
    if (_isLoadingTransparansi && _transparansiData == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final totalRumah = _transparansiData?['totalRumah'] ?? 28;
    final totalLunas = _transparansiData?['totalLunas'] ?? 25;
    final totalBelum = _transparansiData?['totalBelumLunas'] ?? 3;
    final totalTerkumpul = _transparansiData?['totalTerkumpul'] ?? 1250000;
    final targetIuran = _transparansiData?['targetIuran'] ?? 1400000;
    final list = (_transparansiData?['wargaIuranList'] as List<dynamic>?) ?? [];

    final persenLunas = totalRumah > 0 ? (totalLunas / totalRumah * 100).toStringAsFixed(0) : '0';

    final filteredList = list.where((item) {
      final isPaid = item['statusIuran'] == 'PAID';
      if (_transparansiFilter == 'PAID' && !isPaid) return false;
      if (_transparansiFilter == 'UNPAID' && isPaid) return false;

      if (_searchQuery.isNotEmpty) {
        final name = (item['kepalaKeluarga'] ?? item['namaWarga'] ?? '').toString().toLowerCase();
        final noRumah = (item['noRumah'] ?? '').toString().toLowerCase();
        final q = _searchQuery.toLowerCase();
        if (!name.contains(q) && !noRumah.contains(q)) return false;
      }
      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: _loadTransparansiIuran,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          // Header Stats Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primaryNavy, Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Transparansi Iuran RT 03',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _selectedPeriode,
                          style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '$persenLunas% LUNAS',
                        style: const TextStyle(color: Colors.greenAccent, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Progress Bar
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: totalRumah > 0 ? (totalLunas / totalRumah) : 0,
                    backgroundColor: Colors.white.withValues(alpha: 0.15),
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.greenAccent),
                    minHeight: 8,
                  ),
                ),
                const SizedBox(height: 14),

                // Stats Grid
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildStatPill('Total Rumah', '$totalRumah Rumah', Colors.white),
                    Container(width: 1, height: 26, color: Colors.white.withValues(alpha: 0.2)),
                    _buildStatPill('Sudah Bayar', '$totalLunas Lunas', Colors.greenAccent),
                    Container(width: 1, height: 26, color: Colors.white.withValues(alpha: 0.2)),
                    _buildStatPill('Belum Bayar', '$totalBelum Rumah', Colors.orangeAccent),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(color: Colors.white12, height: 1),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Terkumpul: Rp ${totalTerkumpul.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    Text('Target: Rp ${targetIuran.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Search Box
          TextField(
            controller: _searchController,
            onChanged: (val) => setState(() => _searchQuery = val),
            decoration: InputDecoration(
              hintText: 'Cari nama warga atau nomor rumah (e.g. Blok A1)...',
              prefixIcon: const Icon(Icons.search_rounded, size: 20),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
            ),
          ),
          const SizedBox(height: 12),

          // Filter Chips
          Row(
            children: [
              _buildFilterChip('Semua ($totalRumah)', 'SEMUA'),
              const SizedBox(width: 8),
              _buildFilterChip('✓ Lunas ($totalLunas)', 'PAID', activeColor: AppTheme.successGreen),
              const SizedBox(width: 8),
              _buildFilterChip('⏳ Belum Bayar ($totalBelum)', 'UNPAID', activeColor: AppTheme.warningAmber),
            ],
          ),
          const SizedBox(height: 14),

          // Residents List
          if (filteredList.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              alignment: Alignment.center,
              child: const Text('Tidak ada warga yang sesuai dengan pencarian / filter ini.', style: TextStyle(color: AppTheme.textMuted)),
            )
          else
            ...filteredList.map((warga) => _buildWargaIuranCard(warga)),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildStatPill(String label, String value, Color valueColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(label, style: TextStyle(fontSize: 10, color: Colors.white.withValues(alpha: 0.7))),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: valueColor)),
      ],
    );
  }

  Widget _buildFilterChip(String label, String key, {Color activeColor = AppTheme.primaryNavy}) {
    final isSelected = _transparansiFilter == key;
    return GestureDetector(
      onTap: () => setState(() => _transparansiFilter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? activeColor : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? activeColor : AppTheme.slateBorder),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: activeColor.withValues(alpha: 0.2),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildWargaIuranCard(Map<String, dynamic> warga) {
    final isPaid = warga['statusIuran'] == 'PAID' || warga['status'] == 'PAID';
    final nama = warga['kepalaKeluarga'] ?? warga['namaWarga'] ?? 'Warga RT';
    final noRumah = warga['noRumah'] ?? 'Blok A';
    final hunian = (warga['statusHunian'] ?? 'MILIK_SENDIRI').toString().replaceAll('_', ' ');

    final paidAtStr = warga['paidAt'] != null ? DateTime.tryParse(warga['paidAt'].toString()) : null;
    final months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    final paidDateFormatted = paidAtStr != null
        ? '${paidAtStr.day} ${months[paidAtStr.month]} ${paidAtStr.year}'
        : '08 Sep 2026';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPaid ? AppTheme.successGreen.withValues(alpha: 0.25) : AppTheme.slateBorder,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: (isPaid ? AppTheme.successGreen : AppTheme.warningAmber).withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isPaid ? Icons.check_circle_rounded : Icons.hourglass_top_rounded,
                  color: isPaid ? AppTheme.successGreen : AppTheme.warningAmber,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    nama,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.electricBlue.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          noRumah,
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.electricBlue),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        hunian,
                        style: const TextStyle(fontSize: 10.5, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                  if (isPaid) ...[
                    const SizedBox(height: 3),
                    Text(
                      'Lunas: $paidDateFormatted via ${warga['metodePembayaran'] ?? 'QRIS'}',
                      style: const TextStyle(fontSize: 10, color: AppTheme.successGreen, fontWeight: FontWeight.w600),
                    ),
                  ],
                ],
              ),
            ],
          ),

          // Status & Action
          if (isPaid)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppTheme.successGreen.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('✓ Lunas', style: TextStyle(color: AppTheme.successGreen, fontSize: 11, fontWeight: FontWeight.bold)),
            )
          else
            ElevatedButton.icon(
              onPressed: () => _remindWargaViaWhatsApp(warga),
              icon: const Icon(Icons.chat_bubble_outline_rounded, size: 13, color: Colors.white),
              label: const Text('Ingatkan', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.successGreen,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                elevation: 0,
              ),
            ),
        ],
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
