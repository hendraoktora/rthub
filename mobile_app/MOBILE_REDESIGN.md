# RT Hub mobile redesign

## Konsep pengalaman

RT Hub memakai bahasa visual **porcelain neighbourhood**: latar `#F8FAFC`, permukaan putih hangat, navy `#0F172A` sebagai jangkar teks, electric blue `#2563EB` untuk navigasi dan status aktif, emerald `#10B981` untuk kas serta Lapak, dan red `#EF4444` hanya untuk keadaan darurat. Bentuk kartu memiliki radius 18–28 dp, satu bayangan lembut di bawahnya, dan highlight tipis di sisi atas sehingga clay terasa punya volume tanpa memenuhi layar dengan efek.

Home dibuka dengan header profil yang tinggi. Sapaan, avatar, rumah, RT/RW, dan ilustrasi rumah berada di area parallax. Ketika pengguna menggulir, area itu mengecil menjadi app bar kaca yang tetap menampilkan avatar dan akses BMKG. Urutan konten mengikuti keputusan harian warga: status lingkungan, dua kartu pantau (kas dan BMKG), tepat lima quick action, sorotan Lapak berbayar, agenda, lalu pengumuman. Lima quick action adalah Iuran, Lapor, Lapak, Agenda, dan CCTV; SOS tetap menjadi aksi mengambang terpisah agar tidak tertukar dengan tugas rutin.

Hierarki teks menggunakan Plus Jakarta Sans lokal: judul layar 27–32 px dengan weight 800–900, judul section 21–23 px, body 14–15 px dengan line-height 1.5, dan eyebrow 9–11 px dengan letter spacing. Setiap informasi utama mempunyai label sekunder, status kosong yang jujur, serta pesan kegagalan per-section sehingga satu endpoint bermasalah tidak menghapus konten yang sudah termuat.

Lapak menempatkan satu hero hijau muda, pencarian, filter kategori horizontal, sorotan produk sponsored berbentuk carousel, dan katalog lazy grid. Kartu produk memakai foto warga yang tersedia dari API, fallback ilustrasi vektor clay saat foto kosong, badge 3D `SPONSORED`, seller ID untuk filter “Lapak saya”, serta aksi edit/hapus/promosi hanya pada pemilik yang terautentikasi. Modal jangkauan menampilkan RT, RW, Kelurahan, dan Global dengan scope backend `RT`, `RW`, `KELURAHAN`, dan `SEMUA`. Tarif berasal dari katalog aplikasi saat ini; aktivasi baru disebut terkonfirmasi setelah server mengembalikan 2xx, karena backend belum memiliki endpoint pembayaran.

SOS menggunakan bottom sheet yang dapat di-scroll. Pengguna memilih satu dari tiga kategori, melihat status GPS nyata (termasuk akurasi bila tersedia), lalu melewati langkah konfirmasi eksplisit. Pengiriman gagal mempertahankan sheet terbuka, mengembalikan penanda self-alert, dan menyediakan retry. Dialog SOS masuk dipin di bagian atas, memutar alarm melalui channel native bila tersedia, mempunyai mute instan yang tidak menutup dialog, memvalidasi koordinat dalam batas GPS, dan baru menampilkan link peta jika koordinat valid.

## Motion behavior

`TiltCard` menggunakan `Matrix4` dengan perspective entry kecil (`.0012`) dan rotasi maksimal sekitar 3.7°. Pointer/touch hanya mengubah state lokal kartu; gesture horizontal tetap diteruskan ke `PageView`. `DepthCarousel` memakai `PageController` dengan `BouncingScrollPhysics`, skala kartu tidak aktif, rotasi kecil, dan indicator yang memanjang mengikuti jarak halaman.

`StaggeredEntry` menggabungkan `FadeTransition` dan `SlideTransition` dengan delay berdasarkan index. `HubRefreshControl` memakai `CupertinoSliverRefreshControl` dan memutar logo RT Hub sebagai indikator 3D. `PulseSosButton` mengisolasi repaint, berhenti ketika aplikasi tidak terlihat atau perangkat meminta reduced motion, dan memberi haptic feedback saat ditekan. Semua animasi menghormati `MediaQuery.disableAnimations` sehingga test, aksesibilitas, dan perangkat low-power tetap tenang.

## Struktur Flutter

`lib/core/widgets/hub_motion.dart` berisi primitive gerak dan ilustrasi vektor yang tidak memerlukan model 3D atau shader runtime. `HomeRepository` dan `LapakRepository` memisahkan widget dari HTTP sehingga fixture test bisa dipakai tanpa akun atau jaringan. `PanicGateway` memisahkan izin lokasi, validasi koordinat, dan pengiriman API. `ApiService` menyediakan mode strict `allowFallback: false` untuk layar baru; mode lama tetap tersedia bagi layar yang belum dimigrasikan.

Kartu dan daftar memakai `SliverChildBuilderDelegate`, `RepaintBoundary`, gambar dengan `cacheWidth`, serta rebuild lokal. Sasaran desain adalah frame 60 Hz (sekitar 16 ms) dan tetap nyaman pada perangkat 120 Hz; angka FPS produksi perlu diukur lagi di Flutter profile mode dan DevTools pada perangkat target.

## Data dan batas backend

Base URL tetap `https://api.rthub.id/api`. Endpoint Lapak saat ini memiliki GET/POST `/lapak`, POST `/lapak/:id/boost`, dan DELETE `/lapak/:id`; belum ada PATCH produk dan belum ada endpoint pembayaran. UI menampilkan pesan server yang menjelaskan keterbatasan tersebut dan tidak melakukan delete-create diam-diam. SOS terus memakai endpoint yang ada dan geolocator perangkat; tidak ada koordinat demo atau keberhasilan pengiriman yang dibuat-buat.
