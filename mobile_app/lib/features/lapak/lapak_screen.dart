import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/hub_motion.dart';
import 'lapak_models.dart';
import 'lapak_repository.dart';
import 'widgets/ad_package_sheet.dart';
import 'widgets/lapak_product_card.dart';
import 'widgets/product_detail_sheet.dart';
import 'widgets/product_form_sheet.dart';

class LapakScreen extends StatefulWidget {
  const LapakScreen({super.key, this.repository = const ApiLapakRepository()});
  final LapakRepository repository;
  @override
  State<LapakScreen> createState() => _LapakScreenState();
}

class _LapakScreenState extends State<LapakScreen> {
  List<LapakProduct> _products = [];
  Map<String, dynamic>? _user;
  bool _loading = true, _mine = false;
  String _category = 'Semua', _query = '';
  String? _error;
  final _search = TextEditingController();
  int _refreshEpoch = 0;
  bool get _maySell =>
      _user != null && '${_user?['role']}'.toUpperCase() != 'SUPERADMIN';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final values = await Future.wait<Object?>([
        widget.repository.loadProducts(),
        widget.repository.loadUser(),
      ]);
      if (!mounted) return;
      setState(() {
        _products = values[0] as List<LapakProduct>;
        _user = values[1] as Map<String, dynamic>?;
        _loading = false;
        _error = null;
        _refreshEpoch++;
      });
    } catch (_) {
      if (mounted)
        setState(() {
          _loading = false;
          _error = 'Lapak belum dapat dimuat. Periksa koneksi lalu coba lagi.';
        });
    }
  }

  void _message(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _edit([LapakProduct? product]) async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      builder: (_) => ProductFormSheet(
        product: product,
        initialPhone: '${_user?['phone'] ?? ''}',
        onSave: (fields) => widget.repository.save(fields, id: product?.id),
      ),
    );
    if (saved == true) {
      _message('Produk berhasil disimpan.');
      await _load();
    }
  }

  Future<void> _promote(LapakProduct product) async {
    final activated = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      builder: (_) => AdPackageSheet(
        productTitle: product.title,
        currentExpiry: product.promotedUntil,
        sisaDurasiHari: product.sisaDurasiHari,
        onActivate: (package) => widget.repository.promote(product.id, package),
      ),
    );
    if (activated == true) {
      _message('Aktivasi iklan dikonfirmasi server.');
      await _load();
    }
  }

  Future<void> _delete(LapakProduct product) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus produk ini?'),
        content: Text('“${product.title}” akan dihapus dari Lapak Warga.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: AppTheme.alertRed),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await widget.repository.delete(product.id);
      _message('Produk berhasil dihapus.');
      await _load();
    } catch (error) {
      _message(error.toString().replaceFirst('Exception: ', ''));
    }
  }

  void _detail(LapakProduct product) => showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
    ),
    builder: (_) => ProductDetailSheet(product: product, user: _user),
  );

  @override
  Widget build(BuildContext context) {
    final filtered = _products
        .where(
          (product) =>
              (!_mine || product.isOwnedBy(_user)) &&
              (_category == 'Semua' || product.category == _category) &&
              '${product.title} ${product.sellerName} ${product.description}'
                  .toLowerCase()
                  .contains(_query.toLowerCase()),
        )
        .toList();
    final sponsored = _products
        .where((product) => product.isSponsored)
        .toList();
    final categories = [
      'Semua',
      ..._products.map((product) => product.category).toSet(),
    ];
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: [
          SliverAppBar(
            pinned: true,
            floating: false,
            centerTitle: false,
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            scrolledUnderElevation: 0,
            title: const Text(
              'Lapak warga',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 21,
                letterSpacing: -.5,
              ),
            ),
            flexibleSpace: const GlassPanel(
              borderRadius: BorderRadius.zero,
              child: SizedBox.expand(),
            ),
            actions: [
              if (_maySell)
                Padding(
                  padding: const EdgeInsets.only(right: 18),
                  child: IconButton.filledTonal(
                    onPressed: _edit,
                    tooltip: 'Tambah produk',
                    icon: const Icon(Icons.add_rounded),
                  ),
                ),
            ],
          ),
          HubRefreshControl(onRefresh: _load),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(22, 14, 22, 24),
              child: StaggeredEntry(
                index: 0,
                child: _MarketIntro(onSell: _maySell ? _edit : null),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22),
              child: TextField(
                controller: _search,
                onChanged: (value) => setState(() => _query = value),
                decoration: InputDecoration(
                  hintText: 'Cari produk, jasa, atau tetanggamu',
                  prefixIcon: const Icon(Icons.search_rounded),
                  suffixIcon: _query.isEmpty
                      ? null
                      : IconButton(
                          onPressed: () {
                            _search.clear();
                            setState(() => _query = '');
                          },
                          tooltip: 'Hapus pencarian',
                          icon: const Icon(Icons.close_rounded),
                        ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 17,
                  ),
                ),
              ),
            ),
          ),
          if (sponsored.isNotEmpty &&
              !_mine &&
              _query.isEmpty &&
              _category == 'Semua') ...[
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(22, 28, 22, 14),
                child: _SectionHeading(
                  eyebrow: 'KENALAN DENGAN USAHA TETANGGA',
                  title: 'Sorotan lokal',
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: DepthCarousel(
                height: MediaQuery.textScalerOf(context).scale(190) + 25,
                viewportFraction: .90,
                children: sponsored
                    .take(8)
                    .map(
                      (product) => _SponsoredSpotlight(
                        product: product,
                        onTap: () => _detail(product),
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(22, 26, 22, 12),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      _mine ? 'Lapak saya' : 'Jelajahi sekitar',
                      style: const TextStyle(
                        fontSize: 23,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -.7,
                      ),
                    ),
                  ),
                  Text(
                    '${filtered.length} produk',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22),
              child: SegmentedButton<bool>(
                showSelectedIcon: false,
                style: SegmentedButton.styleFrom(
                  selectedBackgroundColor: AppTheme.primaryNavy,
                  selectedForegroundColor: Colors.white,
                  side: const BorderSide(color: AppTheme.slateBorder),
                ),
                segments: const [
                  ButtonSegment(
                    value: false,
                    label: Text('Semua lapak'),
                    icon: Icon(Icons.grid_view_rounded, size: 17),
                  ),
                  ButtonSegment(
                    value: true,
                    label: Text('Lapak saya'),
                    icon: Icon(Icons.storefront_outlined, size: 17),
                  ),
                ],
                selected: {_mine},
                onSelectionChanged: (value) {
                  HapticFeedback.selectionClick();
                  setState(() => _mine = value.first);
                },
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 15),
              child: SizedBox(
                height: 50,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 22),
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  itemCount: categories.length,
                  separatorBuilder: (_, index) => const SizedBox(width: 8),
                  itemBuilder: (context, index) => ChoiceChip(
                    label: Text(categories[index]),
                    selected: _category == categories[index],
                    showCheckmark: false,
                    selectedColor: const Color(0xFFD7F5E9),
                    labelStyle: TextStyle(
                      color: _category == categories[index]
                          ? const Color(0xFF065F46)
                          : AppTheme.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                    onSelected: (_) =>
                        setState(() => _category = categories[index]),
                  ),
                ),
              ),
            ),
          ),
          if (_error != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(22, 0, 22, 20),
                child: _LapakNotice(
                  icon: Icons.cloud_off_outlined,
                  title: 'Koneksi belum tersambung',
                  message: _error!,
                  action: TextButton.icon(
                    onPressed: _load,
                    icon: const Icon(Icons.refresh_rounded),
                    label: const Text('Coba lagi'),
                  ),
                ),
              ),
            ),
          if (_loading)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(50),
                child: Center(child: CircularProgressIndicator()),
              ),
            )
          else if (filtered.isEmpty && _error == null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(22, 10, 22, 30),
                child: _LapakNotice(
                  icon: _mine
                      ? Icons.add_business_outlined
                      : Icons.search_off_rounded,
                  title: _query.isNotEmpty
                      ? 'Belum ketemu.'
                      : _mine
                      ? 'Usahamu dimulai di sini.'
                      : 'Lapak menunggu cerita baru.',
                  message: _query.isNotEmpty
                      ? 'Coba nama produk atau kategori lain.'
                      : _mine
                      ? 'Tambahkan produk pertamamu dan kenalkan ke warga sekitar.'
                      : 'Produk warga akan muncul di sini setelah diterbitkan.',
                  action: _maySell && _query.isEmpty
                      ? FilledButton.icon(
                          onPressed: _edit,
                          icon: const Icon(Icons.add_rounded),
                          label: const Text('Tambah produk'),
                        )
                      : null,
                ),
              ),
            ),
          if (filtered.isNotEmpty)
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 22),
              sliver: SliverLayoutBuilder(
                builder: (context, constraints) {
                  final textScale = MediaQuery.textScalerOf(context).scale(1);
                  final columns =
                      textScale > 1.25 || constraints.crossAxisExtent < 350
                      ? 1
                      : constraints.crossAxisExtent > 760
                      ? 3
                      : 2;
                  final width =
                      (constraints.crossAxisExtent - (columns - 1) * 14) /
                      columns;
                  return SliverGrid(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final product = filtered[index];
                      final owner = product.isOwnedBy(_user) && _maySell;
                      return StaggeredEntry(
                        key: ValueKey('${product.id}-$_refreshEpoch'),
                        index: index.clamp(0, 6),
                        child: LapakProductCard(
                          product: product,
                          onTap: () => _detail(product),
                          onEdit: owner ? () => _edit(product) : null,
                          onDelete: owner ? () => _delete(product) : null,
                          onPromote: owner ? () => _promote(product) : null,
                        ),
                      );
                    }, childCount: filtered.length),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: columns,
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 20,
                      mainAxisExtent:
                          width / 1.28 +
                          175 * textScale +
                          (_mine || filtered.any((p) => p.isOwnedBy(_user))
                              ? 112 * textScale
                              : 0),
                    ),
                  );
                },
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: 126)),
        ],
      ),
    );
  }
}

