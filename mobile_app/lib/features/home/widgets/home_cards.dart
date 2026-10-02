import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_cache_helper.dart';
import '../../../core/widgets/admob_banner_widget.dart';
import '../../../core/widgets/hub_motion.dart';

String hubRupiah(Object? amount) {
  final value = num.tryParse(amount?.toString() ?? '');
  if (value == null) return '—';
  return 'Rp ${value.round().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
}

class HomeKasCard extends StatelessWidget {
  const HomeKasCard({
    super.key,
    required this.summary,
    required this.rt,
    required this.invoices,
    required this.onDetails,
    required this.onInvoices,
    this.scrollTilt = 0,
    this.loading = false,
  });
  final Map<String, dynamic>? summary;
  final String rt;
  final List<dynamic>? invoices;
  final VoidCallback onDetails;
  final VoidCallback onInvoices;
  final double scrollTilt;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final outstanding = invoices
        ?.where(
          (item) => ![
            'PAID',
            'LUNAS',
            'CANCELLED',
            'DIBATALKAN',
          ].contains(item['status']?.toString().toUpperCase()),
        )
        .toList();
    final hasUnpaid = outstanding != null && outstanding.isNotEmpty;
    final isAllPaid = invoices != null && invoices!.isNotEmpty && !hasUnpaid;

    final cardBgColor = hasUnpaid
        ? const Color(0xFFFFFBEB) // Dynamic Warm Amber / Kuning Peringatan
        : const Color(0xFFE7F6EF); // Fresh Mint Green
    final primaryAccent = hasUnpaid
        ? const Color(0xFFD97706)
        : const Color(0xFF087252);

    final billLabel = invoices == null
        ? 'Iuran belum dimuat'
        : hasUnpaid
        ? '${outstanding.length} tagihan belum dibayar'
        : invoices!.isEmpty
        ? 'Belum ada tagihan'
        : 'Semua iuran sudah lunas';

