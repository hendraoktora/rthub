import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
  bool _isLoading = true;
  Map<String, dynamic>? _user;
  List<Map<String, dynamic>> _jadwalRonda = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = await ApiService.getUserData();
      final token = await ApiService.getToken();
      final role = user?['role'] ?? 'WARGA';
      final rtId = user?['rtId'] ?? 'default_rt';
      final canEdit = role == 'ADMIN_RT' || role == 'SEKRETARIS_RT' || role == 'SUPERADMIN';

      final prefs = await SharedPreferences.getInstance();
      final savedRonda = prefs.getString('ronda_schedule_$rtId');
      final isAktifSaved = prefs.getBool('ronda_active_$rtId');

      List<Map<String, dynamic>> loadedList = [];
      if (savedRonda != null) {
        final decoded = jsonDecode(savedRonda) as List;
        loadedList = decoded.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      } else if (token == null) {
        // Fallback for unauthenticated guest / demo only
        loadedList = [
          {'hari': 'Senin Malam', 'regu': 'Regu 1 (Blok C3/01 - C3/03)', 'anggota': 'Bpk. Ahmad, Bpk. Bambang, Bpk. Candra'},
          {'hari': 'Selasa Malam', 'regu': 'Regu 2 (Blok C3/04 - C3/06)', 'anggota': 'Bpk. Dedi, Bpk. Mansyur, Bpk. Eko'},
          {'hari': 'Rabu Malam', 'regu': 'Regu 3 (Blok C3/07 - C3/09)', 'anggota': 'Bpk. Firman, Bpk. Gunawan, Bpk. Harry'},
          {'hari': 'Kamis Malam', 'regu': 'Regu 4 (Blok C3/10 - C3/12)', 'anggota': 'Bpk. Irfan, Bpk. Joko, Bpk. Hendra'},
          {'hari': 'Jumat Malam', 'regu': 'Regu 5 (Gabungan Blok C)', 'anggota': 'Dimas, Kevin, Pak Joko (Satpam)'},
          {'hari': 'Sabtu Malam', 'regu': 'Regu Siskamling Warga Akbar', 'anggota': 'Seluruh Kepala Keluarga Bergilir'},
        ];
      }

      if (mounted) {
        setState(() {
          _user = user;
          _canEditRonda = canEdit;
          _isRondaAktif = isAktifSaved ?? true;
          _jadwalRonda = loadedList;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveRondaSchedule() async {
    final rtId = _user?['rtId'] ?? 'default_rt';
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('ronda_schedule_$rtId', jsonEncode(_jadwalRonda));
    await prefs.setBool('ronda_active_$rtId', _isRondaAktif);
  }

  void _showFormRondaModal({Map<String, dynamic>? initialItem, int? editIndex}) {
    final hariController = TextEditingController(text: initialItem?['hari'] ?? 'Senin Malam');
    final reguController = TextEditingController(text: initialItem?['regu'] ?? '');
    final anggotaController = TextEditingController(text: initialItem?['anggota'] ?? '');

    final hariOptions = [
      'Senin Malam',
      'Selasa Malam',
      'Rabu Malam',
      'Kamis Malam',
      'Jumat Malam',
      'Sabtu Malam',
      'Minggu Malam'
    ];
    String selectedHari = hariOptions.contains(hariController.text) ? hariController.text : hariOptions.first;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (modalCtx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20, right: 20, top: 24,
            bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    editIndex != null ? 'Ubah Regu Ronda' : 'Tambah Regu Ronda',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.pop(modalCtx),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: selectedHari,
                decoration: const InputDecoration(
                  labelText: 'Hari Giliran *',
                  prefixIcon: Icon(Icons.calendar_today_outlined),
                ),
                items: hariOptions.map((h) => DropdownMenuItem(value: h, child: Text(h))).toList(),
                onChanged: (val) {
                  if (val != null) setModalState(() => selectedHari = val);
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: reguController,
                decoration: const InputDecoration(
                  labelText: 'Nama Regu / Cakupan Blok *',
                  hintText: 'Contoh: Regu 1 (Blok A1 - A4)',
                  prefixIcon: Icon(Icons.shield_outlined),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: anggotaController,
                decoration: const InputDecoration(
                  labelText: 'Nama Petugas Ronda / Warga *',
                  hintText: 'Contoh: Bpk. Budi, Bpk. Joko, Bpk. Hendra',
                  prefixIcon: Icon(Icons.people_outline),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryNavy,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () async {
                    if (reguController.text.trim().isEmpty || anggotaController.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Semua field wajib diisi!'), backgroundColor: AppTheme.alertRed),
                      );
                      return;
                    }

                    final newItem = {
                      'hari': selectedHari,
                      'regu': reguController.text.trim(),
                      'anggota': anggotaController.text.trim(),
                    };

                    setState(() {
                      if (editIndex != null) {
                        _jadwalRonda[editIndex] = newItem;
                      } else {
                        _jadwalRonda.add(newItem);
                      }
                    });

                    await _saveRondaSchedule();
                    if (!modalCtx.mounted) return;
                    Navigator.pop(modalCtx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Jadwal ronda berhasil disimpan!'), backgroundColor: AppTheme.successGreen),
                    );
                  },
                  child: const Text('Simpan Jadwal', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final rtNomor = _user?['rt']?['nomor'] ?? '03';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text('Jadwal Ronda Malam RT $rtNomor'),
        actions: [
          if (_canEditRonda)
            IconButton(
              icon: const Icon(Icons.add_circle_outline_rounded, color: AppTheme.electricBlue),
              tooltip: 'Tambah Regu Ronda',
              onPressed: () => _showFormRondaModal(),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
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
                                'Mode Pantau Jadwal. Pengaturan sistem ronda hanya dapat diubah oleh Ketua RT atau Pengurus RT.',
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
                            onChanged: _canEditRonda
                                ? (val) {
                                    setState(() => _isRondaAktif = val);
                                    _saveRondaSchedule();
                                  }
                                : null,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    if (_isRondaAktif) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Jadwal Giliran Mingguan (Pukul 22:00 - 04:00)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                          if (_canEditRonda && _jadwalRonda.isNotEmpty)
                            GestureDetector(
                              onTap: () => _showFormRondaModal(),
                              child: const Text('+ Tambah', style: TextStyle(fontSize: 12, color: AppTheme.electricBlue, fontWeight: FontWeight.bold)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (_jadwalRonda.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(28),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: AppTheme.slateBorder),
                          ),
                          child: Center(
                            child: Column(
                              children: [
                                const Icon(Icons.shield_moon_outlined, size: 48, color: AppTheme.textMuted),
                                const SizedBox(height: 12),
                                const Text('Belum Ada Jadwal Ronda', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                const SizedBox(height: 6),
                                const Text(
                                  'Pengurus RT belum membuat pembagian giliran ronda malam untuk warga.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                ),
                                if (_canEditRonda) ...[
                                  const SizedBox(height: 16),
                                  ElevatedButton.icon(
                                    onPressed: () => _showFormRondaModal(),
                                    icon: const Icon(Icons.add, size: 16),
                                    label: const Text('Buat Jadwal Ronda'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primaryNavy,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        )
                      else
                        ...List.generate(_jadwalRonda.length, (index) {
                          final item = _jadwalRonda[index];
                          return Container(
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
                                        item['hari'] ?? 'Malam',
                                        style: const TextStyle(color: AppTheme.purpleIndigo, fontWeight: FontWeight.bold, fontSize: 11),
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        const Text('22:00 - 04:00 WIB', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                        if (_canEditRonda) ...[
                                          const SizedBox(width: 8),
                                          GestureDetector(
                                            onTap: () => _showFormRondaModal(initialItem: item, editIndex: index),
                                            child: const Icon(Icons.edit_outlined, size: 16, color: AppTheme.textSecondary),
                                          ),
                                          const SizedBox(width: 6),
                                          GestureDetector(
                                            onTap: () async {
                                              setState(() => _jadwalRonda.removeAt(index));
                                              await _saveRondaSchedule();
                                            },
                                            child: const Icon(Icons.delete_outline, size: 16, color: AppTheme.alertRed),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(item['regu'] ?? 'Regu', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(height: 4),
                                Text('Anggota: ${item['anggota'] ?? '-'}', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                              ],
                            ),
                          );
                        }),
                    ] else ...[
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppTheme.slateBorder),
                        ),
                        child: Center(
                          child: Column(
                            children: [
                              const Icon(Icons.shield_outlined, size: 48, color: AppTheme.textMuted),
                              const SizedBox(height: 12),
                              const Text('Sistem Ronda Warga Dinonaktifkan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                              const SizedBox(height: 6),
                              Text(
                                'Keamanan RT $rtNomor saat ini sepenuhnya dijaga oleh Satpam Pos Ronda. Warga tidak dibebani jadwal ronda malam.',
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
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
