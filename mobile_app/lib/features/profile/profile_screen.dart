import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import '../../core/services/nik_service.dart';
import '../../core/utils/image_cache_helper.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _user;
  bool _isLoading = true;

  // Preset Avatars for easy profile picture setup
  final List<Map<String, String>> _avatarPresets = [
    {
      'label': 'Ketua RT Karismatik',
      'url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80',
    },
    {
      'label': 'Ibu RT / Tokoh Warga',
      'url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&fit=crop&q=80',
    },
    {
      'label': 'Bapak Kepala Keluarga',
      'url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80',
    },
    {
      'label': 'Ibu Rumah Tangga Hijab',
      'url': 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=300&fit=crop&q=80',
    },
    {
      'label': 'Pemuda / Millennial',
      'url': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&fit=crop&q=80',
    },
    {
      'label': 'Wanita Profesional',
      'url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&fit=crop&q=80',
    },
    {
      'label': 'Petugas Keamanan Satpam',
      'url': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&fit=crop&q=80',
    },
    {
      'label': 'Sesepuh Warga',
      'url': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&fit=crop&q=80',
    },
  ];

  // Family members list (loaded from database)
  final List<Map<String, dynamic>> _familyMembers = [];

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  void _loadProfile() async {
    final userData = await ApiService.getUserData();
    if (mounted) {
      setState(() {
        _user = userData;
        _isLoading = false;
        _initFamilyData();
      });
    }
  }

  void _initFamilyData() {
    final rawFamily = _user?['profile']?['dataKeluarga'];
    List<Map<String, dynamic>> parsedList = [];
    if (rawFamily != null) {
      if (rawFamily is List) {
        parsedList = rawFamily.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      } else if (rawFamily is String && rawFamily.isNotEmpty) {
        try {
          final decoded = jsonDecode(rawFamily);
          if (decoded is List) {
            parsedList = decoded.map((e) => Map<String, dynamic>.from(e as Map)).toList();
          }
        } catch (_) {}
      }
    }

    _familyMembers.clear();
    if (parsedList.isNotEmpty) {
      _familyMembers.addAll(parsedList);
    } else {
      // Default: siapkan profil pengguna itu sendiri sebagai entitas awal jika ada data
      final myName = _user?['profile']?['namaLengkap']?.toString().trim();
      final myNik = _user?['profile']?['nik']?.toString().trim();
      if (myName != null && myName.isNotEmpty) {
        String usia = '-';
        String gender = 'LAKI_LAKI';
        if (myNik != null && myNik.length == 16) {
          final parsed = NikService.parseNikLocal(myNik);
          if (parsed.isValid) {
            usia = '${parsed.usia} Tahun';
            gender = parsed.jenisKelamin == 'Perempuan' ? 'PEREMPUAN' : 'LAKI_LAKI';
          }
        }
        _familyMembers.add({
          'id': 'head-${_user?['id'] ?? '1'}',
          'nama': myName,
          'hubungan': 'KEPALA_KELUARGA',
          'nik': (myNik != null && myNik.isNotEmpty) ? myNik : '-',
          'jenisKelamin': gender,
          'usia': usia,
          'pekerjaan': 'Kepala Keluarga',
        });
      }
    }
  }

  Future<void> _persistFamilyData() async {
    try {
      final res = await ApiService.updateProfile({
        'dataKeluarga': _familyMembers,
      });
      if (res['user'] != null && mounted) {
        setState(() {
          _user = res['user'];
        });
      }
    } catch (e) {
      debugPrint('Error saving family data: $e');
    }
  }

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickAndUploadImage(ImageSource source, BuildContext modalContext) async {
    final nav = Navigator.of(modalContext);
    final messenger = ScaffoldMessenger.of(context);
    try {
      final XFile? photo = await _picker.pickImage(
        source: source,
        maxWidth: 500,
        maxHeight: 500,
        imageQuality: 80,
      );

      if (photo == null) return;

      final bytes = await photo.readAsBytes();
      final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';

      final res = await ApiService.updateProfile({
        'avatarUrl': base64Image,
      });

      nav.pop();
      if (mounted) {
        setState(() {
          _user = res['user'] ?? _user;
        });
      }

      messenger.showSnackBar(
        const SnackBar(
          content: Text('✅ Foto profil berhasil diupload & disimpan ke database!'),
          backgroundColor: AppTheme.successGreen,
        ),
      );
    } catch (e) {
      messenger.showSnackBar(
        SnackBar(
          content: Text('Gagal mengupload foto: ${e.toString().replaceAll('Exception: ', '')}'),
          backgroundColor: AppTheme.alertRed,
        ),
      );
    }
  }

  void _showGantiFotoModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (modalContext) => Padding(
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
                  const Text('Ubah Foto Profil', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.pop(modalContext),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Upload foto asli Anda dari kamera / galeri HP, atau pilih salah satu avatar warga:',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
              ),
              const SizedBox(height: 18),

              // Upload Buttons Row
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _pickAndUploadImage(ImageSource.camera, modalContext),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppTheme.primaryNavy, Color(0xFF1E293B)],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primaryNavy.withValues(alpha: 0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Column(
                          children: [
                            Icon(Icons.camera_alt_rounded, color: Colors.white, size: 28),
                            SizedBox(height: 6),
                            Text('Buka Kamera', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('Ambil foto langsung', style: TextStyle(color: AppTheme.skyAzure, fontSize: 10)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _pickAndUploadImage(ImageSource.gallery, modalContext),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: AppTheme.electricBlue.withValues(alpha: 0.1),
                          border: Border.all(color: AppTheme.electricBlue.withValues(alpha: 0.3)),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Column(
                          children: [
                            Icon(Icons.photo_library_rounded, color: AppTheme.electricBlue, size: 28),
                            SizedBox(height: 6),
                            Text('Galeri HP', style: TextStyle(color: AppTheme.electricBlue, fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('Pilih dari file foto', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),
              const Text('Atau Pilih Avatar Warga Cepat:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 10),

              SizedBox(
                height: 150,
                child: GridView.builder(
                  scrollDirection: Axis.horizontal,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 0.82,
                  ),
                  itemCount: _avatarPresets.length,
                  itemBuilder: (context, index) {
                    final preset = _avatarPresets[index];
                    final isSelected = _user?['profile']?['avatarUrl'] == preset['url'];

                    return GestureDetector(
                      onTap: () async {
                        final nav = Navigator.of(modalContext);
                        final messenger = ScaffoldMessenger.of(context);
                        try {
                          final res = await ApiService.updateProfile({
                            'avatarUrl': preset['url'],
                          });
                          nav.pop();
                          if (mounted) {
                            setState(() {
                              _user = res['user'] ?? _user;
                            });
                          }
                          messenger.showSnackBar(
                            const SnackBar(
                              content: Text('✅ Foto profil berhasil diubah dan disimpan ke database!'),
                              backgroundColor: AppTheme.successGreen,
                            ),
                          );
                        } catch (e) {
                          messenger.showSnackBar(
                            SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: AppTheme.alertRed),
                          );
                        }
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isSelected ? AppTheme.electricBlue : AppTheme.slateBorder,
                            width: isSelected ? 2.5 : 1,
                          ),
                          color: Colors.grey.shade50,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundImage: NetworkImage(preset['url']!),
                              backgroundColor: Colors.grey.shade200,
                            ),
                            const SizedBox(height: 3),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              child: Text(
                                preset['label']!,
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  color: isSelected ? AppTheme.electricBlue : AppTheme.textPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 18),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    side: const BorderSide(color: AppTheme.alertRed),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () async {
                    final nav = Navigator.of(modalContext);
                    final messenger = ScaffoldMessenger.of(context);
                    try {
                      final res = await ApiService.updateProfile({
                        'avatarUrl': null,
                      });
                      nav.pop();
                      if (mounted) {
                        setState(() {
                          _user = res['user'] ?? _user;
                        });
                      }
                      messenger.showSnackBar(
                        const SnackBar(content: Text('Foto profil berhasil dihapus.'), backgroundColor: AppTheme.successGreen),
                      );
                    } catch (e) {
                      messenger.showSnackBar(
                        SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: AppTheme.alertRed),
                      );
                    }
                  },
                  icon: const Icon(Icons.delete_outline, color: AppTheme.alertRed, size: 18),
                  label: const Text('Hapus Foto Profil (Gunakan Inisial)', style: TextStyle(color: AppTheme.alertRed, fontSize: 13)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleEditProfile() {
    final existingNik = _user?['profile']?['nik'] ?? '';
    final nameCtrl = TextEditingController(text: _user?['profile']?['namaLengkap'] ?? '');
    final phoneCtrl = TextEditingController(text: _user?['phone'] ?? '');
    final emailCtrl = TextEditingController(text: _user?['email'] ?? '');
    final rumahCtrl = TextEditingController(text: _user?['profile']?['noRumah'] ?? '');
    final nikCtrl = TextEditingController(text: existingNik);
    final kkCtrl = TextEditingController(text: _user?['profile']?['noKk'] ?? '');
    
    NikData? parsedNik = existingNik.toString().length == 16 ? NikService.parseNikLocal(existingNik.toString()) : null;
    bool isCheckingNik = false;
    String? duplicateNikError;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) => StatefulBuilder(
        builder: (modalContext, setModalState) => Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.slateBorder,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Edit Data Profil & Identitas', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),

                const Text('Nomor NIK KTP (16 Digit)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: nikCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 16,
                  onChanged: (val) async {
                    final clean = val.replaceAll(RegExp(r'[^0-9]'), '');
                    if (clean.length == 16) {
                      setModalState(() {
                        isCheckingNik = true;
                        duplicateNikError = null;
                      });
                      final result = await NikService.parseNik(clean);
                      if (clean != existingNik) {
                        final checkDup = await ApiService.checkNikAvailability(clean);
                        if (checkDup['available'] == false) {
                          duplicateNikError = checkDup['message'] ?? 'NIK sudah digunakan oleh akun lain!';
                        }
                      }
                      setModalState(() {
                        parsedNik = result;
                        isCheckingNik = false;
                      });
                    } else {
                      if (parsedNik != null || duplicateNikError != null) {
                        setModalState(() {
                          parsedNik = null;
                          duplicateNikError = null;
                        });
                      }
                    }
                  },
                  decoration: InputDecoration(
                    hintText: '327601xxxxxxxxxx',
                    counterText: '',
                    prefixIcon: const Icon(Icons.badge_outlined),
                    suffixIcon: isCheckingNik
                        ? const Padding(
                            padding: EdgeInsets.all(12.0),
                            child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)),
                          )
                        : (parsedNik != null && parsedNik!.isValid && duplicateNikError == null)
                            ? const Icon(Icons.check_circle, color: AppTheme.successGreen)
                            : duplicateNikError != null
                                ? const Icon(Icons.error, color: AppTheme.alertRed)
                                : null,
                  ),
                ),
                if (duplicateNikError != null) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.alertRed.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.alertRed.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded, color: AppTheme.alertRed, size: 16),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            duplicateNikError!,
                            style: const TextStyle(color: AppTheme.alertRed, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                if (parsedNik != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: parsedNik!.isValid ? AppTheme.successGreen.withValues(alpha: 0.08) : Colors.red.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: parsedNik!.isValid ? AppTheme.successGreen.withValues(alpha: 0.3) : Colors.red.withValues(alpha: 0.3)),
                    ),
                    child: parsedNik!.isValid
                        ? Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.verified, color: AppTheme.successGreen, size: 16),
                                  SizedBox(width: 6),
                                  Text('NIK Terverifikasi Dukcapil', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppTheme.successGreen)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '📍 Wilayah: ${parsedNik!.provinsi ?? "-"}'
                                '${parsedNik!.kotaKabupaten != null ? ", ${parsedNik!.kotaKabupaten}" : ""}'
                                '${parsedNik!.kecamatan != null ? ", Kec. ${parsedNik!.kecamatan}" : ""}\n'
                                '👤 ${parsedNik!.jenisKelamin ?? "-"} | Tgl Lahir: ${parsedNik!.tanggalLahir ?? "-"}',
                                style: const TextStyle(fontSize: 11, height: 1.3),
                              ),
                            ],
                          )
                        : Text(parsedNik!.errorMessage ?? 'Format NIK tidak valid', style: const TextStyle(color: Colors.red, fontSize: 11)),
                  ),
                ],
                const SizedBox(height: 12),

                const Text('Nama Lengkap *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(controller: nameCtrl),
                const SizedBox(height: 12),

                const Text('Nomor WhatsApp / HP *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(controller: phoneCtrl, keyboardType: TextInputType.phone),
                const SizedBox(height: 12),

                const Text('Email (Opsional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(controller: emailCtrl, keyboardType: TextInputType.emailAddress),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Nomor Rumah *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(controller: rumahCtrl),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Nomor KK', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(controller: kkCtrl, keyboardType: TextInputType.number),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryNavy,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      if (nameCtrl.text.trim().isEmpty || phoneCtrl.text.trim().isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Nama dan Nomor WhatsApp wajib diisi!')),
                        );
                        return;
                      }

                      if (duplicateNikError != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('❌ $duplicateNikError'), backgroundColor: AppTheme.alertRed),
                        );
                        return;
                      }

                      final nav = Navigator.of(modalContext);
                      final messenger = ScaffoldMessenger.of(context);
                      try {
                        final res = await ApiService.updateProfile({
                          'namaLengkap': nameCtrl.text.trim(),
                          'phone': phoneCtrl.text.trim(),
                          'email': emailCtrl.text.trim().isEmpty ? null : emailCtrl.text.trim(),
                          'noRumah': rumahCtrl.text.trim().isEmpty ? null : rumahCtrl.text.trim(),
                          'nik': nikCtrl.text.trim().isEmpty ? null : nikCtrl.text.trim(),
                          'noKk': kkCtrl.text.trim().isEmpty ? null : kkCtrl.text.trim(),
                        });

                        nav.pop();
                        if (mounted) {
                          setState(() {
                            _user = res['user'] ?? _user;
                            if (_familyMembers.isNotEmpty) {
                              _familyMembers[0]['nama'] = nameCtrl.text.trim();
                              _familyMembers[0]['nik'] = nikCtrl.text.trim();
                            }
                          });
                        }

                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('✅ Data profil & NIK berhasil diperbarui di database!'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                      } catch (e) {
                        messenger.showSnackBar(
                          SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: AppTheme.alertRed),
                        );
                      }
                    },
                    child: const Text('Simpan Perubahan ke Database', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showAddEditFamilyMemberModal({Map<String, dynamic>? existingMember, int? index}) {
    final isEdit = existingMember != null;
    final existingMemberNik = existingMember?['nik'] ?? '';
    final nameCtrl = TextEditingController(text: existingMember?['nama'] ?? '');
    final nikCtrl = TextEditingController(text: existingMemberNik);
    final usiaCtrl = TextEditingController(text: existingMember?['usia'] ?? '');
    final kerjaCtrl = TextEditingController(text: existingMember?['pekerjaan'] ?? '');
    String hubungan = existingMember?['hubungan'] ?? 'ANAK';
    String jenisKelamin = existingMember?['jenisKelamin'] ?? 'LAKI_LAKI';

    NikData? memberNikData = (existingMemberNik.toString().length == 16)
        ? NikService.parseNikLocal(existingMemberNik.toString())
        : null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.slateBorder,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  isEdit ? 'Edit Data Anggota Keluarga' : 'Tambah Anggota Keluarga (KK)',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),

                const Text('Nomor NIK Anggota (16 Digit)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: nikCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 16,
                  onChanged: (val) {
                    final clean = val.replaceAll(RegExp(r'[^0-9]'), '');
                    if (clean.length == 16) {
                      final parsed = NikService.parseNikLocal(clean);
                      if (parsed.isValid) {
                        setModalState(() {
                          memberNikData = parsed;
                          usiaCtrl.text = '${parsed.usia} Tahun';
                          jenisKelamin = parsed.jenisKelamin == 'Perempuan' ? 'PEREMPUAN' : 'LAKI_LAKI';
                        });
                      }
                    } else {
                      if (memberNikData != null) {
                        setModalState(() => memberNikData = null);
                      }
                    }
                  },
                  decoration: InputDecoration(
                    hintText: '327601xxxxxxxxxx (Autofill Usia & Gender)',
                    counterText: '',
                    prefixIcon: const Icon(Icons.badge_outlined),
                    suffixIcon: (memberNikData != null && memberNikData!.isValid)
                        ? const Icon(Icons.check_circle, color: AppTheme.successGreen)
                        : null,
                  ),
                ),
                if (memberNikData != null && memberNikData!.isValid) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '✅ Terverifikasi: Tgl Lahir ${memberNikData!.tanggalLahir} (${memberNikData!.usia} Thn) • ${memberNikData!.jenisKelamin}',
                      style: const TextStyle(fontSize: 11, color: AppTheme.successGreen, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
                const SizedBox(height: 12),

                const Text('Nama Lengkap Anggota *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(hintText: 'Contoh: Siti Aisyah'),
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Hubungan Keluarga', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: hubungan,
                            items: const [
                              DropdownMenuItem(value: 'ISTRI', child: Text('Istri')),
                              DropdownMenuItem(value: 'ANAK', child: Text('Anak')),
                              DropdownMenuItem(value: 'ORANG_TUA', child: Text('Orang Tua')),
                              DropdownMenuItem(value: 'MERTUA', child: Text('Mertua')),
                              DropdownMenuItem(value: 'FAMILI_LAIN', child: Text('Famili Lain')),
                            ],
                            onChanged: (val) {
                              if (val != null) setModalState(() => hubungan = val);
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Jenis Kelamin', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            key: ValueKey(jenisKelamin),
                            initialValue: jenisKelamin,
                            items: const [
                              DropdownMenuItem(value: 'LAKI_LAKI', child: Text('Laki-laki')),
                              DropdownMenuItem(value: 'PEREMPUAN', child: Text('Perempuan')),
                            ],
                            onChanged: (val) {
                              if (val != null) setModalState(() => jenisKelamin = val);
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Usia / Status', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: usiaCtrl,
                            decoration: const InputDecoration(hintText: '10 Tahun'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Pekerjaan', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: kerjaCtrl,
                            decoration: const InputDecoration(hintText: 'Pelajar / Bekerja'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryNavy,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      if (nameCtrl.text.trim().isEmpty) return;

                      final itemData = {
                        'id': isEdit ? existingMember['id'] : DateTime.now().millisecondsSinceEpoch.toString(),
                        'nama': nameCtrl.text.trim(),
                        'hubungan': hubungan,
                        'nik': nikCtrl.text.trim().isEmpty ? '-' : nikCtrl.text.trim(),
                        'jenisKelamin': jenisKelamin,
                        'usia': usiaCtrl.text.trim().isEmpty ? '-' : usiaCtrl.text.trim(),
                        'pekerjaan': kerjaCtrl.text.trim().isEmpty ? '-' : kerjaCtrl.text.trim(),
                      };

                      setState(() {
                        if (isEdit && index != null) {
                          _familyMembers[index] = itemData;
                        } else {
                          _familyMembers.add(itemData);
                        }
                      });

                      Navigator.pop(context);
                      await _persistFamilyData();

                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(isEdit
                                ? '✅ Data ${nameCtrl.text} berhasil diperbarui di database!'
                                : '✅ Anggota keluarga ${nameCtrl.text} berhasil ditambahkan ke database!'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                      }
                    },
                    child: Text(isEdit ? 'Simpan Perubahan' : 'Tambahkan ke Kartu Keluarga', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _handleDeleteMember(int index) {
    if (index == 0 && _familyMembers.length == 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Kepala Keluarga utama tidak dapat dihapus.')),
      );
      return;
    }

    final nama = _familyMembers[index]['nama'];
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Hapus Anggota Keluarga', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Text('Apakah Anda yakin ingin menghapus "$nama" dari Kartu Keluarga digital? Data akan diperbarui di database.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
          ElevatedButton(
            onPressed: () async {
              setState(() => _familyMembers.removeAt(index));
              Navigator.pop(context);
              await _persistFamilyData();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('✅ Anggota keluarga "$nama" telah dihapus dari database.'),
                    backgroundColor: AppTheme.successGreen,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.alertRed),
            child: const Text('Hapus', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  String _formatHubungan(String h) {
    switch (h) {
      case 'KEPALA_KELUARGA':
        return 'Kepala Keluarga';
      case 'ISTRI':
        return 'Istri';
      case 'ANAK':
        return 'Anak';
      case 'ORANG_TUA':
        return 'Orang Tua';
      case 'MERTUA':
        return 'Mertua';
      default:
        return 'Anggota Keluarga';
    }
  }

  Widget _buildAvatarWidget(String? avatarUrl, String namaLengkap) {
    if (avatarUrl != null && avatarUrl.isNotEmpty) {
      return ImageCacheHelper.buildImage(
        avatarUrl,
        width: 80,
        height: 80,
        borderRadius: BorderRadius.circular(40),
        placeholder: _buildInitialsAvatar(namaLengkap),
      );
    }
    return _buildInitialsAvatar(namaLengkap);
  }

  Widget _buildInitialsAvatar(String namaLengkap) {
    return CircleAvatar(
      radius: 40,
      backgroundColor: AppTheme.electricBlue,
      child: Text(
        namaLengkap.length >= 2 ? namaLengkap.substring(0, 2).toUpperCase() : 'U',
        style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final namaLengkap = _user?['profile']?['namaLengkap'] ?? 'Warga RT';
    final noRumah = _user?['profile']?['noRumah'] ?? 'Blok C3 No. 01';
    final phone = _user?['phone'] ?? '0812xxxxxxxx';
    final email = _user?['email'] ?? '-';
    final nik = _user?['profile']?['nik'] ?? '-';
    final noKk = _user?['profile']?['noKk'] ?? '-';
    final avatarUrl = _user?['profile']?['avatarUrl'];
    final rtNomor = _user?['rt']?['nomor'] ?? '03';
    final rwNomor = _user?['rw']?['nomor'] ?? '05';
    final kelurahanNama = _user?['kelurahan']?['nama'] ?? 'Sukamaju';
    final role = _user?['role']?.toString().toUpperCase() ?? 'WARGA';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Profil & Kartu Keluarga',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontSize: 20,
            letterSpacing: -0.5,
          ),
        ),
        centerTitle: false,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: const Color(0xFFE2E8F0), height: 1),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: IconButton.filledTonal(
              icon: const Icon(Icons.edit_note_rounded, size: 22),
              tooltip: 'Edit Profil Diri',
              onPressed: _handleEditProfile,
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile Header Card (Porcelain White Surface)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x060F172A),
                      blurRadius: 18,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Stack(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFE2E8F0), width: 2),
                          ),
                          child: _buildAvatarWidget(avatarUrl, namaLengkap),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: GestureDetector(
                            onTap: _showGantiFotoModal,
                            child: Container(
                              padding: const EdgeInsets.all(7),
                              decoration: const BoxDecoration(
                                color: AppTheme.electricBlue,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 16),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    TextButton.icon(
                      onPressed: _showGantiFotoModal,
                      icon: const Icon(Icons.photo_camera_outlined, size: 13, color: AppTheme.electricBlue),
                      label: const Text('Ubah Foto Profil', style: TextStyle(color: AppTheme.electricBlue, fontSize: 12, fontWeight: FontWeight.bold)),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      namaLengkap,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Unit Rumah: $noRumah',
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      alignment: WrapAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Text(
                            '📍 RT $rtNomor / RW $rwNomor · $kelurahanNama',
                            style: const TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE7F6EF),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: Text(
                            role == 'ADMIN_RT'
                                ? 'Ketua RT'
                                : (role.contains('BENDAHARA')
                                    ? 'Bendahara'
                                    : (role == 'SECURITY' ? 'Satpam RT' : 'Warga Tetap')),
                            style: const TextStyle(
                              color: Color(0xFF047857),
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Data Kependudukan Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Data Identitas & Kontak', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                  TextButton.icon(
                    onPressed: _handleEditProfile,
                    icon: const Icon(Icons.edit, size: 14, color: AppTheme.electricBlue),
                    label: const Text('Edit Data', style: TextStyle(fontSize: 12, color: AppTheme.electricBlue, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x060F172A),
                      blurRadius: 14,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildInfoRow(Icons.phone_android_rounded, 'Nomor WhatsApp', phone),
                    const Divider(height: 18),
                    _buildInfoRow(Icons.mail_outline_rounded, 'Alamat Email', email),
                    const Divider(height: 18),
                    Builder(
                      builder: (context) {
                        final parsed = (nik != '-' && nik.toString().length == 16)
                            ? NikService.parseNikLocal(nik.toString())
                            : null;
                        return _buildInfoRow(
                          Icons.badge_outlined,
                          'Nomor NIK KTP',
                          nik,
                          subtitle: (parsed != null && parsed.isValid)
                              ? '🎂 ${parsed.tanggalLahir} (${parsed.usia} Thn) • 🚻 ${parsed.jenisKelamin} • 📍 ${parsed.kotaKabupaten}'
                              : null,
                          trailing: (parsed != null && parsed.isValid)
                              ? Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.successGreen.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.verified, size: 13, color: AppTheme.successGreen),
                                      SizedBox(width: 4),
                                      Text('Dukcapil Valid', style: TextStyle(color: AppTheme.successGreen, fontSize: 10, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                )
                              : null,
                        );
                      },
                    ),
                    const Divider(height: 18),
                    _buildInfoRow(Icons.family_restroom_rounded, 'Nomor KK', noKk),
                    const Divider(height: 18),
                    _buildInfoRow(Icons.home_outlined, 'Nomor / Blok Rumah', noRumah),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Family Members (Kartu Keluarga Digital)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Anggota Keluarga (KK Digital)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                      Text('Total ${_familyMembers.length} Jiwa terdaftar', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _showAddEditFamilyMemberModal(),
                    icon: const Icon(Icons.person_add_alt_1_rounded, size: 14),
                    label: const Text('Tambah Anggota', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.electricBlue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              if (_familyMembers.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.slateBorder),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.family_restroom_rounded, size: 40, color: AppTheme.textMuted.withValues(alpha: 0.5)),
                      const SizedBox(height: 8),
                      const Text('Belum Ada Anggota Keluarga Terdaftar', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 4),
                      const Text('Tambahkan data keluarga Anda untuk pendataan warga dan pengajuan surat RT.',
                          textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: () => _showAddEditFamilyMemberModal(),
                        icon: const Icon(Icons.add, size: 16),
                        label: const Text('Tambah Anggota Pertama'),
                      ),
                    ],
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _familyMembers.length,
                separatorBuilder: (context, index) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final member = _familyMembers[index];
                  final isKepala = member['hubungan'] == 'KEPALA_KELUARGA';

                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x060F172A),
                          blurRadius: 10,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: (isKepala ? AppTheme.primaryNavy : AppTheme.electricBlue).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isKepala
                                ? Icons.admin_panel_settings_rounded
                                : (member['jenisKelamin'] == 'PEREMPUAN' ? Icons.woman_rounded : Icons.man_rounded),
                            color: isKepala ? AppTheme.primaryNavy : AppTheme.electricBlue,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    member['nama'] ?? '-',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isKepala
                                          ? AppTheme.primaryNavy.withValues(alpha: 0.1)
                                          : AppTheme.skyAzure.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      _formatHubungan(member['hubungan'] ?? ''),
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: isKepala ? AppTheme.primaryNavy : AppTheme.electricBlue,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'NIK: ${member['nik']} • ${member['usia']}',
                                style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.edit_outlined, size: 18, color: AppTheme.textMuted),
                              onPressed: () => _showAddEditFamilyMemberModal(existingMember: member, index: index),
                            ),
                            if (!isKepala)
                              IconButton(
                                icon: const Icon(Icons.delete_outline, size: 18, color: AppTheme.alertRed),
                                onPressed: () => _handleDeleteMember(index),
                              ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    await ApiService.clearSession();
                    if (context.mounted) {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(builder: (context) => const LoginScreen()),
                        (route) => false,
                      );
                    }
                  },
                  icon: const Icon(Icons.logout_rounded, color: AppTheme.alertRed, size: 18),
                  label: const Text('Keluar / Ganti Akun Pengguna', style: TextStyle(color: AppTheme.alertRed, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppTheme.alertRed),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, {String? subtitle, Widget? trailing}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(icon, size: 18, color: AppTheme.textMuted),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
              const SizedBox(height: 1),
              Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
              if (subtitle != null) ...[
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 11, color: AppTheme.electricBlue, fontWeight: FontWeight.w600, height: 1.2),
                ),
              ],
            ],
          ),
        ),
        ?trailing,
      ],
    );
  }
}
