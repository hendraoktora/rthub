import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_theme.dart';
import 'rthub_logo.dart';

/// Pointer listeners observe the gesture without stealing the scroll arena.
/// Perspective is deliberately restrained so text remains readable.
class TiltCard extends StatefulWidget {
  const TiltCard({super.key, required this.child, this.scrollTilt = 0});
  final Widget child;
  final double scrollTilt;

  @override
  State<TiltCard> createState() => _TiltCardState();
}

class _TiltCardState extends State<TiltCard> {
  Offset _tilt = Offset.zero;
  bool _pressed = false;

  void _update(Offset point, Size size) {
    if (size.isEmpty || MediaQuery.disableAnimationsOf(context)) return;
    setState(() {
      _tilt = Offset(
        (point.dx / size.width * 2 - 1).clamp(-1.0, 1.0),
        (point.dy / size.height * 2 - 1).clamp(-1.0, 1.0),
      );
    });
  }

  void _reset() => setState(() {
    _pressed = false;
    _tilt = Offset.zero;
  });

  @override
  Widget build(BuildContext context) {
    final reduced = MediaQuery.disableAnimationsOf(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        return MouseRegion(
          onHover: (event) => _update(event.localPosition, constraints.biggest),
          onExit: (_) => _reset(),
          child: Listener(
            onPointerDown: (event) {
              _pressed = true;
              _update(event.localPosition, constraints.biggest);
            },
            onPointerMove: (event) =>
                _update(event.localPosition, constraints.biggest),
            onPointerUp: (_) => _reset(),
            onPointerCancel: (_) => _reset(),
            child: TweenAnimationBuilder<Offset>(
              tween: Tween(end: reduced ? Offset.zero : _tilt),
              duration: Duration(milliseconds: _pressed ? 80 : 360),
              curve: _pressed ? Curves.easeOut : Curves.easeOutCubic,
              child: RepaintBoundary(child: widget.child),
              builder: (context, tilt, child) => Transform(
                alignment: Alignment.center,
                transform: Matrix4.identity()
                  ..setEntry(3, 2, .0012)
                  ..rotateX(
                    reduced
                        ? 0
                        : -tilt.dy * .065 + widget.scrollTilt.clamp(-.04, .04),
                  )
                  ..rotateY(tilt.dx * .065),
                child: child,
              ),
            ),
          ),
        );
      },
    );
  }
}

/// One controller drives page depth and stretching indicators; card subtrees
/// are cached by AnimatedBuilder instead of rebuilt on every scroll frame.
class DepthCarousel extends StatefulWidget {
  const DepthCarousel({
    super.key,
    required this.children,
    this.height = 230,
    this.viewportFraction = .90,
  });
  final List<Widget> children;
  final double height;
  final double viewportFraction;

  @override
  State<DepthCarousel> createState() => _DepthCarouselState();
}

class _DepthCarouselState extends State<DepthCarousel> {
  late final PageController _controller = PageController(
    viewportFraction: widget.viewportFraction,
  );
  double get _page =>
      _controller.hasClients && _controller.position.hasContentDimensions
      ? _controller.page ?? 0
      : 0;

