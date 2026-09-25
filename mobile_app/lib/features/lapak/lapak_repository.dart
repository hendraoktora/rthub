import '../../core/services/api_service.dart';
import 'lapak_models.dart';

/// Inject this boundary in tests; widgets never issue HTTP requests themselves.
abstract class LapakRepository {
  const LapakRepository();
  Future<List<LapakProduct>> loadProducts();
  Future<Map<String, dynamic>?> loadUser();
  Future<void> save(Map<String, dynamic> fields, {String? id});
  Future<void> delete(String id);
  Future<void> promote(String id, AdPackage package);
}

class ApiLapakRepository extends LapakRepository {
  const ApiLapakRepository();
  @override
  Future<List<LapakProduct>> loadProducts() async {
    List<dynamic> raw;
    try {
      raw = await ApiService.getLapakList(allowFallback: false);
    } catch (_) {
      raw = await ApiService.getLapakList(allowFallback: true);
    }
    return raw
        .whereType<Map>()
        .map((e) => LapakProduct.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
  @override
  Future<Map<String, dynamic>?> loadUser() => ApiService.getUserData();
  @override
  Future<void> save(Map<String, dynamic> fields, {String? id}) async {
    if (id != null) {
      await ApiService.updateLapak(id, fields);
    } else {
      await ApiService.createLapak(fields);
    }
  }

  @override
  Future<void> delete(String id) => ApiService.deleteLapak(id);
  @override
  Future<void> promote(String id, AdPackage package) =>
      ApiService.boostLapakProduk(
        id,
        packageType: package.code,
        durationDays: package.days,
        price: package.price,
        scope: package.scope,
      );
}
