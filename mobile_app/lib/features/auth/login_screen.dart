import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import '../../core/widgets/rthub_logo.dart';
import '../home/home_screen.dart';
import 'register_rt_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController(text: '081234567890');
  final _passwordController = TextEditingController(text: 'Password123!');
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _rememberMe = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();

    if (username.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nomor WhatsApp / NIK dan kata sandi wajib diisi'),
          backgroundColor: AppTheme.alertRed,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final res = await ApiService.login(username, password);
      final user = res['user'];
      final nama = user?['profile']?['namaLengkap'] ?? user?['phone'] ?? 'Pengguna';

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Selamat datang kembali, $nama! 👋'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const HomeScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        final errText = e.toString().replaceAll('Exception:', '').trim();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ $errText'),
            backgroundColor: AppTheme.alertRed,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showServerConfigModal() async {
    final currentUrl = await ApiService.getBaseUrl();
    final urlCtrl = TextEditingController(text: currentUrl);

    if (!mounted) return;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Row(
          children: [
            Icon(Icons.dns_rounded, color: AppTheme.electricBlue),
            SizedBox(width: 8),
            Text('Server Backend URL', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Alamat IP API Backend NestJS:',
              style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: urlCtrl,
              decoration: const InputDecoration(
                hintText: 'https://api.rthub.id/api',
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Petunjuk:\n• Cloud Production: https://api.rthub.id/api\n• Emulator Android: http://10.0.2.2:3000/api\n• HP Fisik (WiFi): http://192.168.100.49:3000/api',
              style: TextStyle(fontSize: 10, color: AppTheme.textMuted, height: 1.4),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              await ApiService.setBaseUrl(urlCtrl.text.trim());
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('✅ Server URL diubah ke: ${urlCtrl.text.trim()}'),
                    backgroundColor: AppTheme.successGreen,
                  ),
                );
              }
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  void _fillAccount(String phone) {
    setState(() {
      _usernameController.text = phone;
      _passwordController.text = 'Password123!';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.arrow_back_ios_new_rounded, size: 16, color: Color(0xFF475569)),
            ],
          ),
          tooltip: 'Kembali',
          onPressed: () => Navigator.pop(context),
        ),
        title: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: const Text(
            'Kembali',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
          ),
        ),
        titleSpacing: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_ethernet_rounded, color: Color(0xFF64748B)),
            tooltip: 'Konfigurasi Server API',
            onPressed: _showServerConfigModal,
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo mark + wordmark row
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF0F172A), Color(0xFF1E3A5F)],
                      ),
                      borderRadius: BorderRadius.circular(13),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.22),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(7),
                    child: const RtHubLogo(size: 28, showWordmark: false, isDark: true),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'RtHub',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.6,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 22),

              // Title + subtitle
              const Text(
                'Masuk Akun',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.8,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Kelola lingkungan dan iuran RT Anda',
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 20),

              // Quick Account Chips
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('⚡ Pilih Akun Demo Real:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.electricBlue)),
                        Text('Pass: Password123!', style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _buildQuickChip('👑 Ketua RT (Pak Hendra)', '081234567890'),
                        _buildQuickChip('📝 Sekretaris (Pak Aditya)', '081288880001'),
                        _buildQuickChip('💰 Bendahara (Ibu Siti)', '081398765432'),
                        _buildQuickChip('🛡️ Satpam (Pak Joko)', '087812345678'),
                        _buildQuickChip('👤 Warga (Pak Fauzi)', '081211110001'),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Identifier label
              const Text(
                'No. WhatsApp / Email / NIK',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF374151),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: TextField(
                  controller: _usernameController,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: '08xx atau NIK Anda',
                    hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                    icon: Icon(Icons.phone_android_rounded, color: Color(0xFF94A3B8), size: 20),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Password label
              const Text(
                'Kata Sandi',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF374151),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Masukkan kata sandi',
                    hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                    icon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF94A3B8), size: 20),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: const Color(0xFF94A3B8),
                        size: 20,
                      ),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Remember me & Forgot Password
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  InkWell(
                    borderRadius: BorderRadius.circular(6),
                    onTap: () => setState(() => _rememberMe = !_rememberMe),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value: _rememberMe,
                            activeColor: const Color(0xFF0F172A),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            onChanged: (v) => setState(() => _rememberMe = v ?? true),
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          'Ingat Saya',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    style: TextButton.styleFrom(padding: EdgeInsets.zero),
                    child: const Text(
                      'Lupa Password?',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.electricBlue),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Submit button
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: Colors.white,
                    elevation: 3,
                    shadowColor: const Color(0xFF0F172A).withValues(alpha: 0.35),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
                        )
                      : const Text(
                          'Masuk ke Lingkungan',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: -0.2),
                        ),
                ),
              ),
              const SizedBox(height: 20),

              // Divider "atau"
              Row(
                children: [
                  const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: Text('atau', style: TextStyle(fontSize: 12.5, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
                  ),
                  const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                ],
              ),
              const SizedBox(height: 18),

              // Register links
              Center(
                child: Wrap(
                  alignment: WrapAlignment.center,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 4,
                  children: [
                    const Text(
                      'Belum punya akun?',
                      style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const RegisterRtScreen()),
                        );
                      },
                      child: const Text(
                        'Daftarkan RT Baru',
                        style: TextStyle(
                          color: AppTheme.electricBlue,
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickChip(String label, String phone) {
    final isSelected = _usernameController.text == phone;
    return GestureDetector(
      onTap: () => _fillAccount(phone),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : const Color(0xFF334155),
          ),
        ),
      ),
    );
  }
}
