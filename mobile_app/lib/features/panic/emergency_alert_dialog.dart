import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/services/notification_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/hub_motion.dart';
import 'panic_gateway.dart';

const _alarmChannel = MethodChannel('com.rthub.rthub_mobile/widget');
ValueNotifier<Map<String, dynamic>>? _activeAlert;

Future<bool> _alarmMethod(String method) async {
  try {
    return await _alarmChannel.invokeMethod<bool>(method) == true;
  } on MissingPluginException {
    return false;
  } on PlatformException {
    return false;
  }
}

/// Owns foreground alarm lifetime. A new alert updates the open dialog rather
/// than stacking routes whose competing stop commands could silence each other.
Future<void> showEmergencyAlertDialog(
  BuildContext context,
  Map<String, dynamic> data,
) async {
  if (NotificationService.isSelfTriggered(data) || !context.mounted) return;
  if (_activeAlert case final active?) {
    final id = data['alertId'];
    if (id == null || id != active.value['alertId']) {
      active.value = Map<String, dynamic>.of(data);
    }
    return;
  }
  final alerts = ValueNotifier(Map<String, dynamic>.of(data));
  _activeAlert = alerts;
  try {
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      barrierColor: AppTheme.primaryNavy.withValues(alpha: .35),
      builder: (_) => EmergencyAlertDialog(data: data, updates: alerts),
    );
  } finally {
    // Covers system back, explicit close and route removal.
    await _alarmMethod('stopPanicAlarm');
    if (identical(_activeAlert, alerts)) _activeAlert = null;
    alerts.dispose();
  }
}

class EmergencyAlertDialog extends StatefulWidget {
  const EmergencyAlertDialog({super.key, required this.data, this.updates});
  final Map<String, dynamic> data;
  final ValueNotifier<Map<String, dynamic>>? updates;

  @override
  State<EmergencyAlertDialog> createState() => _EmergencyAlertDialogState();
}

class _EmergencyAlertDialogState extends State<EmergencyAlertDialog> {
  late Map<String, dynamic> _data;
  bool _muted = false;
  bool? _alarmAvailable;
  int _alarmRevision = 0;

  @override
  void initState() {
    super.initState();
    _data = widget.updates?.value ?? widget.data;
    widget.updates?.addListener(_receiveAlert);
    unawaited(_play());
  }

  void _receiveAlert() {
    setState(() {
      _data = widget.updates!.value;
      _muted = false;
      _alarmAvailable = null;
    });
    unawaited(_play());
  }

  Future<void> _play() async {
    final revision = ++_alarmRevision;
    final available = await _alarmMethod('playPanicAlarm');
    if (!mounted || _muted) {
      await _alarmMethod('stopPanicAlarm');
      return;
    }
    if (revision != _alarmRevision) return;
    setState(() => _alarmAvailable = available);
  }

  void _mute() {
    if (_muted) return;
    setState(() => _muted = true);
    unawaited(_alarmMethod('stopPanicAlarm'));
  }

  @override
  void dispose() {
    widget.updates?.removeListener(_receiveAlert);
    unawaited(_alarmMethod('stopPanicAlarm'));
    super.dispose();
  }

