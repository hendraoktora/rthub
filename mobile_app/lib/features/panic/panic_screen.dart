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

class _PanicScreenState extends State<PanicScreen> {
  static const _categories = <String, (String, String, IconData)>{
    'BAHAYA_KEAMANAN': (
      'Keamanan',
      'Pencurian atau ancaman keselamatan',
      Icons.shield_outlined,
    ),
    'KEBAKARAN': (
      'Kebakaran',
      'Api, asap, atau kebocoran gas',
      Icons.local_fire_department_outlined,
    ),
    'MEDIS': (
      'Medis',
      'Bantuan kesehatan mendesak',
      Icons.medical_services_outlined,
    ),
  };
  late String _category;
  bool _confirming = false;
  bool _sending = false;
  bool _locating = true;
  PanicLocationResult? _location;
  String? _error;

  @override
  void initState() {
    super.initState();
    _category = _categories.containsKey(widget.defaultCategory)
        ? widget.defaultCategory!
        : 'BAHAYA_KEAMANAN';
    _locate();
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
    if (_sending || !_confirming) return;
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
                  padding: const EdgeInsets.fromLTRB(24, 8, 12, 0),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.emergency_outlined,
                        color: AppTheme.alertRed,
                        size: 19,
                      ),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'SOS DARURAT',
                          style: TextStyle(
                            fontSize: 12,
                            letterSpacing: 1.8,
                            fontWeight: FontWeight.w800,
                          ),
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
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(24, 4, 24, 24),
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Center(
                          child: ClayIllustration(
                            kind: ClayKind.siren,
                            size: 116,
                          ),
                        ),
                        Text(
                          _confirming
                              ? 'Siap mengirim bantuan?'
                              : 'Tetap tenang.\nKami terhubung.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 27,
                            height: 1.15,
                            letterSpacing: -.9,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primaryNavy,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _confirming
                              ? 'Sinyal ${_categories[_category]!.$1.toLowerCase()} akan dikirim ke pengurus RT dan petugas keamanan.'
                              : 'Pilih kondisi darurat untuk meminta bantuan pengurus RT dan petugas keamanan.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 13,
                            height: 1.6,
                          ),
                        ),
                        const SizedBox(height: 24),
                        if (!_confirming)
                          ..._categories.entries.map(
                            (entry) => Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: _categoryTile(entry.key, entry.value),
                            ),
                          ),
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
                              ),
                              child: Text(
                                _error!,
                                style: const TextStyle(
                                  color: Color(0xFFB91C1C),
                                  fontSize: 13,
                                  height: 1.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 22),
                        FilledButton.icon(
                          key: const ValueKey('send-panic'),
                          onPressed: _sending
                              ? null
                              : _confirming
                              ? _send
                              : () {
                                  HapticFeedback.lightImpact();
                                  setState(() => _confirming = true);
                                },
                          style: FilledButton.styleFrom(
                            backgroundColor: AppTheme.alertRed,
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: const Color(0xFFFCA5A5),
                            minimumSize: const Size.fromHeight(58),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                          ),
                          icon: _sending
                              ? const SizedBox.square(
                                  dimension: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : Icon(
                                  _confirming
                                      ? Icons.sos_rounded
                                      : Icons.crisis_alert_rounded,
                                ),
                          label: Text(
                            _sending
                                ? 'Mengirim SOS…'
                                : _confirming
                                ? (_error == null
                                      ? 'Kirim SOS sekarang'
                                      : 'Coba kirim SOS lagi')
                                : 'Siapkan sinyal SOS',
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                        ),
                        const SizedBox(height: 8),
                        if (_confirming)
                          TextButton(
                            onPressed: _sending
                                ? null
                                : () => setState(() {
                                    _confirming = false;
                                    _error = null;
                                  }),
                            child: const Text('Ubah pilihan'),
                          )
                        else
                          const Text(
                            'Anda akan diminta konfirmasi sebelum SOS dikirim.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 11,
                              height: 1.5,
                            ),
                          ),
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

  Widget _categoryTile(String id, (String, String, IconData) details) {
    final selected = _category == id;
    return Semantics(
      selected: selected,
      button: true,
      child: Material(
        color: selected ? const Color(0xFFFEF2F2) : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(
            color: selected ? AppTheme.alertRed : AppTheme.slateBorder,
            width: selected ? 1.4 : 1,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () {
            HapticFeedback.selectionClick();
            setState(() => _category = id);
          },
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Icon(
                  details.$3,
                  color: selected ? AppTheme.alertRed : AppTheme.textSecondary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        details.$1,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        details.$2,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  selected
                      ? Icons.radio_button_checked
                      : Icons.radio_button_off,
                  size: 20,
                  color: selected ? AppTheme.alertRed : AppTheme.textMuted,
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
