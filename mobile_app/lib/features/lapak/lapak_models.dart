import 'dart:convert';
import 'package:intl/intl.dart';

String lapakRupiah(num amount) => NumberFormat.currency(
  locale: 'id_ID',
  symbol: 'Rp ',
  decimalDigits: 0,
).format(amount);

/// Immutable presentation model. Raw fields are retained only at the API edge.
class LapakProduct {
  LapakProduct.fromJson(Map<String, dynamic> json)
    : id = '${json['id'] ?? ''}',
      title = '${json['judul'] ?? 'Produk warga'}',
      description = '${json['deskripsi'] ?? ''}',
      category = '${json['kategori'] ?? 'Produk'}',
      price = num.tryParse('${json['harga'] ?? 0}') ?? 0,
      contact = '${json['kontakWa'] ?? ''}',
      sellerId = '${json['sellerId'] ?? json['seller']?['id'] ?? ''}',
      sellerName =
          '${json['seller']?['profile']?['namaLengkap'] ?? json['sellerName'] ?? 'Warga RT Hub'}',
      house = '${json['seller']?['profile']?['noRumah'] ?? ''}',
      rt = '${json['rt']?['nomor'] ?? ''}',
      images = parseImages(json['fotoUrl']),
      isSponsored = _activePromotion(json),
      scope = '${json['paketIklan'] ?? 'RT'}';

  final String id, title, description, category, contact;
  final String sellerId, sellerName, house, rt, scope;
  final num price;
  final List<String> images;
  final bool isSponsored;

  bool isOwnedBy(Map<String, dynamic>? user) =>
      sellerId.isNotEmpty && user?['id']?.toString() == sellerId;

  static bool _activePromotion(Map<String, dynamic> json) {
    if (json['isPromoted'] != true && json['promotedBadge'] != 'SPONSORED') {
      return false;
    }
    final expires = DateTime.tryParse('${json['promotedUntil'] ?? ''}');
    return expires == null || expires.isAfter(DateTime.now());
  }

  static List<String> parseImages(dynamic value) {
    if (value is List)
      return List.unmodifiable(
        value.map((e) => '$e').where((e) => e.trim().isNotEmpty),
      );
    if (value is! String || value.trim().isEmpty) return const [];
    try {
      final decoded = jsonDecode(value);
      if (decoded is List) return parseImages(decoded);
    } on FormatException {
      /* Existing single URL or legacy delimiter. */
    }
    return List.unmodifiable(
      value.split('|||').where((e) => e.trim().isNotEmpty),
    );
  }
}

/// Existing app catalogue; the backend currently has no price-catalogue API.
class AdPackage {
  const AdPackage({
    required this.code,
    required this.scope,
    required this.label,
    required this.description,
    required this.days,
    required this.price,
    required this.level,
  });
  final String code, scope, label, description;
  final int days, level;
  final double price;

  static const catalogue = <AdPackage>[
    AdPackage(
      code: 'IKLAN_RT',
      scope: 'RT',
      label: 'RT',
      description: 'Dekat dengan tetangga satu RT.',
      days: 7,
      price: 10000,
      level: 1,
    ),
    AdPackage(
      code: 'IKLAN_RW',
      scope: 'RW',
      label: 'RW',
      description: 'Jangkau seluruh RT dalam satu RW.',
      days: 7,
      price: 25000,
      level: 2,
    ),
    AdPackage(
      code: 'IKLAN_KELURAHAN',
      scope: 'KELURAHAN',
      label: 'Kelurahan',
      description: 'Kenalkan usaha ke warga se-kelurahan.',
      days: 14,
      price: 50000,
      level: 3,
    ),
    AdPackage(
      code: 'IKLAN_GLOBAL',
      scope: 'SEMUA',
      label: 'Global',
      description: 'Tampil untuk pengguna RT Hub lintas wilayah.',
      days: 30,
      price: 100000,
      level: 4,
    ),
  ];
}