  Future<void> _open(Uri uri) async {
    _mute();
    try {
      if (await launchUrl(uri, mode: LaunchMode.externalApplication)) return;
    } catch (_) {
      // Keep the readable address and coordinate available if no app handles it.
    }
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Aplikasi tujuan belum bisa dibuka. Coba lagi.'),
      ),
    );
  }

  String _text(String key, String fallback) {
    final text = _data[key]?.toString().trim();
    return text == null || text.isEmpty || text == '-' ? fallback : text;
  }

  @override
  Widget build(BuildContext context) {
    final location = PanicLocation.tryParse(
      _data['latitude'],
      _data['longitude'],
    );
    final house = _text('noRumah', '');
    final address = _text(
      'lokasi',
      house.isEmpty ? 'Lingkungan RT' : 'Rumah No. $house',
    );
    final phone = _text('phone', '').replaceAll(RegExp(r'[^0-9+]'), '');
    final muteLabel = _muted
        ? 'Sirine dimatikan'
        : _alarmAvailable == false
        ? 'Suara tidak tersedia'
        : 'Matikan sirine';
    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      backgroundColor: AppTheme.background,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: 440,
          maxHeight: MediaQuery.sizeOf(context).height * .88,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 12, 10, 0),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppTheme.alertRed,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'SOS DARI WARGA',
                      style: TextStyle(
                        fontSize: 11,
                        letterSpacing: 1.5,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFB91C1C),
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: 'Tutup peringatan',
                    onPressed: () {
                      _mute();
                      Navigator.of(context).pop();
                    },
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 4, 22, 14),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  key: const ValueKey('mute-alarm'),
                  onPressed: _muted || _alarmAvailable == false ? null : _mute,
                  icon: Icon(
                    _muted || _alarmAvailable == false
                        ? Icons.volume_off_rounded
                        : Icons.volume_up_rounded,
                  ),
                  label: Text(
                    muteLabel,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(52),
                    backgroundColor: AppTheme.primaryNavy,
                    disabledBackgroundColor: AppTheme.slateBorder,
                    disabledForegroundColor: AppTheme.textSecondary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
            ),
            const Divider(height: 1),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(22, 20, 22, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Center(
                      child: ClayIllustration(kind: ClayKind.siren, size: 106),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Tetangga butuh\nbantuan Anda.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 27,
                        height: 1.2,
                        letterSpacing: -.7,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.slateBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _text('namaPelapor', 'Warga lingkungan'),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            address,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppTheme.textSecondary,
                              height: 1.4,
                            ),
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 14),
                            child: Divider(height: 1),
                          ),
                          Text(
                            _text(
                              'catatan',
                              'Pelapor mengirim sinyal darurat dan membutuhkan bantuan.',
                            ),
                            style: const TextStyle(
                              fontSize: 14,
                              height: 1.6,
                              color: AppTheme.primaryNavy,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.location_on_rounded,
                                color: AppTheme.electricBlue,
                                size: 27,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  location == null
                                      ? 'Titik GPS belum tersedia'
                                      : 'Titik koordinat pelapor',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          if (location != null) ...[
                            SelectableText(
                              '${location.latitude.toStringAsFixed(6)}, ${location.longitude.toStringAsFixed(6)}',
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppTheme.electricBlue,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Buka pin di peta untuk melihat lokasi yang dikirim pelapor.',
                              style: TextStyle(
                                fontSize: 12,
                                height: 1.5,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 14),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton.icon(
                                key: const ValueKey('open-panic-map'),
                                onPressed: () => _open(location.mapsUri),
                                icon: const Icon(
                                  Icons.near_me_outlined,
                                  size: 19,
                                ),
                                label: const Text('Buka pin lokasi'),
                                style: FilledButton.styleFrom(
                                  backgroundColor: AppTheme.electricBlue,
                                  minimumSize: const Size.fromHeight(48),
                                ),
                              ),
                            ),
                          ] else
                            const Text(
                              'Hubungi pelapor atau gunakan keterangan alamat di atas untuk memastikan lokasi.',
                              style: TextStyle(
                                fontSize: 12,
                                height: 1.6,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                        ],
                      ),
                    ),
                    if (phone.isNotEmpty &&
                        RegExp(r'[0-9]{5}').hasMatch(phone)) ...[
                      const SizedBox(height: 16),
                      OutlinedButton.icon(
                        onPressed: () => _open(Uri(scheme: 'tel', path: phone)),
                        icon: const Icon(
                          Icons.phone_in_talk_outlined,
                          size: 20,
                        ),
                        label: const Text('Hubungi pelapor'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(52),
                        ),
                      ),
                    ],
                    const SizedBox(height: 8),
                    const Text(
                      'Utamakan keselamatan diri saat memberikan bantuan.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11,
                        height: 1.5,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
