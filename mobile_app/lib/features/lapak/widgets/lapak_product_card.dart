import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_cache_helper.dart';
import '../../../core/widgets/hub_motion.dart';
import '../lapak_models.dart';

class SponsoredBadge extends StatelessWidget {
  const SponsoredBadge({super.key});
  @override
  Widget build(BuildContext context) => Semantics(
    label: 'Iklan berbayar',
    child: Transform.rotate(
      angle: -.045,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFE4FFF3), Color(0xFFABEDD4)],
          ),
          border: Border.all(color: Colors.white, width: 1.5),
          borderRadius: BorderRadius.circular(10),
          boxShadow: const [
            BoxShadow(color: Color(0x44047D5A), offset: Offset(0, 3)),
            BoxShadow(
              color: Color(0x18047D5A),
              blurRadius: 14,
              offset: Offset(0, 7),
            ),
          ],
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.auto_awesome_rounded,
              size: 13,
              color: Color(0xFF065F46),
            ),
            SizedBox(width: 4),
            Text(
              'SPONSORED',
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w900,
                letterSpacing: .7,
                color: Color(0xFF065F46),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class ProductPhoto extends StatelessWidget {
  const ProductPhoto({
    super.key,
    required this.product,
    this.height,
    this.index = 0,
  });
  final LapakProduct product;
  final double? height;
  final int index;
  @override
  Widget build(BuildContext context) => RepaintBoundary(
    child: ImageCacheHelper.buildImage(
      index < product.images.length ? product.images[index] : null,
      height: height,
      width: double.infinity,
      placeholder: Container(
        height: height,
        color: const Color(0xFFE9F5F0),
        child: const Center(
          child: ClayIllustration(kind: ClayKind.shop, size: 100),
        ),
      ),
    ),
  );
}

class LapakProductCard extends StatelessWidget {
  const LapakProductCard({
    super.key,
    required this.product,
    required this.onTap,
    this.onEdit,
    this.onDelete,
    this.onPromote,
  });
  final LapakProduct product;
  final VoidCallback onTap;
  final VoidCallback? onEdit, onDelete, onPromote;

  @override
  Widget build(BuildContext context) => TiltCard(
    child: Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        border: Border.all(color: const Color(0xFFE1E9E6)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x120F172A),
            blurRadius: 20,
            offset: Offset(0, 9),
          ),
          BoxShadow(color: Color(0xFFDEE9E5), offset: Offset(0, 3)),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(25),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  AspectRatio(
                    aspectRatio: 1.28,
                    child: ProductPhoto(product: product),
                  ),
                  if (product.isSponsored)
                    const Positioned(
                      top: 12,
                      left: 10,
                      child: SponsoredBadge(),
                    ),
                  if (product.images.length > 1)
                    Positioned(
                      bottom: 10,
                      right: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 7,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: .92),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '1 / ${product.images.length}',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.category.toUpperCase(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF047857),
                        fontSize: 9,
                        letterSpacing: 1.1,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 7),
                    Text(
                      product.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppTheme.primaryNavy,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 7),
                    Text(
                      lapakRupiah(product.price),
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Icon(
                          Icons.storefront_outlined,
                          size: 13,
                          color: AppTheme.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            product.sellerName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (onPromote != null) ...[
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.tonalIcon(
                          onPressed: onPromote,
                          icon: const Icon(Icons.bolt_rounded, size: 17),
                          label: Text(
                            product.isSponsored ? 'Perpanjang' : 'Promosikan',
                          ),
                          style: FilledButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: TextButton.icon(
                              onPressed: onEdit,
                              icon: const Icon(Icons.edit_outlined, size: 15),
                              label: const Text('Edit'),
                            ),
                          ),
                          IconButton(
                            onPressed: onDelete,
                            tooltip: 'Hapus ${product.title}',
                            icon: const Icon(
                              Icons.delete_outline_rounded,
                              size: 20,
                            ),
                            color: AppTheme.alertRed,
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
