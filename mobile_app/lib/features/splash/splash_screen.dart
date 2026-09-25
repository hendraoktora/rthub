import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import '../../core/widgets/isometric_village_3d.dart';
import '../auth/login_screen.dart';
import '../auth/register_rt_screen.dart';
import '../home/home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  bool _checkingSession = true;

  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final isTest = WidgetsBinding.instance.runtimeType.toString().contains('Test');
    if (!isTest) {
      // Allow 1.6s of 3D village presentation on app startup
      await Future.delayed(const Duration(milliseconds: 1600));
    }
    try {
      final token = await ApiService.getToken();
      final user = await ApiService.getUserData();
      if (!mounted) return;
      if (token != null && token.isNotEmpty && user != null) {
        // Session active, redirect to home
        Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const HomeScreen(),
            transitionsBuilder: (_, a, __, c) => FadeTransition(opacity: a, child: c),
            transitionDuration: const Duration(milliseconds: 350),
          ),
        );
        return;
      }
    } catch (_) {}
    if (mounted) {
      setState(() => _checkingSession = false);
    }
  }

  void _showServerConfigDialog(BuildContext context) async {
    final currentUrl = await ApiService.getBaseUrl();
    final controller = TextEditingController(text: currentUrl);

    if (!context.mounted) return;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            const Icon(Icons.dns_rounded, color: Color(0xFF2261E8)),
            const SizedBox(width: 8),
            Text(
              'Konfigurasi Server IP',
              style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Masukkan alamat IP server API backend:',
              style: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'https://api.rthub.id/api',
                labelText: 'Server API URL',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Batal', style: GoogleFonts.plusJakartaSans()),
          ),
          ElevatedButton(
            onPressed: () async {
              await ApiService.setBaseUrl(controller.text.trim());
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Server URL diperbarui: ${controller.text.trim()}'),
                    backgroundColor: AppTheme.successGreen,
                  ),
                );
              }
            },
            child: Text('Simpan', style: GoogleFonts.plusJakartaSans()),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: const Color(0xFFF7F8F2),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 6),

              // Official Logo from Landing Page
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GestureDetector(
                    onLongPress: () => _showServerConfigDialog(context),
                    child: Image.asset(
                      'assets/images/rthub_logo_landing.png',
                      height: 38,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: const Color(0xFF2261E8),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.holiday_village_rounded, color: Colors.white, size: 20),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'RT Hub',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF263A32),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Top Brand Pill Tag (identical to landing page .hero-tag)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: const Color(0xFFDCE1D7)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF32664C), // Sage green dot
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'RUANG DIGITAL UNTUK HIDUP BERTETANGGA',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: const Color(0xFF5A6B5E),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Hero Headline (matching landing page: Space Grotesk "Satu kampung. Banyak cerita.")
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 35,
                    fontWeight: FontWeight.w600,
                    letterSpacing: -1.5,
                    height: 1.1,
                    color: const Color(0xFF263A32),
                  ),
                  children: [
                    const TextSpan(text: 'Satu kampung.\n'),
                    TextSpan(
                      text: 'Banyak cerita.',
                      style: GoogleFonts.spaceGrotesk(color: const Color(0xFF2261E8)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // Subtitle in Plus Jakarta Sans
              Text(
                'Urusan RT, sekarang lebih sederhana. Dari kas warga sampai lapak tetangga, semuanya terhubung.',
                textAlign: TextAlign.center,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 12.5,
                  height: 1.6,
                  color: const Color(0xFF69776E),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 12),

              // 3D Isometric Interactive Village Canvas
              const IsometricVillage3D(
                height: 280,
                interactive: true,
                showFloatingBadges: true,
              ),
              const SizedBox(height: 12),

              // Feature Badges (Landing page style)
              Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: [
                  _buildLandingPill(Icons.account_balance_wallet_outlined, 'Iuran Kas', const Color(0xFF2261E8)),
                  _buildLandingPill(Icons.storefront_outlined, 'Lapak Tetangga', const Color(0xFF047857)),
                  _buildLandingPill(Icons.videocam_outlined, 'CCTV 24 Jam', const Color(0xFF3B82F6)),
                  _buildLandingPill(Icons.campaign_outlined, 'Warta RT', const Color(0xFFD97706)),
                ],
              ),
              const SizedBox(height: 22),

              // Action Buttons or Smooth Loading Indicator
              if (_checkingSession)
                Container(
                  width: double.infinity,
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(50),
                    border: Border.all(color: const Color(0xFFDCE1D7)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(color: Color(0xFF2261E8), strokeWidth: 2.2),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Menghubungkan ekosistem RT...',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF5A6B5E),
                        ),
                      ),
                    ],
                  ),
                )
              else ...[
                // Primary "Masuk Akun" Button (.btn-primary style)
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2261E8),
                      foregroundColor: Colors.white,
                      elevation: 4,
                      shadowColor: const Color(0xFF2261E8).withValues(alpha: 0.35),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(50), // Landing page round pill
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Masuk Akun',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.2,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward_rounded, size: 18),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Secondary "Daftar RT / Warga Baru" Button (.btn-secondary style)
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const RegisterRtScreen()),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF263A32),
                      side: const BorderSide(color: Color(0xFFDCE1D7), width: 1.2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(50),
                      ),
                    ),
                    child: Text(
                      'Daftar RT / Warga Baru',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF263A32),
                      ),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 16),

              // Subtle author & platform tag
              Text(
                'RT Hub • Platform Digital Rukun Tetangga',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 10,
                  color: const Color(0xFF94A3B8),
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLandingPill(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF334155),
            ),
          ),
        ],
      ),
    );
  }
}
