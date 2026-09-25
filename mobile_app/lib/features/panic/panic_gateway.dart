import 'package:geolocator/geolocator.dart';

import '../../core/services/api_service.dart';

/// Coordinates are usable only when both values are finite and in GPS bounds.
class PanicLocation {
  const PanicLocation({
    required this.latitude,
    required this.longitude,
    this.accuracyMeters,
  });

  final double latitude;
  final double longitude;
  final double? accuracyMeters;

  static PanicLocation? tryParse(Object? latitude, Object? longitude) {
    final lat = double.tryParse(latitude?.toString() ?? '');
    final lng = double.tryParse(longitude?.toString() ?? '');
    if (lat == null ||
        lng == null ||
        !lat.isFinite ||
        !lng.isFinite ||
        lat.abs() > 90 ||
        lng.abs() > 180) {
      return null;
    }
    return PanicLocation(latitude: lat, longitude: lng);
  }

  bool get isValid => tryParse(latitude, longitude) != null;

  Uri get mapsUri => Uri.https('www.google.com', '/maps/search/', {
    'api': '1',
    'query': '$latitude,$longitude',
  });
}

class PanicLocationResult {
  const PanicLocationResult({this.location, required this.message});
  final PanicLocation? location;
  final String message;
}

/// Keeps permissions and transport separate from emergency interaction state.
abstract interface class PanicGateway {
  Future<PanicLocationResult> locate();
  Future<Map<String, dynamic>> send({
    required String categoryLabel,
    PanicLocation? location,
  });
}

class DevicePanicGateway implements PanicGateway {
  const DevicePanicGateway();

  @override
  Future<PanicLocationResult> locate() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        return const PanicLocationResult(
          message: 'GPS perangkat belum aktif. SOS tetap bisa dikirim.',
        );
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied)
        permission = await Geolocator.requestPermission();
      if (permission != LocationPermission.always &&
          permission != LocationPermission.whileInUse) {
        return const PanicLocationResult(
          message: 'Izin lokasi belum tersedia. SOS dikirim tanpa titik GPS.',
        );
      }
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 6),
        ),
      );
      final location = PanicLocation(
        latitude: position.latitude,
        longitude: position.longitude,
        accuracyMeters: position.accuracy,
      );
      if (!location.isValid) {
        return const PanicLocationResult(
          message: 'Titik GPS belum valid. SOS tetap bisa dikirim.',
        );
      }
      final accuracy = position.accuracy;
      return PanicLocationResult(
        location: location,
        message: accuracy.isFinite && accuracy >= 0
            ? 'GPS tersedia · akurasi ±${accuracy.round()} m'
            : 'Koordinat GPS tersedia',
      );
    } catch (_) {
      return const PanicLocationResult(
        message: 'Lokasi belum diperoleh. SOS tetap bisa dikirim tanpa GPS.',
      );
    }
  }

  @override
  Future<Map<String, dynamic>> send({
    required String categoryLabel,
    PanicLocation? location,
  }) => ApiService.triggerPanicAlert(
    catatan: 'Darurat: $categoryLabel - Mohon segera bantuan!',
    latitude: location?.latitude,
    longitude: location?.longitude,
  );
}
