import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class PengurusListScreen extends StatefulWidget {
  const PengurusListScreen({super.key});

  @override
  State<PengurusListScreen> createState() => _PengurusListScreenState();
}

class _PengurusListScreenState extends State<PengurusListScreen> {
  bool _isLoading = true;
  List<dynamic> _pengurusList = [];
  Map<String, dynamic>? _currentUser;

  bool get _canManagePengurus {
    final role = _currentUser?['role']?.toString().toUpperCase();
    return role == 'ADMIN_RT' || role == 'SEKRETARIS_RT' || role == 'SUPERADMIN';
  }

  @override
  void initState() {
    super.initState();
    _loadPengurus();
  }

  Future<void> _loadPengurus() async {
    setState(() => _isLoading = true);
    final user = await ApiService.getCurrentUser();
    final data = await ApiService.getPengurusList();
    if (mounted) {
      setState(() {
        _currentUser = user;
        _pengurusList = data;
        _isLoading = false;
      });
    }
  }

  void _showFormPengurusModal({Map<String, dynamic>? initialData}) {
    final isEdit = initialData != null;
    final namaController = TextEditingController(text: initialData?['nama'] ?? initialData?['profile']?['namaLengkap'] ?? '');
    final phoneController = TextEditingController(text: initialData?['phone'] ?? '');
    final rumahController = TextEditingController(text: initialData?['noRumah'] ?? initialData?['profile']?['noRumah'] ?? '');
    String selectedRole = initialData?['role'] ?? 'ADMIN_RT';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (modalContext) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 24,
            bottom: MediaQuery.of(modalContext).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isEdit ? 'Ubah Jabatan Pengurus' : 'Tambah / Tetapkan Pengurus RT',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
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
                  labelText: 'Nama Lengkap Pengurus *',
                  hintText: 'Contoh: Hendra Gunawan',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                enabled: !isEdit,
                decoration: InputDecoration(
                  labelText: 'Nomor WhatsApp *',
                  hintText: '0812xxxxxxxx',
                  prefixIcon: const Icon(Icons.phone_android_outlined),
                  helperText: isEdit ? 'Nomor WhatsApp tidak dapat diubah' : null,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: rumahController,
                decoration: const InputDecoration(
                  labelText: 'Nomor / Blok Rumah',
                  hintText: 'Contoh: Blok C3 No. 12',
                  prefixIcon: Icon(Icons.home_outlined),
                ),
              ),
              const SizedBox(height: 14),
              DropdownButtonFormField<String>(
                initialValue: selectedRole,
                decoration: const InputDecoration(
                  labelText: 'Jabatan / Posisi Pengurus *',
                  prefixIcon: Icon(Icons.badge_outlined),
                ),
                items: const [
                  DropdownMenuItem(value: 'ADMIN_RT', child: Text('Ketua RT / Administrator')),
                  DropdownMenuItem(value: 'BENDAHARA_RT', child: Text('Bendahara RT (Keuangan)')),
                  DropdownMenuItem(value: 'SECURITY', child: Text('Petugas Keamanan / Satpam')),
                  DropdownMenuItem(value: 'ADMIN_RW', child: Text('Ketua RW / Koordinator')),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setModalState(() => selectedRole = val);
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
                    if (namaController.text.trim().isEmpty || phoneController.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Nama dan Nomor WhatsApp wajib diisi!')),
                      );
                      return;
                    }

                    try {
                      final nav = Navigator.of(modalContext);
                      final messenger = ScaffoldMessenger.of(context);
                      await ApiService.addOrUpdatePengurus({
                        'namaLengkap': namaController.text.trim(),
                        'phone': phoneController.text.trim(),
                        'noRumah': rumahController.text.trim().isEmpty ? 'Blok RT' : rumahController.text.trim(),
                        'role': selectedRole,
                      });
                      nav.pop();
                      _loadPengurus();
                      messenger.showSnackBar(
                        SnackBar(
                          content: Text(isEdit ? 'Jabatan pengurus berhasil diperbarui!' : 'Pengurus RT baru berhasil ditetapkan!'),
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
                  child: Text(
                    isEdit ? 'Simpan Perubahan' : 'Tetapkan Pengurus',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmDeletePengurus(Map<String, dynamic> pengurus) {
    final userId = pengurus['id'];
    final nama = pengurus['nama'] ?? pengurus['profile']?['namaLengkap'] ?? 'Pengurus';
    final jabatan = pengurus['jabatan'] ?? pengurus['role'] ?? 'Pengurus';

    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: const Text('Cabut Jabatan Pengurus?'),
        content: Text('Apakah Anda yakin ingin mencabut jabatan "$jabatan" dari $nama? Akun akan dikembalikan sebagai Warga biasa.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.alertRed),
            onPressed: () async {
              Navigator.pop(dialogCtx);
              try {
                final messenger = ScaffoldMessenger.of(context);
                await ApiService.deletePengurus(userId);
                _loadPengurus();
                messenger.showSnackBar(
                  const SnackBar(content: Text('Jabatan pengurus berhasil dicabut.'), backgroundColor: AppTheme.successGreen),
                );
              } catch (e) {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: AppTheme.alertRed),
                );
              }
            },
            child: const Text('Cabut Jabatan', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Color _getRoleColor(String role) {
    switch (role) {
      case 'ADMIN_RT':
        return AppTheme.primaryNavy;
      case 'SEKRETARIS_RT':
        return Colors.teal;
      case 'BENDAHARA_RT':
        return AppTheme.successGreen;
      case 'SECURITY':
        return const Color(0xFFE65100);
      case 'ADMIN_RW':
        return AppTheme.purpleIndigo;
      default:
        return AppTheme.textSecondary;
    }
  }

  IconData _getRoleIcon(String role) {
    switch (role) {
      case 'ADMIN_RT':
        return Icons.admin_panel_settings_rounded;
      case 'SEKRETARIS_RT':
        return Icons.edit_note_rounded;
      case 'BENDAHARA_RT':
        return Icons.account_balance_wallet_rounded;
      case 'SECURITY':
        return Icons.security_rounded;
      case 'ADMIN_RW':
        return Icons.location_city_rounded;
      default:
        return Icons.person_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Struktur Pengurus RT'),
      ),
      floatingActionButton: _canManagePengurus
          ? FloatingActionButton.extended(
              onPressed: () => _showFormPengurusModal(),
              backgroundColor: AppTheme.primaryNavy,
              icon: const Icon(Icons.person_add_rounded, color: Colors.white),
              label: const Text('Tambah Pengurus', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadPengurus,
              child: _pengurusList.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: const [
                        SizedBox(height: 120),
                        Center(
                          child: Column(
                            children: [
                              Icon(Icons.people_outline, size: 60, color: AppTheme.textMuted),
                              SizedBox(height: 12),
                              Text('Belum ada data pengurus RT', style: TextStyle(color: AppTheme.textMuted, fontSize: 15)),
                            ],
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: _pengurusList.length,
                      itemBuilder: (context, index) {
                        final p = _pengurusList[index];
                        final nama = p['nama'] ?? p['profile']?['namaLengkap'] ?? 'Pengurus RT';
                        final role = p['role'] ?? 'ADMIN_RT';
                        final jabatan = p['jabatan'] ?? (role == 'ADMIN_RT' ? 'Ketua RT' : role == 'SEKRETARIS_RT' ? 'Sekretaris RT' : role == 'BENDAHARA_RT' ? 'Bendahara RT' : role == 'SECURITY' ? 'Keamanan / Satpam' : role);
                        final phone = p['phone'] ?? '-';
                        final noRumah = p['noRumah'] ?? p['profile']?['noRumah'] ?? '-';
                        final roleColor = _getRoleColor(role);
                        final roleIcon = _getRoleIcon(role);

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.slateBorder),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 46,
                                height: 46,
                                decoration: BoxDecoration(
                                  color: roleColor.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(roleIcon, color: roleColor, size: 24),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            nama,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: roleColor.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        jabatan,
                                        style: TextStyle(
                                          color: roleColor,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      'Rumah: $noRumah • WA: $phone',
                                      style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                                    ),
                                  ],
                                ),
                              ),
                              if (_canManagePengurus)
                                PopupMenuButton<String>(
                                  icon: const Icon(Icons.more_vert, color: AppTheme.textMuted),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  onSelected: (value) {
                                    if (value == 'edit') {
                                      _showFormPengurusModal(initialData: p);
                                    } else if (value == 'delete') {
                                      _confirmDeletePengurus(p);
                                    }
                                  },
                                  itemBuilder: (context) => [
                                    const PopupMenuItem(
                                      value: 'edit',
                                      child: Row(
                                        children: [
                                          Icon(Icons.edit_outlined, size: 18, color: AppTheme.electricBlue),
                                          SizedBox(width: 8),
                                          Text('Ubah Jabatan'),
                                        ],
                                      ),
                                    ),
                                    const PopupMenuItem(
                                      value: 'delete',
                                      child: Row(
                                        children: [
                                          Icon(Icons.person_remove_outlined, size: 18, color: AppTheme.alertRed),
                                          SizedBox(width: 8),
                                          Text('Hapus Pengurus', style: TextStyle(color: AppTheme.alertRed)),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
