import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class RondaScreen extends StatefulWidget {
  const RondaScreen({super.key});

  @override
  State<RondaScreen> createState() => _RondaScreenState();
}

class _RondaScreenState extends State<RondaScreen> {
  bool _isRondaAktif = true;
  bool _canEditRonda = false;

  @override
  void initState() {
    super.initState();
    _loadUserRole();
  }

  void _loadUserRole() async {
    final user = await ApiService.getUserData();
    final role = user?['role'] ?? 'WARGA';
    if (mounted) {
      setState(() {
        _canEditRonda = role == 'ADMIN_RT' || role == 'SEKRETARIS_RT' || role == 'SUPERADMIN';
      });
    }
  }

  final List<Map<String, dynamic>> _jadwalRonda = [
    {'hari': 'Senin Malam', 'regu': 'Regu 1 (Blok C3/01 - C3/03)', 'anggota': 'Bpk. Ahmad, Bpk. Bambang, Bpk. Candra'},
    {'hari': 'Selasa Malam', 'regu': 'Regu 2 (Blok C3/04 - C3/06)', 'anggota': 'Bpk. Dedi, Bpk. Mansyur, Bpk. Eko'},
    {'hari': 'Rabu Malam', 'regu': 'Regu 3 (Blok C3/07 - C3/09)', 'anggota': 'Bpk. Firman, Bpk. Gunawan, Bpk. Harry'},
    {'hari': 'Kamis Malam', 'regu': 'Regu 4 (Blok C3/10 - C3/12)', 'anggota': 'Bpk. Irfan, Bpk. Joko, Bpk. Hendra'},
    {'hari': 'Jumat Malam', 'regu': 'Regu 5 (Gabungan Blok C)', 'anggota': 'Dimas, Kevin, Pak Joko (Satpam)'},
    {'hari': 'Sabtu Malam', 'regu': 'Regu Siskamling Warga Akbar', 'anggota': 'Seluruh Kepala Keluarga Bergilir'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Jadwal Ronda Malam RT'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!_canEditRonda) ...[
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.warningAmber.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.warningAmber.withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.lock_clock_outlined, color: AppTheme.warningAmber, size: 20),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Mode Pantau Jadwal. Pengaturan sistem ronda hanya dapat diubah oleh Ketua RT atau Sekretaris RT.',
                          style: TextStyle(fontSize: 12, color: AppTheme.textPrimary, height: 1.3),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Switch Saklar Ronda Warga
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.slateBorder),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Sistem Ronda Bergilir Warga', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 2),
                        Text(
                          _isRondaAktif ? '🟢 Status: Aktif' : '⚪ Status: Nonaktif (Satpam)',
                          style: TextStyle(
                            fontSize: 12,
                            color: _isRondaAktif ? AppTheme.successGreen : AppTheme.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    Switch(
                      value: _isRondaAktif,
                      activeThumbColor: AppTheme.electricBlue,
                      onChanged: _canEditRonda ? (val) => setState(() => _isRondaAktif = val) : null,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              if (_isRondaAktif) ...[
                const Text('Jadwal Giliran Mingguan (Pukul 22:00 - 04:00)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                ..._jadwalRonda.map((item) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.slateBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.purpleIndigo.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              item['hari'],
                              style: const TextStyle(color: AppTheme.purpleIndigo, fontWeight: FontWeight.bold, fontSize: 11),
                            ),
                          ),
                          const Text('22:00 - 04:00 WIB', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(item['regu'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 4),
                      Text('Anggota: ${item['anggota']}', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                    ],
                  ),
                )),
              ] else ...[
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppTheme.slateBorder),
                  ),
                  child: const Center(
                    child: Column(
                      children: [
                        Icon(Icons.shield_outlined, size: 48, color: AppTheme.textMuted),
                        SizedBox(height: 12),
                        Text('Sistem Ronda Warga Dinonaktifkan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        SizedBox(height: 6),
                        Text(
                          'Keamanan RT 03 saat ini sepenuhnya dijaga oleh Satpam Pos Ronda. Warga tidak dibebani jadwal ronda malam.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
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
    );
  }
}
