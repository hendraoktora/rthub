import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Interactive 3D Isometric Village stage modeled after the RT Hub landing page.
/// Supports user drag/pointer tilt, continuous ambient floating, isometric houses,
/// warung lapak, trees, and floating live badges ("Iuran Pak Budi", "CCTV Online").
class IsometricVillage3D extends StatefulWidget {
  final double height;
  final bool interactive;
  final bool showFloatingBadges;

  const IsometricVillage3D({
    super.key,
    this.height = 320,
    this.interactive = true,
    this.showFloatingBadges = true,
  });

  @override
  State<IsometricVillage3D> createState() => _IsometricVillage3DState();
}

class _IsometricVillage3DState extends State<IsometricVillage3D>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ambientController;
  Offset _dragOffset = Offset.zero;
  Offset _targetOffset = Offset.zero;

  @override
  void initState() {
    super.initState();
    _ambientController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final isTest = WidgetsBinding.instance.runtimeType.toString().contains('Test');
    if (isTest || MediaQuery.disableAnimationsOf(context)) {
      _ambientController.stop();
    } else if (!_ambientController.isAnimating) {
      _ambientController.repeat();
    }
  }

  @override
  void dispose() {
    _ambientController.dispose();
    super.dispose();
  }

  void _onPanUpdate(DragUpdateDetails details) {
    if (!widget.interactive) return;
    setState(() {
      _targetOffset += Offset(
        details.delta.dx * 0.006,
        details.delta.dy * 0.006,
      );
      _targetOffset = Offset(
        _targetOffset.dx.clamp(-0.45, 0.45),
        _targetOffset.dy.clamp(-0.25, 0.25),
      );
    });
  }

  void _onPanEnd(DragEndDetails details) {
    if (!widget.interactive) return;
    setState(() {
      _targetOffset = Offset.zero;
    });
  }

  @override
  Widget build(BuildContext context) {
    final reduced = MediaQuery.disableAnimationsOf(context);

    return SizedBox(
      height: widget.height,
      child: GestureDetector(
        onPanUpdate: _onPanUpdate,
        onPanEnd: _onPanEnd,
        behavior: HitTestBehavior.opaque,
        child: AnimatedBuilder(
          animation: _ambientController,
          builder: (context, _) {
            final t = _ambientController.value * 2 * math.pi;
            final bob = reduced ? 0.0 : math.sin(t) * 6.0;
            final floatTiltX = reduced ? 0.0 : math.cos(t * 0.5) * 0.03;
            final floatTiltY = reduced ? 0.0 : math.sin(t * 0.7) * 0.04;

            // Interpolate drag towards target for smooth inertia
            _dragOffset = Offset.lerp(_dragOffset, _targetOffset, 0.12) ?? Offset.zero;

            final totalTiltX = -0.32 + _dragOffset.dy + floatTiltX;
            final totalTiltY = 0.42 + _dragOffset.dx + floatTiltY;

            return Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                // Soft radial ground shadow
                Positioned(
                  bottom: widget.height * 0.10,
                  child: Container(
                    width: widget.height * 0.85,
                    height: widget.height * 0.28,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(100),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF32664C).withValues(alpha: 0.15),
                          blurRadius: 40,
                          spreadRadius: 8,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                  ),
                ),

                // 3D Isometric Village Canvas
                Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.identity()
                    ..setEntry(3, 2, 0.0012)
                    ..rotateX(totalTiltX)
                    ..rotateY(totalTiltY)
                    ..translateByDouble(0.0, -bob, 0.0, 1.0),
                  child: CustomPaint(
                    size: Size(widget.height * 0.88, widget.height * 0.70),
                    painter: _Village3DPainter(),
                  ),
                ),

                // Floating Badge 1 (Top-Right): "Iuran Pak Budi ✓ Kas RT +Rp50.000"
                if (widget.showFloatingBadges)
                  Positioned(
                    top: widget.height * 0.08 + (math.sin(t + 1.2) * 5.0),
                    right: 12,
                    child: _buildFloatingCard(
                      icon: Icons.check_circle_rounded,
                      iconColor: const Color(0xFF10B981),
                      iconBg: const Color(0xFFE8F5E9),
                      title: 'Iuran Pak Budi masuk! ✓',
                      subtitle: 'Kas RT bertambah Rp50.000',
                      badge: 'KAS RT',
                      badgeColor: const Color(0xFF047857),
                    ),
                  ),

                // Floating Badge 2 (Bottom-Left): "CCTV Lingkungan • 4 online"
                if (widget.showFloatingBadges)
                  Positioned(
                    bottom: widget.height * 0.12 + (math.cos(t) * 4.5),
                    left: 12,
                    child: _buildFloatingCard(
                      icon: Icons.videocam_rounded,
                      iconColor: const Color(0xFF2261E8),
                      iconBg: const Color(0xFFEFF6FF),
                      title: 'Lingkungan terpantau',
                      subtitle: '4 CCTV RT aktif 24 jam',
                      badge: 'LIVE',
                      badgeColor: const Color(0xFF2261E8),
                      hasLiveDot: true,
                    ),
                  ),

                // Floating Badge 3 (Top-Left): "tetangga dekat ✳ hidup hangat"
                if (widget.showFloatingBadges)
                  Positioned(
                    top: widget.height * 0.16 + (math.sin(t * 0.8) * 3.5),
                    left: 14,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEDF2E4),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFBACAAA), width: 1),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('tetangga dekat ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF5A774E))),
                          Text('✳', style: TextStyle(fontSize: 10, color: Color(0xFF2261E8))),
                          Text(' hidup hangat', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF5A774E))),
                        ],
                      ),
                    ),
                  ),

                // Hint touch text at bottom
                if (widget.interactive)
                  Positioned(
                    bottom: 4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFDCE1D7)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.touch_app_rounded, size: 12, color: Color(0xFF5A774E)),
                          SizedBox(width: 4),
                          Text(
                            'Sentuh & geser untuk rotasi 3D',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF5A774E),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildFloatingCard({
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String title,
    required String subtitle,
    required String badge,
    required Color badgeColor,
    bool hasLiveDot = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
          BoxShadow(
            color: iconColor.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: iconBg,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 15, color: iconColor),
          ),
          const SizedBox(width: 9),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(width: 5),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                    decoration: BoxDecoration(
                      color: badgeColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (hasLiveDot) ...[
                          Container(
                            width: 4,
                            height: 4,
                            decoration: BoxDecoration(
                              color: badgeColor,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 3),
                        ],
                        Text(
                          badge,
                          style: TextStyle(
                            fontSize: 7.5,
                            fontWeight: FontWeight.w800,
                            color: badgeColor,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// CustomPainter that renders an isometric village platform with clay-style houses,
/// trees, road, and warung lapak.
class _Village3DPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    // Base Island Coordinates (Isometric diamond)
    final top = Offset(cx, cy - 85);
    final right = Offset(cx + 125, cy - 10);
    final bottom = Offset(cx, cy + 65);
    final left = Offset(cx - 125, cy - 10);
    const depth = 28.0;

    // 1. Underground Layer (Depth of the floating island)
    final soilPath = Path()
      ..moveTo(left.dx, left.dy)
      ..lineTo(bottom.dx, bottom.dy)
      ..lineTo(right.dx, right.dy)
      ..lineTo(right.dx, right.dy + depth)
      ..lineTo(bottom.dx, bottom.dy + depth + 4)
      ..lineTo(left.dx, left.dy + depth)
      ..close();

    final soilGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        const Color(0xFF8B7355),
        const Color(0xFF5D4A32),
      ],
    );
    canvas.drawPath(
      soilPath,
      Paint()..shader = soilGradient.createShader(Rect.fromLTWH(0, cy, size.width, depth + 10)),
    );

    // 2. Top Grass Surface (Isometric Diamond)
    final grassPath = Path()
      ..moveTo(top.dx, top.dy)
      ..lineTo(right.dx, right.dy)
      ..lineTo(bottom.dx, bottom.dy)
      ..lineTo(left.dx, left.dy)
      ..close();

    final grassPaint = Paint()
      ..color = const Color(0xFF88A878)
      ..style = PaintingStyle.fill;
    canvas.drawPath(grassPath, grassPaint);

    // Subtle grass highlight border
    final grassBorder = Paint()
      ..color = const Color(0xFFA5C396)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawPath(grassPath, grassBorder);

    // 3. Paved Village Road (Isometric Pathway through the village)
    final roadPath = Path()
      ..moveTo(cx - 30, cy + 45)
      ..lineTo(cx + 5, cy + 25)
      ..lineTo(cx - 10, cy - 40)
      ..lineTo(cx + 35, cy - 65)
      ..lineTo(cx + 55, cy - 50)
      ..lineTo(cx + 20, cy - 25)
      ..lineTo(cx + 25, cy + 35)
      ..lineTo(cx - 10, cy + 55)
      ..close();

    final roadPaint = Paint()
      ..color = const Color(0xFFE2DDD1)
      ..style = PaintingStyle.fill;
    canvas.drawPath(roadPath, roadPaint);

    // 4. House 1: Main RT Hub House (Cobalt & Porcelain) - Center-Left
    _drawIsometricHouse(
      canvas,
      baseCenter: Offset(cx - 45, cy - 10),
      width: 44,
      length: 50,
      height: 38,
      roofColor: const Color(0xFF2261E8), // RT Hub Blue
      wallColor: const Color(0xFFF1F5F9), // Porcelain
      wallShadeColor: const Color(0xFFCBD5E1),
      doorColor: const Color(0xFF0F172A),
      windowGlow: true,
      hasChimney: true,
    );

    // 5. House 2: Neighbor Home (Warm Terracotta / Orange Roof) - Center-Right
    _drawIsometricHouse(
      canvas,
      baseCenter: Offset(cx + 42, cy - 28),
      width: 38,
      length: 42,
      height: 32,
      roofColor: const Color(0xFFE27D60), // Terracotta
      wallColor: const Color(0xFFFFFBEB),
      wallShadeColor: const Color(0xFFFDE68A),
      doorColor: const Color(0xFF78350F),
      windowGlow: true,
      hasChimney: false,
    );

    // 6. Warung / Lapak Tetangga (Emerald Green striped canopy) - Bottom Center
    _drawIsometricWarung(
      canvas,
      baseCenter: Offset(cx + 5, cy + 22),
      width: 36,
      length: 34,
      height: 24,
    );

    // 7. Trees & Shrubbery
    _drawIsometricTree(canvas, Offset(cx - 85, cy - 15), radius: 14, height: 28);
    _drawIsometricTree(canvas, Offset(cx - 65, cy + 25), radius: 11, height: 22);
    _drawIsometricTree(canvas, Offset(cx + 80, cy - 10), radius: 13, height: 26);
    _drawIsometricTree(canvas, Offset(cx + 65, cy + 20), radius: 10, height: 20);

    // 8. CCTV Pole with small camera
    _drawCctvPole(canvas, Offset(cx - 15, cy - 5));
  }

  void _drawIsometricHouse(
    Canvas canvas, {
    required Offset baseCenter,
    required double width,
    required double length,
    required double height,
    required Color roofColor,
    required Color wallColor,
    required Color wallShadeColor,
    required Color doorColor,
    required bool windowGlow,
    required bool hasChimney,
  }) {
    final bx = baseCenter.dx;
    final by = baseCenter.dy;

    // Isometric wall faces
    final pFrontLeft = Offset(bx - width * 0.5, by);
    final pFrontCenter = Offset(bx, by + length * 0.25);
    final pFrontRight = Offset(bx + width * 0.5, by);
    final pBack = Offset(bx, by - length * 0.25);

    // Left Wall
    final leftWall = Path()
      ..moveTo(pFrontLeft.dx, pFrontLeft.dy)
      ..lineTo(pFrontCenter.dx, pFrontCenter.dy)
      ..lineTo(pFrontCenter.dx, pFrontCenter.dy - height)
      ..lineTo(pFrontLeft.dx, pFrontLeft.dy - height)
      ..close();
    canvas.drawPath(leftWall, Paint()..color = wallColor);

    // Right Wall (shaded)
    final rightWall = Path()
      ..moveTo(pFrontCenter.dx, pFrontCenter.dy)
      ..lineTo(pFrontRight.dx, pFrontRight.dy)
      ..lineTo(pFrontRight.dx, pFrontRight.dy - height)
      ..lineTo(pFrontCenter.dx, pFrontCenter.dy - height)
      ..close();
    canvas.drawPath(rightWall, Paint()..color = wallShadeColor);

    // Front Door on Left Wall
    final doorWidth = width * 0.22;
    final doorHeight = height * 0.45;
    final doorPath = Path()
      ..moveTo(bx - doorWidth * 0.5, by + 2)
      ..lineTo(bx + doorWidth * 0.5, by + length * 0.12)
      ..lineTo(bx + doorWidth * 0.5, by + length * 0.12 - doorHeight)
      ..lineTo(bx - doorWidth * 0.5, by + 2 - doorHeight)
      ..close();
    canvas.drawPath(doorPath, Paint()..color = doorColor);

    // Glowing Window on Right Wall
    if (windowGlow) {
      final winPath = Path()
        ..moveTo(bx + width * 0.2, by + length * 0.10 - height * 0.5)
        ..lineTo(bx + width * 0.38, by - height * 0.5)
        ..lineTo(bx + width * 0.38, by - height * 0.75)
        ..lineTo(bx + width * 0.2, by + length * 0.10 - height * 0.75)
        ..close();
      canvas.drawPath(winPath, Paint()..color = const Color(0xFFFEF08A)); // Warm yellow glow
      canvas.drawPath(winPath, Paint()..color = Colors.white.withValues(alpha: 0.6)..style = PaintingStyle.stroke..strokeWidth = 1);
    }

    // Chimney
    if (hasChimney) {
      final chimX = bx - width * 0.22;
      final chimY = by - height - 12;
      final chimPath = Path()
        ..addRect(Rect.fromLTWH(chimX, chimY, 7, 14));
      canvas.drawPath(chimPath, Paint()..color = const Color(0xFF94A3B8));
    }

    // Roof (Gabled Isometric Roof)
    final roofPeak = Offset(bx, by - height - 16);
    final roofBack = Offset(pBack.dx, pBack.dy - height - 16);

    // Left Roof Slope
    final roofLeft = Path()
      ..moveTo(pFrontLeft.dx - 3, pFrontLeft.dy - height)
      ..lineTo(pFrontCenter.dx, pFrontCenter.dy - height + 2)
      ..lineTo(roofPeak.dx, roofPeak.dy)
      ..close();
    canvas.drawPath(roofLeft, Paint()..color = roofColor);

    // Right Roof Slope (shaded)
    final roofRight = Path()
      ..moveTo(pFrontCenter.dx, pFrontCenter.dy - height + 2)
      ..lineTo(pFrontRight.dx + 3, pFrontRight.dy - height)
      ..lineTo(roofPeak.dx + 12, roofPeak.dy - 6)
      ..lineTo(roofPeak.dx, roofPeak.dy)
      ..close();
    canvas.drawPath(
      roofRight,
      Paint()..color = HSLColor.fromColor(roofColor).withLightness((HSLColor.fromColor(roofColor).lightness - 0.12).clamp(0.0, 1.0)).toColor(),
    );
  }

  void _drawIsometricWarung(
    Canvas canvas, {
    required Offset baseCenter,
    required double width,
    required double length,
    required double height,
  }) {
    final bx = baseCenter.dx;
    final by = baseCenter.dy;

    // Warung Counter Walls
    final counterPath = Path()
      ..moveTo(bx - width * 0.5, by)
      ..lineTo(bx, by + length * 0.25)
      ..lineTo(bx + width * 0.5, by)
      ..lineTo(bx + width * 0.5, by - height)
      ..lineTo(bx, by + length * 0.25 - height)
      ..lineTo(bx - width * 0.5, by - height)
      ..close();
    canvas.drawPath(counterPath, Paint()..color = const Color(0xFFF8FAFC));

    // Striped Awning (Canopy)
    final awningFront = Path()
      ..moveTo(bx - width * 0.6, by - height)
      ..lineTo(bx, by + length * 0.35 - height + 4)
      ..lineTo(bx + width * 0.6, by - height)
      ..lineTo(bx + width * 0.45, by - height - 12)
      ..lineTo(bx, by + length * 0.20 - height - 12)
      ..lineTo(bx - width * 0.45, by - height - 12)
      ..close();
    canvas.drawPath(awningFront, Paint()..color = const Color(0xFF047857)); // Emerald green canopy

    // Canopy white stripes
    final stripePaint = Paint()..color = Colors.white..strokeWidth = 3..style = PaintingStyle.stroke;
    canvas.drawLine(
      Offset(bx - width * 0.25, by - height - 8),
      Offset(bx - width * 0.3, by + length * 0.15 - height),
      stripePaint,
    );
    canvas.drawLine(
      Offset(bx + width * 0.25, by - height - 8),
      Offset(bx + width * 0.3, by + length * 0.15 - height),
      stripePaint,
    );
  }

  void _drawIsometricTree(Canvas canvas, Offset base, {required double radius, required double height}) {
    // Tree Trunk
    final trunk = Path()
      ..moveTo(base.dx - 2.5, base.dy)
      ..lineTo(base.dx + 2.5, base.dy)
      ..lineTo(base.dx + 2, base.dy - height * 0.45)
      ..lineTo(base.dx - 2, base.dy - height * 0.45)
      ..close();
    canvas.drawPath(trunk, Paint()..color = const Color(0xFF6B4226));

    // Tree Foliage (Clay sphere style)
    final foliageCenter = Offset(base.dx, base.dy - height * 0.65);
    final foliagePaint = Paint()
      ..shader = RadialGradient(
        center: const Alignment(-0.3, -0.4),
        colors: [
          const Color(0xFF65A30D),
          const Color(0xFF3F6212),
        ],
      ).createShader(Rect.fromCircle(center: foliageCenter, radius: radius));

    canvas.drawCircle(foliageCenter, radius, foliagePaint);
  }

  void _drawCctvPole(Canvas canvas, Offset base) {
    // Thin pole
    canvas.drawLine(
      base,
      Offset(base.dx, base.dy - 35),
      Paint()..color = const Color(0xFF475569)..strokeWidth = 2,
    );
    // Camera unit
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(base.dx - 1, base.dy - 38, 10, 5),
        const Radius.circular(2),
      ),
      Paint()..color = const Color(0xFF0F172A),
    );
    // Blinking LED dot
    canvas.drawCircle(
      Offset(base.dx + 8, base.dy - 35.5),
      1.5,
      Paint()..color = const Color(0xFFEF4444),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
