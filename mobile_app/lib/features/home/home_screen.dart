import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import '../../core/utils/image_cache_helper.dart';
import '../invoice/invoice_screen.dart';
import '../panic/panic_screen.dart';
import '../pengurus/pengurus_panel_screen.dart';
import '../lapor/lapor_screen.dart';
import '../lapak/lapak_screen.dart';
import '../agenda/agenda_screen.dart';
import '../cctv/cctv_screen.dart';
import '../profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const _widgetChannel = MethodChannel('com.rthub.rthub_mobile/widget');
  int _selectedDateIndex = DateTime.now().weekday - 1; // Default to today's day of week
  Map<String, dynamic>? _user;
  Map<String, dynamic> _kasSummary = {
    'saldoKas': 0,
    'totalPemasukan': 0,
    'totalPengeluaran': 0,
    'recentTransactions': [],
  };
  List<dynamic> _agendaDbList = [];
  List<dynamic> _beritaDbList = [];
  List<dynamic> _lapakDbList = [];
  List<dynamic> _tagihanDbList = [];
  final PageController _cardPageController = PageController();
  int _activeCardSlide = 0;

  @override
  void initState() {
    super.initState();
    _loadInitialDataParallel();
    _checkWidgetLaunch();
  }

  @override
  void dispose() {
    _cardPageController.dispose();
    super.dispose();
  }

  void _checkWidgetLaunch() async {
    _widgetChannel.setMethodCallHandler((call) async {
      if (call.method == 'onPanicTriggered') {
        _openPanicModal();
      }
    });

    try {
      final action = await _widgetChannel.invokeMethod<String>('getInitialAction');
      if (action == 'panic') {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _openPanicModal();
        });
      }
    } catch (_) {}
  }

  void _openPanicModal() {
    if (!mounted) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const PanicScreen(),
    );
  }

  Future<void> _loadInitialDataParallel() async {
    try {
      final results = await Future.wait([
        ApiService.getUserData(),
        ApiService.getKasSummary(),
        ApiService.getAgendaList(),
        ApiService.getBeritaFeed(),
        ApiService.getLapakList(),
        ApiService.getTagihanSaya(),
      ]);

      if (!mounted) return;

      setState(() {
        final userData = results[0] as Map<String, dynamic>?;
        if (userData != null) _user = userData;

        final summary = results[1] as Map<String, dynamic>?;
        if (summary != null) {
          _kasSummary = summary;
        }

        final agendaList = results[2] as List<dynamic>?;
        _agendaDbList = agendaList ?? [];

        final beritaList = results[3] as List<dynamic>?;
        _beritaDbList = beritaList ?? [];

        final lapakList = results[4] as List<dynamic>?;
        _lapakDbList = lapakList ?? [];

        final tagihanList = results[5] as List<dynamic>?;
        _tagihanDbList = tagihanList ?? [];
      });
    } catch (_) {}
  }

  void _loadUserData() async {
    final userData = await ApiService.getUserData();
    if (mounted) {
      setState(() {
        _user = userData;
      });
    }
  }

  void _loadAgendaData() async {
    try {
      final list = await ApiService.getAgendaList();
      if (mounted && list.isNotEmpty) {
        setState(() {
          _agendaDbList = list;
        });
      }
    } catch (_) {}
  }

  void _loadLapakData() async {
    try {
      final lapak = await ApiService.getLapakList();
      if (mounted && lapak.isNotEmpty) {
        setState(() {
          _lapakDbList = lapak;
        });
      }
    } catch (_) {}
  }

  void _loadTagihanData() async {
    try {
      final tagihan = await ApiService.getTagihanSaya();
      if (mounted && tagihan.isNotEmpty) {
        setState(() {
          _tagihanDbList = tagihan;
        });
      }
    } catch (_) {}
  }

  Future<void> _refreshAllData() async {
    await _loadInitialDataParallel();
  }

  String _getInitials(String name) {
    if (name.isEmpty) return 'U';
    final parts = name.replaceAll(RegExp(r'Bpk\.|Ibu|Hj\.|H\.'), '').trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0].substring(0, parts[0].length >= 2 ? 2 : 1).toUpperCase();
  }

  void _showTransparansiKasModal(String rtNomor) {
    final recent = _kasSummary['recentTransactions'] as List<dynamic>? ?? [];
    final saldo = _kasSummary['saldoKas'] ?? 18450000;
    final masuk = _kasSummary['totalPemasukan'] ?? 19400000;
    final keluar = _kasSummary['totalPengeluaran'] ?? 950000;

    String selectedMonth = 'SEMUA';
    String selectedTipe = 'SEMUA';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          final months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          
          final filteredList = recent.where((tx) {
            if (selectedTipe != 'SEMUA' && tx['tipe'] != selectedTipe) return false;
            if (selectedMonth != 'SEMUA') {
              final date = tx['createdAt'] != null ? DateTime.tryParse(tx['createdAt']) : null;
              if (date != null && '${date.month}' != selectedMonth) return false;
            }
            return true;
          }).toList();

          return Container(
            height: MediaQuery.of(context).size.height * 0.85,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
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
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Buku Kas Terbuka RT $rtNomor',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const Text(
                          'Transparansi publik real-time seluruh warga',
                          style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.successGreen.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.verified_rounded, size: 12, color: AppTheme.successGreen),
                          SizedBox(width: 4),
                          Text(
                            'Audit Warga',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.successGreen),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Summary mini cards
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.slateLight,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Text('Total Saldo Kas', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
                          const SizedBox(height: 2),
                          Text('Rp ${saldo.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy)),
                        ],
                      ),
                      Container(width: 1, height: 28, color: AppTheme.slateBorder),
                      Column(
                        children: [
                          const Text('Pemasukan', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
                          const SizedBox(height: 2),
                          Text('+Rp ${masuk.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                        ],
                      ),
                      Container(width: 1, height: 28, color: AppTheme.slateBorder),
                      Column(
                        children: [
                          const Text('Pengeluaran', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
                          const SizedBox(height: 2),
                          Text('-Rp ${keluar.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.alertRed)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // Month/Year and Type Filter Bar
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.slateLight,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppTheme.slateBorder),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: selectedMonth,
                            isDense: true,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                            items: const [
                              DropdownMenuItem(value: 'SEMUA', child: Text('Semua Bulan')),
                              DropdownMenuItem(value: '9', child: Text('September 2026')),
                              DropdownMenuItem(value: '8', child: Text('Agustus 2026')),
                              DropdownMenuItem(value: '7', child: Text('Juli 2026')),
                              DropdownMenuItem(value: '6', child: Text('Juni 2026')),
                            ],
                            onChanged: (val) {
                              if (val != null) setModalState(() => selectedMonth = val);
                            },
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => setModalState(() => selectedTipe = 'SEMUA'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: selectedTipe == 'SEMUA' ? AppTheme.primaryNavy : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: selectedTipe == 'SEMUA' ? AppTheme.primaryNavy : AppTheme.slateBorder),
                          ),
                          child: Text('Semua', style: TextStyle(fontSize: 11, color: selectedTipe == 'SEMUA' ? Colors.white : AppTheme.textSecondary, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: () => setModalState(() => selectedTipe = 'PEMASUKAN'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: selectedTipe == 'PEMASUKAN' ? AppTheme.successGreen : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: selectedTipe == 'PEMASUKAN' ? AppTheme.successGreen : AppTheme.slateBorder),
                          ),
                          child: Text('+ Pemasukan', style: TextStyle(fontSize: 11, color: selectedTipe == 'PEMASUKAN' ? Colors.white : AppTheme.successGreen, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: () => setModalState(() => selectedTipe = 'PENGELUARAN'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: selectedTipe == 'PENGELUARAN' ? AppTheme.alertRed : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: selectedTipe == 'PENGELUARAN' ? AppTheme.alertRed : AppTheme.slateBorder),
                          ),
                          child: Text('- Pengeluaran', style: TextStyle(fontSize: 11, color: selectedTipe == 'PENGELUARAN' ? Colors.white : AppTheme.alertRed, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Mutasi Kas Tercatat', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    Text('${filteredList.length} transaksi', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  ],
                ),
                const SizedBox(height: 8),

                Expanded(
                  child: filteredList.isNotEmpty
                      ? ListView.separated(
                          itemCount: filteredList.length,
                          separatorBuilder: (context, index) => const Divider(height: 16),
                          itemBuilder: (context, index) {
                            final tx = filteredList[index];
                            final isMasuk = tx['tipe'] == 'PEMASUKAN';
                            final nominal = tx['nominal'] ?? 0;
                            final date = tx['createdAt'] != null ? DateTime.tryParse(tx['createdAt'].toString()) : null;
                            final dateFormatted = date != null
                                ? '${date.day} ${months[date.month]} ${date.year}, ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')} WIB'
                                : '11 Sep 2026, 10:00 WIB';

                            return Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: (isMasuk ? AppTheme.successGreen : AppTheme.alertRed).withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    isMasuk ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                                    size: 16,
                                    color: isMasuk ? AppTheme.successGreen : AppTheme.alertRed,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tx['kategori'] ?? (isMasuk ? 'Pemasukan' : 'Pengeluaran'),
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        tx['keterangan'] ?? '-',
                                        style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                                      ),
                                      const SizedBox(height: 3),
                                      Row(
                                        children: [
                                          const Icon(Icons.access_time_rounded, size: 11, color: AppTheme.textMuted),
                                          const SizedBox(width: 4),
                                          Text(
                                            dateFormatted,
                                            style: const TextStyle(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.w500),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      '${isMasuk ? '+' : '-'}Rp ${nominal.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                        color: isMasuk ? AppTheme.successGreen : AppTheme.alertRed,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: (isMasuk ? AppTheme.successGreen : AppTheme.alertRed).withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        isMasuk ? 'Masuk' : 'Keluar',
                                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: isMasuk ? AppTheme.successGreen : AppTheme.alertRed),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            );
                          },
                        )
                      : const Center(
                          child: Text('Belum ada riwayat mutasi kas pada filter ini.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                        ),
                ),
                const SizedBox(height: 12),

                // Button to check All Resident Payment Status
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const InvoiceScreen(initialTabIndex: 1)),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primaryNavy,
                      side: const BorderSide(color: AppTheme.primaryNavy),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.people_alt_rounded, size: 16),
                    label: const Text('📊 Cek Status Iuran Seluruh Warga (Lunas / Belum)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final role = _user?['role']?.toString().toUpperCase() ?? 'WARGA';
    final isPengurus = role == 'ADMIN_RT' ||
        role == 'KETUA_RT' ||
        role == 'BENDAHARA_RT' ||
        role == 'BENDAHARA' ||
        role == 'SEKRETARIS' ||
        role == 'SECURITY' ||
        role == 'SUPERADMIN';

    final namaLengkap = _user?['profile']?['namaLengkap'] ?? 'Warga RT 03';
    final noRumah = _user?['profile']?['noRumah'] ?? 'Blok C3';
    final rtNomor = _user?['rt']?['nomor'] ?? '03';
    final rwNomor = _user?['rw']?['nomor'] ?? '05';
    final kelurahanNama = _user?['kelurahan']?['nama'] ?? 'Sukamaju';
    final initials = _getInitials(namaLengkap);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refreshAllData,
          color: AppTheme.primaryNavy,
          backgroundColor: Colors.white,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Header with Tapable Profile
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () async {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ProfileScreen()),
                      );
                      _loadUserData();
                    },
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: isPengurus ? AppTheme.primaryNavy : AppTheme.electricBlue,
                          child: Text(
                            initials,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  'Halo, $namaLengkap 👋',
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.electricBlue.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '📍 RT $rtNomor / RW $rwNomor - $kelurahanNama',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: AppTheme.electricBlue,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isPengurus
                                        ? AppTheme.warningAmber.withValues(alpha: 0.15)
                                        : AppTheme.successGreen.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    isPengurus
                                        ? (role.contains('BENDAHARA') ? 'Bendahara' : (role == 'ADMIN_RT' ? 'Ketua RT' : role))
                                        : 'Warga',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: isPengurus ? AppTheme.warningAmber : AppTheme.successGreen,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const ProfileScreen()),
                          );
                          _loadUserData();
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTheme.electricBlue, width: 1.5),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.electricBlue.withValues(alpha: 0.15),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: _buildUserAvatar(),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Dynamic Role Banner: Pengurus Panel vs Resident Status
              if (isPengurus)
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const PengurusPanelScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryNavy,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryNavy.withValues(alpha: 0.15),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.electricBlue.withValues(alpha: 0.3),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.admin_panel_settings_rounded, color: Colors.white, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Panel Pengurus & Kas RT $rtNomor',
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                const Text(
                                  'Kelola warga, catat pengeluaran & iuran',
                                  style: TextStyle(color: AppTheme.skyAzure, fontSize: 11),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 14),
                      ],
                    ),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.slateBorder),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.electricBlue.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.home_work_outlined, color: AppTheme.electricBlue, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Unit Rumah: $noRumah',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
                              ),
                              Text(
                                'Terdaftar resmi di RT $rtNomor / RW $rwNomor',
                                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.successGreen.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Aktif',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.successGreen),
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 16),

              // Sliding Cards Carousel (Kas RT, Lapak Warga Baru / Sponsored, & Agenda 7 Hari Ke Depan)
              _buildSlidingCardsCarousel(rtNomor),

              const SizedBox(height: 24),

              // Quick Action Row (6 Layanan Termasuk CCTV Lingkungan)
              _buildQuickActionsRow(),

              const SizedBox(height: 24),

              // Calendar & Agenda Section
              _buildCalendarAgendaSection(),

              const SizedBox(height: 24),

              // Recent News Feed
              _buildRecentNewsFeed(),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
      ),
      floatingActionButton: _buildFloatingPanicButton(),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildSlidingCardsCarousel(String rtNomor) {
    return Column(
      children: [
        SizedBox(
          height: 215,
          child: PageView(
            controller: _cardPageController,
            onPageChanged: (idx) {
              setState(() {
                _activeCardSlide = idx;
              });
            },
            children: [
              _buildKasCard(rtNomor),
              _buildLapakCard(rtNomor),
              _buildAgendaCard(rtNomor),
            ],
          ),
        ),
        const SizedBox(height: 10),
        // Carousel Page Indicators
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(3, (index) {
            final isActive = _activeCardSlide == index;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              height: 6,
              width: isActive ? 22 : 6,
              decoration: BoxDecoration(
                color: isActive ? AppTheme.primaryNavy : AppTheme.slateBorder,
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }

  // Slide 1: Buku Kas RT & Tagihan Iuran
  Widget _buildKasCard(String rtNomor) {
    final saldo = _kasSummary['saldoKas'] ?? 18450000;
    final masuk = _kasSummary['totalPemasukan'] ?? 19400000;
    final keluar = _kasSummary['totalPengeluaran'] ?? 950000;

    final formattedSaldo = saldo.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
    final formattedMasuk = masuk.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
    final formattedKeluar = keluar.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');

    return GestureDetector(
      onTap: () => _showTransparansiKasModal(rtNomor),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.primaryNavy,
              Color(0xFF1E293B),
            ],
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryNavy.withValues(alpha: 0.25),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      'Saldo Kas Terbuka RT $rtNomor',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.85),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Icon(Icons.touch_app_rounded, color: AppTheme.skyAzure, size: 14),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('Lihat Rincian', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            Text(
              'Rp $formattedSaldo',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.5,
              ),
            ),
            Row(
              children: [
                _buildMiniPill(Icons.arrow_downward_rounded, '+Rp $formattedMasuk', AppTheme.successGreen),
                const SizedBox(width: 8),
                _buildMiniPill(Icons.arrow_upward_rounded, '-Rp $formattedKeluar', AppTheme.alertRed),
              ],
            ),
            // Inside Bill Banner
            Builder(
              builder: (context) {
                final isPaid = _tagihanDbList.isNotEmpty && _tagihanDbList.any((t) => t['status'] == 'PAID');
                final activeBill = _tagihanDbList.isNotEmpty ? _tagihanDbList.first : null;
                final hasBill = activeBill != null;
                final nominalVal = hasBill
                    ? (double.tryParse(activeBill['totalBayar'].toString()) ?? 0).toInt()
                    : 0;
                final nominalFmt = nominalVal.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
                
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isPaid ? AppTheme.successGreen.withValues(alpha: 0.18) : Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isPaid ? AppTheme.successGreen.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.12),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'Iuran Warga Periode Ini',
                                style: TextStyle(
                                  color: isPaid ? Colors.greenAccent : Colors.white.withValues(alpha: 0.7),
                                  fontSize: 10,
                                  fontWeight: isPaid ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                              if (isPaid) ...[
                                const SizedBox(width: 4),
                                const Icon(Icons.check_circle_rounded, color: Colors.greenAccent, size: 11),
                              ],
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            isPaid
                                ? '✓ LUNAS'
                                : (hasBill
                                    ? 'Rp $nominalFmt'
                                    : 'Belum Ada Tagihan'),
                            style: TextStyle(
                              color: isPaid ? Colors.greenAccent : Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const InvoiceScreen()),
                          ).then((_) => _loadTagihanData());
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isPaid ? Colors.greenAccent : Colors.white,
                          foregroundColor: AppTheme.primaryNavy,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: Text(
                          isPaid ? 'Rincian Lunas' : (hasBill ? 'Bayar' : 'Rincian'),
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  // Slide 2: Produk & Jasa Baru di Lapak Warga (Sponsored / Terkini)
  Widget _buildLapakCard(String rtNomor) {
    final item = _lapakDbList.isNotEmpty
        ? _lapakDbList.cast<dynamic>().firstWhere(
            (it) => it['isPromoted'] == true || it['promotedBadge'] == 'SPONSORED',
            orElse: () => _lapakDbList.first,
          )
        : null;

    if (item == null) {
      return GestureDetector(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const LapakScreen()));
        },
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF065F46),
                Color(0xFF0F766E),
              ],
            ),
            borderRadius: BorderRadius.circular(22),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF065F46).withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.storefront_rounded, color: Colors.amberAccent, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        'Lapak Warga RT $rtNomor',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
                    ),
                    child: const Text(
                      'UMKM',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.store_mall_directory_rounded, color: Colors.amberAccent, size: 26),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Mulai Usaha di Lingkungan',
                          style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Jual produk, kuliner, atau jasa ke tetangga sekitar',
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Dukung usaha tetangga lingkungan!',
                      style: TextStyle(color: Colors.white, fontSize: 11),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const LapakScreen()));
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF065F46),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Buka Lapak', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    final judul = item['judul'] ?? 'Produk Lapak Warga';
    final harga = item['harga'] ?? '0';
    final kategori = item['kategori'] ?? 'Lapak Warga';
    final penjual = item['seller']?['profile']?['namaLengkap'] ?? item['user']?['profile']?['namaLengkap'] ?? item['sellerName'] ?? 'Warga';
    
    dynamic rawFoto = item?['fotoUrl'];
    String? fotoUrl;
    if (rawFoto is List && rawFoto.isNotEmpty) {
      fotoUrl = rawFoto.first.toString();
    } else if (rawFoto is String && rawFoto.isNotEmpty) {
      if (rawFoto.startsWith('[') && rawFoto.endsWith(']')) {
        try {
          final decoded = jsonDecode(rawFoto);
          if (decoded is List && decoded.isNotEmpty) fotoUrl = decoded.first.toString();
        } catch (_) {
          fotoUrl = rawFoto;
        }
      } else if (rawFoto.contains('|||')) {
        fotoUrl = rawFoto.split('|||').first;
      } else {
        fotoUrl = rawFoto;
      }
    }

    final isSponsored = item?['isPromoted'] == true || item?['promotedBadge'] == 'SPONSORED';

    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) => const LapakScreen()));
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF065F46),
              Color(0xFF0F766E),
            ],
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF065F46).withValues(alpha: 0.3),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.storefront_rounded, color: Colors.amberAccent, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      'Lapak Warga RT $rtNomor',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: (isSponsored ? Colors.amberAccent : Colors.white).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: (isSponsored ? Colors.amberAccent : Colors.white).withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isSponsored) ...[
                        const Icon(Icons.star_rounded, color: Colors.amberAccent, size: 12),
                        const SizedBox(width: 3),
                      ],
                      Text(
                        isSponsored ? 'Sponsored' : 'Terbaru',
                        style: TextStyle(
                          color: isSponsored ? Colors.amberAccent : Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            Row(
              children: [
                // Product Photo Thumbnail
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: ImageCacheHelper.buildImage(
                    fotoUrl,
                    width: 58,
                    height: 58,
                    borderRadius: BorderRadius.circular(12),
                    placeholder: const Icon(Icons.shopping_bag_rounded, color: Colors.white, size: 28),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        judul,
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Oleh: $penjual • $kategori',
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Rp ${harga.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                        style: const TextStyle(color: Colors.amberAccent, fontSize: 14, fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Dukung usaha tetangga lingkungan kita!',
                    style: TextStyle(color: Colors.white, fontSize: 11),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const LapakScreen()));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF065F46),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Buka Lapak', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Slide 3: Agenda & Kegiatan Terdekat (7 Hari Ke Depan)
  Widget _buildAgendaCard(String rtNomor) {
    final event = _agendaDbList.isNotEmpty ? _agendaDbList.first : null;

    if (event == null) {
      return GestureDetector(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const AgendaScreen()));
        },
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF3730A3),
                Color(0xFF4F46E5),
              ],
            ),
            borderRadius: BorderRadius.circular(22),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF3730A3).withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.event_available_rounded, color: Colors.white, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        'Agenda RT Seminggu Ini',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text('Kalender RT', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const Row(
                children: [
                  Icon(Icons.calendar_month_outlined, color: Colors.white70, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Belum Ada Kegiatan Terjadwal',
                          style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Rapat warga, kerja bakti, & posyandu akan tampil di sini',
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Lihat jadwal lengkap lingkungan',
                      style: TextStyle(color: Colors.white, fontSize: 11),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const AgendaScreen()));
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF3730A3),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Buka Kalender', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    final judul = event['judul'] ?? 'Agenda Kegiatan RT';
    final tanggal = event['tanggal'] ?? '-';
    final lokasi = event['lokasi'] ?? 'Lingkungan RT $rtNomor';
    final kategori = event['kategori'] ?? 'Kegiatan';

    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) => const AgendaScreen()));
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF3730A3),
              Color(0xFF4F46E5),
            ],
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF3730A3).withValues(alpha: 0.3),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.event_available_rounded, color: Colors.white, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      'Agenda RT Seminggu Ini',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('7 Hari Kedepan', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    kategori,
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  judul,
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(Icons.schedule_rounded, size: 12, color: Colors.white.withValues(alpha: 0.8)),
                    const SizedBox(width: 4),
                    Text(
                      tanggal,
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 11),
                    ),
                    const SizedBox(width: 10),
                    Icon(Icons.place_rounded, size: 12, color: Colors.white.withValues(alpha: 0.8)),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        lokasi,
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Mari hadir dan berpartisipasi bersama warga',
                    style: TextStyle(color: Colors.white, fontSize: 11),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => const AgendaScreen()));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF3730A3),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Lihat Agenda', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniPill(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 12),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildActionItem(
          icon: Icons.receipt_long_rounded,
          label: 'Bayar IPL',
          color: AppTheme.electricBlue,
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const InvoiceScreen()))
                .then((_) => _loadTagihanData());
          },
        ),
        _buildActionItem(
          icon: Icons.campaign_rounded,
          label: 'Lapor RT',
          color: AppTheme.warningAmber,
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const LaporScreen()));
          },
        ),
        _buildActionItem(
          icon: Icons.storefront_rounded,
          label: 'Lapak RT',
          color: AppTheme.successGreen,
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const LapakScreen()));
          },
        ),
        _buildActionItem(
          icon: Icons.calendar_month_rounded,
          label: 'Agenda RT',
          color: AppTheme.purpleIndigo,
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const AgendaScreen()));
          },
        ),
        _buildActionItem(
          icon: Icons.videocam_rounded,
          label: 'CCTV Live',
          color: Colors.teal,
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const CctvScreen()));
          },
        ),
      ],
    );
  }

  Widget _buildActionItem({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }

  Widget _buildCalendarAgendaSection() {
    final now = DateTime.now();
    final monday = now.subtract(Duration(days: now.weekday - 1));
    final weekDays = List.generate(7, (i) => monday.add(Duration(days: i)));
    final dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    final months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    final displayAgendas = _agendaDbList.take(2).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Text(
                  'Agenda Kegiatan',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.electricBlue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${months[now.month]} ${now.year}',
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.electricBlue),
                  ),
                ),
              ],
            ),
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) => const AgendaScreen()));
              },
              child: const Text(
                'Lihat Semua',
                style: TextStyle(fontSize: 12, color: AppTheme.electricBlue, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(weekDays.length, (index) {
            final dayDate = weekDays[index];
            final isToday = dayDate.year == now.year && dayDate.month == now.month && dayDate.day == now.day;
            final isSelected = index == _selectedDateIndex;

            return Expanded(
              child: GestureDetector(
                onTap: () {
                  setState(() => _selectedDateIndex = index);
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const AgendaScreen()));
                },
                child: Container(
                  margin: EdgeInsets.only(right: index < 6 ? 6 : 0),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppTheme.electricBlue
                        : (isToday ? AppTheme.electricBlue.withValues(alpha: 0.08) : Colors.white),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected
                          ? AppTheme.electricBlue
                          : (isToday ? AppTheme.electricBlue : AppTheme.slateBorder),
                      width: isToday ? 1.5 : 1.0,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppTheme.electricBlue.withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            )
                          ]
                        : null,
                  ),
                  child: Column(
                    children: [
                      Text(
                        dayNames[dayDate.weekday - 1],
                        style: TextStyle(
                          fontSize: 10,
                          color: isSelected
                              ? Colors.white.withValues(alpha: 0.85)
                              : (isToday ? AppTheme.electricBlue : AppTheme.textSecondary),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${dayDate.day}',
                        style: TextStyle(
                          fontSize: 15,
                          color: isSelected
                              ? Colors.white
                              : (isToday ? AppTheme.electricBlue : AppTheme.textPrimary),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 14),
        if (displayAgendas.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.slateBorder),
            ),
            child: const Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.event_available_outlined, size: 20, color: AppTheme.textMuted),
                  SizedBox(width: 8),
                  Text(
                    'Belum ada agenda kegiatan minggu ini',
                    style: TextStyle(fontSize: 13, color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          )
        else
          ...displayAgendas.map((item) {
          final start = item['tanggalMulai'] != null ? DateTime.tryParse(item['tanggalMulai']) : null;
          final timeStr = start != null
              ? '${start.hour.toString().padLeft(2, '0')}:${start.minute.toString().padLeft(2, '0')} WIB'
              : '08:00 WIB';
          final kat = (item['kategori'] ?? 'KERJA_BAKTI').toString().toUpperCase();

          Color tagColor = AppTheme.successGreen;
          if (kat.contains('RAPAT')) {
            tagColor = AppTheme.primaryNavy;
          } else if (kat.contains('POSYANDU')) {
            tagColor = AppTheme.purpleIndigo;
          } else if (kat.contains('KESEHATAN') || kat.contains('FOGGING')) {
            tagColor = AppTheme.warningAmber;
          }

          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: GestureDetector(
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const AgendaScreen())),
              child: _buildEventCard(
                title: item['judul'] ?? 'Agenda Lingkungan',
                time: timeStr,
                location: item['lokasi'] ?? 'Wilayah RT',
                tag: 'Level ${item['scope'] ?? 'RT'}',
                tagColor: tagColor,
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildEventCard({
    required String title,
    required String time,
    required String location,
    required String tag,
    required Color tagColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.slateBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: tagColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  tag,
                  style: TextStyle(fontSize: 11, color: tagColor, fontWeight: FontWeight.bold),
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.access_time_rounded, size: 14, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    time,
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textMuted),
              const SizedBox(width: 4),
              Text(
                location,
                style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentNewsFeed() {
    final displayBerita = _beritaDbList.isNotEmpty
        ? _beritaDbList.take(2).toList()
        : [
            {
              'judul': 'Laporan Pertanggungjawaban Kas RT Terbuka & Real-Time',
              'konten': 'Seluruh warga dapat memantau saldo kas dan seluruh bukti nota pengeluaran RT secara transparan.',
              'scope': 'RT',
              'isPinned': true,
            }
          ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Pengumuman Lingkungan',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.electricBlue.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Live DB',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.electricBlue),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...displayBerita.map((item) {
          final isPinned = item['isPinned'] == true;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: isPinned ? AppTheme.electricBlue.withValues(alpha: 0.3) : AppTheme.slateBorder),
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
                        color: AppTheme.purpleIndigo.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '📢 Pengumuman Level ${item['scope'] ?? 'RT'}',
                        style: const TextStyle(fontSize: 11, color: AppTheme.purpleIndigo, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (isPinned)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.electricBlue.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text('📌 Pinned', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.electricBlue)),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  item['judul'] ?? 'Pengumuman Lingkungan',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  item['konten'] ?? '',
                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      backgroundColor: Colors.white,
      selectedItemColor: AppTheme.electricBlue,
      unselectedItemColor: AppTheme.textMuted,
      currentIndex: 0,
      onTap: (index) {
        if (index == 1) {
          final rtNomor = _user?['rt']?['nomor'] ?? '03';
          _showTransparansiKasModal(rtNomor);
        } else if (index == 2) {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const AgendaScreen())).then((_) => _loadAgendaData());
        } else if (index == 3) {
          Navigator.push(context, MaterialPageRoute(builder: (context) => const LapakScreen())).then((_) => _loadLapakData());
        } else if (index == 4) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ProfileScreen()),
          ).then((_) => _loadUserData());
        }
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Kas & Iuran'),
        BottomNavigationBarItem(icon: Icon(Icons.calendar_month_outlined), label: 'Agenda'),
        BottomNavigationBarItem(icon: Icon(Icons.storefront_outlined), label: 'Lapak'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded), label: 'Profil Saya'),
      ],
    );
  }

  Widget _buildUserAvatar() {
    final avatarUrl = _user?['profile']?['avatarUrl'] as String?;
    final nama = _user?['profile']?['namaLengkap'] ?? _user?['phone'] ?? 'User';

    if (avatarUrl != null && avatarUrl.isNotEmpty) {
      return ImageCacheHelper.buildImage(
        avatarUrl,
        width: 36,
        height: 36,
        borderRadius: BorderRadius.circular(18),
        placeholder: _buildFallbackAvatarIcon(nama),
      );
    }
    return _buildFallbackAvatarIcon(nama);
  }

  Widget _buildFallbackAvatarIcon(String nama) {
    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      child: const Icon(Icons.person_outline_rounded, color: AppTheme.electricBlue, size: 20),
    );
  }



  Widget _buildFloatingPanicButton() {
    return Container(
      width: 62,
      height: 62,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          colors: [
            Color(0xFFEF4444),
            Color(0xFFDC2626),
            Color(0xFF991B1B),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFDC2626).withValues(alpha: 0.55),
            blurRadius: 16,
            spreadRadius: 3,
            offset: const Offset(0, 5),
          ),
        ],
        border: Border.all(color: Colors.white.withValues(alpha: 0.4), width: 2),
      ),
      child: Material(
        color: Colors.transparent,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: _openPanicModal,
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.crisis_alert_rounded, color: Colors.white, size: 20),
              SizedBox(height: 1),
              Text(
                'SOS',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

