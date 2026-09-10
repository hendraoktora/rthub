class NikData {
  final bool isValid;
  final String? nik;
  final String? jenisKelamin;
  final String? tanggalLahir;
  final int? usia;
  final String? provinsi;
  final String? kotaKabupaten;
  final String? kecamatan;
  final String? kelurahan;
  final String? errorMessage;

  NikData({
    required this.isValid,
    this.nik,
    this.jenisKelamin,
    this.tanggalLahir,
    this.usia,
    this.provinsi,
    this.kotaKabupaten,
    this.kecamatan,
    this.kelurahan,
    this.errorMessage,
  });
}

class NikService {
  static const Map<String, String> _provinsiMap = {
    '11': 'Aceh',
    '12': 'Sumatera Utara',
    '13': 'Sumatera Barat',
    '14': 'Riau',
    '15': 'Jambi',
    '16': 'Sumatera Selatan',
    '17': 'Bengkulu',
    '18': 'Lampung',
    '19': 'Kepulauan Bangka Belitung',
    '21': 'Kepulauan Riau',
    '31': 'DKI Jakarta',
    '32': 'Jawa Barat',
    '33': 'Jawa Tengah',
    '34': 'DI Yogyakarta',
    '35': 'Jawa Timur',
    '36': 'Banten',
    '51': 'Bali',
    '52': 'Nusa Tenggara Barat',
    '53': 'Nusa Tenggara Timur',
    '61': 'Kalimantan Barat',
    '62': 'Kalimantan Tengah',
    '63': 'Kalimantan Selatan',
    '64': 'Kalimantan Timur',
    '65': 'Kalimantan Utara',
    '71': 'Sulawesi Utara',
    '72': 'Sulawesi Tengah',
    '73': 'Sulawesi Selatan',
    '74': 'Sulawesi Tenggara',
    '75': 'Gorontalo',
    '76': 'Sulawesi Barat',
    '81': 'Maluku',
    '82': 'Maluku Utara',
    '91': 'Papua Barat',
    '92': 'Papua Barat Daya',
    '93': 'Papua Selatan',
    '94': 'Papua Tengah',
    '95': 'Papua Pegunungan',
    '96': 'Papua',
  };

  static const Map<String, String> _kabKotaMap = {
    // DKI Jakarta
    '3101': 'Kab. Kepulauan Seribu',
    '3171': 'Kota Jakarta Selatan',
    '3172': 'Kota Jakarta Timur',
    '3173': 'Kota Jakarta Pusat',
    '3174': 'Kota Jakarta Barat',
    '3175': 'Kota Jakarta Utara',
    // Jawa Barat
    '3201': 'Kab. Bogor',
    '3202': 'Kab. Sukabumi',
    '3203': 'Kab. Cianjur',
    '3204': 'Kab. Bandung',
    '3205': 'Kab. Garut',
    '3206': 'Kab. Tasikmalaya',
    '3207': 'Kab. Ciamis',
    '3208': 'Kab. Kuningan',
    '3209': 'Kab. Cirebon',
    '3210': 'Kab. Majalengka',
    '3211': 'Kab. Sumedang',
    '3212': 'Kab. Indramayu',
    '3213': 'Kab. Subang',
    '3214': 'Kab. Purwakarta',
    '3215': 'Kab. Karawang',
    '3216': 'Kab. Bekasi',
    '3217': 'Kab. Bandung Barat',
    '3218': 'Kab. Pangandaran',
    '3271': 'Kota Bogor',
    '3272': 'Kota Sukabumi',
    '3273': 'Kota Bandung',
    '3274': 'Kota Cirebon',
    '3275': 'Kota Bekasi',
    '3276': 'Kota Depok',
    '3277': 'Kota Cimahi',
    '3278': 'Kota Tasikmalaya',
    '3279': 'Kota Banjar',
    // Banten
    '3601': 'Kab. Pandeglang',
    '3602': 'Kab. Lebak',
    '3603': 'Kab. Tangerang',
    '3604': 'Kab. Serang',
    '3671': 'Kota Tangerang',
    '3672': 'Kota Cilegon',
    '3673': 'Kota Serang',
    '3674': 'Kota Tangerang Selatan',
    // Jawa Tengah
    '3301': 'Kab. Cilacap',
    '3302': 'Kab. Banyumas',
    '3371': 'Kota Magelang',
    '3372': 'Kota Surakarta (Solo)',
    '3373': 'Kota Salatiga',
    '3374': 'Kota Semarang',
    '3375': 'Kota Pekalongan',
    '3376': 'Kota Tegal',
    // Jawa Timur
    '3571': 'Kota Kediri',
    '3572': 'Kota Blitar',
    '3573': 'Kota Malang',
    '3574': 'Kota Probolinggo',
    '3575': 'Kota Pasuruan',
    '3576': 'Kota Mojokerto',
    '3577': 'Kota Madiun',
    '3578': 'Kota Surabaya',
    '3579': 'Kota Batu',
    // DI Yogyakarta
    '3401': 'Kab. Kulon Progo',
    '3402': 'Kab. Bantul',
    '3403': 'Kab. Gunungkidul',
    '3404': 'Kab. Sleman',
    '3471': 'Kota Yogyakarta',
    // Bali & Lainnya
    '5171': 'Kota Denpasar',
    '1271': 'Kota Medan',
    '1671': 'Kota Palembang',
    '7371': 'Kota Makassar',
  };

  static Future<NikData> parseNik(String nikInput) async {
    final cleanNik = nikInput.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanNik.length != 16) {
      return NikData(
        isValid: false,
        errorMessage: 'NIK harus berjumlah 16 digit angka.',
      );
    }

    return parseNikLocal(cleanNik);
  }

  static NikData parseNikLocal(String nik) {
    try {
      final provCode = nik.substring(0, 2);
      final kabKotaCode = nik.substring(0, 4);
      final rawDay = int.parse(nik.substring(6, 8));
      final month = int.parse(nik.substring(8, 10));
      final yearShort = int.parse(nik.substring(10, 12));

      final isFemale = rawDay > 40;
      final day = isFemale ? rawDay - 40 : rawDay;

      // Estimate century (if YY > 30 => 19YY, else 20YY)
      final currentYear = DateTime.now().year;
      final currentYearLast2 = currentYear % 100;
      final fullYear = (yearShort > currentYearLast2) ? 1900 + yearShort : 2000 + yearShort;
      final age = currentYear - fullYear;

      final provinsi = _provinsiMap[provCode] ?? 'Provinsi (Kode $provCode)';
      final kotaKabupaten = _kabKotaMap[kabKotaCode] ?? 'Kab/Kota (Kode $kabKotaCode)';
      final jenisKelamin = isFemale ? 'Perempuan' : 'Laki-laki';
      final formattedDate = '${day.toString().padLeft(2, '0')}/${month.toString().padLeft(2, '0')}/$fullYear';

      return NikData(
        isValid: true,
        nik: nik,
        jenisKelamin: jenisKelamin,
        tanggalLahir: formattedDate,
        usia: age >= 0 ? age : 0,
        provinsi: provinsi,
        kotaKabupaten: kotaKabupaten,
        kecamatan: null,
      );
    } catch (e) {
      return NikData(
        isValid: false,
        errorMessage: 'Format NIK tidak valid',
      );
    }
  }
}
