import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class TarikKasScreen extends StatefulWidget {
  const TarikKasScreen({super.key});

  @override
  State<TarikKasScreen> createState() => _TarikKasScreenState();
}

class _TarikKasScreenState extends State<TarikKasScreen> {
  final _nominalController = TextEditingController();
  final _noRekController = TextEditingController();
  final _namaPemilikController = TextEditingController();

  String _selectedBank = 'BCA';
  double _saldoKas = 0.0;
  bool _isLoading = true;
  bool _isSubmitting = false;
  List<dynamic> _riwayat = [];

  final List<String> _bankList = [
    'BCA',
    'Mandiri',
    'BRI',
    'BNI',
    'BSI',
    'Bank DKI',
    'Bank BJB',
    'CIMB Niaga',
    'Permata',
    'Lainnya',
  ];

  static const double _biayaAdmin = 6000.0; // Biaya Layanan Penarikan Rp 6.000

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  bool _isBendahara = true;

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final userData = await ApiService.getUserData();
      final role = userData?['role']?.toString().toUpperCase() ?? '';
      final isBendahara = role == 'BENDAHARA_RT' || role == 'BENDAHARA';

      final kasData = await ApiService.getKasSummary();
      final history = await ApiService.getRiwayatPenarikan();

      if (mounted) {
        setState(() {
          _isBendahara = isBendahara;
          _saldoKas = (kasData['saldoKas'] as num?)?.toDouble() ?? 0.0;
          _riwayat = history;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  String _formatRupiah(num val) {
    return 'Rp ${val.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
  }

  void _handleSubmit() async {
    if (!_isBendahara) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Akses Ditolak: Hanya Bendahara RT yang berwenang mengajukan penarikan dana kas.'),
          backgroundColor: AppTheme.alertRed,
        ),
      );
      return;
    }

    final nominal = double.tryParse(_nominalController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0.0;
    final noRek = _noRekController.text.trim();
    final nama = _namaPemilikController.text.trim();

    if (nominal < 20000) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nominal penarikan minimal Rp 20.000'),
          backgroundColor: AppTheme.alertRed,
        ),
      );
      return;
    }

    final totalDipotong = nominal + _biayaAdmin;
    if (totalDipotong > _saldoKas) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Saldo kas (${_formatRupiah(_saldoKas)}) tidak mencukupi untuk penarikan ${_formatRupiah(totalDipotong)}'),
          backgroundColor: AppTheme.alertRed,
        ),
      );
      return;
    }

    if (noRek.isEmpty || nama.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nomor rekening dan nama pemilik wajib diisi'),
          backgroundColor: AppTheme.alertRed,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final res = await ApiService.ajukanPenarikanKas({
        'bankName': _selectedBank,
        'nomorRekening': noRek,
        'namaPemilik': nama,
        'nominalTarik': nominal.toInt(),
      });

      if (!mounted) return;

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppTheme.successGreen, size: 28),
              SizedBox(width: 10),
              Text('Pengajuan Diterima!'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(res['message'] ?? 'Pengajuan penarikan dana kas RT berhasil dikirim.'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.slateLight,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Rekening Tujuan:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                        Text('$_selectedBank - $noRek', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Atas Nama:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                        Text(nama, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Nominal Dana:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                        Text(_formatRupiah(nominal), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Biaya Layanan:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                        Text(_formatRupiah(_biayaAdmin), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.alertRed)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                _nominalController.clear();
                _loadData();
              },
              child: const Text('Mengerti'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mengajukan penarikan: $e'),
            backgroundColor: AppTheme.alertRed,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final nominalVal = double.tryParse(_nominalController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0.0;
    final totalDipotong = nominalVal > 0 ? (nominalVal + _biayaAdmin) : 0.0;
    final isExceed = totalDipotong > _saldoKas;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Pencairan Dana Kas RT'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Saldo Banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0F5132), Color(0xFF198754)],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF198754).withValues(alpha: 0.25),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Saldo Kas RT Tersedia',
                                style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _formatRupiah(_saldoKas),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Dana iuran warga yang dapat dicairkan ke rekening bank resmi pengurus',
                            style: TextStyle(color: Colors.white60, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    if (!_isBendahara) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFECACA)),
                        ),
                        child: const Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.lock_person_rounded, color: AppTheme.alertRed, size: 22),
                            SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Akses Terbatas: Khusus Bendahara RT',
                                    style: TextStyle(color: AppTheme.alertRed, fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(height: 3),
                                  Text(
                                    'Akun Anda saat ini bukan sebagai Bendahara RT. Formulir pengajuan pencairan saldo kas RT dinonaktifkan.',
                                    style: TextStyle(color: Color(0xFF991B1B), fontSize: 11, height: 1.3),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],

                    // Form Penarikan
                    const Text('Formulir Permohonan Pencairan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),

                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.slateBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Pilih Bank Tujuan *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            decoration: BoxDecoration(
                              color: AppTheme.slateLight,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppTheme.slateBorder),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedBank,
                                isExpanded: true,
                                items: _bankList
                                    .map((b) => DropdownMenuItem(value: b, child: Text(b, style: const TextStyle(fontWeight: FontWeight.bold))))
                                    .toList(),
                                onChanged: (v) {
                                  if (v != null) setState(() => _selectedBank = v);
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          TextField(
                            controller: _noRekController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              labelText: 'Nomor Rekening Kas RT *',
                              hintText: 'Contoh: 8870123456',
                              prefixIcon: Icon(Icons.credit_card_rounded),
                            ),
                          ),
                          const SizedBox(height: 16),

                          TextField(
                            controller: _namaPemilikController,
                            decoration: const InputDecoration(
                              labelText: 'Nama Pemilik Rekening *',
                              hintText: 'Sesuai dengan buku tabungan pengurus',
                              prefixIcon: Icon(Icons.person_outline),
                            ),
                          ),
                          const SizedBox(height: 16),

                          TextField(
                            controller: _nominalController,
                            keyboardType: TextInputType.number,
                            onChanged: (_) => setState(() {}),
                            decoration: const InputDecoration(
                              labelText: 'Nominal Pencairan *',
                              hintText: 'Contoh: 1500000',
                              prefixIcon: Icon(Icons.payments_outlined),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Calculation Box
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppTheme.slateLight,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppTheme.slateBorder),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Dana Diterima Rekening:', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                    Text(_formatRupiah(nominalVal), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Biaya Layanan Penarikan:', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                    Text(_formatRupiah(_biayaAdmin), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.alertRed)),
                                  ],
                                ),
                                const Divider(height: 16),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Total Saldo Kas Dipotong:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                    Text(
                                      _formatRupiah(totalDipotong),
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w800,
                                        color: isExceed ? AppTheme.alertRed : const Color(0xFF0F5132),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          if (isExceed) ...[
                            const SizedBox(height: 8),
                            const Text(
                              '⚠️ Total potongan melebihi saldo kas RT yang tersedia!',
                              style: TextStyle(color: AppTheme.alertRed, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                          const SizedBox(height: 20),

                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0F5132),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              onPressed: (_isSubmitting || !_isBendahara || nominalVal < 20000 || isExceed || _noRekController.text.trim().isEmpty || _namaPemilikController.text.trim().isEmpty)
                                  ? null
                                  : _handleSubmit,
                              child: _isSubmitting
                                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                  : Text(
                                      !_isBendahara ? 'Hanya Bendahara RT yang Berhak Menarik' : 'Kirim Pengajuan Pencairan Kas',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Riwayat Pengajuan
                    const Text('Riwayat Pengajuan Pencairan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),

                    if (_riwayat.isEmpty)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.slateBorder),
                        ),
                        child: const Center(
                          child: Text(
                            'Belum ada riwayat permohonan pencairan kas.',
                            style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                          ),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _riwayat.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (ctx, idx) {
                          final item = _riwayat[idx];
                          final isApproved = item['status'] == 'APPROVED';
                          final isPending = item['status'] == 'MENUNGGU_APPROVAL';

                          return Container(
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
                                    Text(
                                      '${item['bankName']} - ${item['nomorRekening']}',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isApproved
                                            ? AppTheme.successGreen.withValues(alpha: 0.1)
                                            : isPending
                                            ? AppTheme.warningAmber.withValues(alpha: 0.1)
                                            : AppTheme.alertRed.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        isApproved ? '✓ CAIR' : isPending ? 'MENUNGGU' : 'DITOLAK',
                                        style: TextStyle(
                                          color: isApproved ? AppTheme.successGreen : isPending ? AppTheme.warningAmber : AppTheme.alertRed,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'a/n ${item['namaPemilik']} • ${_formatRupiah((item['nominalTarik'] as num?)?.toDouble() ?? 0)}',
                                  style: const TextStyle(fontSize: 13, color: AppTheme.textPrimary, fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Biaya Admin: ${_formatRupiah((item['biayaAdmin'] as num?)?.toDouble() ?? 6000)} (Total Potong: ${_formatRupiah((item['totalDipotong'] as num?)?.toDouble() ?? 0)})',
                                  style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                ),
                                if (item['catatanApproval'] != null) ...[
                                  const SizedBox(height: 6),
                                  Text(
                                    'Catatan: ${item['catatanApproval']}',
                                    style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppTheme.textSecondary),
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}