class _MarketIntro extends StatelessWidget {
  const _MarketIntro({this.onSell});
  final VoidCallback? onSell;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(22),
    decoration: BoxDecoration(
      color: const Color(0xFFE8F6EF),
      borderRadius: BorderRadius.circular(28),
      border: Border.all(color: const Color(0xFFC6E6D7)),
      boxShadow: const [
        BoxShadow(color: Color(0xFFD2EADC), offset: Offset(0, 4)),
      ],
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'DARI TETANGGA, UNTUK KITA',
                    style: TextStyle(
                      fontSize: 9,
                      color: Color(0xFF047857),
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.15,
                    ),
                  ),
                  SizedBox(height: 13),
                  Text(
                    'Dekat rumah.\nBanyak cerita.',
                    style: TextStyle(
                      fontSize: 30,
                      height: 1.12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -1.2,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: 8),
            ClayIllustration(kind: ClayKind.shop, size: 90),
          ],
        ),
        const SizedBox(height: 13),
        const Text(
          'Temukan kuliner, barang, dan jasa dari usaha warga di sekitarmu.',
          style: TextStyle(color: Color(0xFF527566), fontSize: 13, height: 1.6),
        ),
        if (onSell != null)
          Padding(
            padding: const EdgeInsets.only(top: 14),
            child: TextButton.icon(
              onPressed: onSell,
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                foregroundColor: const Color(0xFF065F46),
                alignment: Alignment.centerLeft,
              ),
              icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
              label: const Text(
                'Mulai jualan',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
          ),
      ],
    ),
  );
}

