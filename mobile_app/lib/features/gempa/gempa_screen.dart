import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class GempaScreen extends StatefulWidget {
  final Map<String, dynamic>? initialData;
  const GempaScreen({super.key, this.initialData});

  @override
  State<GempaScreen> createState() => _GempaScreenState();
}

class _GempaScreenState extends State<GempaScreen> {
  Map<String, dynamic>? _gempa;
  bool _isLoading = true;
  bool _isBroadcasting = false;
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    if (widget.initialData != null) {
      _gempa = widget.initialData;
      _isLoading = false;
    }
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        ApiService.getGempaTerkini(),
        ApiService.getUserData(),
      ]);

      if (!mounted) return;
      setState(() {
        if (results[0] != null) {
          _gempa = results[0] as Map<String, dynamic>;
        }
        if (results[1] != null) {
          _user = results[1] as Map<String, dynamic>;
        }
        _isLoading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  bool get _isPengurus {
    final role = _user?['role']?.toString().toUpperCase() ?? '';
    return role == 'KETUA_RT' ||
        role == 'SEKRETARIS_RT' ||
        role == 'BENDAHARA_RT' ||
        role == 'ADMIN' ||
        role == 'PENGURUS';
  }

  Color _getMagnitudeColor(double mag) {
    if (mag >= 6.5) return const Color(0xFFDC2626); // Deep Red
    if (mag >= 5.0) return const Color(0xFFEA580C); // Vibrant Orange
    if (mag >= 4.0) return const Color(0xFFD97706); // Amber
    return const Color(0xFF059669); // Emerald
  }

  Future<void> _shareToWhatsApp() async {
    if (_gempa == null) return;
    final mag = _gempa!['Magnitude'] ?? '-';
    final wilayah = _gempa!['Wilayah'] ?? '-';
    final waktu = '${_gempa!['Tanggal'] ?? ''} ${_gempa!['Jam'] ?? ''}'.trim();
    final kedalaman = _gempa!['Kedalaman'] ?? '-';
    final potensi = _gempa!['Potensi'] ?? '-';

    final text = '⚠️ *INFORMASI GEMPA BUMI TERKINI (BMKG)* ⚠️\n\n'
        '• *Magnitudo:* M $mag\n'
        '• *Waktu:* $waktu\n'
        '• *Pusat Gempa:* $wilayah\n'
        '• *Kedalaman:* $kedalaman\n'
        '• *Status:* $potensi\n\n'
        'Harap warga tetap tenang, waspada terhadap gempa susulan, dan periksa kondisi bangunan sekitar.\n'
        '_Disiarkan melalui Aplikasi RtHub_';

    final url = Uri.parse('whatsapp://send?text=${Uri.encodeComponent(text)}');
    final webUrl = Uri.parse('https://wa.me/?text=${Uri.encodeComponent(text)}');

    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else if (await canLaunchUrl(webUrl)) {
      await launchUrl(webUrl, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _handleBroadcast() async {
    if (_gempa == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.campaign_rounded, color: AppTheme.alertRed),
            SizedBox(width: 8),
            Text('Siarkan Gempa ke Warga?'),
          ],
        ),
        content: Text(
          'Notifikasi peringatan gempa M ${_gempa!['Magnitude']} (${_gempa!['Wilayah']}) akan dikirimkan ke seluruh smartphone warga yang terdaftar.',
          style: const TextStyle(fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.alertRed,
              foregroundColor: Colors.white,
            ),
            child: const Text('Ya, Siarkan Sekarang'),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    setState(() => _isBroadcasting = true);
    final success = await ApiService.broadcastGempa(_gempa!);
    if (!mounted) return;
    setState(() => _isBroadcasting = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success
            ? '📢 Peringatan gempa berhasil disiarkan ke seluruh HP warga!'
            : 'Gagal mengirim siaran gempa. Silakan coba lagi.'),
        backgroundColor: success ? AppTheme.successGreen : AppTheme.alertRed,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final magStr = _gempa?['Magnitude']?.toString() ?? '0.0';
    final magVal = double.tryParse(magStr) ?? 0.0;
    final magColor = _getMagnitudeColor(magVal);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Info Gempa Bumi BMKG',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Perbarui Data BMKG',
            onPressed: _loadData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _gempa == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.signal_wifi_off_rounded, size: 48, color: AppTheme.textMuted),
                      const SizedBox(height: 12),
                      const Text('Gagal memuat data gempa BMKG', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: _loadData,
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Official Source Banner
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFBFDBFE)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.verified_rounded, color: AppTheme.electricBlue, size: 18),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Sumber Resmi: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Main Earthquake Card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Magnitude Badge
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    decoration: BoxDecoration(
                                      color: magColor.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: magColor.withValues(alpha: 0.4), width: 2),
                                    ),
                                    child: Column(
                                      children: [
                                        Text(
                                          'M $magStr',
                                          style: TextStyle(
                                            fontSize: 26,
                                            fontWeight: FontWeight.w900,
                                            color: magColor,
                                          ),
                                        ),
                                        Text(
                                          'Skala Richter',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: magColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFFEF3C7),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            '${_gempa!['Tanggal'] ?? ''} • ${_gempa!['Jam'] ?? ''}',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF92400E),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          _gempa!['Wilayah'] ?? '-',
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w800,
                                            color: AppTheme.textPrimary,
                                            height: 1.3,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              const Divider(height: 1),
                              const SizedBox(height: 14),

                              // Quick Metrics Grid
                              Row(
                                children: [
                                  Expanded(
                                    child: _buildMetricItem(
                                      icon: Icons.layers_rounded,
                                      title: 'Kedalaman',
                                      value: _gempa!['Kedalaman'] ?? '-',
                                    ),
                                  ),
                                  Expanded(
                                    child: _buildMetricItem(
                                      icon: Icons.my_location_rounded,
                                      title: 'Koordinat',
                                      value: '${_gempa!['Lintang'] ?? ''}, ${_gempa!['Bujur'] ?? ''}'.trim(),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),

                              // Potensi Banner
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: (_gempa!['Potensi'] ?? '').toString().toLowerCase().contains('tsunami')
                                      ? const Color(0xFFFEF2F2)
                                      : const Color(0xFFF0FDF4),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: (_gempa!['Potensi'] ?? '').toString().toLowerCase().contains('tsunami')
                                        ? const Color(0xFFFCA5A5)
                                        : const Color(0xFFBBF7D0),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.info_outline_rounded,
                                      size: 18,
                                      color: (_gempa!['Potensi'] ?? '').toString().toLowerCase().contains('tsunami')
                                          ? AppTheme.alertRed
                                          : AppTheme.successGreen,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _gempa!['Potensi'] ?? '-',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: (_gempa!['Potensi'] ?? '').toString().toLowerCase().contains('tsunami')
                                              ? const Color(0xFF991B1B)
                                              : const Color(0xFF166534),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              if (_gempa!['Dirasakan'] != null && _gempa!['Dirasakan'].toString().isNotEmpty) ...[
                                const SizedBox(height: 10),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Icon(Icons.vibration_rounded, size: 18, color: AppTheme.textSecondary),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Wilayah Dirasakan (Skala MMI):',
                                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textSecondary),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              _gempa!['Dirasakan'],
                                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
                                            ),
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
                        const SizedBox(height: 18),

                        // Shakemap Image Section
                        if (_gempa!['ShakemapUrl'] != null) ...[
                          const Text(
                            'Peta Guncangan (BMKG Shakemap)',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              color: Colors.white,
                              child: Image.network(
                                _gempa!['ShakemapUrl'],
                                fit: BoxFit.contain,
                                loadingBuilder: (context, child, progress) {
                                  if (progress == null) return child;
                                  return Container(
                                    height: 200,
                                    color: Colors.grey.shade100,
                                    child: const Center(child: CircularProgressIndicator()),
                                  );
                                },
                                errorBuilder: (context, error, stackTrace) => Container(
                                  height: 120,
                                  color: Colors.grey.shade100,
                                  child: const Center(
                                    child: Text('Peta guncangan tidak tersedia', style: TextStyle(color: AppTheme.textMuted)),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 18),
                        ],

                        // Panduan Mitigasi Gempa
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.health_and_safety_rounded, color: AppTheme.electricBlue, size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    'Panduan Cepat Tanggap Gempa',
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              _buildGuidelineItem('1. Berlindung di bawah meja kokoh (Drop, Cover, Hold On).'),
                              _buildGuidelineItem('2. Jauhi jendela kaca, cermin, dan lemari yang mudah roboh.'),
                              _buildGuidelineItem('3. Matikan kompor dan sumber listrik untuk mencegah kebakaran.'),
                              _buildGuidelineItem('4. Jangan menggunakan lift, gunakan tangga darurat.'),
                              _buildGuidelineItem('5. Menuju titik kumpul ruang terbuka bebas tiang listrik & bangunan.'),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Action Buttons
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: _shareToWhatsApp,
                                icon: const Icon(Icons.share_rounded, color: Colors.white, size: 18),
                                label: const Text('Bagikan ke WA', style: TextStyle(fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF25D366),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ),
                          ],
                        ),

                        // Broadcast Button for Pengurus / Admin
                        if (_isPengurus) ...[
                          const SizedBox(height: 10),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              onPressed: _isBroadcasting ? null : _handleBroadcast,
                              icon: _isBroadcasting
                                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                  : const Icon(Icons.campaign_rounded, color: AppTheme.alertRed, size: 20),
                              label: Text(
                                _isBroadcasting ? 'Menyiarkan Notifikasi...' : '📢 Broadcast Notif ke Seluruh HP Warga',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.alertRed),
                              ),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppTheme.alertRed, width: 1.5),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildMetricItem({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppTheme.textSecondary),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGuidelineItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
      ),
    );
  }
}
