import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import '../../core/services/notification_service.dart';

class PanicScreen extends StatefulWidget {
  final String? defaultCategory;
  const PanicScreen({super.key, this.defaultCategory});

  @override
  State<PanicScreen> createState() => _PanicScreenState();
}

class _PanicScreenState extends State<PanicScreen> {
  bool _isLoading = false;
  String? _selectedCategory;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.defaultCategory ?? 'BAHAYA_KEAMANAN';
  }

  Future<void> _sendPanicAlert() async {
    setState(() => _isLoading = true);
    double? latitude;
    double? longitude;

    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        final position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 4),
          ),
        );
        latitude = position.latitude;
        longitude = position.longitude;
      }
    } catch (_) {}

    // Catat waktu trigger lokal agar perangkat sendiri tidak memutar sirine / memunculkan popup responder
    NotificationService.lastSelfTriggeredAlertTime = DateTime.now();

    try {
      final res = await ApiService.triggerPanicAlert(
        catatan: 'Darurat: ${_getCategoryLabel(_selectedCategory)} - Mohon segera bantuan!',
        latitude: latitude,
        longitude: longitude,
      );
      if (res['alert']?['id'] != null) {
        NotificationService.lastSelfTriggeredAlertId = res['alert']['id'].toString();
      }
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Colors.white),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '🚨 Sinyal darurat & koordinat GPS berhasil dikirim ke Pengurus RT & Pos Satpam!',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ],
            ),
            backgroundColor: AppTheme.alertRed,
            duration: Duration(seconds: 5),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🚨 Sinyal darurat disiarkan secara lokal ke pos satpam RT & pengurus!'),
            backgroundColor: AppTheme.alertRed,
          ),
        );
      }
    }
  }

  String _getCategoryLabel(String? category) {
    switch (category) {
      case 'KEBAKARAN':
        return '🔥 Kebakaran / Api / Gas Bocor';
      case 'MEDIS':
        return '🚑 Darurat Medis / Sakit Kritis / Ambulans';
      case 'BAHAYA_KEAMANAN':
      default:
        return '🚨 Bahaya Keamanan / Maling / Penyusup';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 44,
              height: 5,
              decoration: BoxDecoration(
                color: AppTheme.slateBorder,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              '🚨 PANIC BUTTON DARURAT RT',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppTheme.alertRed,
              ),
            ),
              const SizedBox(height: 8),
              const Text(
                'Tekan tombol SOS di bawah untuk menyalakan alarm darurat & mengirimkan notifikasi prioritas tinggi ke Satpam & Pengurus RT.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 16),

              // Category Selector Chips
              Wrap(
                spacing: 8,
                children: [
                  _buildCategoryChip('BAHAYA_KEAMANAN', '🚨 Keamanan / Maling'),
                  _buildCategoryChip('KEBAKARAN', '🔥 Kebakaran'),
                  _buildCategoryChip('MEDIS', '🚑 Medis / Ambulans'),
                ],
              ),
              const SizedBox(height: 24),

              GestureDetector(
                onTap: _isLoading ? null : _sendPanicAlert,
                child: Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: AppTheme.alertRed,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.alertRed.withValues(alpha: 0.4),
                        blurRadius: 30,
                        spreadRadius: 8,
                      ),
                    ],
                  ),
                  child: Center(
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.crisis_alert_rounded, color: Colors.white, size: 48),
                              SizedBox(height: 4),
                              Text(
                                'SOS',
                                style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Sentuh tombol SOS untuk kirim sinyal seketika',
                style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
              ),
              const SizedBox(height: 20),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Batal / Tutup', style: TextStyle(color: AppTheme.textSecondary)),
              ),
            ],
          ),
        ),
      );
  }

  Widget _buildCategoryChip(String id, String label) {
    final isSelected = _selectedCategory == id;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
      selected: isSelected,
      selectedColor: AppTheme.alertRed.withValues(alpha: 0.15),
      labelStyle: TextStyle(color: isSelected ? AppTheme.alertRed : AppTheme.textPrimary),
      onSelected: (selected) {
        if (selected) {
          setState(() => _selectedCategory = id);
        }
      },
    );
  }
}