class _SectionHeading extends StatelessWidget {
  const _SectionHeading({required this.eyebrow, required this.title});
  final String eyebrow, title;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        eyebrow,
        style: const TextStyle(
          color: AppTheme.textSecondary,
          fontSize: 9,
          letterSpacing: 1.2,
          fontWeight: FontWeight.w800,
        ),
      ),
      const SizedBox(height: 7),
      Text(
        title,
        style: const TextStyle(
          fontSize: 23,
          fontWeight: FontWeight.w900,
          letterSpacing: -.7,
        ),
      ),
    ],
  );
}

class _SponsoredSpotlight extends StatelessWidget {
  const _SponsoredSpotlight({required this.product, required this.onTap});
  final LapakProduct product;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => TiltCard(
    child: Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              SizedBox(
                width: 100,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(17),
                  child: ProductPhoto(product: product, height: 140),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SponsoredBadge(),
                    const SizedBox(height: 13),
                    Text(
                      product.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        height: 1.3,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      lapakRupiah(product.price),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF047857),
                      ),
                    ),
                    const SizedBox(height: 7),
                    Text(
                      product.sellerName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
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
  );
}

class _LapakNotice extends StatelessWidget {
  const _LapakNotice({
    required this.icon,
    required this.title,
    required this.message,
    this.action,
  });
  final IconData icon;
  final String title, message;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(25),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: AppTheme.slateBorder),
    ),
    child: Column(
      children: [
        Icon(icon, size: 36, color: AppTheme.electricBlue),
        const SizedBox(height: 15),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 19),
        ),
        const SizedBox(height: 8),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppTheme.textSecondary, height: 1.6),
        ),
        if (action != null)
          Padding(padding: const EdgeInsets.only(top: 16), child: action!),
      ],
    ),
  );
}
