import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/notification_service.dart';
import '../../core/utils/image_cache_helper.dart';
import '../../core/widgets/hub_motion.dart';
import '../invoice/invoice_screen.dart';
import '../panic/panic_screen.dart';
import '../panic/emergency_alert_dialog.dart';
import '../pengurus/pengurus_panel_screen.dart';
import '../lapor/lapor_screen.dart';
import '../lapak/lapak_screen.dart';
import '../agenda/agenda_screen.dart';
import '../cctv/cctv_screen.dart';
import '../gempa/gempa_screen.dart';
import '../profile/profile_screen.dart';
import 'home_repository.dart';
import 'widgets/home_cards.dart';

/// Backend reads and visual cards are separate, keeping scroll rebuilds local.
class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    this.repository = const ApiHomeRepository(),
    this.enablePlatformListeners = true,
  });
  final HomeRepository repository;
  final bool enablePlatformListeners;
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const _widgetChannel = MethodChannel('com.rthub.rthub_mobile/widget');
  final _scroll = ScrollController();
  HomeSnapshot _data = const HomeSnapshot();
  bool _loading = true;
  int _entryEpoch = 0;
  Future<void>? _activeLoad;
  String get _rt => _data.user?['rt']?['nomor']?.toString() ?? '—';
  String get _rw => _data.user?['rw']?['nomor']?.toString() ?? '—';
  String get _name {
    final user = _data.user;
    final profile = user?['profile'];
    final candidate = profile?['namaLengkap'] ??
        profile?['nama'] ??
        user?['namaLengkap'] ??
        user?['name'] ??
        user?['nama'] ??
        user?['phone'];
    return candidate?.toString().trim() ?? 'Warga';
  }

  String _formatDisplayName(String raw) {
    if (raw.isEmpty) return 'Warga';
    final withoutParentheses =
        raw.replaceAll(RegExp(r'\s*\(.*?\)\s*'), '').trim();
    if (withoutParentheses.isEmpty) return 'Warga';

    final tokens = withoutParentheses
        .split(RegExp(r'\s+'))
        .where((t) => t.isNotEmpty)
        .toList();
    if (tokens.isEmpty) return 'Warga';

    const titles = {
      'bpk.',
      'bpk',
      'bapak',
      'pak',
      'ibu',
      'bu',
      'h.',
      'hj.',
      'haji',
      'hajjah',
      'dr.',
      'dr',
      'dra.',
      'drs.',
      'ir.',
      'prof.',
      'mas',
      'mbak',
      'kak',
      'bang',
      'om',
      'tante',
      'sdr.',
      'sdr',
      'sdri.',
      'sdri',
    };

    if (titles.contains(tokens.first.toLowerCase())) {
      int nextIdx = 1;
      while (nextIdx < tokens.length &&
          titles.contains(tokens[nextIdx].toLowerCase())) {
        nextIdx++;
      }
      if (nextIdx < tokens.length) {
        return '${tokens.first} ${tokens[nextIdx]}';
      }
      return tokens.first;
    }

    return tokens.first;
  }

  bool get _isPengurus => const {
    'ADMIN_RT',
    'KETUA_RT',
    'BENDAHARA_RT',
    'BENDAHARA',
    'SEKRETARIS',
    'SECURITY',
    'SUPERADMIN',
  }.contains(_data.user?['role']?.toString().toUpperCase());

  @override
  void initState() {
    super.initState();
    _refresh();
    if (widget.enablePlatformListeners) {
      _checkWidgetLaunch();
      _setupNotifications();
    }
  }

  @override
  void dispose() {
    _scroll.dispose();
    if (widget.enablePlatformListeners) {
      _widgetChannel.setMethodCallHandler(null);
      NotificationService.onPanicAlertReceived = null;
      NotificationService.onPanicAlertOpened = null;
      NotificationService.onGempaAlertReceived = null;
      NotificationService.onGempaAlertOpened = null;
    }
    super.dispose();
  }

  Future<void> _refresh() =>
      _activeLoad ??= _load().whenComplete(() => _activeLoad = null);
  Future<void> _load() async {
    try {
      final result = await widget.repository.load();
      if (!mounted) return;
      setState(() {
        _data = result.retaining(_data);
        _loading = false;
        _entryEpoch++;
      });
      if (widget.enablePlatformListeners && result.user != null) {
        NotificationService.currentUserId = result.user!['id']?.toString();
        NotificationService.currentUserPhone = result.user!['phone']
            ?.toString();
        final rtId = result.user!['rtId']?.toString();
        if (rtId != null) NotificationService.subscribeToRt(rtId);
      }
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _data = const HomeSnapshot(
          failedSections: {'koneksi'},
        ).retaining(_data);
      });
    }
  }

  void _setupNotifications() {
    NotificationService.onPanicAlertReceived = _handleEmergencyAlert;
    NotificationService.onPanicAlertOpened = _handleEmergencyAlert;
    NotificationService.onGempaAlertReceived = _openGempa;
    NotificationService.onGempaAlertOpened = _openGempa;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        final message = await NotificationService.getInitialMessage();
        if (!mounted || message == null) return;
        if (message.data['type'] == 'PANIC')
          _handleEmergencyAlert(message.data);
        if (message.data['type'] == 'GEMPA') _openGempa(message.data);
      } catch (_) {
        /* Notification availability never blocks the dashboard. */
      }
    });
  }

  void _handleEmergencyAlert(Map<String, dynamic> data) {
    if (!mounted || NotificationService.isSelfTriggered(data)) return;
    _refresh();
    showEmergencyAlertDialog(context, data);
  }

  void _openGempa(Map<String, dynamic> data) {
    if (mounted) _navigate(GempaScreen(initialData: data));
  }

  Future<void> _checkWidgetLaunch() async {
    _widgetChannel.setMethodCallHandler((call) async {
      if (call.method == 'onPanicTriggered') _openPanicModal();
    });
    try {
      final action = await _widgetChannel.invokeMethod<String>(
        'getInitialAction',
      );
      if (action == 'panic' && mounted)
        WidgetsBinding.instance.addPostFrameCallback((_) => _openPanicModal());
    } catch (_) {}
  }

  Future<void> _navigate(Widget destination, {bool refresh = false}) async {
    await Navigator.of(
      context,
    ).push(MaterialPageRoute<void>(builder: (_) => destination));
    if (mounted && refresh) await _refresh();
  }

  void _openPanicModal() {
    if (!mounted) return;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const PanicScreen(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textScale = MediaQuery.textScalerOf(context).scale(14) / 14;
    // Both cards keep their copy and clay illustration inside the viewport at
    // the smallest supported width; text scaling adds room progressively.
    final carouselHeight = 330.0 + ((textScale - 1).clamp(0, 2) * 120);
    return Scaffold(
      backgroundColor: AppTheme.background,
      extendBody: true,
      body: CustomScrollView(
        key: const PageStorageKey('home-scroll'),
        controller: _scroll,
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: [
          _buildAppBar(textScale),
          HubRefreshControl(onRefresh: _refresh),
          if (_loading)
            const SliverToBoxAdapter(
              child: LinearProgressIndicator(minHeight: 2),
            ),
          if (_data.failedSections.isNotEmpty)
            SliverToBoxAdapter(child: _connectionNotice()),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(22, 18, 22, 14),
              child: _membershipCard(),
            ),
          ),
          SliverToBoxAdapter(
            child: AnimatedBuilder(
              animation: _scroll,
              builder: (context, _) {
                final offset = _scroll.hasClients ? _scroll.offset : 0.0;
                final tilt = ((offset - 120) / 2400).clamp(-.035, .05);
                return DepthCarousel(
                  height: carouselHeight,
                  viewportFraction: .90,
                  children: [
                    HomeKasCard(
                      summary: _data.kas,
                      rt: _rt,
                      invoices: _data.invoices,
                      loading: _loading,
                      scrollTilt: tilt,
                      onDetails: _showKas,
                      onInvoices: () =>
                          _navigate(const InvoiceScreen(), refresh: true),
                    ),
                    HomeQuakeCard(
                      data: _data.earthquake,
                      scrollTilt: tilt,
                      onTap: () =>
                          _navigate(GempaScreen(initialData: _data.earthquake)),
                    ),
                  ],
                );
              },
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(22, 22, 22, 0),
            sliver: SliverToBoxAdapter(child: _quickActions()),
          ),
          SliverToBoxAdapter(child: _marketSection(textScale)),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(22, 26, 22, 0),
            sliver: SliverToBoxAdapter(child: _agendaSection()),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(22, 26, 22, 0),
            sliver: SliverToBoxAdapter(child: _newsSection()),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 156)),
        ],
      ),
      floatingActionButton: PulseSosButton(onPressed: _openPanicModal),
      floatingActionButtonLocation: const _SosFabLocation(),
      bottomNavigationBar: _bottomNav(),
    );
  }

  Widget _buildAppBar(double textScale) {
    final name = _formatDisplayName(_name);
    final expandedHeight = 254.0 + ((textScale - 1).clamp(0, 2) * 70);
    return SliverAppBar(
      pinned: true,
      automaticallyImplyLeading: false,
      backgroundColor: Colors.transparent,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      toolbarHeight: 74,
      expandedHeight: expandedHeight,
      titleSpacing: 22,
      title: AnimatedBuilder(
        animation: _scroll,
        builder: (context, _) {
          final progress =
              ((_scroll.hasClients ? _scroll.offset : 0) /
                      (expandedHeight - 74))
                  .clamp(0.0, 1.0);
          return Row(
            children: [
              Semantics(
                label: 'Buka profil',
                button: true,
                child: InkWell(
                  borderRadius: BorderRadius.circular(30),
                  onTap: () => _navigate(const ProfileScreen(), refresh: true),
                  child: _avatar(46 - progress * 8),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      progress > .7 ? 'RT HUB' : 'SELAMAT ${_greeting()}',
                      style: const TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.6,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Halo, $name',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -.35,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () =>
                    _navigate(GempaScreen(initialData: _data.earthquake)),
                tooltip: 'Info gempa BMKG',
                icon: const Icon(
                  Icons.sensors_rounded,
                  color: AppTheme.electricBlue,
                ),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withValues(alpha: .85),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            ],
          );
        },
      ),
      flexibleSpace: LayoutBuilder(
        builder: (context, constraints) {
          final inset = MediaQuery.paddingOf(context).top;
          final visible =
              ((constraints.maxHeight - inset - 74) / (expandedHeight - 74))
                  .clamp(0.0, 1.0);
          return ClipRect(
            child: Stack(
              fit: StackFit.expand,
              children: [
                const ColoredBox(color: Color(0xFFF1F5FB)),
                Positioned(
                  right: -50,
                  top: -95,
                  child: Container(
                    width: 285,
                    height: 285,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.electricBlue.withValues(alpha: .04),
                      border: Border.all(
                        color: AppTheme.electricBlue.withValues(alpha: .05),
                        width: 30,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: 22,
                  right: 12,
                  bottom: 21 - (1 - visible) * 18,
                  child: IgnorePointer(
                    child: Opacity(
                      opacity: visible,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Rumah dekat.\nWarga erat.',
                                  style: TextStyle(
                                    fontSize: 31,
                                    fontWeight: FontWeight.w800,
                                    height: 1.04,
                                    letterSpacing: -1.5,
                                    color: AppTheme.primaryNavy,
                                  ),
                                ),
                                const SizedBox(height: 13),
                                Wrap(
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  spacing: 5,
                                  children: [
                                    const Icon(
                                      Icons.location_on_rounded,
                                      size: 13,
                                      color: AppTheme.electricBlue,
                                    ),
                                    Text(
                                      'RT $_rt / RW $_rw',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppTheme.electricBlue,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                                if (_data.user?['kelurahan']?['nama'] != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      _data.user!['kelurahan']['nama']
                                          .toString(),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          if (MediaQuery.sizeOf(context).width > 330 &&
                              textScale < 1.6)
                            Transform.translate(
                              offset: Offset(0, (1 - visible) * 30),
                              child: const ExcludeSemantics(
                                child: ClayIllustration(
                                  kind: ClayKind.home,
                                  size: 130,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
                if (visible < 1)
                  Opacity(
                    opacity: 1 - visible,
                    child: const GlassPanel(child: SizedBox.expand()),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    return hour < 11
        ? 'PAGI'
        : hour < 15
        ? 'SIANG'
        : hour < 18
        ? 'SORE'
        : 'MALAM';
  }

  Widget _avatar(double size) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      color: Colors.white,
      shape: BoxShape.circle,
      border: Border.all(color: Colors.white, width: 3),
      boxShadow: const [
        BoxShadow(
          color: Color(0x160F172A),
          blurRadius: 12,
          offset: Offset(0, 3),
        ),
      ],
    ),
    child: ImageCacheHelper.buildImage(
      _data.user?['profile']?['avatarUrl']?.toString(),
      width: size,
      height: size,
      borderRadius: BorderRadius.circular(size),
      placeholder: ColoredBox(
        color: const Color(0xFFE6EDFC),
        child: Center(
          child: Text(
            _name.isEmpty ? 'W' : _name.characters.first.toUpperCase(),
            style: const TextStyle(
              color: AppTheme.electricBlue,
              fontSize: 19,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ),
    ),
  );

  Widget _connectionNotice() => Container(
    margin: const EdgeInsets.fromLTRB(22, 14, 22, 0),
    padding: const EdgeInsets.fromLTRB(12, 6, 5, 6),
    decoration: BoxDecoration(
      color: const Color(0xFFFFF6DD),
      borderRadius: BorderRadius.circular(16),
    ),
    child: Row(
      children: [
        const Icon(
          Icons.cloud_off_outlined,
          size: 18,
          color: Color(0xFF8E6512),
        ),
        const SizedBox(width: 9),
        Expanded(
          child: Text(
            'Belum dapat memperbarui ${_data.failedSections.join(', ')}. Data terakhir tetap ditampilkan.',
            style: const TextStyle(fontSize: 11, color: Color(0xFF78540C)),
          ),
        ),
        IconButton(
          onPressed: _refresh,
          tooltip: 'Coba lagi',
          icon: const Icon(Icons.refresh_rounded, color: Color(0xFF8E6512)),
        ),
      ],
    ),
  );

  Widget _membershipCard() => Material(
    color: Colors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(18),
      side: const BorderSide(color: Color(0xFFE2E8F0)),
    ),
    child: InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: () => _navigate(
        _isPengurus ? const PengurusPanelScreen() : const ProfileScreen(),
        refresh: true,
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Icon(
              _isPengurus
                  ? Icons.admin_panel_settings_outlined
                  : Icons.home_work_outlined,
              color: AppTheme.electricBlue,
              size: 22,
            ),
            const SizedBox(width: 11),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _isPengurus
                        ? 'Ruang pengurus'
                        : 'Rumah ${_data.user?['profile']?['noRumah'] ?? 'belum diisi'}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _isPengurus
                        ? 'Kelola warga, kas & lingkungan'
                        : 'Identitas warga & keluarga',
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_rounded,
              size: 18,
              color: AppTheme.textMuted,
            ),
          ],
        ),
      ),
    ),
  );

  Widget _quickActions() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const Text(
        'Ada yang bisa dibantu?',
        style: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w800,
          letterSpacing: -.35,
        ),
      ),
      const SizedBox(height: 13),
      Row(
        key: const ValueKey('home-quick-actions'),
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: HomeQuickAction(
              icon: Icons.receipt_long_rounded,
              label: 'Iuran',
              color: AppTheme.electricBlue,
              onTap: () => _navigate(const InvoiceScreen(), refresh: true),
            ),
          ),
          Expanded(
            child: HomeQuickAction(
              icon: Icons.campaign_rounded,
              label: 'Lapor',
              color: const Color(0xFFD68B25),
              onTap: () => _navigate(const LaporScreen()),
            ),
          ),
          Expanded(
            child: HomeQuickAction(
              icon: Icons.storefront_rounded,
              label: 'Lapak',
              color: const Color(0xFF087252),
              onTap: () => _navigate(const LapakScreen(), refresh: true),
            ),
          ),
          Expanded(
            child: HomeQuickAction(
              icon: Icons.calendar_month_rounded,
              label: 'Agenda',
              color: const Color(0xFF7C68B4),
              onTap: () => _navigate(const AgendaScreen(), refresh: true),
            ),
          ),
          Expanded(
            child: HomeQuickAction(
              icon: Icons.videocam_rounded,
              label: 'CCTV',
              color: const Color(0xFF187F96),
              onTap: () => _navigate(const CctvScreen()),
            ),
          ),
        ],
      ),
    ],
  );

  List<Map<String, dynamic>> get _promotedProducts {
    final user = _data.user;
    final now = DateTime.now();
    return (_data.products ?? [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .where((item) {
          final promoted =
              item['isPromoted'] == true ||
              item['promotedBadge'] == 'SPONSORED' ||
              item['status'] == 'PROMOTED' ||
              item['paketIklan'] != null;
          if (!promoted) return false;
          final expiry = DateTime.tryParse(
            (item['promotedUntil'] ??
                    item['iklanExpiredAt'] ??
                    item['expiresAt'] ??
                    '')
                .toString(),
          );
          if (expiry != null && expiry.isBefore(now)) return false;
          final sellerId =
              (item['userId'] ?? item['sellerId'] ?? item['seller']?['id'])
                  ?.toString();
          if (item['isOwner'] == true ||
              (user?['id'] != null && sellerId == user!['id'].toString()))
            return true;
          final scope = (item['paketIklan'] ?? 'RT').toString().toUpperCase();
          if (scope == 'NASIONAL' ||
              scope.contains('SEMUA') ||
              scope.contains('GLOBAL'))
            return true;
          final key = scope.contains('KELURAHAN')
              ? 'kelurahanId'
              : scope.contains('RW')
              ? 'rwId'
              : 'rtId';
          final itemArea = (item[key] ?? item['seller']?[key])?.toString();
          final userArea = user?[key]?.toString();
          // The server scopes the catalog; reject a known mismatched area locally.
          return itemArea == null || userArea == null || itemArea == userArea;
        })
        .toList();
  }

  Widget _marketSection(double textScale) {
    final items = _promotedProducts;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(22, 26, 22, 6),
          child: _sectionHeading(
            'Dari tetangga, untuk kita.',
            'Buka lapak',
            () => _navigate(const LapakScreen(), refresh: true),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(22, 0, 22, 14),
          child: Text(
            items.isEmpty
                ? 'Usaha kecil. Dukungan besar dari lingkungan.'
                : 'Pilihan usaha warga · Iklan berbayar',
            style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
          ),
        ),
        if (items.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 22),
            child: _emptyCard(
              icon: Icons.storefront_outlined,
              title: _data.products == null
                  ? 'Lapak belum dimuat'
                  : 'Kenali usaha tetangga',
              subtitle: _data.products == null
                  ? 'Tarik halaman untuk mencoba lagi.'
                  : 'Temukan produk warga atau buka lapakmu sendiri.',
              onTap: () => _navigate(const LapakScreen(), refresh: true),
            ),
          )
        else
          DepthCarousel(
            height: 204 + ((textScale - 1).clamp(0, 2) * 100),
            viewportFraction: .9,
            children: items
                .take(12)
                .map(
                  (item) => HomeProductCard(
                    item: item,
                    onOpen: () => _navigate(const LapakScreen(), refresh: true),
                    onOrder: () => _orderProduct(item),
                  ),
                )
                .toList(),
          ),
      ],
    );
  }

  Future<void> _orderProduct(Map<String, dynamic> item) async {
    final raw =
        (item['kontakWa'] ??
                item['seller']?['phone'] ??
                item['user']?['phone'] ??
                '')
            .toString();
    var phone = raw.replaceAll(RegExp(r'\D'), '');
    if (phone.isEmpty) {
      _navigate(const LapakScreen(), refresh: true);
      return;
    }
    if (phone.startsWith('0')) phone = '62${phone.substring(1)}';
    final uri = Uri.https('wa.me', '/$phone', {
      'text':
          'Halo, saya tertarik dengan ${item['judul'] ?? 'produk Anda'} di Lapak RT Hub.',
    });
    try {
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication) &&
          mounted)
        _launchError();
    } catch (_) {
      if (mounted) _launchError();
    }
  }

  void _launchError() => ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(
      content: Text('WhatsApp belum dapat dibuka. Coba dari halaman Lapak.'),
    ),
  );

  Widget _agendaSection() {
    final today = DateUtils.dateOnly(DateTime.now());
    final agendas = (_data.agenda ?? [])
        .whereType<Map>()
        .where((item) {
          final date = DateTime.tryParse(
            (item['tanggalSelesai'] ??
                    item['endDate'] ??
                    item['tanggalMulai'] ??
                    item['tanggal'] ??
                    item['startDate'] ??
                    '')
                .toString(),
          );
          return date == null || !date.toLocal().isBefore(today);
        })
        .take(3)
        .toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionHeading(
          'Ketemu di lingkungan.',
          'Kalender',
          () => _navigate(const AgendaScreen(), refresh: true),
        ),
        const SizedBox(height: 5),
        const Text(
          'Agenda & kegiatan warga',
          style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 15),
        if (agendas.isEmpty)
          _emptyCard(
            icon: Icons.event_available_outlined,
            title: _data.agenda == null
                ? 'Agenda belum dimuat'
                : 'Belum ada agenda mendatang',
            subtitle: 'Rapat, kerja bakti, dan kegiatan warga tampil di sini.',
            onTap: () => _navigate(const AgendaScreen(), refresh: true),
          ),
        ...agendas.asMap().entries.map((entry) {
          final item = entry.value;
          final date = DateTime.tryParse(
            (item['tanggalMulai'] ?? item['tanggal'] ?? item['startDate'] ?? '')
                .toString(),
          )?.toLocal();
          return StaggeredEntry(
            key: ValueKey('agenda-$_entryEpoch-${entry.key}'),
            index: entry.key,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Material(
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(22),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                child: InkWell(
                  borderRadius: BorderRadius.circular(22),
                  onTap: () => _navigate(const AgendaScreen(), refresh: true),
                  child: Padding(
                    padding: const EdgeInsets.all(15),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 52,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEAF0FF),
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: Column(
                            children: [
                              Text(
                                date == null ? '—' : '${date.day}',
                                style: const TextStyle(
                                  fontSize: 23,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.electricBlue,
                                ),
                              ),
                              Text(
                                date == null
                                    ? 'AGENDA'
                                    : _months[date.month].toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.electricBlue,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 13),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'LINGKUP ${item['scope'] ?? 'RT'}',
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.textSecondary,
                                  letterSpacing: .8,
                                ),
                              ),
                              const SizedBox(height: 5),
                              Text(
                                item['judul']?.toString() ?? 'Kegiatan warga',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  height: 1.25,
                                ),
                              ),
                              const SizedBox(height: 7),
                              Text(
                                '${date == null ? 'Waktu menyusul' : '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}'} · ${item['lokasi'] ?? 'Lokasi menyusul'}',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _newsSection() {
    final now = DateTime.now();
    final items = (_data.announcements ?? [])
        .whereType<Map>()
        .where((item) {
          final expiry = DateTime.tryParse(
            (item['expiresAt'] ??
                    item['tanggalBerakhir'] ??
                    item['expiredAt'] ??
                    '')
                .toString(),
          );
          return expiry == null || !expiry.isBefore(now);
        })
        .take(5)
        .toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Kabar untuk warga.',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            letterSpacing: -.7,
          ),
        ),
        const SizedBox(height: 5),
        const Text(
          'Pengumuman dari lingkunganmu',
          style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 16),
        if (items.isEmpty)
          _emptyCard(
            icon: Icons.campaign_outlined,
            title: _data.announcements == null
                ? 'Pengumuman belum dimuat'
                : 'Belum ada pengumuman',
            subtitle: 'Kabar terbaru pengurus akan tampil di sini.',
          ),
        ...items.asMap().entries.map((entry) {
          final item = Map<String, dynamic>.from(entry.value);
          final pinned = item['isPinned'] == true;
          return StaggeredEntry(
            key: ValueKey('news-$_entryEpoch-${entry.key}'),
            index: entry.key,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Material(
                color: pinned ? const Color(0xFFFFFAE9) : Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(22),
                  side: BorderSide(
                    color: pinned
                        ? const Color(0xFFEEE1AE)
                        : const Color(0xFFE2E8F0),
                  ),
                ),
                child: InkWell(
                  borderRadius: BorderRadius.circular(22),
                  onTap: () => _showNews(item),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              pinned
                                  ? Icons.push_pin_outlined
                                  : Icons.campaign_outlined,
                              size: 15,
                              color: AppTheme.textSecondary,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                '${pinned ? 'DISEMATKAN' : 'PENGUMUMAN'} / ${item['scope'] ?? 'RT'}',
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: .7,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ),
                            const Icon(
                              Icons.north_east_rounded,
                              size: 16,
                              color: AppTheme.textSecondary,
                            ),
                          ],
                        ),
                        const SizedBox(height: 13),
                        Text(
                          item['judul']?.toString() ?? 'Pengumuman warga',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            height: 1.25,
                            letterSpacing: -.3,
                          ),
                        ),
                        const SizedBox(height: 7),
                        Text(
                          item['konten']?.toString() ?? '',
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            height: 1.5,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _sectionHeading(String title, String action, VoidCallback onTap) =>
      Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                letterSpacing: -.7,
                height: 1.15,
              ),
            ),
          ),
          const SizedBox(width: 6),
          TextButton(
            onPressed: onTap,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              minimumSize: const Size(48, 44),
            ),
            child: Text(
              action,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800),
            ),
          ),
        ],
      );

  Widget _emptyCard({
    required IconData icon,
    required String title,
    required String subtitle,
    VoidCallback? onTap,
  }) => Material(
    color: Colors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(22),
      side: const BorderSide(color: Color(0xFFE2E8F0)),
    ),
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Icon(icon, color: AppTheme.textMuted, size: 28),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppTheme.textSecondary,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            if (onTap != null)
              const Padding(
                padding: EdgeInsets.only(left: 9),
                child: Icon(
                  Icons.arrow_forward_rounded,
                  size: 17,
                  color: AppTheme.textMuted,
                ),
              ),
          ],
        ),
      ),
    ),
  );

  Widget _bottomNav() {
    final destinations = <(IconData, String, VoidCallback)>[
      (
        Icons.home_rounded,
        'Beranda',
        () => _scroll.animateTo(
          0,
          duration: MediaQuery.disableAnimationsOf(context)
              ? Duration.zero
              : const Duration(milliseconds: 450),
          curve: Curves.easeOutCubic,
        ),
      ),
      (Icons.account_balance_wallet_outlined, 'Kas', _showKas),
      (
        Icons.calendar_month_outlined,
        'Agenda',
        () => _navigate(const AgendaScreen(), refresh: true),
      ),
      (
        Icons.storefront_outlined,
        'Lapak',
        () => _navigate(const LapakScreen(), refresh: true),
      ),
      (
        Icons.person_outline_rounded,
        'Profil',
        () => _navigate(const ProfileScreen(), refresh: true),
      ),
    ];
    return SafeArea(
      top: false,
      minimum: const EdgeInsets.fromLTRB(14, 0, 14, 10),
      child: GlassPanel(
        borderRadius: BorderRadius.circular(26),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 7),
          child: Row(
            children: destinations.asMap().entries.map((entry) {
              final selected = entry.key == 0;
              final item = entry.value;
              return Expanded(
                child: Semantics(
                  selected: selected,
                  button: true,
                  label: item.$2,
                  child: InkWell(
                    onTap: item.$3,
                    borderRadius: BorderRadius.circular(19),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 7),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 13,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: selected
                                  ? const Color(0xFFE4EDFF)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              item.$1,
                              size: 22,
                              color: selected
                                  ? AppTheme.electricBlue
                                  : AppTheme.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 3),
                          ExcludeSemantics(
                            child: Text(
                              item.$2,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: selected
                                    ? FontWeight.w800
                                    : FontWeight.w600,
                                color: selected
                                    ? AppTheme.electricBlue
                                    : AppTheme.textSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  void _showNews(Map<String, dynamic> item) => showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    useSafeArea: true,
    builder: (context) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: .65,
      minChildSize: .35,
      maxChildSize: .9,
      builder: (_, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.fromLTRB(24, 4, 24, 36),
        children: [
          Text(
            'PENGUMUMAN / ${item['scope'] ?? 'RT'}',
            style: const TextStyle(
              fontSize: 11,
              color: AppTheme.electricBlue,
              fontWeight: FontWeight.w800,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            item['judul']?.toString() ?? 'Pengumuman warga',
            style: const TextStyle(
              fontSize: 25,
              height: 1.2,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 20),
          SelectableText(
            item['konten']?.toString() ?? '',
            style: const TextStyle(
              fontSize: 15,
              height: 1.65,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    ),
  );

  void _showKas() {
    String selectedMonth = 'SEMUA';
    String selectedType = 'SEMUA';
    final recent = (_data.kas?['recentTransactions'] as List<dynamic>? ?? [])
        .whereType<Map>()
        .toList();
    final monthKeys =
        recent
            .map(
              (tx) => DateTime.tryParse(
                tx['createdAt']?.toString() ?? '',
              )?.toLocal(),
            )
            .whereType<DateTime>()
            .map(
              (date) => '${date.year}-${date.month.toString().padLeft(2, '0')}',
            )
            .toSet()
            .toList()
          ..sort((a, b) => b.compareTo(a));
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      showDragHandle: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          final filtered = recent.where((tx) {
            if (selectedType != 'SEMUA' && tx['tipe'] != selectedType)
              return false;
            if (selectedMonth == 'SEMUA') return true;
            final date = DateTime.tryParse(
              tx['createdAt']?.toString() ?? '',
            )?.toLocal();
            return date != null &&
                '${date.year}-${date.month.toString().padLeft(2, '0')}' ==
                    selectedMonth;
          }).toList();
          return SizedBox(
            height: MediaQuery.sizeOf(context).height * .82,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(22, 0, 22, 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Buku kas RT $_rt',
                              style: const TextStyle(
                                fontSize: 23,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -.6,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Catatan kas terbuka untuk warga',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        tooltip: 'Tutup buku kas',
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 22),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE7F6EF),
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Saldo kas',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        Text(
                          hubRupiah(_data.kas?['saldoKas']),
                          style: const TextStyle(
                            fontSize: 29,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 9),
                        Wrap(
                          spacing: 16,
                          runSpacing: 5,
                          children: [
                            Text(
                              'Masuk ${hubRupiah(_data.kas?['totalPemasukan'])}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF087252),
                              ),
                            ),
                            Text(
                              'Keluar ${hubRupiah(_data.kas?['totalPengeluaran'])}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(22, 14, 22, 14),
                  child: Row(
                    children: [
                      DropdownButton<String>(
                        value: selectedMonth,
                        underline: const SizedBox.shrink(),
                        items: [
                          const DropdownMenuItem(
                            value: 'SEMUA',
                            child: Text('Semua bulan'),
                          ),
                          ...monthKeys.map(
                            (key) => DropdownMenuItem(
                              value: key,
                              child: Text(
                                '${_months[int.parse(key.split('-')[1])]} ${key.split('-')[0]}',
                              ),
                            ),
                          ),
                        ],
                        onChanged: (value) => setModalState(
                          () => selectedMonth = value ?? 'SEMUA',
                        ),
                      ),
                      const SizedBox(width: 14),
                      ...['SEMUA', 'PEMASUKAN', 'PENGELUARAN'].map(
                        (type) => Padding(
                          padding: const EdgeInsets.only(right: 7),
                          child: ChoiceChip(
                            label: Text(
                              type == 'SEMUA'
                                  ? 'Semua'
                                  : type == 'PEMASUKAN'
                                  ? 'Masuk'
                                  : 'Keluar',
                            ),
                            selected: selectedType == type,
                            onSelected: (_) =>
                                setModalState(() => selectedType = type),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: filtered.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Text(
                              _data.kas == null
                                  ? 'Buku kas belum dapat dimuat.'
                                  : 'Belum ada mutasi pada filter ini.',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 22),
                          itemCount: filtered.length,
                          separatorBuilder: (_, index) =>
                              const Divider(height: 22),
                          itemBuilder: (_, index) {
                            final tx = filtered[index];
                            final incoming = tx['tipe'] == 'PEMASUKAN';
                            final date = DateTime.tryParse(
                              tx['createdAt']?.toString() ?? '',
                            )?.toLocal();
                            return Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                CircleAvatar(
                                  radius: 17,
                                  backgroundColor: incoming
                                      ? const Color(0xFFE7F6EF)
                                      : const Color(0xFFFFEDEC),
                                  child: Icon(
                                    incoming
                                        ? Icons.south_west_rounded
                                        : Icons.north_east_rounded,
                                    size: 16,
                                    color: incoming
                                        ? const Color(0xFF087252)
                                        : AppTheme.alertRed,
                                  ),
                                ),
                                const SizedBox(width: 11),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tx['kategori']?.toString() ??
                                            (incoming
                                                ? 'Pemasukan'
                                                : 'Pengeluaran'),
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        tx['keterangan']?.toString() ?? '—',
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: AppTheme.textSecondary,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        date == null
                                            ? 'Tanggal belum tersedia'
                                            : '${date.day} ${_months[date.month]} ${date.year}',
                                        style: const TextStyle(
                                          fontSize: 10,
                                          color: AppTheme.textMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Flexible(
                                  child: Text(
                                    '${incoming ? '+' : '−'}${hubRupiah(tx['nominal'])}',
                                    textAlign: TextAlign.right,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      color: incoming
                                          ? const Color(0xFF087252)
                                          : AppTheme.alertRed,
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                ),
                SafeArea(
                  top: false,
                  minimum: const EdgeInsets.all(18),
                  child: SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        _navigate(
                          const InvoiceScreen(initialTabIndex: 1),
                          refresh: true,
                        );
                      },
                      icon: const Icon(Icons.people_alt_outlined, size: 19),
                      label: const Text('Lihat status iuran warga'),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

const _months = [
  '',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/// Positions the SOS floating action button comfortably above the glass bottom navigation bar.
class _SosFabLocation extends FloatingActionButtonLocation {
  const _SosFabLocation();

  @override
  Offset getOffset(ScaffoldPrelayoutGeometry scaffoldGeometry) {
    final Offset standard =
        FloatingActionButtonLocation.endFloat.getOffset(scaffoldGeometry);
    // Lift the SOS button by 84dp so it floats cleanly above the glass bottom nav bar
    return Offset(standard.dx, standard.dy - 84.0);
  }
}
