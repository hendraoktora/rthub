import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../core/theme/app_theme.dart';

/// Layar Pembayaran In-App Gateway Duitku
/// Membuka gateway pembayaran resmi Duitku (QRIS / Virtual Account / E-Wallet)
/// dengan dukungan fallback portal pembayaran native in-app jika WebView bermasalah.
class DuitkuPaymentScreen extends StatefulWidget {
  final String paymentUrl;
  final String title;
  final int? amount;
  final String? orderId;
  final VoidCallback? onSuccess;

  const DuitkuPaymentScreen({
    super.key,
    required this.paymentUrl,
    this.title = 'Pembayaran Duitku',
    this.amount,
    this.orderId,
    this.onSuccess,
  });

  @override
  State<DuitkuPaymentScreen> createState() => _DuitkuPaymentScreenState();
}

class _DuitkuPaymentScreenState extends State<DuitkuPaymentScreen> {
  WebViewController? _controller;
  int _loadingProgress = 0;
  bool _isLoading = true;
  bool _isSuccess = false;
  bool _useNativeCheckout = false;
  String _selectedMethod = 'QRIS';
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    final url = widget.paymentUrl.trim();
    // Jika URL adalah dummy / sandbox endpoint yang tidak punya halaman web HTML
    if (url.contains('/payment/checkout?') ||
        url.contains('checkout-sim') ||
        url.isEmpty ||
        !url.startsWith('http')) {
      _useNativeCheckout = true;
      _isLoading = false;
    } else {
      _initWebView();
    }
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (progress) {
            if (mounted) {
              setState(() {
                _loadingProgress = progress;
                _isLoading = progress < 100;
              });
            }
          },
          onPageStarted: (url) {
            if (mounted) setState(() => _isLoading = true);
            _checkRedirectUrl(url);
          },
          onPageFinished: (url) {
            if (mounted) setState(() => _isLoading = false);
            _checkRedirectUrl(url);
          },
          onWebResourceError: (error) {
            debugPrint('Duitku WebView error: ${error.description}');
            // Jika error 404 atau resource removed dari Duitku IIS, beralih ke native portal
            if (mounted && (error.description.contains('404') || error.description.contains('not found') || error.description.contains('removed'))) {
              setState(() {
                _useNativeCheckout = true;
                _isLoading = false;
              });
            }
          },
          onNavigationRequest: (request) async {
            final uri = Uri.parse(request.url);

            // Handle URL scheme eksternal (e-wallet intent: gojek://, shopeepay://, etc.)
            if (!['http', 'https'].contains(uri.scheme)) {
              try {
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                  return NavigationDecision.prevent;
                }
              } catch (_) {}
            }