    return TiltCard(
      scrollTilt: scrollTilt,
      child: _HomeSurface(
        color: cardBgColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hasUnpaid ? 'TAGIHAN KAS & IURAN / RT $rt' : 'BUKU KAS / RT $rt',
                        style: _eyebrow.copyWith(
                          color: primaryAccent,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        hasUnpaid
                            ? 'Iuran bulan ini belum lunas.\nYuk, dukung kas RT!'
                            : 'Dikelola bersama.\nTerbuka untuk semua.',
                        style: const TextStyle(
                          fontSize: 17,
                          height: 1.15,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryNavy,
                        ),
                      ),
                    ],
                  ),
                ),
                const ExcludeSemantics(
                  child: ClayIllustration(kind: ClayKind.coins, size: 72),
                ),
              ],
            ),
            const Spacer(),
            Text(
              loading && summary == null
                  ? 'Memuat saldo…'
                  : summary == null
                  ? 'Saldo belum tersedia'
                  : 'Saldo kas lingkungan',
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                hubRupiah(summary?['saldoKas']),
                style: const TextStyle(
                  fontSize: 30,
                  height: 1.15,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -1.2,
                  color: AppTheme.primaryNavy,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 14,
              runSpacing: 4,
              children: [
                Text(
                  '↓ ${hubRupiah(summary?['totalPemasukan'])}',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: primaryAccent,
                  ),
                ),
                Text(
                  '↑ ${hubRupiah(summary?['totalPengeluaran'])}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
            const Spacer(),
            Row(
              children: [
                Expanded(
                  child: TextButton.icon(
                    onPressed: onInvoices,
                    style: TextButton.styleFrom(
                      alignment: Alignment.centerLeft,
                      padding: EdgeInsets.zero,
                      foregroundColor: primaryAccent,
                    ),
                    icon: Icon(
                      hasUnpaid ? Icons.warning_amber_rounded : Icons.receipt_long_rounded,
                      size: 15,
                    ),
                    label: Text(
                      billLabel,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                if (hasUnpaid) ...[
                  ElevatedButton.icon(
                    onPressed: onInvoices,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryAccent,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
                      visualDensity: VisualDensity.compact,
                    ),
                    icon: const Icon(Icons.payments_rounded, size: 13),
                    label: const Text(
                      'Bayar Kas',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 4),
                ] else if (isAllPaid) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD1FAE5),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF059669)),
                        SizedBox(width: 4),
                        Text(
                          'LUNAS',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 4),
                ],
                IconButton.filledTonal(
                  onPressed: onDetails,
                  tooltip: 'Lihat rincian buku kas',
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppTheme.primaryNavy,
                    visualDensity: VisualDensity.compact,
                  ),
                  icon: const Icon(Icons.north_east_rounded, size: 18),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class HomeQuakeCard extends StatelessWidget {
  const HomeQuakeCard({
    super.key,
    required this.data,
    required this.onTap,
    this.scrollTilt = 0,
  });
  final Map<String, dynamic>? data;
  final VoidCallback onTap;
  final double scrollTilt;

  @override
  Widget build(BuildContext context) {
    return TiltCard(
      scrollTilt: scrollTilt,
      child: _HomeSurface(
        color: const Color(0xFFEAF0FF),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'PANTAU GEMPA / BMKG',
                    style: _eyebrow.copyWith(color: AppTheme.electricBlue),
                  ),
                ),
                const Icon(
                  Icons.sensors_rounded,
                  color: AppTheme.electricBlue,
                  size: 20,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          data == null ? '—' : 'M ${data!['Magnitude'] ?? '—'}',
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -1.5,
                          ),
                        ),
                        Text(
                          data == null
                              ? 'Data belum tersedia'
                              : 'Kedalaman ${data!['Kedalaman'] ?? '—'}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const ExcludeSemantics(
                    child: ClayIllustration(kind: ClayKind.quake, size: 86),
                  ),
                ],
              ),
            ),
            Text(
              data?['Wilayah']?.toString() ??
                  'Informasi gempa terbaru dari BMKG.',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 15,
                height: 1.25,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              data?['Potensi']?.toString() ??
                  'Tarik halaman untuk mencoba lagi.',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: Text(
                    data == null
                        ? 'Sumber: BMKG'
                        : '${data!['Tanggal'] ?? ''} · ${data!['Jam'] ?? ''}',
                    maxLines: 2,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: onTap,
                  tooltip: 'Buka informasi gempa BMKG',
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppTheme.electricBlue,
                  ),
                  icon: const Icon(Icons.north_east_rounded, size: 20),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class HomeSubscriptionCard extends StatelessWidget {
  const HomeSubscriptionCard({
    super.key,
    required this.membership,
    required this.onUpgrade,
    this.scrollTilt = 0,
  });

  final Map<String, dynamic>? membership;
  final VoidCallback onUpgrade;
  final double scrollTilt;

  @override
  Widget build(BuildContext context) {
    final sub = membership?['subscription'] as Map<String, dynamic>?;
    final isPro = sub?['isPro'] == true;
    final sisaHari = sub?['sisaHari'] as int? ?? 7;
    final isExpiringSoon = sub?['isExpiringSoon'] == true || sisaHari <= 3;
    final isExpired = sub?['isExpired'] == true || sisaHari <= 0;
    final untilStr = sub?['activeUntil']?.toString() ?? sub?['expiredAt']?.toString();
    DateTime? untilDate = untilStr != null ? DateTime.tryParse(untilStr) : null;
    final untilFormatted = untilDate != null
        ? '${untilDate.day} ${_monthName(untilDate.month)} ${untilDate.year}'
        : 'Tidak Terbatas';

    return TiltCard(
      scrollTilt: scrollTilt,
      child: _HomeSurface(
        color: Colors.white,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: (isPro ? AppTheme.electricBlue : Colors.grey.shade600).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        isPro ? Icons.workspace_premium_rounded : Icons.account_circle_outlined,
                        color: isPro ? AppTheme.electricBlue : Colors.grey.shade700,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 9),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isPro ? 'RTHub Pro (Pengurus RT)' : 'RTHub Basic (Pengurus RT)',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Paket Layanan Lingkungan RT',
                          style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: isPro
                        ? (isExpiringSoon
                            ? AppTheme.warningAmber.withValues(alpha: 0.12)
                            : AppTheme.successGreen.withValues(alpha: 0.12))
                        : (isExpired
                            ? AppTheme.alertRed.withValues(alpha: 0.12)
                            : Colors.grey.shade100),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    isPro
                        ? (isExpiringSoon ? '⚠️ Sisa $sisaHari Hari' : '✓ AKTIF')
                        : (isExpired ? '✕ KEDALUWARSA' : 'GRATIS'),
                    style: TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.w800,
                      color: isPro
                          ? (isExpiringSoon ? AppTheme.warningAmber : AppTheme.successGreen)
                          : (isExpired ? AppTheme.alertRed : Colors.grey.shade700),
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 20, color: Color(0xFFF1F5F9)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Masa Aktif Layanan', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
                    const SizedBox(height: 3),
                    Text(
                      isPro ? untilFormatted : 'Masa aktif habis',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('Sisa Durasi', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
                    const SizedBox(height: 3),
                    Text(
                      isPro ? '$sisaHari Hari Tersisa' : '0 Hari',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: isExpiringSoon ? AppTheme.warningAmber : AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.electricBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                onPressed: onUpgrade,
                icon: const Icon(Icons.autorenew_rounded, size: 16),
                label: const Text(
                  'Perpanjang Masa Aktif (Rp 99.000 / bln)',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 5),
            const Center(
              child: Text(
                '💡 Sisa hari Anda saat ini akan diakumulasikan (+30 hari).',
                style: TextStyle(fontSize: 9.5, color: AppTheme.textSecondary, fontStyle: FontStyle.italic),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _monthName(int m) {
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return m >= 1 && m <= 12 ? months[m] : '';
  }
}

class HomeAdMobCard extends StatelessWidget {
  const HomeAdMobCard({
    super.key,
    this.scrollTilt = 0,
  });

  final double scrollTilt;

  @override
  Widget build(BuildContext context) {
    return TiltCard(
      scrollTilt: scrollTilt,
      child: _HomeSurface(
        color: const Color(0xFFFAFAFA),
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.ads_click_rounded, size: 12, color: Color(0xFF475569)),
                      SizedBox(width: 4),
                      Text(
                        'SPONSOR RESMI GOOGLE',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF475569),
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                const Text(
                  'AdMob by Google',
                  style: TextStyle(
                    fontSize: 9,
                    color: AppTheme.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Expanded(
              child: Center(
                child: ClipRRect(
                  borderRadius: const BorderRadius.all(Radius.circular(12)),
                  child: AdMobBannerWidget(
                    padding: EdgeInsets.zero,
                    adSize: AdSize.mediumRectangle,
                    customFallback: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.electricBlue.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.campaign_rounded, size: 28, color: AppTheme.electricBlue),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Ruang Iklan & Sponsor Google',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppTheme.primaryNavy),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Menjangkau ribuan warga RT & lingkungan sekitar secara tepat sasaran',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 10.5, color: AppTheme.textSecondary, height: 1.3),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Tayangan sponsor membantu kelancaran server & operasional RT digital',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 9.5,
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HomeProductCard extends StatelessWidget {
  const HomeProductCard({
    super.key,
    required this.item,
    required this.onOpen,
    required this.onOrder,
  });
  final Map<String, dynamic> item;
  final VoidCallback onOpen;
  final VoidCallback onOrder;

  String? get _photo {
    final raw = item['fotoUrl'];
    if (raw is List && raw.isNotEmpty) return raw.first.toString();
    if (raw is! String || raw.isEmpty) return null;
    if (raw.startsWith('[')) {
      try {
        final decoded = jsonDecode(raw);
        if (decoded is List && decoded.isNotEmpty)
          return decoded.first.toString();
      } catch (_) {
        return null;
      }
    }
    return raw.split('|||').first;
  }

  @override
  Widget build(BuildContext context) {
    final seller =
        item['seller']?['profile']?['namaLengkap'] ??
        item['user']?['profile']?['namaLengkap'] ??
        item['sellerName'] ??
        'Warga sekitar';
    return TiltCard(
      child: _HomeSurface(
        color: Colors.white,
        padding: const EdgeInsets.all(10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left Photo Showcase
            SizedBox(
              width: 90,
              height: double.infinity,
              child: Semantics(
                label: 'Lihat ${item['judul'] ?? 'produk warga'}',
                button: true,
                child: InkWell(
                  onTap: onOpen,
                  borderRadius: BorderRadius.circular(14),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: ColoredBox(
                            color: const Color(0xFFF1F5F9),
                            child: ImageCacheHelper.buildImage(
                              _photo,
                              fit: BoxFit.cover,
                              placeholder: const Center(
                                child: ClayIllustration(
                                  kind: ClayKind.shop,
                                  size: 48,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Floating Gradient Sponsored Pill
                      Positioned(
                        left: 5,
                        top: 5,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                            ),
                            borderRadius: BorderRadius.circular(6),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x33000000),
                                offset: Offset(0, 1),
                                blurRadius: 3,
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.auto_awesome, color: Colors.white, size: 8),
                              SizedBox(width: 2),
                              Text(
                                'SPONSORED',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 7.5,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 11),
            // Right Information & Action
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.storefront_rounded, size: 12, color: AppTheme.textSecondary),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          seller.toString(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item['judul']?.toString() ?? 'Produk warga',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      height: 1.2,
                      color: AppTheme.primaryNavy,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: Text(
                      hubRupiah(item['harga']),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF047857),
                      ),
                    ),
                  ),
                  const Spacer(),
                  // WhatsApp Green Button (compact)
                  SizedBox(
                    height: 30,
                    child: ElevatedButton.icon(
                      onPressed: onOrder,
                      icon: const Icon(
                        Icons.chat_bubble_rounded,
                        size: 12,
                        color: Colors.white,
                      ),
                      label: const Text(
                        'Chat Penjual',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(9),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}


class HomeQuickAction extends StatelessWidget {
  const HomeQuickAction({
    super.key,
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: label,
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Column(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.white, Color.lerp(Colors.white, color, .14)!],
                ),
                borderRadius: BorderRadius.circular(17),
                border: Border.all(color: color.withValues(alpha: .16)),
                boxShadow: [
                  BoxShadow(
                    color: color.withValues(alpha: .10),
                    offset: const Offset(0, 4),
                    blurRadius: 0,
                  ),
                  const BoxShadow(
                    color: Color(0x080F172A),
                    offset: Offset(0, 8),
                    blurRadius: 12,
                  ),
                ],
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            ExcludeSemantics(
              child: Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primaryNavy,
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

const _eyebrow = TextStyle(
  fontSize: 10,
  fontWeight: FontWeight.w800,
  letterSpacing: 1.1,
);

class _HomeSurface extends StatelessWidget {
  const _HomeSurface({
    required this.child,
    required this.color,
    this.padding = const EdgeInsets.all(20),
  });
  final Widget child;
  final Color color;
  final EdgeInsets padding;
  @override
  Widget build(BuildContext context) => Container(
    padding: padding,
    decoration: BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(28),
      border: Border.all(color: const Color(0x190F172A)),
      boxShadow: const [
        BoxShadow(
          color: Color(0x100F172A),
          offset: Offset(0, 5),
          blurRadius: 0,
        ),
        BoxShadow(
          color: Color(0x0A0F172A),
          offset: Offset(0, 10),
          blurRadius: 22,
        ),
      ],
    ),
    child: child,
  );
}
