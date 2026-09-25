import '../../core/services/api_service.dart';

/// A section can fail independently without replacing already loaded content.
class HomeSnapshot {
  const HomeSnapshot({
    this.user,
    this.kas,
    this.agenda,
    this.announcements,
    this.products,
    this.invoices,
    this.earthquake,
    this.failedSections = const {},
  });

  final Map<String, dynamic>? user;
  final Map<String, dynamic>? kas;
  final List<dynamic>? agenda;
  final List<dynamic>? announcements;
  final List<dynamic>? products;
  final List<dynamic>? invoices;
  final Map<String, dynamic>? earthquake;
  final Set<String> failedSections;

  HomeSnapshot retaining(HomeSnapshot previous) => HomeSnapshot(
    user: user ?? previous.user,
    kas: kas ?? previous.kas,
    agenda: agenda ?? previous.agenda,
    announcements: announcements ?? previous.announcements,
    products: products ?? previous.products,
    invoices: invoices ?? previous.invoices,
    earthquake: earthquake ?? previous.earthquake,
    failedSections: failedSections,
  );
}

abstract interface class HomeRepository {
  Future<HomeSnapshot> load();
}

class ApiHomeRepository implements HomeRepository {
  const ApiHomeRepository();

  @override
  Future<HomeSnapshot> load() async {
    final failures = <String>{};
    Future<T?> read<T>(String section, Future<T?> Function() fetch) async {
      try {
        final result = await fetch();
        if (result == null) failures.add(section);
        return result;
      } catch (_) {
        failures.add(section);
        return null;
      }
    }

    final results = await Future.wait<Object?>([
      read('profil', ApiService.getUserData),
      read('kas', () => ApiService.getKasSummary(allowFallback: false)),
      read('agenda', () => ApiService.getAgendaList(allowFallback: false)),
      read('pengumuman', () => ApiService.getBeritaFeed(allowFallback: false)),
      read('lapak', () async {
        try {
          return await ApiService.getLapakList(allowFallback: false);
        } catch (_) {
          return await ApiService.getLapakList(allowFallback: true);
        }
      }),
      read('iuran', () => ApiService.getTagihanSaya(allowFallback: false)),
      read('BMKG', () => ApiService.getGempaTerkini(allowFallback: false)),
    ]);
    return HomeSnapshot(
      user: results[0] as Map<String, dynamic>?,
      kas: results[1] as Map<String, dynamic>?,
      agenda: results[2] as List<dynamic>?,
      announcements: results[3] as List<dynamic>?,
      products: results[4] as List<dynamic>?,
      invoices: results[5] as List<dynamic>?,
      earthquake: results[6] as Map<String, dynamic>?,
      failedSections: failures,
    );
  }
}