  @override
  void didUpdateWidget(covariant DepthCarousel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.children.length != oldWidget.children.length) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted &&
            _controller.hasClients &&
            widget.children.isNotEmpty &&
            _page >= widget.children.length) {
          _controller.jumpToPage(widget.children.length - 1);
        }
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.children.isEmpty) return const SizedBox.shrink();
    final reduced = MediaQuery.disableAnimationsOf(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: widget.height,
          child: PageView.builder(
            controller: _controller,
            physics: const BouncingScrollPhysics(),
            itemCount: widget.children.length,
            itemBuilder: (context, index) => AnimatedBuilder(
              animation: _controller,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(6, 8, 6, 14),
                child: RepaintBoundary(child: widget.children[index]),
              ),
              builder: (context, child) {
                final distance = (_page - index).clamp(-1.0, 1.0);
                return Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.identity()
                    ..setEntry(3, 2, .001)
                    ..rotateY(reduced ? 0 : distance * .045)
                    ..scaleByDouble(
                      1.0,
                      reduced ? 1 : 1 - distance.abs() * .06,
                      1.0,
                      1.0,
                    ),
                  child: child,
                );
              },
            ),
          ),
        ),
        if (widget.children.length > 1)
          AnimatedBuilder(
            animation: _controller,
            builder: (context, _) => Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(widget.children.length, (index) {
                final active = (1 - (_page - index).abs()).clamp(0.0, 1.0);
                return Semantics(
                  label: 'Kartu ${index + 1} dari ${widget.children.length}',
                  selected: active > .5,
                  button: true,
                  child: InkResponse(
                    radius: 24,
                    onTap: () {
                      if (reduced) {
                        _controller.jumpToPage(index);
                      } else {
                        _controller.animateToPage(
                          index,
                          duration: const Duration(milliseconds: 380),
                          curve: Curves.easeOutCubic,
                        );
                      }
                    },
                    child: SizedBox(
                      height: 44,
                      width: 24 + active * 16,
                      child: Center(
                        child: Container(
                          width: 6 + active * 20,
                          height: 6,
                          decoration: BoxDecoration(
                            color: Color.lerp(
                              AppTheme.slateBorder,
                              AppTheme.electricBlue,
                              active,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
      ],
    );
  }
}

class StaggeredEntry extends StatefulWidget {
  const StaggeredEntry({super.key, required this.child, this.index = 0});
  final Widget child;
  final int index;

  @override
  State<StaggeredEntry> createState() => _StaggeredEntryState();
}

class _StaggeredEntryState extends State<StaggeredEntry>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: Duration(milliseconds: 440 + widget.index.clamp(0, 6) * 55),
  );
  late final Animation<double> _progress = CurvedAnimation(
    parent: _controller,
    curve: Interval(
      widget.index.clamp(0, 6) * .055,
      1,
      curve: Curves.easeOutCubic,
    ),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.disableAnimationsOf(context)) {
      _controller.value = 1;
    } else {
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: _progress,
    child: SlideTransition(
      position: Tween(
        begin: const Offset(0, .08),
        end: Offset.zero,
      ).animate(_progress),
      child: widget.child,
    ),
  );
}

class GlassPanel extends StatelessWidget {
  const GlassPanel({super.key, required this.child, this.borderRadius});
  final Widget child;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: borderRadius ?? BorderRadius.circular(28),
    child: BackdropFilter(
      filter: ui.ImageFilter.blur(sigmaX: 12, sigmaY: 12),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: .88),
          border: Border.all(color: Colors.white.withValues(alpha: .85)),
          borderRadius: borderRadius ?? BorderRadius.circular(28),
        ),
        child: child,
      ),
    ),
  );
}

class PulseSosButton extends StatefulWidget {
  const PulseSosButton({super.key, required this.onPressed});
  final VoidCallback onPressed;

  @override
  State<PulseSosButton> createState() => _PulseSosButtonState();
}

class _PulseSosButtonState extends State<PulseSosButton>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2100),
  );

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  void _sync({bool active = true}) {
    if (active &&
        TickerMode.of(context) &&
        !MediaQuery.disableAnimationsOf(context)) {
      if (!_pulse.isAnimating) _pulse.repeat();
    } else {
      _pulse.stop();
      _pulse.value = 0;
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) =>
      _sync(active: state == AppLifecycleState.resumed);

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => RepaintBoundary(
    child: SizedBox(
      width: 80,
      height: 80,
      child: AnimatedBuilder(
        animation: _pulse,
        child: Semantics(
          button: true,
          label: 'SOS. Buka bantuan darurat',
          excludeSemantics: true,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: () {
                HapticFeedback.mediumImpact();
                widget.onPressed();
              },
              child: Ink(
                width: 62,
                height: 62,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFFFF807A),
                      AppTheme.alertRed,
                      Color(0xFFC52A38),
                    ],
                  ),
                  border: Border.all(color: const Color(0xFFFFB2AD), width: 2),
                  boxShadow: const [
                    BoxShadow(color: Color(0xFFAC2030), offset: Offset(0, 4)),
                    BoxShadow(
                      color: Color(0x35EF4444),
                      blurRadius: 16,
                      offset: Offset(0, 9),
                    ),
                  ],
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.crisis_alert_rounded,
                      color: Colors.white,
                      size: 22,
                    ),
                    Text(
                      'SOS',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        builder: (context, child) => Stack(
          alignment: Alignment.center,
          children: [
            Transform.scale(
              scale: 1 + _pulse.value * .26,
              child: Container(
                width: 62,
                height: 62,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppTheme.alertRed.withValues(
                      alpha: (1 - _pulse.value) * .24,
                    ),
                    width: 2,
                  ),
                ),
              ),
            ),
            child!,
          ],
        ),
      ),
    ),
  );
}

