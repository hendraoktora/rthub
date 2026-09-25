import 'dart:convert';
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_cache_helper.dart';
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
    final billLabel = invoices == null
        ? 'Iuran belum dimuat'
        : outstanding!.isNotEmpty
        ? '${outstanding.length} tagihan perlu dicek'
        : invoices!.isEmpty
        ? 'Belum ada tagihan'
        : 'Semua iuran sudah lunas';
    return TiltCard(
      scrollTilt: scrollTilt,
      child: _HomeSurface(
        color: const Color(0xFFE7F6EF),
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
                        'BUKU KAS / RT $rt',
                        style: _eyebrow.copyWith(
                          color: const Color(0xFF087252),
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Dikelola bersama.\nTerbuka untuk semua.',
                        style: TextStyle(
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
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF087252),
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
                  child: TextButton(
                    onPressed: onInvoices,
                    style: TextButton.styleFrom(
                      alignment: Alignment.centerLeft,
                      padding: EdgeInsets.zero,
                      foregroundColor: const Color(0xFF087252),
                    ),
                    child: Text(
                      billLabel,
                      maxLines: 2,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: onDetails,
                  tooltip: 'Lihat rincian buku kas',
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppTheme.primaryNavy,
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
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              flex: 4,
              child: Semantics(
                label: 'Lihat ${item['judul'] ?? 'produk warga'}',
                button: true,
                child: InkWell(
                  onTap: onOpen,
                  borderRadius: BorderRadius.circular(18),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(18),
                          child: ColoredBox(
                            color: const Color(0xFFF0F7F1),
                            child: ImageCacheHelper.buildImage(
                              _photo,
                              fit: BoxFit.cover,
                              placeholder: const Center(
                                child: ClayIllustration(
                                  kind: ClayKind.shop,
                                  size: 80,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        left: 7,
                        top: 8,
                        child: Transform.rotate(
                          angle: -.07,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 7,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF9E7A1),
                              border: Border.all(
                                color: const Color(0xFFCDB775),
                              ),
                              borderRadius: BorderRadius.circular(6),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x332A311F),
                                  offset: Offset(0, 3),
                                  blurRadius: 0,
                                ),
                              ],
                            ),
                            child: const Text(
                              'SPONSORED',
                              style: TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.w900,
                                letterSpacing: .4,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              flex: 5,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    seller.toString(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    item['judul']?.toString() ?? 'Produk warga',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      height: 1.15,
                    ),
                  ),
                  const SizedBox(height: 7),
                  Text(
                    hubRupiah(item['harga']),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF087252),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextButton.icon(
                    onPressed: onOrder,
                    icon: const Icon(
                      Icons.chat_bubble_outline_rounded,
                      size: 15,
                    ),
                    label: const Text(
                      'Pesan',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    style: TextButton.styleFrom(
                      foregroundColor: AppTheme.primaryNavy,
                      backgroundColor: const Color(0xFFF1F5F9),
                      minimumSize: const Size(92, 44),
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
