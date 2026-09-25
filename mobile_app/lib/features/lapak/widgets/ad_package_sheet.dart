import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/hub_motion.dart';
import '../lapak_models.dart';

/// Selection stays local until the user explicitly activates the chosen package.
class AdPackageSheet extends StatefulWidget {
  const AdPackageSheet({
    super.key,
    required this.productTitle,
    this.currentExpiry,
    this.sisaDurasiHari,
    required this.onActivate,
  });
  final String productTitle;
  final DateTime? currentExpiry;
  final int? sisaDurasiHari;
  final Future<void> Function(AdPackage package) onActivate;
  @override
  State<AdPackageSheet> createState() => _AdPackageSheetState();
}

class _AdPackageSheetState extends State<AdPackageSheet> {
  AdPackage _selected = AdPackage.catalogue.first;
  bool _busy = false;
  String? _error;

  bool get _isExtending =>
      widget.currentExpiry != null &&
      widget.currentExpiry!.isAfter(DateTime.now());

  Future<void> _activate() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.onActivate(_selected);
      if (mounted) Navigator.of(context).pop(true);
    } catch (error) {
      if (mounted)
        setState(() {
          _busy = false;
          _error = error.toString().replaceFirst('Exception: ', '');
        });
    }
  }

  @override
  Widget build(BuildContext context) => SafeArea(
    top: false,
    child: ConstrainedBox(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.sizeOf(context).height * .94,
      ),
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(
          24,
          14,
          24,
          24 + MediaQuery.viewInsetsOf(context).bottom,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.slateBorder,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'USAHA KECIL. PELUANG BESAR.',
              style: TextStyle(
                fontSize: 10,
                letterSpacing: 1.5,
                fontWeight: FontWeight.w800,
                color: Color(0xFF047857),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Biar makin dikenal.',
              style: TextStyle(
                fontSize: 29,
                height: 1.15,
                fontWeight: FontWeight.w900,
                letterSpacing: -1,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              widget.productTitle,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                height: 1.5,
              ),
            ),
            if (_isExtending) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.av_timer_rounded, color: Color(0xFF059669), size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Iklan aktif tersisa ${widget.sisaDurasiHari ?? 0} hari. Durasi paket pilihan (+${_selected.days} hari) akan otomatis ditambahkan ke sisa hari saat ini.',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF065F46),
                          fontWeight: FontWeight.w600,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),
            _ReachPreview(package: _selected),
            const SizedBox(height: 22),
            const Text(
              'Pilih jangkauan iklan',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
            ),
            const SizedBox(height: 12),
            ...AdPackage.catalogue.map(
              (package) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _PackageOption(
                  package: package,
                  selected: _selected.code == package.code,
                  onTap: _busy
                      ? null
                      : () {
                          HapticFeedback.selectionClick();
                          setState(() => _selected = package);
                        },
                ),
              ),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.background,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text(
                'Tarif mengikuti katalog aplikasi. Pembayaran belum terhubung di aplikasi; '
                'koordinasikan pembayaran dengan pengurus. Tombol di bawah mengaktifkan iklan, '
                'bukan konfirmasi pembayaran.',
                style: TextStyle(
                  fontSize: 12,
                  height: 1.55,
                  color: AppTheme.textSecondary,
                ),
              ),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  _error!,
                  key: const Key('ad-error'),
                  style: const TextStyle(color: AppTheme.alertRed, height: 1.5),
                ),
              ),
            const SizedBox(height: 20),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Expanded(
                  child: Text(
                    'Tarif paket',
                    style: TextStyle(color: AppTheme.textSecondary),
                  ),
                ),
                Flexible(
                  child: Text(
                    lapakRupiah(_selected.price),
                    key: const Key('ad-total'),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -.6,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                key: const Key('activate-ad'),
                onPressed: _busy ? null : _activate,
                style: FilledButton.styleFrom(
                  backgroundColor: AppTheme.electricBlue,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                ),
                icon: _busy
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.bolt_rounded),
                label: Text(
                  _busy
                      ? 'Memproses…'
                      : (_isExtending
                          ? 'Perpanjang Durasi (+${_selected.days} Hari) - ${_selected.label}'
                          : 'Aktifkan Iklan ${_selected.label} (${_selected.days} Hari)'),
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _PackageOption extends StatelessWidget {
  const _PackageOption({
    required this.package,
    required this.selected,
    this.onTap,
  });
  final AdPackage package;
  final bool selected;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => Semantics(
    selected: selected,
    button: true,
    child: AnimatedContainer(
      duration: MediaQuery.disableAnimationsOf(context)
          ? Duration.zero
          : const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      decoration: BoxDecoration(
        color: selected ? const Color(0xFFEEF4FF) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: selected ? AppTheme.electricBlue : AppTheme.slateBorder,
          width: selected ? 1.8 : 1,
        ),
        boxShadow: selected
            ? const [BoxShadow(color: Color(0x202563EB), offset: Offset(0, 3))]
            : [],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          key: ValueKey('package-${package.scope}'),
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Padding(
            padding: const EdgeInsets.all(15),
            child: Row(
              children: [
                Icon(
                  selected
                      ? Icons.radio_button_checked_rounded
                      : Icons.radio_button_off_rounded,
                  size: 21,
                  color: selected ? AppTheme.electricBlue : AppTheme.textMuted,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        package.label,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${package.days} hari tayang',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Flexible(
                  child: Text(
                    lapakRupiah(package.price),
                    textAlign: TextAlign.end,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

class _ReachPreview extends StatelessWidget {
  const _ReachPreview({required this.package});
  final AdPackage package;
  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(
      color: const Color(0xFFEAF6F1),
      borderRadius: BorderRadius.circular(24),
    ),
    padding: const EdgeInsets.fromLTRB(20, 12, 20, 18),
    child: Column(
      children: [
        SizedBox(
          height: 136,
          child: Center(
            child: Stack(
              alignment: Alignment.center,
              children: [
                ...List.generate(
                  4,
                  (index) => AnimatedContainer(
                    duration: MediaQuery.disableAnimationsOf(context)
                        ? Duration.zero
                        : const Duration(milliseconds: 420),
                    curve: Curves.easeOutBack,
                    width: 84.0 + index * 32,
                    height: 36.0 + index * 22,
                    transform: Matrix4.identity()..rotateZ(-.16),
                    decoration: BoxDecoration(
                      shape: BoxShape.rectangle,
                      borderRadius: BorderRadius.circular(100),
                      color: index < package.level
                          ? AppTheme.successGreen.withValues(alpha: .045)
                          : Colors.transparent,
                      border: Border.all(
                        color: index < package.level
                            ? AppTheme.successGreen.withValues(alpha: .48)
                            : AppTheme.successGreen.withValues(alpha: .08),
                        width: 1.5,
                      ),
                    ),
                  ),
                ).reversed,
                const Padding(
                  padding: EdgeInsets.only(bottom: 24),
                  child: ClayIllustration(kind: ClayKind.shop, size: 102),
                ),
              ],
            ),
          ),
        ),
        Text(
          'Jangkauan ${package.label}',
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17),
        ),
        const SizedBox(height: 5),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 180),
          child: Text(
            package.description,
            key: ValueKey(package.code),
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF3A6957),
              height: 1.4,
            ),
          ),
        ),
      ],
    ),
  );
}
