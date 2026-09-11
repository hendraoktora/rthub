import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class RtHubLogo extends StatelessWidget {
  final double size;
  final bool showWordmark;
  final bool isDark;
  final String? subtitle;
  final bool useSquareIcon;

  const RtHubLogo({
    super.key,
    this.size = 48.0,
    this.showWordmark = true,
    this.isDark = true,
    this.subtitle,
    this.useSquareIcon = false,
  });

  @override
  Widget build(BuildContext context) {
    if (!showWordmark) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(size * 0.22),
        child: Image.asset(
          useSquareIcon
              ? 'assets/images/rthub_icon.png'
              : 'assets/images/rthub_mark.png',
          width: size,
          height: size,
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) => Image.asset(
            'assets/images/rthub_icon.png',
            width: size,
            height: size,
            fit: BoxFit.contain,
          ),
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Image.asset(
          'assets/images/rthub_logo.png',
          height: size,
          fit: BoxFit.contain,
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 2),
          Padding(
            padding: const EdgeInsets.only(left: 4.0),
            child: Text(
              subtitle!,
              style: TextStyle(
                fontSize: (size * 0.22).clamp(10.0, 14.0),
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white70 : AppTheme.textSecondary,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
