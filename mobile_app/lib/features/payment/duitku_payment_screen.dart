import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../core/theme/app_theme.dart';

/// Layar Pembayaran In-App Duitku
/// Membuka gateway pembayaran (QRIS / Virtual Account / E-Wallet) langsung di dalam aplikasi RtHub.
class DuitkuPaymentScreen extends StatefulWidget {
  final String paymentUrl;
  final String title;
  final int? amount;
  final VoidCallback? onSuccess;

  const DuitkuPaymentScreen({
    super.key,
    required this.paymentUrl,
    this.title = 'Pembayaran Duitku',
    this.amount,
    this.onSuccess,
  });

  @override
  State<DuitkuPaymentScreen> createState() => _DuitkuPaymentScreenState();
}

class _DuitkuPaymentScreenState extends State<DuitkuPaymentScreen> {
  late final WebViewController _controller;
  int _loadingProgress = 0;
  bool _isLoading = true;
  bool _isSuccess = false;

  @override
  void initState() {
    super.initState();
    _initWebView();
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
          },
          onNavigationRequest: (request) async {
            final uri = Uri.parse(request.url);

            // Handle URL scheme eksternal (misal: e-wallet intent gojek://, shopeepay://, etc.)
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

    _controller.loadRequest(Uri.parse(widget.paymentUrl));
  }

  bool _checkRedirectUrl(String url) {
    final lower = url.toLowerCase();
    final uri = Uri.tryParse(url);
    final resultCode = uri?.queryParameters['resultCode'];
    final status = uri?.queryParameters['status']?.toLowerCase();

    final isReturnRedirect = lower.contains('payment-success') ||
        lower.contains('duitku-finish') ||
        lower.contains('rthub.id/payment-success') ||
        lower.contains('rthub.id');

    if (!isReturnRedirect && resultCode == null && status == null) {
      return false;
    }

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
    final isSuccess = resultCode == '00' ||
        status == 'success' ||
        lower.contains('resultcode=00') ||
        lower.contains('status=success');

    if (isSuccess) {
      if (!_isSuccess) {
        _isSuccess = true;
        _showSuccessDialog();
      }
      return true;
    }

    if (isReturnRedirect) {
      // Default jika diarahkan ke payment-success tanpa kode error
      if (resultCode == null && status == null) {
        if (!_isSuccess) {
          _isSuccess = true;
          _showSuccessDialog();
        }
      } else {
        _showCanceledDialog();
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
              'Transaksi pembayaran telah dibatalkan atau tidak diselesaikan. Tagihan / langganan belum diperpanjang.',
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
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
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.primaryNavy),
            tooltip: 'Muat Ulang',
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
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
    );
  }

  void _confirmExit() async {
    final leave = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Batalkan pembayaran?'),
        content: const Text(
          'Jika Anda belum menyelesaikan proses transaksi di gateway, status layanan belum akan aktif.',
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
            child: const Text('Keluar'),
          ),
        ],
      ),
    );

    if (leave == true && mounted) {
      Navigator.pop(context, false);
    }
  }
}
