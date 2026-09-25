import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import 'catat_kas_screen.dart';
import 'warga_list_screen.dart';
import 'ronda_screen.dart';
import 'pengurus_list_screen.dart';
import 'atur_iuran_screen.dart';
import 'tarik_kas_screen.dart';
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
                      icon: Icons.payments_rounded,
                      color: const Color(0xFF0F5132),
                      title: 'Pencairan / Tarik Kas RT',
                      subtitle: 'Cairkan kas RT ke rekening bank resmi pengurus (Biaya Rp 6.000)',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const TarikKasScreen())),
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
                      icon: Icons.workspace_premium_rounded,
                      color: const Color(0xFFD97706),
                      title: 'Paket Add-Ons RT (Rp 49.000 / bln)',
                      subtitle: 'Surat Pengantar RT digital & pencatatan iuran manual warga',
                      onTap: () => _showAddonsModal(context),
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

  void _showAddonsModal(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.workspace_premium_rounded, size: 14, color: Color(0xFFD97706)),
                      SizedBox(width: 4),
                      Text(
                        'Paket Add-Ons RT Pro',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF92400E)),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              'Layanan Administrasi & Surat Digital RT',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
              'Tingkatkan efisiensi kerja pengurus RT dengan otomasi persuratan warga dan pencatatan kas fisik terverifikasi.',
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 16),

            // Feature list
            _buildAddonFeature(
              icon: Icons.description_outlined,
              title: '1. Pelayanan Surat Pengantar RT/RW Digital',
              desc: 'Warga mengajukan surat domisili, SKCK, izin usaha, kematian, dll dari aplikasi. Ketua RT cukup 1-klik ACC dan surat PDF resmi bertanda tangan digital langsung terbit.',
            ),
            const SizedBox(height: 10),
            _buildAddonFeature(
              icon: Icons.receipt_long_outlined,
              title: '2. Pembayaran Iuran Manual & Kwitansi Digital',
              desc: 'Catat setoran iuran tunai langsung di tempat dan otomatis menerbitkan resi/kwitansi digital resmi ber-QR code ke notifikasi handphone warga.',
            ),
            const SizedBox(height: 10),
            _buildAddonFeature(
              icon: Icons.table_view_outlined,
              title: '3. Ekspor Rekap Keuangan Akuntansi RT',
              desc: 'Download format Excel & PDF pembukuan kas RT lengkap standar akuntansi untuk pertanggungjawaban rapat tahunan warga.',
            ),
            const SizedBox(height: 18),

            // Pricing & Status Box
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.slateBorder),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Tarif Langganan:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                      SizedBox(height: 2),
                      Text('Rp 49.000 / bulan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.check_circle_rounded, size: 14, color: AppTheme.successGreen),
                        SizedBox(width: 4),
                        Text(
                          'Fitur Aktif Lengkap',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.successGreen),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryNavy,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddonFeature({required IconData icon, required String title, required String desc}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.slateBorder),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFFD97706), size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, height: 1.35)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
