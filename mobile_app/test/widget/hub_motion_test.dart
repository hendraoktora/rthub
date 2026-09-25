import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rthub_mobile/core/widgets/hub_motion.dart';

void main() {
  testWidgets(
    'tilt resets after release and does not consume carousel swipes',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: DepthCarousel(
              height: 220,
              children: [
                TiltCard(
                  child: ColoredBox(
                    color: Colors.blue,
                    child: Center(child: Text('Kas')),
                  ),
                ),
                TiltCard(
                  child: ColoredBox(
                    color: Colors.green,
                    child: Center(child: Text('Gempa')),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
      final first = find.byType(TiltCard).first;
      final gesture = await tester.startGesture(
        tester.getCenter(first) + const Offset(50, 10),
      );
      await tester.pump(const Duration(milliseconds: 120));
      final tilted = tester
          .widgetList<Transform>(
            find.descendant(of: first, matching: find.byType(Transform)),
          )
          .last;
      expect(tilted.transform.entry(3, 2), isNot(0));
      await gesture.up();
      await tester.pump(const Duration(milliseconds: 400));
      await tester.drag(find.byType(PageView), const Offset(-650, 0));
      await tester.pumpAndSettle();
      final pageView = tester.widget<PageView>(find.byType(PageView));
      expect(pageView.controller!.page, closeTo(1, .01));
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'reduced motion has no repeating SOS animation and retains action',
    (tester) async {
      var opens = 0;
      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(disableAnimations: true),
            child: Scaffold(body: PulseSosButton(onPressed: () => opens++)),
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byType(InkWell));
      expect(opens, 1);
      await tester.pumpAndSettle();
      expect(tester.binding.hasScheduledFrame, isFalse);
    },
  );

  testWidgets('custom pull refresh invokes its loader once', (tester) async {
    var refreshes = 0;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: CustomScrollView(
            physics: const BouncingScrollPhysics(
              parent: AlwaysScrollableScrollPhysics(),
            ),
            slivers: [
              HubRefreshControl(
                onRefresh: () async {
                  refreshes++;
                },
              ),
              const SliverToBoxAdapter(
                child: SizedBox(height: 1200, child: Text('Warga')),
              ),
            ],
          ),
        ),
      ),
    );
    await tester.drag(find.byType(CustomScrollView), const Offset(0, 400));
    await tester.pumpAndSettle();
    expect(refreshes, 1);
    expect(tester.takeException(), isNull);
  });
}
