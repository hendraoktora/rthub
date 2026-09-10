import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class CatatKasScreen extends StatefulWidget {
  const CatatKasScreen({super.key});

  @override
  State<CatatKasScreen> createState() => _CatatKasScreenState();
}

class _CatatKasScreenState extends State<CatatKasScreen> {
  String _tipeKas = 'PENGELUARAN'; // Default to PENGELUARAN as requested
  final _nominalController = TextEditingController();
  final _kategoriController = TextEditingController(text: 'Perbaikan Fasilitas & Lampu PJU');
  final _keteranganController = TextEditingController();
  final _notaController = TextEditingController();
  final _picController = TextEditingController(text: 'Bendahara RT');
  bool _isLoading = false;
  bool _isBendahara = true;
  String _userRole = 'BENDAHARA_RT';

  @override
  void initState() {
    super.initState();
    _loadUserRole();
  }

  void _loadUserRole() async {
    final user = await ApiService.getCurrentUser();
    if (mounted) {
      final role = user?['role']?.toString().toUpperCase() ?? 'WARGA';
      setState(() {
        _userRole = role;
        _isBendahara = role == 'BENDAHARA_RT' || role == 'SUPERADMIN';
      });
    }
  }

  final List<String> _kategoriPengeluaranList = [
    'Perbaikan Fasilitas & Lampu PJU',
    'Honor Petugas Kebersihan & Sampah',
    'Honor & Perlengkapan Satpam',
    'Dana Sosial & Santunan Warga',
    'Kegiatan Warga / Kerja Bakti / 17an',
    'Konsumsi & Rapat RT',
    'Operasional & Administrasi RT',
    'Lainnya',
  ];

  final List<String> _kategoriPemasukanList = [
    'Iuran Warga',
    'Saldo Awal Pembukuan',
    'Donasi / Sumbangan Sukarela',
    'Sewa Fasilitas / Lapangan RT',
    'Lainnya',
  ];

  void _handleSimpan() async {
    if (_nominalController.text.isEmpty || _keteranganController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nominal dan rincian pengeluaran wajib diisi!')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final keteranganFull = '${_keteranganController.text.trim()}'
        '${_notaController.text.isNotEmpty ? ' [Nota: ${_notaController.text.trim()}]' : ''}'
        ' (PIC: ${_picController.text.trim()})';

    try {
      await ApiService.createMutasiKas({
        'tipe': _tipeKas,
        'kategori': _kategoriController.text.trim(),
        'nominal': int.tryParse(_nominalController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0,
        'keterangan': keteranganFull,
      });

      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_tipeKas == 'PENGELUARAN'
                ? '✅ Pengeluaran kas berhasil dicatat & dipublikasikan ke warga!'
                : '✅ Kas masuk berhasil dicatat!'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
        Navigator.pop(context, true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Catat Mutasi Kas RT'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!_isBendahara) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.warningAmber.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.warningAmber.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.lock_outline_rounded, color: AppTheme.warningAmber, size: 22),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Mode Lihat Saja (${_userRole == "ADMIN_RT" ? "Ketua RT" : _userRole == "SEKRETARIS_RT" ? "Sekretaris RT" : "Pengurus"})',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.warningAmber),
                            ),
                            const SizedBox(height: 3),
                            const Text(
                              'Hanya Bendahara RT yang memiliki wewenang untuk menginput transaksi kas masuk dan mencatat pengeluaran kas.',
                              style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Segmented Toggle Tipe Kas
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppTheme.slateLight,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() {
                          _tipeKas = 'PENGELUARAN';
                          _kategoriController.text = 'Perbaikan Fasilitas & Lampu PJU';
                        }),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _tipeKas == 'PENGELUARAN' ? AppTheme.alertRed : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              '📤 Kas Keluar (Pengeluaran)',
                              style: TextStyle(
                                color: _tipeKas == 'PENGELUARAN' ? Colors.white : AppTheme.textSecondary,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() {
                          _tipeKas = 'PEMASUKAN';
                          _kategoriController.text = 'Iuran Warga';
                        }),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _tipeKas == 'PEMASUKAN' ? AppTheme.successGreen : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              '📥 Kas Masuk',
                              style: TextStyle(
                                color: _tipeKas == 'PEMASUKAN' ? Colors.white : AppTheme.textSecondary,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Transparansi Card Alert
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.electricBlue.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.2)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield_outlined, color: AppTheme.electricBlue, size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Pencatatan ini transparan dan otomatis dapat dilihat seluruh warga di aplikasi.',
                        style: TextStyle(fontSize: 11, color: AppTheme.primaryNavy, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text('Nominal Kas (Rp) *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextField(
                controller: _nominalController,
                keyboardType: TextInputType.number,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                decoration: const InputDecoration(
                  hintText: 'Contoh: 350000',
                  prefixText: 'Rp ',
                ),
              ),
              const SizedBox(height: 16),

              const Text('Kategori Pengeluaran / Transaksi', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                initialValue: (_tipeKas == 'PENGELUARAN' ? _kategoriPengeluaranList : _kategoriPemasukanList).contains(_kategoriController.text)
                    ? _kategoriController.text
                    : (_tipeKas == 'PENGELUARAN' ? _kategoriPengeluaranList[0] : _kategoriPemasukanList[0]),
                items: (_tipeKas == 'PENGELUARAN' ? _kategoriPengeluaranList : _kategoriPemasukanList).map((cat) {
                  return DropdownMenuItem(value: cat, child: Text(cat, style: const TextStyle(fontSize: 13)));
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() => _kategoriController.text = val);
                  }
                },
                decoration: const InputDecoration(
                  contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Penanggung Jawab (PIC)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _picController,
                          decoration: const InputDecoration(
                            hintText: 'Bendahara / Seksi RT',
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('No. Bukti Nota', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _notaController,
                          decoration: const InputDecoration(
                            hintText: 'NOTA-0809',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              const Text('Rincian Keperluan / Catatan *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextField(
                controller: _keteranganController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Contoh: Pembelian bohlam LED PJU dan perbaikan kabel tiang listrik gang C',
                ),
              ),
              const SizedBox(height: 28),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (_isLoading || !_isBendahara) ? null : _handleSimpan,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: !_isBendahara
                        ? Colors.grey.shade400
                        : (_tipeKas == 'PENGELUARAN' ? AppTheme.alertRed : AppTheme.primaryNavy),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(!_isBendahara
                          ? '🔒 Wewenang Khusus Bendahara RT'
                          : (_tipeKas == 'PENGELUARAN' ? 'Simpan & Publikasikan Pengeluaran' : 'Simpan Kas Masuk')),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
