import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/services/notification_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/hub_motion.dart';
import 'panic_gateway.dart';

/// A scrollable emergency sheet with an explicit accessible confirmation step.
class PanicScreen extends StatefulWidget {
  const PanicScreen({
    super.key,
    this.defaultCategory,
    this.gateway = const DevicePanicGateway(),
  });
  final String? defaultCategory;
  final PanicGateway gateway;

  @override
  State<PanicScreen> createState() => _PanicScreenState();
}

class _PanicScreenState extends State<PanicScreen>
    with SingleTickerProviderStateMixin {
  static const _categories = <String, (String, String, IconData)>{
    'BAHAYA_KEAMANAN': (
      'Keamanan',
      'Pencurian atau ancaman keselamatan',
      Icons.shield_rounded,
    ),
    'KEBAKARAN': (
      'Kebakaran',
      'Api, asap, atau kebocoran gas',
      Icons.local_fire_department_rounded,
    ),
    'MEDIS': (
      'Medis',
      'Bantuan kesehatan mendesak',
      Icons.medical_services_rounded,
    ),
  };
  late String _category;
  bool _sending = false;
  bool _locating = true;
  PanicLocationResult? _location;
  String? _error;
  AnimationController? _pulseController;
  Animation<double>? _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _category = _categories.containsKey(widget.defaultCategory)
        ? widget.defaultCategory!
        : 'BAHAYA_KEAMANAN';
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController!, curve: Curves.easeInOut),
    );
    _locate();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.of(context).disableAnimations) {
      _pulseController?.stop();
    } else if (_pulseController?.isAnimating != true) {
      _pulseController?.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _pulseController?.dispose();
    super.dispose();
  }

  Future<void> _locate() async {
    if (!_locating) setState(() => _locating = true);
    PanicLocationResult result;
    try {
      result = await widget.gateway.locate();
    } catch (_) {
      result = const PanicLocationResult(
        message: 'Lokasi belum diperoleh. SOS tetap bisa dikirim tanpa GPS.',
      );
    }
    if (!mounted) return;
    setState(() {
      _location = result;
      _locating = false;
    });
  }

  Future<void> _send() async {
    if (_sending) return;
    HapticFeedback.heavyImpact();
    setState(() {
      _sending = true;
      _error = null;
    });
    final previousTime = NotificationService.lastSelfTriggeredAlertTime;
    final triggeredAt = DateTime.now();
    NotificationService.lastSelfTriggeredAlertTime = triggeredAt;
    final candidate = _location?.location;
    final location = candidate?.isValid == true ? candidate : null;
    try {
      final response = await widget.gateway.send(
        categoryLabel: _categories[_category]!.$1,
        location: location,
      );
      final alert = response['alert'];
      if (alert is Map && alert['id'] != null)
        NotificationService.lastSelfTriggeredAlertId = alert['id'].toString();
      if (!mounted) return;
      final messenger = ScaffoldMessenger.of(context);
      Navigator.of(context).pop();
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            location == null
                ? 'SOS berhasil dikirim. Titik GPS belum tersedia.'
                : 'SOS dan titik GPS berhasil dikirim ke pengurus RT.',
          ),
          backgroundColor: AppTheme.primaryNavy,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (_) {
      // Failed delivery must never be presented as a locally delivered SOS.
      if (NotificationService.lastSelfTriggeredAlertTime == triggeredAt)
        NotificationService.lastSelfTriggeredAlertTime = previousTime;
      if (!mounted) return;
      setState(() {
        _sending = false;
        _error =
            'Pengiriman SOS belum terkonfirmasi. Periksa koneksi lalu coba lagi, atau hubungi petugas secara langsung.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_sending,
      child: SafeArea(
        top: false,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.sizeOf(context).height * .94,
          ),
          child: Material(
            color: AppTheme.background,
            clipBehavior: Clip.antiAlias,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 10),
                Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppTheme.slateBorder,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 8, 12, 4),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEE2E2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.emergency_rounded,
                          color: AppTheme.alertRed,
                          size: 18,
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'SINYAL DARURAT',
                              style: TextStyle(
                                fontSize: 13,
                                letterSpacing: 1.2,
                                fontWeight: FontWeight.w900,
                                color: AppTheme.alertRed,
                              ),
                            ),
                            Text(
                              'Sentuh tombol untuk langsung kirim sinyal',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        tooltip: 'Tutup SOS',
                        onPressed: _sending
                            ? null
                            : () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1, color: AppTheme.slateBorder),
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Category Selection - Compact Chips
                        const Text(
                          'PILIH KATEGORI DARURAT',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: _categories.entries.map((entry) {
                            final isSelected = _category == entry.key;
                            return Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(16),
                                  onTap: _sending
                                      ? null
                                      : () {
                                          HapticFeedback.selectionClick();
                                          setState(() => _category = entry.key);
                                        },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                      horizontal: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? const Color(0xFFFEF2F2)
                                          : Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: isSelected
                                            ? AppTheme.alertRed
                                            : AppTheme.slateBorder,
                                        width: isSelected ? 2 : 1,
                                      ),
                                      boxShadow: isSelected
                                          ? [
                                              BoxShadow(
                                                color: AppTheme.alertRed.withOpacity(0.12),
                                                blurRadius: 8,
                                                offset: const Offset(0, 3),
                                              )
                                            ]
                                          : null,
                                    ),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          entry.value.$3,
                                          color: isSelected
                                              ? AppTheme.alertRed
                                              : AppTheme.textSecondary,
                                          size: 24,
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          entry.value.$1,
                                          textAlign: TextAlign.center,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: isSelected
                                                ? FontWeight.w800
                                                : FontWeight.w600,
                                            color: isSelected
                                                ? AppTheme.alertRed
                                                : AppTheme.primaryNavy,
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
                        const SizedBox(height: 24),

                        // Prominent Center SOS Button
                        Center(
                          child: AnimatedBuilder(
                            animation: _pulseAnimation ??
                                const AlwaysStoppedAnimation(1.0),
                            builder: (context, child) {
                              final scale = _sending
                                  ? 1.0
                                  : (_pulseAnimation?.value ?? 1.0);
                              return Transform.scale(
                                scale: scale,
                                child: child,
                              );
                            },
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                // Outer glow wave
                                Container(
                                  width: 176,
                                  height: 176,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: const Color(0xFFEF4444).withOpacity(0.15),
                                  ),
                                ),
                                // Middle ring
                                Container(
                                  width: 156,
                                  height: 156,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: const Color(0xFFEF4444).withOpacity(0.25),
                                  ),
                                ),
                                // Main clickable SOS button
                                Material(
                                  color: Colors.transparent,
                                  shape: const CircleBorder(),
                                  child: InkWell(
                                    key: const ValueKey('send-panic'),
                                    onTap: _sending ? null : _send,
                                    customBorder: const CircleBorder(),
                                    splashColor: Colors.white30,
                                    highlightColor: Colors.white24,
                                    child: Ink(
                                      width: 136,
                                      height: 136,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: const LinearGradient(
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                          colors: [
                                            Color(0xFFFF3B30),
                                            Color(0xFFDC2626),
                                            Color(0xFF991B1B),
                                          ],
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFFDC2626).withOpacity(0.45),
                                            blurRadius: 24,
                                            spreadRadius: 2,
                                            offset: const Offset(0, 8),
                                          ),
                                        ],
                                      ),
                                      child: Center(
                                        child: _sending
                                            ? const Column(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  SizedBox.square(
                                                    dimension: 36,
                                                    child: CircularProgressIndicator(
                                                      color: Colors.white,
                                                      strokeWidth: 3.5,
                                                    ),
                                                  ),
                                                  SizedBox(height: 10),
                                                  Text(
                                                    'MENGIRIM...',
                                                    style: TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.w900,
                                                      letterSpacing: 1.2,
                                                    ),
                                                  ),
                                                ],
                                              )
                                            : Column(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  const Icon(
                                                    Icons.crisis_alert_rounded,
                                                    color: Colors.white,
                                                    size: 32,
                                                  ),
                                                  const SizedBox(height: 2),
                                                  const Text(
                                                    'SOS',
                                                    style: TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 34,
                                                      fontWeight: FontWeight.w900,
                                                      letterSpacing: 2.5,
                                                      height: 1.0,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    'TEKAN SEKARANG',
                                                    style: TextStyle(
                                                      color: Colors.white.withOpacity(0.9),
                                                      fontSize: 9,
                                                      fontWeight: FontWeight.w800,
                                                      letterSpacing: 0.8,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),
                        Text(
                          'Sinyal ${_categories[_category]!.$1.toLowerCase()} akan langsung dikirim ke pengurus RT dan satpam.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 18),
                        _locationTile(),
                        if (_error != null) ...[
                          const SizedBox(height: 14),
                          Semantics(
                            liveRegion: true,
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF2F2),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: const Color(0xFFFCA5A5),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(
                                    Icons.error_outline_rounded,
                                    color: Color(0xFFB91C1C),
                                    size: 20,
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      _error!,
                                      style: const TextStyle(
                                        color: Color(0xFFB91C1C),
                                        fontSize: 12,
                                        height: 1.4,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }


  Widget _locationTile() {
    final available = _location?.location?.isValid == true;
    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: available ? const Color(0xFFECFDF5) : AppTheme.slateLight,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(
              available ? Icons.gps_fixed_rounded : Icons.location_searching,
              size: 21,
              color: available
                  ? const Color(0xFF047857)
                  : AppTheme.textSecondary,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _locating
                    ? 'Mencari lokasi perangkat… SOS tetap bisa dikirim.'
                    : _location?.message ?? 'Lokasi belum tersedia.',
                style: const TextStyle(
                  fontSize: 12,
                  height: 1.5,
                  color: AppTheme.textSecondary,
                ),
              ),
            ),
            if (!_locating && !available && !_sending)
              IconButton(
                tooltip: 'Cari lokasi lagi',
                onPressed: _locate,
                icon: const Icon(Icons.refresh_rounded),
              ),
          ],
        ),
      ),
    );
  }
}