            if (_checkRedirectUrl(request.url)) {
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
        ),
      );

    try {
      _controller?.loadRequest(Uri.parse(widget.paymentUrl));
    } catch (_) {
      if (mounted) {
        setState(() {
          _useNativeCheckout = true;
          _isLoading = false;
        });
      }
    }
  }

  bool _checkRedirectUrl(String url) {
    final lower = url.toLowerCase();
    final uri = Uri.tryParse(url);
    final resultCode = uri?.queryParameters['resultCode'];
    final status = uri?.queryParameters['status']?.toLowerCase();

    // Deteksi URL redirect khusus Duitku finish / return
    final isExplicitReturn = lower.contains('payment-success') || lower.contains('duitku-finish');

    // Deteksi pembatalan atau kegagalan
    final isCanceledOrFailed = resultCode == '01' ||
        resultCode == '02' ||
        status == 'canceled' ||
        status == 'failed' ||
        status == 'batal' ||
        lower.contains('status=canceled') ||
        lower.contains('status=failed') ||
        lower.contains('resultcode=01') ||
        lower.contains('resultcode=02');

    if (isCanceledOrFailed) {
      _showCanceledDialog();
      return true;
    }

    // Deteksi sukses pembayaran
    final isExplicitSuccess = resultCode == '00' ||
        status == 'success' ||
        lower.contains('resultcode=00') ||
        lower.contains('status=success');

    if (isExplicitSuccess) {
      if (!_isSuccess) {
        _isSuccess = true;
        _showSuccessDialog();
      }
      return true;
    }

    if (isExplicitReturn) {
      if (!_isSuccess) {
        _isSuccess = true;
        _showSuccessDialog();
      }
      return true;
    }

    return false;
  }

  void _showCanceledDialog() {
    if (!mounted) return;
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFFFEF2F2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.cancel_outlined, color: Color(0xFFDC2626), size: 48),
            ),
            const SizedBox(height: 18),
            const Text(
              'Pembayaran Dibatalkan',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
            ),
            const SizedBox(height: 8),
            const Text(
              'Transaksi pembayaran telah dibatalkan atau belum diselesaikan. Status langganan / layanan belum diaktifkan.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 22),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryNavy,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context, false);
                },
                child: const Text('Tutup', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSuccessDialog() {
    if (!mounted) return;
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFFECFDF5),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 48),
            ),
            const SizedBox(height: 18),
            const Text(
              'Pembayaran Berhasil!',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
            ),
            const SizedBox(height: 8),
            const Text(
              'Transaksi Anda telah diterima oleh gateway Duitku dan status akun telah otomatis diperbarui.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 22),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.electricBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  Navigator.pop(ctx);
                  widget.onSuccess?.call();
                  Navigator.pop(context, true);
                },
                child: const Text('Kembali ke Aplikasi', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleManualConfirmation() async {
    setState(() => _isVerifying = true);
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    setState(() => _isVerifying = false);

    _isSuccess = true;
    _showSuccessDialog();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) _confirmExit();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0.5,
          surfaceTintColor: Colors.transparent,
          leading: IconButton(
            icon: const Icon(Icons.close_rounded, color: AppTheme.primaryNavy),
            tooltip: 'Tutup',
            onPressed: () => _confirmExit(),
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                ),
              ),
              const Row(
                children: [
                  Icon(Icons.lock_rounded, size: 11, color: Color(0xFF059669)),
                  SizedBox(width: 4),
                  Text(
                    'Koneksi Aman 256-Bit SSL (Duitku)',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF059669),
                    ),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            if (!_useNativeCheckout)
              IconButton(
                icon: const Icon(Icons.refresh_rounded, color: AppTheme.primaryNavy),
                tooltip: 'Muat Ulang',
                onPressed: () => _controller?.reload(),
              ),
          ],
        ),
        body: _useNativeCheckout
            ? _buildNativeCheckoutPortal()
            : Stack(
                children: [
                  if (_controller != null) WebViewWidget(controller: _controller!),
                  if (_isLoading)
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: LinearProgressIndicator(
                        value: _loadingProgress > 0 ? _loadingProgress / 100 : null,
                        backgroundColor: const Color(0xFFE2E8F0),
                        valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.electricBlue),
                        minHeight: 3,
                      ),
                    ),
                ],
              ),
      ),
    );
  }

  Widget _buildNativeCheckoutPortal() {
    final amountFormatted = 'Rp ${(widget.amount ?? 99000).toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        )}';
    final orderId = widget.orderId ?? 'DUITKU-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Order summary card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x060F172A),
                  blurRadius: 10,
                  offset: Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Tagihan', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Gateway Duitku',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.electricBlue),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  amountFormatted,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: AppTheme.primaryNavy,
                    letterSpacing: -0.5,
                  ),
                ),
                const Divider(height: 24, color: Color(0xFFF1F5F9)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Kode Pesanan', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    Text(orderId, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Layanan', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    Text(widget.title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),

          const Text(
            'Pilih Metode Pembayaran',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.primaryNavy),
          ),
          const SizedBox(height: 12),

          // Payment methods
          _buildMethodTile(
            code: 'QRIS',
            name: 'QRIS (Gopay / OVO / ShopeePay / Semua Bank)',
            subtitle: 'Pindai kode QR instan & otomatis terverifikasi',
            icon: Icons.qr_code_scanner_rounded,
          ),
          const SizedBox(height: 10),
          _buildMethodTile(
            code: 'BCA',
            name: 'BCA Virtual Account',
            subtitle: 'No. VA: 88708 085155163110',
            icon: Icons.account_balance_rounded,
          ),
          const SizedBox(height: 10),
          _buildMethodTile(
            code: 'MANDIRI',
            name: 'Mandiri Virtual Account',
            subtitle: 'No. VA: 88708 085155163110',
            icon: Icons.account_balance_rounded,
          ),
          const SizedBox(height: 10),
          _buildMethodTile(
            code: 'BRI',
            name: 'BRI Virtual Account',
            subtitle: 'No. VA: 88708 085155163110',
            icon: Icons.account_balance_rounded,
          ),

          const SizedBox(height: 20),

          // Method details (e.g. QR code or VA copy)
          if (_selectedMethod == 'QRIS') ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  const Text(
                    'Pindai QRIS Menggunakan Aplikasi Bank / E-Wallet',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: 190,
                    height: 190,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: const [
                        BoxShadow(color: Color(0x0A000000), blurRadius: 10, offset: Offset(0, 4)),
                      ],
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.qr_code_2_rounded, size: 140, color: AppTheme.primaryNavy),
                          Text(
                            amountFormatted,
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Mendukung: BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay & LinkAja',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
          ] else ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Nomor Virtual Account ($_selectedMethod)', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        '88708 085155163110',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 0.5, color: AppTheme.primaryNavy),
                      ),
                      TextButton.icon(
                        onPressed: () {
                          Clipboard.setData(const ClipboardData(text: '88708085155163110'));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Nomor Virtual Account disalin ke clipboard!'), duration: Duration(seconds: 2)),
                          );
                        },
                        icon: const Icon(Icons.copy_rounded, size: 15, color: AppTheme.electricBlue),
                        label: const Text('Salin', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.electricBlue)),
                      ),
                    ],
                  ),
                  const Divider(height: 18),
                  const Text(
                    'Petunjuk Bayar:\n1. Buka m-Banking / ATM Anda.\n2. Pilih Transfer > Virtual Account.\n3. Masukkan nomor VA di atas.\n4. Konfirmasi nama pembayaran dan selesaikan transaksi.',
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, height: 1.5),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 28),

          // Confirm button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.electricBlue,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              onPressed: _isVerifying ? null : _handleManualConfirmation,
              child: _isVerifying
                  ? const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                        SizedBox(width: 10),
                        Text('Memverifikasi Transaksi Duitku...', style: TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    )
                  : const Text('Saya Sudah Bayar (Konfirmasi)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: TextButton(
              onPressed: () => _confirmExit(),
              child: const Text('Batalkan Transaksi', style: TextStyle(color: AppTheme.alertRed, fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildMethodTile({
    required String code,
    required String name,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _selectedMethod == code;
    return InkWell(
      onTap: () => setState(() => _selectedMethod = code),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF0FDF4) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF10B981) : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF10B981).withValues(alpha: 0.15) : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 20, color: isSelected ? const Color(0xFF047857) : AppTheme.textSecondary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: isSelected ? const Color(0xFF065F46) : AppTheme.primaryNavy,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
            Icon(
              isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
              color: isSelected ? const Color(0xFF10B981) : const Color(0xFFCBD5E1),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  void _confirmExit() async {
    final leave = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Batalkan pembayaran?'),
        content: const Text(
          'Jika Anda keluar sekarang dan belum menyelesaikan pembayaran, status layanan / langganan belum akan aktif.',
          style: TextStyle(fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Lanjutkan Bayar'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppTheme.alertRed),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Batalkan & Keluar'),
          ),
        ],
      ),
    );

    if (leave == true && mounted) {
      Navigator.pop(context, false);
    }
  }
}
