import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_cache_helper.dart';
import '../lapak_models.dart';

class ProductFormSheet extends StatefulWidget {
  const ProductFormSheet({
    super.key,
    this.product,
    this.initialPhone = '',
    required this.onSave,
  });
  final LapakProduct? product;
  final String initialPhone;
  final Future<void> Function(Map<String, dynamic> fields) onSave;
  @override
  State<ProductFormSheet> createState() => _ProductFormSheetState();
}

class _ProductFormSheetState extends State<ProductFormSheet> {
  static const _categories = [
    'Kuliner',
    'Sembako',
    'Minuman',
    'Jasa',
    'Kontrakan',
    'Produk',
    'Fashion',
    'Elektronik',
  ];
  final _form = GlobalKey<FormState>();
  late final TextEditingController _title, _price, _phone, _description;
  late String _category;
  late List<String> _photos;
  bool _saving = false, _picking = false;
  String? _error;
  @override
  void initState() {
    super.initState();
    final item = widget.product;
    _title = TextEditingController(text: item?.title ?? '');
    _price = TextEditingController(text: item?.price.toStringAsFixed(0) ?? '');
    _phone = TextEditingController(text: item?.contact ?? widget.initialPhone);
    _description = TextEditingController(text: item?.description ?? '');
    _category = _categories.contains(item?.category)
        ? item!.category
        : 'Kuliner';
    _photos = [...?item?.images];
  }

  @override
  void dispose() {
    for (final controller in [_title, _price, _phone, _description]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _pick(bool camera) async {
    if (_picking || _photos.length >= 10) return;
    setState(() {
      _picking = true;
      _error = null;
    });
    try {
      final picker = ImagePicker();
      final cameraImage = camera
          ? await picker.pickImage(
              source: ImageSource.camera,
              imageQuality: 75,
              maxWidth: 1200,
              maxHeight: 1200,
            )
          : null;
      final picked = camera
          ? [if (cameraImage != null) cameraImage]
          : await picker.pickMultiImage(
              imageQuality: 75,
              maxWidth: 1200,
              maxHeight: 1200,
            );
      final encoded = <String>[];
      for (final image in picked.take(10 - _photos.length)) {
        final bytes = await image.readAsBytes();
        final type = image.name.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
        encoded.add('data:image/$type;base64,${base64Encode(bytes)}');
      }
      if (mounted) setState(() => _photos.addAll(encoded));
    } catch (_) {
      if (mounted)
        setState(
          () => _error =
              'Foto belum dapat dibuka. Periksa izin kamera atau galeri.',
        );
    } finally {
      if (mounted) setState(() => _picking = false);
    }
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await widget.onSave({
        'judul': _title.text.trim(),
        'harga': num.parse(_price.text),
        'kategori': _category,
        'kontakWa': _phone.text.trim(),
        'deskripsi': _description.text.trim(),
        'fotoUrl': _photos.isEmpty ? null : jsonEncode(_photos),
      });
      if (mounted) Navigator.of(context).pop(true);
    } catch (error) {
      if (mounted)
        setState(
          () => _error = error.toString().replaceFirst('Exception: ', ''),
        );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => PopScope(
    canPop: !_saving,
    child: SafeArea(
      top: false,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * .94,
        ),
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
            24,
            20,
            24,
            MediaQuery.viewInsetsOf(context).bottom + 24,
          ),
          child: Form(
            key: _form,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        widget.product == null
                            ? 'Buka lapakmu.'
                            : 'Rapikan lapakmu.',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -1,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: _saving ? null : () => Navigator.pop(context),
                      tooltip: 'Tutup',
                      icon: const Icon(Icons.close_rounded),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Dari rumah, untuk tetangga. Ceritakan produk atau jasa terbaikmu.',
                  style: TextStyle(color: AppTheme.textSecondary, height: 1.5),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Foto produk',
                        style: TextStyle(fontWeight: FontWeight.w800),
                      ),
                    ),
                    Text(
                      '${_photos.length}/10',
                      style: const TextStyle(color: AppTheme.textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (_photos.isNotEmpty)
                  SizedBox(
                    height: 108,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _photos.length,
                      separatorBuilder: (_, index) => const SizedBox(width: 10),
                      itemBuilder: (context, index) => SizedBox(
                        width: 104,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            ImageCacheHelper.buildImage(
                              _photos[index],
                              width: 104,
                              height: 104,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            if (index == 0)
                              Positioned(
                                bottom: 0,
                                left: 0,
                                right: 0,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 4,
                                  ),
                                  color: AppTheme.primaryNavy.withValues(
                                    alpha: .8,
                                  ),
                                  child: const Text(
                                    'Foto utama',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                              ),
                            Positioned(
                              top: 0,
                              right: 0,
                              child: IconButton.filledTonal(
                                onPressed: _saving
                                    ? null
                                    : () => setState(
                                        () => _photos.removeAt(index),
                                      ),
                                tooltip: 'Hapus foto ${index + 1}',
                                iconSize: 18,
                                icon: const Icon(Icons.close_rounded),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                Wrap(
                  spacing: 8,
                  children: [
                    OutlinedButton.icon(
                      onPressed: _saving || _picking || _photos.length >= 10
                          ? null
                          : () => _pick(false),
                      icon: const Icon(
                        Icons.add_photo_alternate_outlined,
                        size: 19,
                      ),
                      label: Text(_picking ? 'Membuka…' : 'Pilih foto'),
                    ),
                    TextButton.icon(
                      onPressed: _saving || _picking || _photos.length >= 10
                          ? null
                          : () => _pick(true),
                      icon: const Icon(Icons.camera_alt_outlined, size: 19),
                      label: const Text('Kamera'),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                TextFormField(
                  controller: _title,
                  enabled: !_saving,
                  maxLength: 120,
                  decoration: const InputDecoration(
                    labelText: 'Nama produk / jasa',
                  ),
                  validator: (value) => value == null || value.trim().isEmpty
                      ? 'Isi nama produk dahulu.'
                      : null,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _category,
                  decoration: const InputDecoration(labelText: 'Kategori'),
                  items: _categories
                      .map(
                        (category) => DropdownMenuItem(
                          value: category,
                          child: Text(category),
                        ),
                      )
                      .toList(),
                  onChanged: _saving
                      ? null
                      : (value) => setState(() => _category = value!),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _price,
                  enabled: !_saving,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: const InputDecoration(
                    labelText: 'Harga',
                    prefixText: 'Rp ',
                  ),
                  validator: (value) => (num.tryParse(value ?? '') ?? 0) <= 0
                      ? 'Masukkan harga lebih dari 0.'
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phone,
                  enabled: !_saving,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'WhatsApp untuk pesanan',
                    hintText: '08xxxxxxxxxx',
                  ),
                  validator: (value) =>
                      (value ?? '').replaceAll(RegExp(r'\D'), '').length < 9
                      ? 'Periksa nomor WhatsApp.'
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _description,
                  enabled: !_saving,
                  minLines: 3,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    labelText: 'Deskripsi',
                    hintText: 'Varian, jam buka, dan cara pengiriman…',
                  ),
                ),
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 14),
                    child: Text(
                      _error!,
                      style: const TextStyle(
                        color: AppTheme.alertRed,
                        height: 1.5,
                      ),
                    ),
                  ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _saving || _picking ? null : _save,
                    icon: _saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.check_rounded),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.all(18),
                    ),
                    label: Text(
                      _saving
                          ? 'Menyimpan…'
                          : widget.product == null
                          ? 'Terbitkan produk'
                          : 'Simpan perubahan',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
