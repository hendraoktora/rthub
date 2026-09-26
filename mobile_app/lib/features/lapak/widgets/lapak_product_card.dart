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
  Widget build(BuildContext context) {
    final isOwner = onPromote != null || onEdit != null || onDelete != null;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: product.isSponsored
              ? const Color(0xFF6EE7B7)
              : const Color(0xFFE2E8F0),
          width: product.isSponsored ? 1.5 : 1.0,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x080F172A),
            blurRadius: 12,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(13),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // LEFT COLUMN: ShopeeFood Content Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Category / Sponsored Tag
                          Row(
                            children: [
                              if (product.isSponsored) ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFECFDF5),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: const Color(0xFF10B981),
                                      width: 0.8,
                                    ),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.auto_awesome_rounded,
                                        size: 10,
                                        color: Color(0xFF059669),
                                      ),
                                      SizedBox(width: 3),
                                      Text(
                                        'SPONSORED',
                                        style: TextStyle(
                                          fontSize: 8.5,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF059669),
                                          letterSpacing: 0.3,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 6),
                              ],
                              Flexible(
                                child: Text(
                                  product.category.toUpperCase(),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Color(0xFF047857),
                                    fontSize: 9.5,
                                    letterSpacing: 0.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 5),

                          // Product Title
                          Text(
                            product.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppTheme.primaryNavy,
                              fontWeight: FontWeight.w800,
                              fontSize: 14.5,
                              height: 1.25,
                            ),
                          ),

                          // Product Description Snippet
                          if (product.description.trim().isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              product.description.trim(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: AppTheme.textSecondary,
                                height: 1.2,
                              ),
                            ),
                          ],

                          const SizedBox(height: 8),

                          // Price (ShopeeFood bold standout)
                          Text(
                            lapakRupiah(product.price),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: AppTheme.electricBlue,
                            ),
                          ),

                          const SizedBox(height: 4),

                          // Store / Seller Info
                          Row(
                            children: [
                              const Icon(
                                Icons.storefront_rounded,
                                size: 12,
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
                                    fontWeight: FontWeight.w500,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(width: 14),

                    // RIGHT COLUMN: Compact Square Photo + Quick Action (ShopeeFood Style)
                    Column(
                      children: [
                        Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(15),
                              child: SizedBox(
                                width: 94,
                                height: 94,
                                child: ProductPhoto(product: product),
                              ),
                            ),
                            if (product.images.length > 1)
                              Positioned(
                                bottom: 6,
                                right: 6,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 5,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.65),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '1/${product.images.length}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        if (!isOwner) ...[
                          const SizedBox(height: 7),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: const Color(0xFFBFDBFE),
                              ),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.shopping_bag_outlined,
                                  size: 11,
                                  color: AppTheme.electricBlue,
                                ),
                                SizedBox(width: 4),
                                Text(
                                  'Pesan',
                                  style: TextStyle(
                                    color: AppTheme.electricBlue,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),

                // OWNER ACTIONS (Promote, Edit, Delete)
                if (isOwner) ...[
                  const SizedBox(height: 10),
                  const Divider(
                    height: 1,
                    thickness: 0.8,
                    color: Color(0xFFF1F5F9),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (onPromote != null)
                        Expanded(
                          child: FilledButton.tonalIcon(
                            onPressed: onPromote,
                            icon: const Icon(Icons.bolt_rounded, size: 14),
                            label: Text(
                              product.isSponsored ? 'Perpanjang' : 'Promosikan',
                              style: const TextStyle(fontSize: 11),
                            ),
                            style: FilledButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 0,
                              ),
                              visualDensity: VisualDensity.compact,
                              minimumSize: const Size(0, 32),
                            ),
                          ),
                        ),
                      if (onPromote != null) const SizedBox(width: 6),
                      if (onEdit != null)
                        OutlinedButton.icon(
                          onPressed: onEdit,
                          icon: const Icon(Icons.edit_outlined, size: 13),
                          label: const Text(
                            'Edit',
                            style: TextStyle(fontSize: 11),
                          ),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 0,
                            ),
                            visualDensity: VisualDensity.compact,
                            minimumSize: const Size(0, 32),
                          ),
                        ),
                      if (onDelete != null) ...[
                        const SizedBox(width: 4),
                        IconButton(
                          onPressed: onDelete,
                          tooltip: 'Hapus produk',
                          icon: const Icon(
                            Icons.delete_outline_rounded,
                            size: 18,
                          ),
                          color: AppTheme.alertRed,
                          visualDensity: VisualDensity.compact,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(
                            minWidth: 32,
                            minHeight: 32,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