/// Sliver refresh participates in the scroll layout, with no overlay spinner.
class HubRefreshControl extends StatelessWidget {
  const HubRefreshControl({super.key, required this.onRefresh});
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) => CupertinoSliverRefreshControl(
    onRefresh: onRefresh,
    refreshTriggerPullDistance: 92,
    refreshIndicatorExtent: 68,
    builder: (context, mode, pulled, trigger, extent) => ClipRect(
      child: OverflowBox(
        minHeight: 0,
        maxHeight: 68,
        alignment: Alignment.bottomCenter,
        child: _RefreshLogo(
          progress: (pulled / trigger).clamp(0.0, 1.0),
          spinning:
              mode == RefreshIndicatorMode.refresh ||
              mode == RefreshIndicatorMode.armed,
        ),
      ),
    ),
  );
}

class _RefreshLogo extends StatefulWidget {
  const _RefreshLogo({required this.progress, required this.spinning});
  final double progress;
  final bool spinning;

  @override
  State<_RefreshLogo> createState() => _RefreshLogoState();
}

class _RefreshLogoState extends State<_RefreshLogo>
    with SingleTickerProviderStateMixin {
  late final AnimationController _rotation = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1050),
  );

  void _sync() {
    if (widget.spinning && !MediaQuery.disableAnimationsOf(context)) {
      if (!_rotation.isAnimating) _rotation.repeat();
    } else {
      _rotation.stop();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(covariant _RefreshLogo oldWidget) {
    super.didUpdateWidget(oldWidget);
    _sync();
  }

  @override
  void dispose() {
    _rotation.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Semantics(
    label: widget.spinning
        ? 'Memperbarui data warga'
        : 'Tarik untuk memperbarui',
    liveRegion: widget.spinning,
    child: SizedBox(
      height: 68,
      child: Center(
        child: AnimatedBuilder(
          animation: _rotation,
          child: const RtHubLogo(
            size: 34,
            showWordmark: false,
            useSquareIcon: true,
          ),
          builder: (context, child) => Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, .004)
              ..rotateY(
                MediaQuery.disableAnimationsOf(context)
                    ? 0
                    : (widget.spinning
                          ? _rotation.value * math.pi * 2
                          : widget.progress * math.pi * .5),
              ),
            child: child,
          ),
        ),
      ),
    ),
  );
}

enum ClayKind { home, coins, siren, shop, quake }

/// Lightweight vector clay artwork. Static painting is isolated from animated
/// transforms; no models, shaders, network assets or continuously painted scene.
class ClayIllustration extends StatelessWidget {
  const ClayIllustration({
    super.key,
    required this.kind,
    this.size = 100,
    this.color,
  });
  final ClayKind kind;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: RepaintBoundary(
      child: SizedBox.square(
        dimension: size,
        child: CustomPaint(painter: _ClayPainter(kind, color)),
      ),
    ),
  );
}

class _ClayPainter extends CustomPainter {
  const _ClayPainter(this.kind, this.color);
  final ClayKind kind;
  final Color? color;

  Paint ink(Color value) => Paint()..color = value;
  Path polygon(List<Offset> points) => Path()..addPolygon(points, true);
  void gradient(Canvas canvas, Path path, Color start, Color end) {
    canvas.drawPath(
      path,
      Paint()
        ..shader = ui.Gradient.linear(
          path.getBounds().topLeft,
          path.getBounds().bottomRight,
          [start, end],
        ),
    );
  }

