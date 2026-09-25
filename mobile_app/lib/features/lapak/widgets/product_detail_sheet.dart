import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/hub_motion.dart';
import '../lapak_models.dart';
import 'lapak_product_card.dart';

class ProductDetailSheet extends StatefulWidget {
  const ProductDetailSheet({super.key, required this.product, this.user});
  final LapakProduct product;
  final Map<String, dynamic>? user;
  @override
  State<ProductDetailSheet> createState() => _ProductDetailSheetState();
}

class _ProductDetailSheetState extends State<ProductDetailSheet> {
  late final TextEditingController _address;
  final _notes = TextEditingController();
  int _quantity = 1;
  bool _opening = false;
  String? _error;
  @override
  void initState() {
    super.initState();
    _address = TextEditingController(
      text: '${widget.user?['profile']?['noRumah'] ?? ''}',
    );
  }

  @override
  void dispose() {
    _address.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _contact({bool order = false}) async {
    if (order && _address.text.trim().isEmpty) {
      setState(() => _error = 'Isi alamat atau titik pengambilan dahulu.');
      return;
    }
    var phone = widget.product.contact.replaceAll(RegExp(r'\D'), '');
    if (phone.startsWith('0')) phone = '62${phone.substring(1)}';
    if (!phone.startsWith('62')) phone = '62$phone';
    if (phone.length < 10) {
      setState(() => _error = 'Nomor WhatsApp penjual belum tersedia.');
      return;
    }
    final item = widget.product;
    final message = order
        ? 'Halo ${item.sellerName}, saya ingin memesan dari Lapak Warga RT Hub.\n\n'
              'Produk: ${item.title}\nJumlah: $_quantity\nTotal: ${lapakRupiah(item.price * _quantity)}\n'
              'Alamat: ${_address.text.trim()}\nPemesan: ${widget.user?['profile']?['namaLengkap'] ?? 'Warga'}\n'
              '${_notes.text.trim().isEmpty ? '' : 'Catatan: ${_notes.text.trim()}\n'}\n'
              'Mohon konfirmasi ketersediaan dan cara pembayarannya. Terima kasih.'
        : 'Halo, saya tertarik dengan "${item.title}" di Lapak Warga RT Hub. Apakah masih tersedia?';
    setState(() {
      _opening = true;
      _error = null;
    });
    try {
      final opened = await launchUrl(
        Uri.https('wa.me', '/$phone', {'text': message}),
        mode: LaunchMode.externalApplication,
      );
      if (!opened) throw StateError('WhatsApp belum dapat dibuka.');
    } catch (_) {
      await Clipboard.setData(ClipboardData(text: '$phone\n\n$message'));
      if (mounted)
        setState(
          () => _error =
              'WhatsApp belum dapat dibuka. Nomor dan draf pesan telah disalin; pesan belum terkirim.',
        );
    } finally {
      if (mounted) setState(() => _opening = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.product;
    return SafeArea(
      top: false,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * .94,
        ),
        child: SingleChildScrollView(
          padding: EdgeInsets.only(
            bottom: MediaQuery.viewInsetsOf(context).bottom + 24,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: DepthCarousel(
                      height: 270,
                      viewportFraction: .94,
                      children: List.generate(
                        item.images.isEmpty ? 1 : item.images.length,
                        (index) => ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: ProductPhoto(
                            product: item,
                            index: index,
                            height: 240,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 22,
                    right: 16,
                    child: IconButton.filledTonal(
                      onPressed: () => Navigator.pop(context),
                      tooltip: 'Tutup detail',
                      icon: const Icon(Icons.close_rounded),
                    ),
                  ),
                  if (item.isSponsored)
                    const Positioned(
                      top: 32,
                      left: 25,
                      child: SponsoredBadge(),
                    ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.category.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF047857),
                        letterSpacing: 1.3,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      item.title,
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        height: 1.2,
                        letterSpacing: -.7,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      lapakRupiah(item.price),
                      style: const TextStyle(
                        fontSize: 25,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF047857),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        const CircleAvatar(
                          backgroundColor: Color(0xFFEAF6F1),
                          child: Icon(
                            Icons.storefront_rounded,
                            color: Color(0xFF047857),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.sellerName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              if (item.house.isNotEmpty || item.rt.isNotEmpty)
                                Text(
                                  [
                                    if (item.rt.isNotEmpty) 'RT ${item.rt}',
                                    if (item.house.isNotEmpty) item.house,
                                  ].join(' · '),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (item.description.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 20),
                        child: Text(
                          item.description,
                          style: const TextStyle(
                            height: 1.7,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: Divider(),
                    ),
                    Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'Buat pesanan',
                            style: TextStyle(
                              fontSize: 19,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        IconButton.outlined(
                          onPressed: _quantity > 1
                              ? () => setState(() => _quantity--)
                              : null,
                          tooltip: 'Kurangi jumlah',
                          icon: const Icon(Icons.remove_rounded, size: 18),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            '$_quantity',
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                        ),
                        IconButton.filledTonal(
                          onPressed: _quantity < 999
                              ? () => setState(() => _quantity++)
                              : null,
                          tooltip: 'Tambah jumlah',
                          icon: const Icon(Icons.add_rounded, size: 18),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    TextField(
                      controller: _address,
                      decoration: const InputDecoration(
                        labelText: 'Alamat / titik pengambilan',
                      ),
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: _notes,
                      minLines: 1,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Catatan (opsional)',
                      ),
                    ),
                    const SizedBox(height: 20),
                    Wrap(
                      alignment: WrapAlignment.spaceBetween,
                      spacing: 20,
                      runSpacing: 6,
                      children: [
                        const Text(
                          'Total pesanan',
                          style: TextStyle(color: AppTheme.textSecondary),
                        ),
                        Text(
                          lapakRupiah(item.price * _quantity),
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Text(
                          _error!,
                          style: const TextStyle(
                            color: AppTheme.alertRed,
                            height: 1.5,
                          ),
                        ),
                      ),
                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF047857),
                          padding: const EdgeInsets.all(18),
                        ),
                        onPressed: _opening || item.contact.isEmpty
                            ? null
                            : () => _contact(order: true),
                        icon: const Icon(
                          Icons.chat_bubble_outline_rounded,
                          size: 19,
                        ),
                        label: const Text('Lanjutkan ke WhatsApp'),
                      ),
                    ),
                    Center(
                      child: TextButton(
                        onPressed: _opening || item.contact.isEmpty
                            ? null
                            : _contact,
                        child: const Text('Tanya penjual dulu'),
                      ),
                    ),
                    const Text(
                      'Ketersediaan, ongkir, dan pembayaran dikonfirmasi langsung dengan penjual.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11,
                        color: AppTheme.textSecondary,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
