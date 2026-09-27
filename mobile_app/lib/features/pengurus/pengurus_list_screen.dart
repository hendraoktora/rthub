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
  List<Map<String, String>> _wargaList = [];
  bool _isLoadingWarga = false;
  Map<String, dynamic>? _currentUser;

  bool get _canManagePengurus {
    final role = _currentUser?['role']?.toString().toUpperCase();
    return role == 'ADMIN_RT' || role == 'SEKRETARIS_RT' || role == 'SUPERADMIN';
  }

  @override
  void initState() {
    super.initState();
    _loadPengurus();
    _loadWargaList();
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

  Future<void> _loadWargaList() async {
    setState(() => _isLoadingWarga = true);
    try {
      final data = await ApiService.getWargaList();
      final parsed = _parseWargaList(data);
      if (mounted) {
        setState(() {
          _wargaList = parsed;
          _isLoadingWarga = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingWarga = false);
    }
  }

  List<Map<String, String>> _parseWargaList(Map<String, dynamic> data) {
    final List<Map<String, String>> result = [];
    final Set<String> seen = {};

    void addWarga(String nama, String noRumah, String phone) {
      final cleanNama = nama.trim();
      final cleanRumah = noRumah.trim().isEmpty ? '-' : noRumah.trim();
      final cleanPhone = phone.trim();
      if (cleanNama.isEmpty) return;

      final key = '${cleanNama.toLowerCase()}_$cleanPhone';
      if (!seen.contains(key)) {
        seen.add(key);
        result.add({
          'nama': cleanNama,
          'noRumah': cleanRumah,
          'phone': cleanPhone,
        });
      }
    }

    // 1. Dari userList (warga yang punya akun user di RT)
    final userList = data['userList'] as List<dynamic>? ?? [];
    for (final u in userList) {
      final profile = u['profile'] as Map<String, dynamic>?;
      final nama = (profile?['namaLengkap'] ?? u['name'] ?? '').toString();
      final noRumah = (profile?['noRumah'] ?? u['noRumah'] ?? '-').toString();
      final phone = (u['phone'] ?? '').toString();
      addWarga(nama, noRumah, phone);
    }

    // 2. Dari rumahList (rumah & kartu keluarga & anggota)
    final rumahList = data['rumahList'] as List<dynamic>? ?? [];
    for (final r in rumahList) {
      final noRumah = (r['noRumah'] ?? '-').toString();
      final phoneRumah = (r['phone'] ?? '').toString();

      if (r['kepalaKeluarga'] != null) {
        addWarga(r['kepalaKeluarga'].toString(), noRumah, phoneRumah);
      }

      if (r['kartuKeluarga'] is List) {
        for (final kk in r['kartuKeluarga']) {
          final namaKepala = (kk['namaKepala'] ?? '').toString();
          if (namaKepala.isNotEmpty) {
            addWarga(namaKepala, noRumah, phoneRumah);
          }
          if (kk['anggota'] is List) {
            for (final a in kk['anggota']) {
              final namaAnggota = (a['namaLengkap'] ?? '').toString();
              final phoneAnggota = (a['noHp'] ?? '').toString();
              if (namaAnggota.isNotEmpty) {
                addWarga(namaAnggota, noRumah, phoneAnggota.isNotEmpty ? phoneAnggota : phoneRumah);
              }
            }
          }
        }
      }
    }

    // Urutkan alfabetis berdasarkan nama
    result.sort((a, b) => a['nama']!.toLowerCase().compareTo(b['nama']!.toLowerCase()));
    return result;
  }

  void _showSelectWargaSheet(Function(Map<String, String>) onSelect) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (pickerCtx) {
        String searchQuery = '';
        return StatefulBuilder(
          builder: (ctx, setPickerState) {
            final filtered = _wargaList.where((w) {
              if (searchQuery.trim().isEmpty) return true;
              final q = searchQuery.toLowerCase();
              final nameMatch = (w['nama'] ?? '').toLowerCase().contains(q);
              final rumahMatch = (w['noRumah'] ?? '').toLowerCase().contains(q);
              return nameMatch || rumahMatch;
            }).toList();

            return Container(
              height: MediaQuery.of(pickerCtx).size.height * 0.75,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Pilih Warga Terdaftar',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Cari berdasarkan nama lengkap atau nomor rumah',
                            style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: () => Navigator.pop(pickerCtx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    autofocus: true,
                    decoration: InputDecoration(
                      hintText: 'Cari nama warga atau nomor rumah...',
                      prefixIcon: const Icon(Icons.search, color: AppTheme.electricBlue),
                      filled: true,
                      fillColor: Colors.grey.shade100,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none,
                      ),
                      suffixIcon: searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 18),
                              onPressed: () => setPickerState(() => searchQuery = ''),
                            )
                          : null,
                    ),
                    onChanged: (val) => setPickerState(() => searchQuery = val),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total: ${filtered.length} warga ditemukan',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textMuted),
                      ),
                      if (_isLoadingWarga)
                        const Row(
                          children: [
                            SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2)),
                            SizedBox(width: 6),
                            Text('Memuat...', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                          ],
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(height: 1),
                  Expanded(
                    child: filtered.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.person_off_outlined, size: 48, color: Colors.grey.shade400),
                                const SizedBox(height: 10),
                                Text(
                                  searchQuery.isEmpty ? 'Belum ada data warga terdaftar di RT ini' : 'Tidak ada warga dengan kata kunci "$searchQuery"',
                                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            itemCount: filtered.length,
                            separatorBuilder: (_, __) => const Divider(height: 1),
                            itemBuilder: (context, i) {
                              final item = filtered[i];
                              final nama = item['nama'] ?? '-';
                              final noRumah = item['noRumah'] ?? '-';
                              final phone = item['phone'] ?? '-';

                              return ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                                leading: CircleAvatar(
                                  backgroundColor: AppTheme.electricBlue.withValues(alpha: 0.12),
                                  child: Text(
                                    nama.isNotEmpty ? nama[0].toUpperCase() : 'W',
                                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.electricBlue),
                                  ),
                                ),
                                title: Text(
                                  nama,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                subtitle: Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.blue.shade50,
                                          borderRadius: BorderRadius.circular(4),
                                          border: Border.all(color: Colors.blue.shade200),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            const Icon(Icons.home_outlined, size: 12, color: Colors.blue),
                                            const SizedBox(width: 3),
                                            Text(
                                              'Rumah: $noRumah',
                                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue.shade800),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Icon(Icons.phone_android_outlined, size: 12, color: Colors.grey.shade600),
                                      const SizedBox(width: 3),
                                      Text(
                                        phone.isNotEmpty && phone != '-' ? phone : 'No Telp (-)',
                                        style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                      ),
                                    ],
                                  ),
                                ),
                                trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 18),
                                onTap: () {
                                  Navigator.pop(pickerCtx);
                                  onSelect(item);
                                },
                              );
                            },
                          ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showFormPengurusModal({Map<String, dynamic>? initialData}) {
    final isEdit = initialData != null;
    final namaController = TextEditingController(text: initialData?['nama'] ?? initialData?['profile']?['namaLengkap'] ?? '');
    final phoneController = TextEditingController(text: initialData?['phone'] ?? '');
    final rumahController = TextEditingController(text: initialData?['noRumah'] ?? initialData?['profile']?['noRumah'] ?? '');
    String selectedRole = initialData?['role'] ?? 'ADMIN_RT';
    Map<String, String>? selectedWarga;
    bool showManualFields = isEdit;

    // Jika edit, prefill selected warga jika ada
    if (isEdit) {
      selectedWarga = {
        'nama': namaController.text,
        'phone': phoneController.text,
        'noRumah': rumahController.text,
      };
    }

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
          child: SingleChildScrollView(
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

                // 1. SELECT BOX DARI DAFTAR WARGA (CARI NAMA / RUMAH)
                if (!isEdit) ...[
                  const Text(
                    '1. Pilih Warga Terdaftar *',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                  ),
                  const SizedBox(height: 8),
                  if (selectedWarga != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.blue.shade300),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: AppTheme.electricBlue,
                            child: Text(
                              (selectedWarga!['nama'] ?? 'W')[0].toUpperCase(),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  selectedWarga!['nama'] ?? '-',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(color: Colors.blue.shade200),
                                      ),
                                      child: Text(
                                        'Rumah: ${selectedWarga!['noRumah']}',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue.shade800),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      '•  ${selectedWarga!['phone']}',
                                      style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              side: BorderSide(color: Colors.blue.shade400),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () {
                              _showSelectWargaSheet((w) {
                                setModalState(() {
                                  selectedWarga = w;
                                  namaController.text = w['nama'] ?? '';
                                  phoneController.text = w['phone'] ?? '';
                                  rumahController.text = w['noRumah'] ?? '';
                                });
                              });
                            },
                            child: const Text('Ganti', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    InkWell(
                      onTap: () {
                        _showSelectWargaSheet((w) {
                          setModalState(() {
                            selectedWarga = w;
                            namaController.text = w['nama'] ?? '';
                            phoneController.text = w['phone'] ?? '';
                            rumahController.text = w['noRumah'] ?? '';
                          });
                        });
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.blue.shade300),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.electricBlue.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.person_search_rounded, color: AppTheme.electricBlue, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Pilih Warga dari Daftar RT...',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
                                  ),
                                  Text(
                                    _wargaList.isNotEmpty
                                        ? '${_wargaList.length} warga tersedia (ada Nama & No Rumah)'
                                        : 'Ketuk untuk mencari warga terdaftar...',
                                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.arrow_drop_down, color: AppTheme.electricBlue),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 14),
                ],

                // 2. JABATAN / POSISI PENGURUS
                const Text(
                  '2. Posisi / Jabatan Pengurus *',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: selectedRole,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.badge_outlined, color: AppTheme.electricBlue),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'ADMIN_RT', child: Text('Ketua RT / Administrator')),
                    DropdownMenuItem(value: 'SEKRETARIS_RT', child: Text('Sekretaris RT')),
                    DropdownMenuItem(value: 'BENDAHARA_RT', child: Text('Bendahara RT (Keuangan)')),
                    DropdownMenuItem(value: 'SECURITY', child: Text('Petugas Keamanan / Satpam')),
                    DropdownMenuItem(value: 'ADMIN_RW', child: Text('Koordinator / Ketua RW')),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setModalState(() => selectedRole = val);
                    }
                  },
                ),
                const SizedBox(height: 14),

                // TOGGLE MANUAL FIELDS ATAU AUTO-FILLED
                if (!isEdit) ...[
                  InkWell(
                    onTap: () => setModalState(() => showManualFields = !showManualFields),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          Icon(showManualFields ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, size: 18, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(
                            showManualFields ? 'Sembunyikan detail input manual' : 'Lihat / Edit detail nama, rumah & WA manual',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey.shade700),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],

                if (showManualFields || isEdit) ...[
                  const SizedBox(height: 10),
                  TextField(
                    controller: namaController,
                    decoration: InputDecoration(
                      labelText: 'Nama Lengkap Pengurus *',
                      hintText: 'Contoh: Hendra Gunawan',
                      prefixIcon: const Icon(Icons.person_outline),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: rumahController,
                    decoration: InputDecoration(
                      labelText: 'Nomor / Blok Rumah',
                      hintText: 'Contoh: Blok C3 No. 12',
                      prefixIcon: const Icon(Icons.home_outlined),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ],

                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: AppTheme.primaryNavy,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () async {
                      if (namaController.text.trim().isEmpty || phoneController.text.trim().isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Pilih warga terlebih dahulu atau isi Nama & Nomor WhatsApp!')),
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
                      isEdit ? 'Simpan Perubahan' : 'Tetapkan Sebagai Pengurus',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ),
              ],
            ),
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