  void rounded(Canvas c, Rect rect, double radius, Color start, Color end) {
    c.drawRRect(
      RRect.fromRectAndRadius(rect, Radius.circular(radius)),
      Paint()
        ..shader = ui.Gradient.linear(rect.topLeft, rect.bottomRight, [
          start,
          end,
        ]),
    );
  }

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / 120, size.height / 120);
    canvas.drawOval(
      const Rect.fromLTWH(18, 96, 88, 10),
      Paint()
        ..color = const Color(0x220F172A)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 5),
    );
    switch (kind) {
      case ClayKind.home:
        _house(canvas);
      case ClayKind.coins:
        _coins(canvas);
      case ClayKind.siren:
        _siren(canvas);
      case ClayKind.shop:
        _shop(canvas);
      case ClayKind.quake:
        _quake(canvas);
    }
    canvas.restore();
  }

  void _house(Canvas c) {
    gradient(
      c,
      polygon([
        const Offset(18, 62),
        const Offset(54, 42),
        const Offset(100, 66),
        const Offset(66, 86),
      ]),
      const Color(0xFFF4F8FC),
      const Color(0xFFDCE6F4),
    );
    gradient(
      c,
      polygon([
        const Offset(24, 55),
        const Offset(62, 37),
        const Offset(62, 100),
        const Offset(24, 82),
      ]),
      const Color(0xFFFFFFFF),
      const Color(0xFFDAE6F6),
    );
    gradient(
      c,
      polygon([
        const Offset(62, 37),
        const Offset(99, 57),
        const Offset(99, 82),
        const Offset(62, 100),
      ]),
      const Color(0xFFA6BBE3),
      const Color(0xFF7897CC),
    );
    gradient(
      c,
      polygon([
        const Offset(15, 55),
        const Offset(48, 17),
        const Offset(68, 46),
        const Offset(61, 62),
      ]),
      const Color(0xFF8EB7FF),
      color ?? AppTheme.electricBlue,
    );
    gradient(
      c,
      polygon([
        const Offset(48, 17),
        const Offset(87, 36),
        const Offset(107, 64),
        const Offset(68, 46),
      ]),
      const Color(0xFF568AF1),
      const Color(0xFF1C49A8),
    );
    rounded(
      c,
      const Rect.fromLTWH(37, 65, 15, 25),
      3,
      const Color(0xFFB5CDF7),
      const Color(0xFF769CDB),
    );
    rounded(
      c,
      const Rect.fromLTWH(73, 60, 14, 14),
      3,
      const Color(0xFFD7F3FF),
      const Color(0xFF9ACEF1),
    );
    c.drawLine(
      const Offset(80, 61),
      const Offset(80, 73),
      Paint()
        ..color = Colors.white
        ..strokeWidth = 2,
    );
    c.drawCircle(const Offset(102, 82), 13, ink(const Color(0xFF64C9A6)));
    c.drawCircle(const Offset(97, 75), 11, ink(const Color(0xFFA2E7CE)));
    c.drawLine(
      const Offset(101, 87),
      const Offset(101, 101),
      Paint()
        ..color = const Color(0xFF6D8B84)
        ..strokeWidth = 4
        ..strokeCap = StrokeCap.round,
    );
  }

  void _coins(Canvas c) {
    for (var row = 0; row < 4; row++) {
      final y = 80.0 - row * 9;
      rounded(
        c,
        Rect.fromLTWH(15, y, 52, 15),
        7,
        const Color(0xFFF4BC54),
        const Color(0xFFC5882E),
      );
      c.drawOval(
        Rect.fromLTWH(15, y - 4, 52, 15),
        Paint()
          ..shader = ui.Gradient.linear(Offset(15, y), Offset(67, y + 11), [
            const Color(0xFFFFE7A1),
            const Color(0xFFF8BD4E),
          ]),
      );
      c.drawOval(
        Rect.fromLTWH(21, y - 1, 40, 9),
        Paint()
          ..color = const Color(0xFFEDB853)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.3,
      );
    }
    c.save();
    c.translate(87, 59);
    c.rotate(.23);
    rounded(
      c,
      const Rect.fromLTWH(-21, -30, 43, 64),
      20,
      const Color(0xFFCA902E),
      const Color(0xFFDDA33A),
    );
    rounded(
      c,
      const Rect.fromLTWH(-25, -30, 42, 60),
      20,
      const Color(0xFFFFECA8),
      const Color(0xFFF1B749),
    );
    c.drawOval(
      const Rect.fromLTWH(-19, -23, 29, 46),
      Paint()
        ..color = const Color(0xFFD9A23D)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
    final symbol = TextPainter(
      text: const TextSpan(
        text: 'Rp',
        style: TextStyle(
          color: Color(0xFFB1812E),
          fontSize: 17,
          fontWeight: FontWeight.w900,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    symbol.paint(c, const Offset(-17, -11));
    c.restore();
    c.drawCircle(const Offset(83, 18), 4, ink(const Color(0xFFE8B64A)));
    c.drawCircle(const Offset(102, 30), 2, ink(const Color(0xFFF4CD6D)));
  }

  void _siren(Canvas c) {
    rounded(
      c,
      const Rect.fromLTWH(18, 78, 88, 24),
      12,
      const Color(0xFFB7C7DD),
      const Color(0xFF6C7D97),
    );
    c.drawOval(
      const Rect.fromLTWH(18, 74, 88, 21),
      ink(const Color(0xFFE5EDF7)),
    );
    final dome = Path()
      ..moveTo(29, 80)
      ..lineTo(29, 58)
      ..cubicTo(29, 14, 94, 14, 94, 58)
      ..lineTo(94, 80)
      ..cubicTo(82, 95, 41, 95, 29, 80)
      ..close();
    gradient(
      c,
      dome,
      const Color(0xFFFFA095),
      color ?? const Color(0xFFD82E40),
    );
    final shine = Path()
      ..moveTo(42, 66)
      ..lineTo(42, 53)
      ..quadraticBezierTo(42, 38, 54, 35);
    c.drawPath(
      shine,
      Paint()
        ..color = const Color(0xAAFFFFFF)
        ..strokeWidth = 6
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round,
    );
    final line = Paint()
      ..color = const Color(0xFFE97871)
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;
    c.drawLine(const Offset(60, 7), const Offset(60, 15), line);
    c.drawLine(const Offset(23, 21), const Offset(29, 28), line);
    c.drawLine(const Offset(99, 22), const Offset(93, 29), line);
  }

  void _shop(Canvas c) {
    rounded(
      c,
      const Rect.fromLTWH(28, 57, 65, 38),
      7,
      const Color(0xFFABEDD6),
      color ?? const Color(0xFF3BA888),
    );
    rounded(
      c,
      const Rect.fromLTWH(34, 67, 52, 17),
      3,
      const Color(0xFFE9FAF3),
      const Color(0xFFBEE5D7),
    );
    c.drawLine(
      const Offset(27, 36),
      const Offset(27, 94),
      Paint()
        ..color = const Color(0xFF547469)
        ..strokeWidth = 4,
    );
    c.drawLine(
      const Offset(96, 36),
      const Offset(96, 94),
      Paint()
        ..color = const Color(0xFF547469)
        ..strokeWidth = 4,
    );
    gradient(
      c,
      polygon([
        const Offset(23, 27),
        const Offset(96, 27),
        const Offset(106, 48),
        const Offset(15, 48),
      ]),
      const Color(0xFFC4F3DF),
      const Color(0xFF7AD0AF),
    );
    for (var i = 0; i < 6; i++) {
      final x = 15.0 + i * 15;
      rounded(
        c,
        Rect.fromLTWH(x, 44, 16, 15),
        5,
        i.isEven ? const Color(0xFFFFFFFF) : const Color(0xFF42B991),
        i.isEven ? const Color(0xFFE6F2EC) : const Color(0xFF249973),
      );
    }
    for (final x in [40.0, 85.0]) {
      c.drawCircle(Offset(x, 99), 9, ink(const Color(0xFF536977)));
      c.drawCircle(Offset(x - 1, 98), 4, ink(const Color(0xFFD6E3E9)));
    }
  }

  void _quake(Canvas c) {
    c.save();
    c.translate(0, 3);
    gradient(
      c,
      polygon([
        const Offset(14, 75),
        const Offset(62, 51),
        const Offset(109, 73),
        const Offset(61, 104),
      ]),
      const Color(0xFFDFEAFB),
      const Color(0xFFB7CAEB),
    );
    c.drawPath(
      polygon([
        const Offset(61, 71),
        const Offset(55, 85),
        const Offset(65, 88),
        const Offset(59, 103),
        const Offset(71, 84),
        const Offset(63, 81),
      ]),
      ink(const Color(0xFF8DA5CD)),
    );
    c.translate(15, -5);
    c.scale(.7);
    _house(c);
    c.restore();
    c.drawArc(
      const Rect.fromLTWH(7, 12, 108, 101),
      -.4,
      .85,
      false,
      Paint()
        ..color = const Color(0xFFA8C4F5)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3
        ..strokeCap = StrokeCap.round,
    );
    c.drawArc(
      const Rect.fromLTWH(20, 24, 81, 75),
      -.4,
      .85,
      false,
      Paint()
        ..color = const Color(0xFF78A6F3)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(covariant _ClayPainter oldDelegate) =>
      oldDelegate.kind != kind || oldDelegate.color != color;
}
