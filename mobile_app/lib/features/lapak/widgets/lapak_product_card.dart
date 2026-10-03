import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_cache_helper.dart';
import '../../../core/widgets/hub_motion.dart';
import '../lapak_models.dart';

class SponsoredBadge extends StatelessWidget {
  const SponsoredBadge({super.key});

  @override
  Widget build(BuildContext context) => Semantics(
    label: 'Iklan berbayar',
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFE4FFF3), Color(0xFFABEDD4)],
        ),
        border: Border.all(color: Colors.white, width: 1.2),
        borderRadius: BorderRadius.circular(7),
        boxShadow: const [
          BoxShadow(
            color: Color(0x22047D5A),
            blurRadius: 4,
            offset: Offset(0, 1.5),
          ),
        ],
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.auto_awesome_rounded,
            size: 9.5,
            color: Color(0xFF065F46),
          ),
          SizedBox(width: 3),
          Text(
            'SPONSORED',
            style: TextStyle(
              fontSize: 8,
              fontWeight: FontWeight.w900,
              letterSpacing: .5,
              color: Color(0xFF065F46),
            ),
          ),
        ],
      ),
    ),
  );
}

class UmkmBadge extends StatelessWidget {
  const UmkmBadge({super.key});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
    decoration: BoxDecoration(
      color: Colors.black.withValues(alpha: 0.55),
      borderRadius: BorderRadius.circular(6),
    ),
    child: const Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.storefront_rounded,
          size: 9.5,
          color: Colors.white,
        ),
        SizedBox(width: 3),
        Text(
          'UMKM',
          style: TextStyle(
            fontSize: 8,
            fontWeight: FontWeight.w800,
            letterSpacing: .4,
            color: Colors.white,
          ),
        ),
      ],
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
      fit: BoxFit.cover,
      placeholder: Container(
        height: height,
        color: const Color(0xFFF1F5F9),
        child: const Center(
          child: ClayIllustration(kind: ClayKind.shop, size: 70),
        ),
      ),
    ),
  );
}

class LapakProductCard extends StatefulWidget {
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
  State<LapakProductCard> createState() => _LapakProductCardState();
}

class _LapakProductCardState extends State<LapakProductCard> {
  bool _isFavorite = false;

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final isOwner = widget.onPromote != null || widget.onEdit != null || widget.onDelete != null;

    // Pseudo-rating based on product hash for realistic e-commerce showcase
    final ratingNum = 4.5 + ((product.id.hashCode.abs() % 5) / 10.0);
    final reviewCount = 12 + (product.id.hashCode.abs() % 68);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: product.isSponsored
              ? const Color(0xFF6EE7B7)
              : const Color(0xFFE2E8F0),
          width: product.isSponsored ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: product.isSponsored
                ? const Color(0x14059669)
                : const Color(0x080F172A),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: widget.onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // TOP: Large 1:1 / 4:3 Image with badges & wishlist heart
              Stack(
                children: [
                  AspectRatio(
                    aspectRatio: 1.12,
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(17)),
                      child: ProductPhoto(product: product),
                    ),
                  ),

                  // Top-Left Badge (Sponsored or UMKM)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: product.isSponsored
                        ? const SponsoredBadge()
                        : const UmkmBadge(),
                  ),

                  // Top-Right: Image Counter if multiple images
                  if (product.images.length > 1)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '1/${product.images.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 8.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),

                  // Bottom-Right: Floating Heart / Wishlist button
                  Positioned(
                    bottom: 6,
                    right: 6,
                    child: GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        setState(() => _isFavorite = !_isFavorite);
                      },
                      child: Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.92),
                          shape: BoxShape.circle,
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x22000000),
                              blurRadius: 4,
                              offset: Offset(0, 1.5),
                            ),
                          ],
                        ),
                        child: Icon(
                          _isFavorite
                              ? Icons.favorite_rounded
                              : Icons.favorite_border_rounded,
                          size: 15,
                          color: _isFavorite
                              ? const Color(0xFFEF4444)
                              : Colors.grey.shade600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // BOTTOM: Content Details
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product Title
                    Text(
                      product.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppTheme.primaryNavy,
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 2),

                    // Seller Name & RT
                    Row(
                      children: [
                        const Icon(
                          Icons.storefront_rounded,
                          size: 10.5,
                          color: AppTheme.textSecondary,
                        ),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            product.sellerName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),

                    // Product Price (Bold, High Contrast)
                    Text(
                      lapakRupiah(product.price),
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 4),

                    // Rating & Review Count (e.g. ★ 4.5 (50))
                    Row(
                      children: [
                        const Icon(
                          Icons.star_rounded,
                          size: 13,
                          color: Color(0xFFF59E0B),
                        ),
                        const SizedBox(width: 2),
                        Text(
                          ratingNum.toStringAsFixed(1),
                          style: const TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(width: 2.5),
                        Text(
                          '($reviewCount)',
                          style: const TextStyle(
                            fontSize: 9.5,
                            color: AppTheme.textMuted,
                          ),
                        ),
                        const Spacer(),
                        if (!isOwner) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEBF5FF),
                              borderRadius: BorderRadius.circular(5),
                            ),
                            child: const Text(
                              'Pesan',
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.electricBlue,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),

                    // OWNER ACTIONS BAR
                    if (isOwner) ...[
                      const SizedBox(height: 8),
                      const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          if (widget.onPromote != null)
                            Expanded(
                              child: GestureDetector(
                                onTap: widget.onPromote,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 4),
                                  decoration: BoxDecoration(
                                    color: product.isSponsored
                                        ? const Color(0xFFECFDF5)
                                        : const Color(0xFFFFFBEB),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: product.isSponsored
                                          ? const Color(0xFFA7F3D0)
                                          : const Color(0xFFFDE68A),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.bolt_rounded,
                                        size: 11,
                                        color: product.isSponsored
                                          ? const Color(0xFF059669)
                                          : const Color(0xFFD97706),
                                      ),
                                      const SizedBox(width: 2),
                                      Text(
                                        product.isSponsored ? 'Perpanjang' : 'Iklan',
                                        style: TextStyle(
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.bold,
                                          color: product.isSponsored
                                            ? const Color(0xFF059669)
                                            : const Color(0xFFD97706),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          if (widget.onEdit != null) ...[
                            const SizedBox(width: 4),
                            GestureDetector(
                              onTap: widget.onEdit,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Icon(
                                  Icons.edit_outlined,
                                  size: 13,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                            ),
                          ],
                          if (widget.onDelete != null) ...[
                            const SizedBox(width: 4),
                            GestureDetector(
                              onTap: widget.onDelete,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEE2E2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Icon(
                                  Icons.delete_outline_rounded,
                                  size: 13,
                                  color: AppTheme.alertRed,
                                ),
                              ),
                            ),
                          ],
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
    );
  }
}
