import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class RtHubLogo extends StatelessWidget {
  final double size;
  final bool showWordmark;
  final bool isDark;
  final String? subtitle;

  const RtHubLogo({
    super.key,
    this.size = 48.0,
    this.showWordmark = true,
    this.isDark = true,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Vector Icon Mark (Concept 1: House Loop & Interlocking RT)
        SizedBox(
          width: size,
          height: size,
          child: CustomPaint(
            painter: _RtHubLogoPainter(),
          ),
        ),
        if (showWordmark) ...[
          const SizedBox(width: 12),
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: 'Rt',
                      style: TextStyle(
                        fontSize: size * 0.52,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                        color: isDark ? Colors.white : AppTheme.primaryNavy,
                        fontFamily: 'PlusJakartaSans',
                      ),
                    ),
                    TextSpan(
                      text: 'Hub',
                      style: TextStyle(
                        fontSize: size * 0.52,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                        color: AppTheme.skyAzure,
                        fontFamily: 'PlusJakartaSans',
                      ),
                    ),
                  ],
                ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(
                  subtitle!,
                  style: TextStyle(
                    fontSize: size * 0.22,
                    fontWeight: FontWeight.w500,
                    color: isDark ? Colors.white70 : AppTheme.textSecondary,
                  ),
                ),
              ],
            ],
          ),
        ],
      ],
    );
  }
}

class _RtHubLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 100.0;
    canvas.scale(scale, scale);

    final rect = const Rect.fromLTWH(0, 0, 100, 100);
    final gradient = const LinearGradient(
      begin: Alignment.bottomLeft,
      end: Alignment.topRight,
      colors: [
        AppTheme.electricBlue,
        Color(0xFF3B82F6),
        AppTheme.skyAzure,
      ],
    ).createShader(rect);

    final strokePaint = Paint()
      ..shader = gradient
      ..style = PaintingStyle.stroke
      ..strokeWidth = 7.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final dotPaint = Paint()
      ..color = AppTheme.skyAzure
      ..style = PaintingStyle.fill;

    // 1. Outer House Silhouette Path
    final housePath = Path();
    housePath.moveTo(50, 10);
    housePath.cubicTo(52.5, 10, 54.5, 11.2, 56.5, 13);
    housePath.lineTo(86, 38);
    housePath.cubicTo(89, 40.5, 90, 43.5, 90, 47.5);
    housePath.lineTo(90, 80);
    housePath.cubicTo(90, 86.5, 84.5, 92, 78, 92);
    housePath.lineTo(22, 92);
    housePath.cubicTo(15.5, 92, 10, 86.5, 10, 80);
    housePath.lineTo(10, 47.5);
    housePath.cubicTo(10, 43.5, 11, 40.5, 14, 38);
    housePath.lineTo(43.5, 13);
    housePath.cubicTo(45.5, 11.2, 47.5, 10, 50, 10);
    housePath.close();

    canvas.drawPath(housePath, strokePaint);

    // 2. Inner R Curve & Left Vertical Stem
    final rPath = Path();
    rPath.moveTo(29, 78);
    rPath.lineTo(29, 44);
    rPath.cubicTo(29, 36, 36, 31, 48, 31);
    rPath.cubicTo(60, 31, 67, 36, 67, 46);
    rPath.cubicTo(67, 55, 59, 60, 48, 60);
    rPath.lineTo(29, 60);

    canvas.drawPath(rPath, strokePaint);

    // 3. Interlocking Diagonal Connection & T Bar
    final tPath = Path();
    tPath.moveTo(48, 60);
    tPath.lineTo(69, 78);
    tPath.moveTo(72, 38);
    tPath.lineTo(72, 58);

    canvas.drawPath(tPath, strokePaint);

    // 4. Center Node Dot
    canvas.drawCircle(const Offset(50, 46), 3.5, dotPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
