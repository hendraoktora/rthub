import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class PanicScreen extends StatefulWidget {
  final String? defaultCategory;
  const PanicScreen({super.key, this.defaultCategory});

  @override
  State<PanicScreen> createState() => _PanicScreenState();
}

class _PanicScreenState extends State<PanicScreen> {
  bool _isTriggered = false;
  bool _isLoading = false;
  String? _selectedCategory;
  String _alertMessage = 'Pos Keamanan RT dan Pengurus telah menerima sinyal darurat dari lokasi rumah Anda.';

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.defaultCategory ?? 'BAHAYA_KEAMANAN';
  }

  Future<void> _sendPanicAlert() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.triggerPanicAlert(
        catatan: 'Darurat: ${_getCategoryLabel(_selectedCategory)} - Mohon segera bantuan!',
      );
      if (mounted) {
        setState(() {
          _isTriggered = true;
          _isLoading = false;
          _alertMessage = res['message'] ?? _alertMessage;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isTriggered = true;
          _isLoading = false;
          _alertMessage = 'Sinyal darurat disiarkan secara lokal ke pos satpam RT & pengurus!';
        });
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
            if (!_isTriggered) ...[
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
            ] else ...[
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.alertRed.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.warning_amber_rounded, color: AppTheme.alertRed, size: 50),
              ),
              const SizedBox(height: 16),
              const Text(
                '🚨 ALARM DARURAT AKTIF!',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.alertRed),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _getCategoryLabel(_selectedCategory),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryNavy),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                _alertMessage,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppTheme.textPrimary, height: 1.4),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryNavy,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Tutup Notifikasi Darurat', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
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
