import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';
import '../../core/services/nik_service.dart';
import '../home/home_screen.dart';
import 'login_screen.dart';

class RegisterRtScreen extends StatefulWidget {
  final String initialRole; // 'RT' or 'WARGA'
  const RegisterRtScreen({super.key, this.initialRole = 'RT'});

  @override
  State<RegisterRtScreen> createState() => _RegisterRtScreenState();
}

class _RegisterRtScreenState extends State<RegisterRtScreen> {
  late String _selectedRole; // 'RT' or 'WARGA'

  // Controllers
  final _nikController = TextEditingController();
  final _namaLengkap = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _noKk = TextEditingController();
  final _noRumah = TextEditingController();

  // RT specific controllers
  final _nomorRt = TextEditingController(text: '03');
  final _nomorRw = TextEditingController(text: '05');
  final _namaKelurahan = TextEditingController(text: 'Sukamaju');
  final _namaJalan = TextEditingController(text: 'Jl. Melati Blok C');

  // Document Upload & AI Verification for RT Legalitas
  String? _legalitasDocBase64;
  String? _legalitasDocPath;
  bool _isDocVerified = false;
  double _docConfidenceScore = 0.0;

  // Warga specific selection
  List<dynamic> _availableRts = [];
  String? _selectedRtId;
  bool _isLoadingRts = false;

