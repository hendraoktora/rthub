import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import 'catat_kas_screen.dart';
import 'warga_list_screen.dart';
import 'ronda_screen.dart';
import 'pengurus_list_screen.dart';
import 'atur_iuran_screen.dart';
import '../cctv/cctv_screen.dart';

class PengurusPanelScreen extends StatefulWidget {
  const PengurusPanelScreen({super.key});

  @override
  State<PengurusPanelScreen> createState() => _PengurusPanelScreenState();
}

class _PengurusPanelScreenState extends State<PengurusPanelScreen> {
  Map<String, dynamic>? _user;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await ApiService.getCurrentUser();
    if (mounted) {
      setState(() {
        _user = user;
        _isLoading = false;
      });
    }
  }

  String _getRoleTitle(String? role) {
    switch (role) {
      case 'ADMIN_RT':
        return 'Ketua RT / Admin RT';
      case 'SEKRETARIS_RT':
        return 'Sekretaris RT';
      case 'BENDAHARA_RT':
        return 'Bendahara RT (Keuangan)';
      case 'SECURITY':
        return 'Petugas Keamanan / Satpam';
      case 'ADMIN_RW':
        return 'Ketua RW';
      default:
        return 'Pengurus RT';
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = _user?['profile'] as Map<String, dynamic>?;
    final userName = profile?['namaLengkap'] ?? _user?['phone'] ?? 'Pengurus RT';
    final role = _user?['role'] as String? ?? 'ADMIN_RT';
    final roleTitle = _getRoleTitle(role);
    final rtName = _user?['rt']?['nomor'] != null ? 'RT ${_user!['rt']['nomor']}' : 'RT 03';
    final rwName = _user?['rw']?['nomor'] != null ? 'RW ${_user!['rw']['nomor']}' : 'RW 05';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text('Panel Pengurus $rtName'),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Dynamic Hero Pengurus Banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.primaryNavy, Color(0xFF1E293B)],
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.electricBlue.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '🏛️ Pengurus $rtName / $rwName',
                              style: const TextStyle(color: AppTheme.skyAzure, fontWeight: FontWeight.bold, fontSize: 11),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            userName,
                            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            roleTitle,
                            style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    const Text('Menu Manajemen RT', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 14),

                    _buildMenuTile(
                      icon: Icons.admin_panel_settings_rounded,
                      color: AppTheme.purpleIndigo,
                      title: 'Struktur & Pengurus RT',
                      subtitle: 'Kelola daftar pengurus, bendahara, dan satpam',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const PengurusListScreen())),
                    ),
                    const SizedBox(height: 10),
                    _buildMenuTile(
                      icon: Icons.people_alt_rounded,
                      color: AppTheme.electricBlue,
                      title: 'Data Warga & Tambah Akun',
                      subtitle: 'Kelola data warga RT dan daftarkan KK baru',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const WargaListScreen())),
                    ),
                    const SizedBox(height: 10),
                    _buildMenuTile(
                      icon: Icons.account_balance_wallet_rounded,
                      color: AppTheme.successGreen,
                      title: 'Catat Kas Masuk & Keluar',
                      subtitle: 'Input pemasukan, donasi, atau pengeluaran operasional RT',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CatatKasScreen())),
                    ),
                    const SizedBox(height: 10),
                    _buildMenuTile(
                      icon: Icons.receipt_long_rounded,
                      color: Colors.teal,
                      title: 'Atur Nilai Iuran Bulanan (IPL)',
                      subtitle: 'Ubah tarif iuran kas & terbitkan tagihan bulanan serentak',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const AturIuranScreen())),
                    ),
                    const SizedBox(height: 10),
                    _buildMenuTile(
                      icon: Icons.nightlight_round,
                      color: const Color(0xFFE65100),
                      title: 'Jadwal Ronda Warga (Opsional)',
                      subtitle: 'Atur sistem siskamling bergilir warga',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const RondaScreen())),
                    ),
                    const SizedBox(height: 10),
                    _buildMenuTile(
                      icon: Icons.videocam_rounded,
                      color: AppTheme.alertRed,
                      title: 'CCTV Lingkungan & Streaming',
                      subtitle: 'Kelola dan pantau live feed CCTV lingkungan RT/RW',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CctvScreen())),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.slateBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTheme.textMuted),
          ],
        ),
      ),
    );
  }
}
