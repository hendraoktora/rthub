import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class WargaListScreen extends StatefulWidget {
  const WargaListScreen({super.key});

  @override
  State<WargaListScreen> createState() => _WargaListScreenState();
}

class _WargaListScreenState extends State<WargaListScreen> {
  bool _isLoading = true;
  List<dynamic> _rumahList = [];
  int _totalWarga = 0;
  int _totalRumah = 0;
  bool _canAddWarga = false;

  @override
  void initState() {
    super.initState();
    _loadWarga();
  }

  Future<void> _loadWarga() async {
    setState(() => _isLoading = true);
    final user = await ApiService.getUserData();
    final role = user?['role'] ?? 'WARGA';
    final canAdd = role == 'ADMIN_RT' || role == 'SEKRETARIS_RT' || role == 'SUPERADMIN';

    final data = await ApiService.getWargaList();
    if (mounted) {
      setState(() {
        _canAddWarga = canAdd;
        _rumahList = data['rumahList'] as List<dynamic>? ?? [];
        _totalWarga = data['totalWarga'] as int? ?? 0;
        _totalRumah = data['totalRumah'] as int? ?? _rumahList.length;
        _isLoading = false;
      });
    }
  }

  void _showTambahWargaModal() {
    final namaController = TextEditingController();
    final phoneController = TextEditingController();
    final rumahController = TextEditingController();
    final nikController = TextEditingController();
    final noKkController = TextEditingController();
    final namaIstriController = TextEditingController();
    String selectedHunian = 'TETAP';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (modalContext) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 24,
            bottom: MediaQuery.of(modalContext).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Tambah Akun Warga Baru', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.pop(modalContext),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: namaController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Kepala Keluarga *',
                    hintText: 'Contoh: Bpk. Gunawan',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'No. WhatsApp Aktif *',
                    hintText: '0812xxxxxxxx',
                    prefixIcon: Icon(Icons.phone_android_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: rumahController,
                  decoration: const InputDecoration(
                    labelText: 'No. Rumah / Blok *',
                    hintText: 'Contoh: Blok C3 No. 15',
                    prefixIcon: Icon(Icons.home_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: nikController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'NIK KTP (Opsional)',
                          hintText: '3201xxxxxxxx',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: noKkController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'No. KK (Opsional)',
                          hintText: '3201xxxxxxxx',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: namaIstriController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Istri / Pasangan (Opsional)',
                    hintText: 'Contoh: Ibu Siti',
                    prefixIcon: Icon(Icons.favorite_border),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: selectedHunian,
                  decoration: const InputDecoration(
                    labelText: 'Status Hunian',
                    prefixIcon: Icon(Icons.apartment_rounded),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'TETAP', child: Text('Rumah Milik Sendiri (Tetap)')),
                    DropdownMenuItem(value: 'KONTRAK', child: Text('Kontrak / Sewa')),
                    DropdownMenuItem(value: 'KOS', child: Text('Kos / Kamar')),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setModalState(() => selectedHunian = val);
                    }
                  },
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: AppTheme.primaryNavy,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      if (namaController.text.trim().isEmpty ||
                          phoneController.text.trim().isEmpty ||
                          rumahController.text.trim().isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Nama, No. WhatsApp, dan No. Rumah wajib diisi!')),
                        );
                        return;
                      }

                      try {
                        final nav = Navigator.of(modalContext);
                        final messenger = ScaffoldMessenger.of(context);
                        await ApiService.addWarga({
                          'namaLengkap': namaController.text.trim(),
                          'phone': phoneController.text.trim(),
                          'noRumah': rumahController.text.trim(),
                          'nik': nikController.text.trim().isEmpty ? null : nikController.text.trim(),
                          'noKk': noKkController.text.trim().isEmpty ? null : noKkController.text.trim(),
                          'statusHunian': selectedHunian,
                          'namaIstri': namaIstriController.text.trim().isEmpty ? null : namaIstriController.text.trim(),
                        });
                        nav.pop();
                        _loadWarga();
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('Akun warga baru berhasil disimpan ke database!'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                      } catch (e) {
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: AppTheme.alertRed),
                        );
                      }
                    },
                    child: const Text('Simpan & Buat Akun', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Data Warga & Rumah RT'),
      ),
      floatingActionButton: _canAddWarga
          ? FloatingActionButton.extended(
              onPressed: _showTambahWargaModal,
              backgroundColor: AppTheme.primaryNavy,
              icon: const Icon(Icons.person_add_alt_1_rounded, color: Colors.white),
              label: const Text('Tambah Warga', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadWarga,
              child: _rumahList.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: const [
                        SizedBox(height: 120),
                        Center(
                          child: Column(
                            children: [
                              Icon(Icons.home_work_outlined, size: 60, color: AppTheme.textMuted),
                              SizedBox(height: 12),
                              Text('Belum ada data warga terdaftar', style: TextStyle(color: AppTheme.textMuted, fontSize: 15)),
                            ],
                          ),
                        ),
                      ],
                    )
                  : Column(
                      children: [
                        // Summary Banner
                        Container(
                          margin: const EdgeInsets.all(16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.slateBorder),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              Column(
                                children: [
                                  Text('$_totalRumah', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy)),
                                  const SizedBox(height: 2),
                                  const Text('Unit Rumah', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                ],
                              ),
                              Container(height: 24, width: 1, color: AppTheme.slateBorder),
                              Column(
                                children: [
                                  Text('$_totalWarga', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                                  const SizedBox(height: 2),
                                  const Text('Warga Terdaftar', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: ListView.builder(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _rumahList.length,
                            itemBuilder: (context, index) {
                              final r = _rumahList[index];
                              final noRumah = r['noRumah'] ?? 'Rumah';
                              final statusHunian = r['statusHunian'] ?? 'TETAP';
                              final penghuniList = r['penghuni'] as List<dynamic>? ?? [];
                              final primaryPenghuni = penghuniList.isNotEmpty ? penghuniList[0] : null;
                              final nama = primaryPenghuni?['profile']?['namaLengkap'] ?? primaryPenghuni?['phone'] ?? 'Belum ada penghuni';
                              final phone = primaryPenghuni?['phone'] ?? '-';
                              
                              final tagihanList = r['tagihanWarga'] as List<dynamic>? ?? [];
                              final latestTagihan = tagihanList.isNotEmpty ? tagihanList[0] : null;
                              final isLunas = latestTagihan?['status'] == 'PAID';

                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
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
                                        color: AppTheme.electricBlue.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(Icons.home_filled, color: AppTheme.electricBlue, size: 22),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(nama, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                          const SizedBox(height: 3),
                                          Text(
                                            '$noRumah • $statusHunian • $phone',
                                            style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                      decoration: BoxDecoration(
                                        color: isLunas ? AppTheme.successGreen.withValues(alpha: 0.1) : AppTheme.alertRed.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        isLunas ? '✓ Lunas' : 'Belum Bayar',
                                        style: TextStyle(
                                          color: isLunas ? AppTheme.successGreen : AppTheme.alertRed,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
            ),
    );
  }
}