  bool _isLoading = false;
  bool _isCheckingNik = false;
  NikData? _nikData;
  String? _nikDuplicateError;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.initialRole;
    _fetchPublicRts();
  }

  void _fetchPublicRts() async {
    setState(() => _isLoadingRts = true);
    try {
      final list = await ApiService.getPublicRtList();
      if (mounted) {
        setState(() {
          _availableRts = list;
          if (_availableRts.isNotEmpty && _selectedRtId == null) {
            _selectedRtId = _availableRts.first['id'];
          }
        });
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoadingRts = false);
  }

  void _checkNik(String val) async {
    final clean = val.replaceAll(RegExp(r'[^0-9]'), '');
    if (clean.length == 16) {
      setState(() {
        _isCheckingNik = true;
        _nikDuplicateError = null;
      });
      final result = await NikService.parseNik(clean);
      final checkDup = await ApiService.checkNikAvailability(clean);

      if (mounted) {
        setState(() {
          _nikData = result;
          _isCheckingNik = false;
          if (checkDup['available'] == false) {
            _nikDuplicateError = checkDup['message'] ?? 'NIK sudah terdaftar dalam sistem!';
          } else {
            _nikDuplicateError = null;
          }
          if (result.isValid) {
            if (_selectedRole == 'RT') {
              if (result.kelurahan != null && result.kelurahan!.isNotEmpty) {
                _namaKelurahan.text = result.kelurahan!;
              } else if (_namaKelurahan.text == 'Sukamaju' && result.kotaKabupaten != null) {
                _namaKelurahan.text = result.kotaKabupaten!.replaceAll('Kota ', '').replaceAll('Kab. ', '');
              }
            }
          }
        });
      }
    } else {
      if (_nikData != null || _nikDuplicateError != null) {
        setState(() {
          _nikData = null;
          _nikDuplicateError = null;
        });
      }
    }
  }

  Future<void> _pickLegalitasDocument(ImageSource source) async {
    // Validasi awal agar user mengisi nama & NIK terlebih dahulu untuk dicocokkan
    if (_nikController.text.trim().isEmpty || _namaLengkap.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ Mohon isi NIK KTP dan Nama Lengkap terlebih dahulu sebelum memindai dokumen SK RT.'),
          backgroundColor: AppTheme.warningAmber,
        ),
      );
      return;
    }

    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 75,
        maxWidth: 1280,
      );

      if (image != null) {
        final bytes = await image.readAsBytes();
        final base64String = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        
        setState(() {
          _legalitasDocBase64 = base64String;
          _legalitasDocPath = image.path;
          _isDocVerified = false;
        });

        // Jalankan Pengecekan Forensik AI & Data Matching
        await _runAiDocumentVerification(base64String);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mengambil foto dokumen: $e'),
            backgroundColor: AppTheme.alertRed,
          ),
        );
      }
    }
  }

  Future<void> _runAiDocumentVerification(String base64Content) async {
    // Tampilkan dialog proses pemindaian AI
    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 10),
              const SizedBox(
                width: 50,
                height: 50,
                child: CircularProgressIndicator(strokeWidth: 3, color: AppTheme.electricBlue),
              ),
              const SizedBox(height: 20),
              const Text(
                'Memverifikasi Keaslian Dokumen SK RT',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.slateLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.check_circle, size: 14, color: AppTheme.successGreen),
                        SizedBox(width: 6),
                        Text('Deteksi Citra Anti-AI & Forensic', style: TextStyle(fontSize: 11)),
                      ],
                    ),
                    SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.check_circle, size: 14, color: AppTheme.successGreen),
                        SizedBox(width: 6),
                        Text('Pencocokan NIK Dukcapil 16-Digit', style: TextStyle(fontSize: 11)),
                      ],
                    ),
                    SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.check_circle, size: 14, color: AppTheme.successGreen),
                        SizedBox(width: 6),
                        Text('Pencocokan Nama & Wilayah RT/RW', style: TextStyle(fontSize: 11)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    try {
      final res = await ApiService.verifyDocument({
        'documentBase64': base64Content,
        'nik': _nikController.text.trim(),
        'namaLengkap': _namaLengkap.text.trim(),
        'nomorRt': _nomorRt.text.trim(),
        'nomorRw': _nomorRw.text.trim(),
        'namaKelurahan': _namaKelurahan.text.trim(),
      });

      if (mounted) Navigator.pop(context); // close loading dialog

      final isVerified = res['isVerified'] == true;
      final score = (res['confidenceScore'] as num?)?.toDouble() ?? 0.0;
      final errorReasons = (res['errorReasons'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];

      if (mounted) {
        setState(() {
          _isDocVerified = isVerified;
          _docConfidenceScore = score;

          if (!isVerified) {
            _legalitasDocBase64 = null;
            _legalitasDocPath = null;
          }
        });

        if (isVerified) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('🎉 ${res['summaryMessage'] ?? 'Dokumen SK RT Sah & Terverifikasi (Auto-Approved)'}'),
              backgroundColor: AppTheme.successGreen,
              duration: const Duration(seconds: 4),
            ),
          );
        } else {
          _showRejectionModal(errorReasons);
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // close loading dialog
        setState(() {
          _isDocVerified = false;
          _legalitasDocBase64 = null;
          _legalitasDocPath = null;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal verifikasi dokumen: $e'),
            backgroundColor: AppTheme.alertRed,
          ),
        );
      }
    }
  }

  void _showRejectionModal(List<String> reasons) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.error_outline_rounded, color: AppTheme.alertRed, size: 24),
            SizedBox(width: 8),
            Text('Dokumen Ditolak', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Dokumen yang Anda unggah tidak lolos verifikasi keaslian otomatis karena alasan berikut:',
              style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 12),
            ...reasons.map((r) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('• ', style: TextStyle(color: AppTheme.alertRed, fontWeight: FontWeight.bold)),
                  Expanded(child: Text(r, style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary))),
                ],
              ),
            )),
            const SizedBox(height: 12),
            const Text(
              'Silakan unggah kembali foto fisik dokumen asli yang memuat NIK & Nama Anda dengan pencahayaan jelas.',
              style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: AppTheme.textMuted),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.electricBlue,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Foto Ulang Dokumen'),
          ),
        ],
      ),
    );
  }

  void _removeLegalitasDoc() {
    setState(() {
      _legalitasDocBase64 = null;
      _legalitasDocPath = null;
      _isDocVerified = false;
      _docConfidenceScore = 0.0;
    });
  }

  /// Memulai alur pendaftaran dengan mengirimkan OTP terlebih dahulu
  void _startRegistrationWithOtp() async {
    final nama = _namaLengkap.text.trim();
    final phone = _phone.text.trim();
    final password = _password.text.trim();

    if (nama.isEmpty || phone.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Semua field bertanda * wajib diisi'),
          backgroundColor: AppTheme.alertRed,
        ),
      );
      return;
    }

    if (_nikDuplicateError != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ $_nikDuplicateError'),
          backgroundColor: AppTheme.alertRed,
        ),
      );
      return;
    }

    if (_selectedRole == 'RT') {
      if (_legalitasDocBase64 == null || !_isDocVerified) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('⚠️ Mohon upload & verifikasi Dokumen Legalitas / SK RT terlebih dahulu'),
            backgroundColor: AppTheme.alertRed,
          ),
        );
        return;
      }
    } else {
      if (_selectedRtId == null || _selectedRtId!.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pilih wilayah RT tempat tinggal Anda'),
            backgroundColor: AppTheme.alertRed,
          ),
        );
        return;
      }
      if (_noRumah.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Nomor rumah / blok wajib diisi'),
            backgroundColor: AppTheme.alertRed,
          ),
        );
        return;
      }
    }

    // Tampilkan Modal OTP Verification
    _showOtpVerificationModal();
  }

  void _showOtpVerificationModal() {
    String currentChannel = 'WHATSAPP';
    final otpController = TextEditingController();
    int secondsRemaining = 60;
    Timer? resendTimer;
    bool isSendingOtp = false;
    bool isVerifyingOtp = false;
    String? latestDemoOtp;

    void startTimer(StateSetter setModalState) {
      resendTimer?.cancel();
      secondsRemaining = 60;
      resendTimer = Timer.periodic(const Duration(seconds: 1), (t) {
        if (secondsRemaining > 0) {
          setModalState(() => secondsRemaining--);
        } else {
          t.cancel();
        }
      });
    }

    Future<void> sendOtpRequest(StateSetter setModalState) async {
      setModalState(() => isSendingOtp = true);
      final target = currentChannel == 'WHATSAPP' ? _phone.text.trim() : (_email.text.trim().isNotEmpty ? _email.text.trim() : _phone.text.trim());
      try {
        final res = await ApiService.sendOtp(target, channel: currentChannel);
        setModalState(() {
          isSendingOtp = false;
          latestDemoOtp = res['demoOtp'];
        });
        startTimer(setModalState);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('📲 ${res['message']}'),
              backgroundColor: AppTheme.successGreen,
            ),
          );
        }
      } catch (e) {
        setModalState(() => isSendingOtp = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Gagal kirim OTP: $e'),
              backgroundColor: AppTheme.alertRed,
            ),
          );
        }
      }
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (modalCtx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          if (latestDemoOtp == null && !isSendingOtp && secondsRemaining == 60) {
            sendOtpRequest(setModalState);
          }

          return Padding(
            padding: EdgeInsets.only(
              left: 24,
              right: 24,
              top: 24,
              bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Verifikasi Kode OTP',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () {
                        resendTimer?.cancel();
                        Navigator.pop(modalCtx);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Masukkan 6 digit kode OTP yang telah dikirimkan ke:',
                  style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 12),

                // Channel Selector Tabs
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          if (currentChannel != 'WHATSAPP') {
                            setModalState(() => currentChannel = 'WHATSAPP');
                            sendOtpRequest(setModalState);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                          decoration: BoxDecoration(
                            color: currentChannel == 'WHATSAPP' ? AppTheme.successGreen.withValues(alpha: 0.1) : Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: currentChannel == 'WHATSAPP' ? AppTheme.successGreen : AppTheme.slateBorder,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.phone_android, size: 16, color: currentChannel == 'WHATSAPP' ? AppTheme.successGreen : AppTheme.textSecondary),
                              const SizedBox(width: 6),
                              Text(
                                'WhatsApp',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: currentChannel == 'WHATSAPP' ? AppTheme.successGreen : AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          if (_email.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Isi kolom Email pada formulir untuk OTP via Email')),
                            );
                            return;
                          }
                          if (currentChannel != 'EMAIL') {
                            setModalState(() => currentChannel = 'EMAIL');
                            sendOtpRequest(setModalState);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                          decoration: BoxDecoration(
                            color: currentChannel == 'EMAIL' ? AppTheme.electricBlue.withValues(alpha: 0.1) : Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: currentChannel == 'EMAIL' ? AppTheme.electricBlue : AppTheme.slateBorder,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.email_outlined, size: 16, color: currentChannel == 'EMAIL' ? AppTheme.electricBlue : AppTheme.textSecondary),
                              const SizedBox(width: 6),
                              Text(
                                'Email',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: currentChannel == 'EMAIL' ? AppTheme.electricBlue : AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // OTP Input Field
                TextField(
                  controller: otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
                  decoration: InputDecoration(
                    hintText: '000000',
                    counterText: '',
                    filled: true,
                    fillColor: AppTheme.slateLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 10),

                // Demo Helper OTP code autofill button
                if (latestDemoOtp != null)
                  Center(
                    child: TextButton.icon(
                      onPressed: () {
                        otpController.text = latestDemoOtp!;
                      },
                      icon: const Icon(Icons.touch_app_rounded, size: 16, color: AppTheme.electricBlue),
                      label: Text(
                        'Isi Cepat Kode Demo: $latestDemoOtp',
                        style: const TextStyle(fontSize: 12, color: AppTheme.electricBlue, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),

                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      secondsRemaining > 0 ? 'Kirim ulang dalam ${secondsRemaining}s' : 'Tidak menerima kode?',
                      style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    TextButton(
                      onPressed: (secondsRemaining == 0 && !isSendingOtp)
                          ? () => sendOtpRequest(setModalState)
                          : null,
                      child: const Text('Kirim Ulang OTP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryNavy,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: isVerifyingOtp
                        ? null
                        : () async {
                            final code = otpController.text.trim();
                            if (code.length < 6) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Masukkan 6 digit kode OTP lengkap')),
                              );
                              return;
                            }

                            setModalState(() => isVerifyingOtp = true);
                            final target = currentChannel == 'WHATSAPP' ? _phone.text.trim() : (_email.text.trim().isNotEmpty ? _email.text.trim() : _phone.text.trim());

                            try {
                              await ApiService.verifyOtp(target, code);
                              resendTimer?.cancel();
                              if (modalCtx.mounted) {
                                Navigator.pop(modalCtx); // Close modal
                              }
                              if (mounted) {
                                _executeFinalRegistration(); // Submit registration
                              }
                            } catch (e) {
                              setModalState(() => isVerifyingOtp = false);
                              if (modalCtx.mounted) {
                                ScaffoldMessenger.of(modalCtx).showSnackBar(
                                  SnackBar(content: Text(e.toString().replaceAll('Exception:', '')), backgroundColor: AppTheme.alertRed),
                                );
                              }
                            }
                          },
                    child: isVerifyingOtp
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Verifikasi & Selesaikan Pendaftaran', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _executeFinalRegistration() async {
    setState(() => _isLoading = true);

    try {
      if (_selectedRole == 'RT') {
        final res = await ApiService.registerRT({
          'nik': _nikController.text.trim(),
          'namaLengkap': _namaLengkap.text.trim(),
          'phone': _phone.text.trim(),
          'email': _email.text.trim().isNotEmpty ? _email.text.trim() : null,
          'password': _password.text.trim(),
          'nomorRt': _nomorRt.text.trim(),
          'nomorRw': _nomorRw.text.trim(),
          'namaKelurahan': _namaKelurahan.text.trim(),
          'namaJalan': _namaJalan.text.trim(),
          'skDokumenUrl': _legalitasDocBase64,
        });

        if (res['accessToken'] != null) {
          await ApiService.saveToken(res['accessToken']);
          if (res['user'] != null) await ApiService.saveUserData(res['user']);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(res['message'] ?? 'RT Berhasil Didaftarkan!'),
                backgroundColor: AppTheme.successGreen,
              ),
            );
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (context) => const HomeScreen()),
              (route) => false,
            );
          }
        }
      } else {
        final res = await ApiService.registerWarga({
          'nik': _nikController.text.trim(),
          'namaLengkap': _namaLengkap.text.trim(),
          'phone': _phone.text.trim(),
          'email': _email.text.trim().isNotEmpty ? _email.text.trim() : null,
          'password': _password.text.trim(),
          'rtId': _selectedRtId,
          'noRumah': _noRumah.text.trim(),
          'noKk': _noKk.text.trim(),
        });

        if (res['accessToken'] != null) {
          await ApiService.saveToken(res['accessToken']);
          if (res['user'] != null) await ApiService.saveUserData(res['user']);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(res['message'] ?? 'Pendaftaran Warga Berhasil!'),
                backgroundColor: AppTheme.successGreen,
              ),
            );
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (context) => const HomeScreen()),
              (route) => false,
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        final err = e.toString().replaceAll('Exception:', '').trim();
        final isAlreadyRegistered = err.toLowerCase().contains('terdaftar') || err.toLowerCase().contains('sudah ada');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ $err'),
            backgroundColor: AppTheme.alertRed,
            duration: Duration(seconds: isAlreadyRegistered ? 6 : 4),
            action: isAlreadyRegistered
                ? SnackBarAction(
                    label: 'MASUK SEKARANG',
                    textColor: Colors.white,
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const LoginScreen()),
                      );
                    },
                  )
                : null,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isRt = _selectedRole == 'RT';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(isRt ? 'Pendaftaran Ketua RT' : 'Pendaftaran Warga Baru'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. TOP ROLE SELECTOR CARD BUTTONS
              const Text(
                'Daftar Sebagai:',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildRoleCard(
                      role: 'RT',
                      title: 'Ketua RT',
                      subtitle: 'Bentuk RT Baru',
                      icon: Icons.admin_panel_settings_rounded,
                      badgeColor: AppTheme.electricBlue,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildRoleCard(
                      role: 'WARGA',
                      title: 'Warga RT',
                      subtitle: 'Gabung RT Terdaftar',
                      icon: Icons.person_pin_rounded,
                      badgeColor: AppTheme.successGreen,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Info Card Banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isRt
                      ? AppTheme.electricBlue.withValues(alpha: 0.08)
                      : AppTheme.successGreen.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isRt
                        ? AppTheme.electricBlue.withValues(alpha: 0.25)
                        : AppTheme.successGreen.withValues(alpha: 0.25),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      isRt ? Icons.verified_user_rounded : Icons.home_work_rounded,
                      color: isRt ? AppTheme.electricBlue : AppTheme.successGreen,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        isRt
                            ? 'Pendaftaran mandiri Ketua RT dengan verifikasi keaslian dokumen SK RT via AI Forensik & OTP. Sistem otomatis mengaitkan RT dengan RW & Kelurahan.'
                            : 'Pendaftaran warga langsung terhubung dengan RT tempat tinggal Anda dengan verifikasi OTP cepat.',
                        style: TextStyle(
                          color: AppTheme.textPrimary.withValues(alpha: 0.85),
                          fontSize: 13,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // NIK KTP Field with Dukcapil parsing
              Text(
                isRt ? 'Data Identitas Ketua RT' : 'Data Identitas Warga',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _nikController,
                keyboardType: TextInputType.number,
                maxLength: 16,
                onChanged: _checkNik,
                decoration: InputDecoration(
                  labelText: 'Nomor Induk Kependudukan (NIK KTP) *',
                  hintText: '16 Digit NIK KTP Anda',
                  counterText: '',
                  prefixIcon: const Icon(Icons.badge_outlined),
                  suffixIcon: _isCheckingNik
                      ? const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : (_nikData != null && _nikData!.isValid && _nikDuplicateError == null)
                          ? const Icon(Icons.check_circle, color: AppTheme.successGreen)
                          : _nikDuplicateError != null
                              ? const Icon(Icons.error, color: AppTheme.alertRed)
                              : null,
                ),
              ),
              if (_nikDuplicateError != null) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.alertRed.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.alertRed.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: AppTheme.alertRed, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _nikDuplicateError!,
                          style: const TextStyle(color: AppTheme.alertRed, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              if (_nikData != null && _nikDuplicateError == null) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _nikData!.isValid
                        ? AppTheme.successGreen.withValues(alpha: 0.08)
                        : Colors.red.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: _nikData!.isValid
                          ? AppTheme.successGreen.withValues(alpha: 0.4)
                          : Colors.red.withValues(alpha: 0.4),
                      width: 1.2,
                    ),
                  ),
                  child: _nikData!.isValid
                      ? Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.verified_rounded, color: AppTheme.successGreen, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  'NIK Terverifikasi Sesuai Standar Dukcapil',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: AppTheme.successGreen,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppTheme.slateBorder),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on_outlined, size: 15, color: AppTheme.electricBlue),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          'Wilayah: ${_nikData!.kotaKabupaten ?? "-"}, ${_nikData!.provinsi ?? "-"}',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.cake_outlined, size: 15, color: AppTheme.electricBlue),
                                      const SizedBox(width: 6),
                                      Text(
                                        'Tgl Lahir: ${_nikData!.tanggalLahir ?? "-"} (${_nikData!.usia ?? 0} Thn)',
                                        style: const TextStyle(fontSize: 12),
                                      ),
                                      const Spacer(),
                                      const Icon(Icons.person_outline, size: 15, color: AppTheme.electricBlue),
                                      const SizedBox(width: 4),
                                      Text(
                                        _nikData!.jenisKelamin ?? "-",
                                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        )
                      : Text(
                          _nikData!.errorMessage ?? 'Format NIK tidak valid',
                          style: const TextStyle(color: Colors.red, fontSize: 12),
                        ),
                ),
              ],
              const SizedBox(height: 16),

              TextField(
                controller: _namaLengkap,
                decoration: InputDecoration(
                  labelText: isRt ? 'Nama Lengkap Ketua RT *' : 'Nama Lengkap Warga *',
                  hintText: isRt ? 'Contoh: Bpk. Hendra Gunawan' : 'Contoh: Bpk. Ahmad Fauzi',
                  prefixIcon: const Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'No. WhatsApp Aktif (Untuk OTP) *',
                  hintText: 'Contoh: 081234567890',
                  prefixIcon: Icon(Icons.phone_android_rounded),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Alamat Email (Opsional)',
                  hintText: 'Contoh: hendra@gmail.com',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _password,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Kata Sandi Akun *',
                  hintText: 'Minimal 6 karakter',
                  prefixIcon: Icon(Icons.lock_outline_rounded),
                ),
              ),

              // ================= SECTION KHUSUS KETUA RT =================
              if (isRt) ...[
                const SizedBox(height: 28),
                const Text(
                  'Struktur & Lokasi Wilayah RT',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _nomorRt,
                        decoration: const InputDecoration(
                          labelText: 'No. RT *',
                          hintText: '03',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _nomorRw,
                        decoration: const InputDecoration(
                          labelText: 'No. RW *',
                          hintText: '05',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _namaKelurahan,
                  decoration: const InputDecoration(
                    labelText: 'Kelurahan / Desa *',
                    hintText: 'Contoh: Sukamaju',
                    prefixIcon: Icon(Icons.location_city_rounded),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _namaJalan,
                  decoration: const InputDecoration(
                    labelText: 'Nama Jalan / Komplek / Gang Utama',
                    hintText: 'Contoh: Jl. Melati Raya Blok C',
                    prefixIcon: Icon(Icons.alt_route_rounded),
                  ),
                ),

                const SizedBox(height: 28),
                // UPLOAD DOKUMEN LEGALITAS SK RT
                Row(
                  children: [
                    const Icon(Icons.verified_outlined, color: AppTheme.electricBlue, size: 20),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Upload & Verifikasi Dokumen Legalitas SK RT *',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Sistem AI secara otomatis memverifikasi keaslian dokumen fisik, anti-AI generator, dan kecocokan NIK & Nama Anda.',
                  style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.3),
                ),
                const SizedBox(height: 12),

                if (_legalitasDocBase64 == null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.slateBorder, width: 1.5),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppTheme.electricBlue.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.document_scanner_rounded, size: 36, color: AppTheme.electricBlue),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Pindai Foto Dokumen SK Penetapan RT',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'AI Verification & Auto-Approval Active',
                          style: TextStyle(fontSize: 11, color: AppTheme.successGreen, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.electricBlue,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              ),
                              onPressed: () => _pickLegalitasDocument(ImageSource.camera),
                              icon: const Icon(Icons.camera_alt_rounded, size: 18),
                              label: const Text('Foto Kamera', style: TextStyle(fontSize: 13)),
                            ),
                            const SizedBox(width: 12),
                            OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppTheme.electricBlue),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              ),
                              onPressed: () => _pickLegalitasDocument(ImageSource.gallery),
                              icon: const Icon(Icons.photo_library_rounded, size: 18, color: AppTheme.electricBlue),
                              label: const Text('Pilih Galeri', style: TextStyle(fontSize: 13, color: AppTheme.electricBlue)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.successGreen, width: 1.5),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.verified_rounded, color: AppTheme.successGreen, size: 22),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Dokumen Sah & Auto-Approved',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.successGreen),
                                  ),
                                  Text(
                                    'Skor Keaslian AI: $_docConfidenceScore% • NIK & Nama Cocok',
                                    style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: AppTheme.alertRed),
                              onPressed: _removeLegalitasDoc,
                              tooltip: 'Hapus Dokumen',
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        if (_legalitasDocPath != null && !kIsWeb)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.file(
                              File(_legalitasDocPath!),
                              height: 140,
                              width: double.infinity,
                              fit: BoxFit.cover,
                            ),
                          ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton.icon(
                              onPressed: () => _pickLegalitasDocument(ImageSource.gallery),
                              icon: const Icon(Icons.sync_rounded, size: 16),
                              label: const Text('Pindai Ulang Dokumen'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
              ],

              // ================= SECTION KHUSUS WARGA =================
              if (!isRt) ...[
                const SizedBox(height: 28),
                const Text(
                  'Data Tempat Tinggal & Keluarga',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _noKk,
                  keyboardType: TextInputType.number,
                  maxLength: 16,
                  decoration: const InputDecoration(
                    labelText: 'Nomor Kartu Keluarga (No. KK)',
                    hintText: '16 Digit No. KK',
                    counterText: '',
                    prefixIcon: Icon(Icons.family_restroom_rounded),
                  ),
                ),
                const SizedBox(height: 16),

                // RT SELECTION
                const Text(
                  'Pilih Wilayah RT Tempat Tinggal *',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                _isLoadingRts
                    ? const Padding(
                        padding: EdgeInsets.all(12.0),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppTheme.slateBorder),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            isExpanded: true,
                            value: _selectedRtId,
                            hint: const Text('Pilih RT Terdaftar'),
                            items: _availableRts.map((item) {
                              final label = item['label'] ?? 'RT ${item['nomorRt']} / RW ${item['nomorRw']} - ${item['namaKelurahan']}';
                              return DropdownMenuItem<String>(
                                value: item['id'] as String,
                                child: Text(
                                  label,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              );
                            }).toList(),
                            onChanged: (val) {
                              setState(() => _selectedRtId = val);
                            },
                          ),
                        ),
                      ),
                const SizedBox(height: 16),

                TextField(
                  controller: _noRumah,
                  decoration: const InputDecoration(
                    labelText: 'Nomor Rumah / Blok *',
                    hintText: 'Contoh: Blok C3 No. 12',
                    prefixIcon: Icon(Icons.home_outlined),
                  ),
                ),
              ],

              const SizedBox(height: 32),

              // SUBMIT BUTTON (TRIGGERS OTP)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isRt ? AppTheme.electricBlue : AppTheme.successGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: _isLoading ? null : _startRegistrationWithOtp,
                  child: _isLoading
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          isRt ? 'Verifikasi OTP & Daftarkan RT' : 'Verifikasi OTP & Daftar Warga',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleCard({
    required String role,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color badgeColor,
  }) {
    final isSelected = _selectedRole == role;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedRole = role;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? badgeColor.withValues(alpha: 0.1) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? badgeColor : AppTheme.slateBorder,
            width: isSelected ? 2.5 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: badgeColor.withValues(alpha: 0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Column(
          children: [
            Stack(
              alignment: Alignment.topRight,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? badgeColor : Colors.grey.shade100,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    size: 28,
                    color: isSelected ? Colors.white : AppTheme.textSecondary,
                  ),
                ),
                if (isSelected)
                  Container(
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.check_circle, color: badgeColor, size: 18),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isSelected ? badgeColor : AppTheme.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 11,
                color: isSelected ? AppTheme.textPrimary : AppTheme.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

