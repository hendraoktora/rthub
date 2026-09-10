import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class AgendaScreen extends StatefulWidget {
  const AgendaScreen({super.key});

  @override
  State<AgendaScreen> createState() => _AgendaScreenState();
}

class _AgendaScreenState extends State<AgendaScreen> {
  int _selectedDateIndex = 1; // Default to 'Sel 9'
  String _selectedCategory = 'SEMUA';
  Map<String, dynamic>? _user;
  List<Map<String, dynamic>> _agendaList = [];
  bool _isLoading = false;

  final Set<String> _remindedIds = {};

  @override
  void initState() {
    super.initState();
    _loadUser();
    _loadAgendaFromDb();
  }

  void _loadUser() async {
    final user = await ApiService.getUserData();
    if (mounted) setState(() => _user = user);
  }

  Future<void> _loadAgendaFromDb() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.getAgendaList();
      if (mounted) {
        if (data.isNotEmpty) {
          setState(() {
            _agendaList = data.map((item) {
              final start = item['tanggalMulai'] != null ? DateTime.tryParse(item['tanggalMulai']) : null;
              final end = item['tanggalSelesai'] != null ? DateTime.tryParse(item['tanggalSelesai']) : null;
              final kat = (item['kategori'] ?? 'KERJA_BAKTI').toString().toUpperCase();

              String dayName = 'Kegiatan';
              String dateStr = '-';
              String timeStr = '08:00 WIB';

              if (start != null) {
                final days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
                final months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                dayName = days[start.weekday - 1];
                dateStr = '${start.day} ${months[start.month]} ${start.year}';
                timeStr = '${start.hour.toString().padLeft(2, '0')}:${start.minute.toString().padLeft(2, '0')} WIB';
                if (end != null) {
                  timeStr = '$timeStr - ${end.hour.toString().padLeft(2, '0')}:${end.minute.toString().padLeft(2, '0')} WIB';
                }
              }

              Color color = AppTheme.successGreen;
              if (kat.contains('RAPAT')) {
                color = AppTheme.primaryNavy;
              } else if (kat.contains('POSYANDU')) {
                color = AppTheme.purpleIndigo;
              } else if (kat.contains('KESEHATAN') || kat.contains('FOGGING')) {
                color = AppTheme.warningAmber;
              } else if (kat.contains('KEAGAMAAN')) {
                color = AppTheme.electricBlue;
              }

              return {
                'id': item['id']?.toString() ?? UniqueKey().toString(),
                'title': item['judul'] ?? 'Agenda Lingkungan',
                'date': dateStr,
                'day': dayName,
                'time': timeStr,
                'location': item['lokasi'] ?? 'Wilayah RT',
                'category': kat,
                'level': 'Level ${item['scope'] ?? 'RT'}',
                'levelColor': color,
                'description': item['deskripsi'] ?? 'Kegiatan warga lingkungan bersama.',
                'raw': item,
              };
            }).toList();
          });
        } else {
          // If empty in DB, show helpful default initial items
          _setDefaultInitialAgenda();
        }
      }
    } catch (_) {
      if (_agendaList.isEmpty) _setDefaultInitialAgenda();
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _setDefaultInitialAgenda() {
    setState(() {
      _agendaList = [
        {
          'id': 'seed_1',
          'title': 'Kerja Bakti Bersih Saluran Air & Selokan',
          'date': '9 Sep 2026',
          'day': 'Selasa',
          'time': '07:00 - 10:00 WIB',
          'location': 'Sepanjang Jl. Melati Blok C & D',
          'category': 'KERJA_BAKTI',
          'level': 'Level RT ${_user?['rt']?['nomor'] ?? '03'}',
          'levelColor': AppTheme.successGreen,
          'description': 'Pembersihan endapan lumpur got dan sampah ranting daun mengantisipasi musim hujan deras.',
        },
        {
          'id': 'seed_2',
          'title': 'Fogging Nyamuk DBD Serentak RW',
          'date': '9 Sep 2026',
          'day': 'Selasa',
          'time': '15:30 - 17:30 WIB',
          'location': 'Seluruh Lingkungan RW ${_user?['rw']?['nomor'] ?? '05'}',
          'category': 'KESEHATAN',
          'level': 'Level RW ${_user?['rw']?['nomor'] ?? '05'}',
          'levelColor': AppTheme.warningAmber,
          'description': 'Pengasapan nyamuk aedes aegypti serentak. Harap menutup makanan dan membuka jendela saat petugas lewat.',
        },
        {
          'id': 'seed_3',
          'title': 'Posyandu Balita & Lansia Rutin',
          'date': '12 Sep 2026',
          'day': 'Jumat',
          'time': '08:30 - 11:00 WIB',
          'location': 'Balai Warga / Posyandu Flamboyan',
          'category': 'POSYANDU',
          'level': 'Level RT ${_user?['rt']?['nomor'] ?? '03'}',
          'levelColor': AppTheme.purpleIndigo,
          'description': 'Penimbangan berat badan, imunisasi balita, dan cek tensi/gula darah gratis untuk lansia.',
        },
      ];
    });
  }

  void _showTambahAgendaModal() {
    final messenger = ScaffoldMessenger.of(context);
    final titleCtrl = TextEditingController();
    final locCtrl = TextEditingController();
    final timeCtrl = TextEditingController(text: '08:00');
    final descCtrl = TextEditingController();
    String category = 'KERJA_BAKTI';
    String scope = 'RT';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) => StatefulBuilder(
        builder: (modalContext, setModalState) => Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.slateBorder,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('📅 Buat Agenda Kegiatan RT', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const Text('Data otomatis tersinkronisasi ke seluruh warga & web admin',
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                const SizedBox(height: 16),

                const Text('Judul Kegiatan *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(hintText: 'Contoh: Kerja Bakti Got Blok C'),
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Kategori', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: category,
                            items: const [
                              DropdownMenuItem(value: 'KERJA_BAKTI', child: Text('Kerja Bakti')),
                              DropdownMenuItem(value: 'RAPAT_RT', child: Text('Rapat RT')),
                              DropdownMenuItem(value: 'POSYANDU', child: Text('Posyandu')),
                              DropdownMenuItem(value: 'KESEHATAN', child: Text('Fogging / Sehat')),
                              DropdownMenuItem(value: 'KEAGAMAAN', child: Text('Pengajian')),
                            ],
                            onChanged: (val) {
                              if (val != null) setModalState(() => category = val);
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Level Scope', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: scope,
                            items: const [
                              DropdownMenuItem(value: 'RT', child: Text('Level RT')),
                              DropdownMenuItem(value: 'RW', child: Text('Level RW')),
                            ],
                            onChanged: (val) {
                              if (val != null) setModalState(() => scope = val);
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Jam Pelaksanaan', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: timeCtrl,
                            decoration: const InputDecoration(hintText: '08:00'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Lokasi Tempat *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: locCtrl,
                            decoration: const InputDecoration(hintText: 'Balai Warga / Blok C'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                const Text('Deskripsi & Petunjuk Warga', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: descCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(hintText: 'Jelaskan detail acara dan perlengkapan...'),
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (titleCtrl.text.trim().isEmpty) return;
                      Navigator.pop(modalContext);

                      try {
                        final startTime = DateTime.now().toIso8601String();
                        await ApiService.createAgenda({
                          'judul': titleCtrl.text.trim(),
                          'kategori': category,
                          'tanggalMulai': startTime,
                          'lokasi': locCtrl.text.trim().isNotEmpty ? locCtrl.text.trim() : 'Lingkungan RT',
                          'deskripsi': descCtrl.text.trim().isNotEmpty ? descCtrl.text.trim() : null,
                          'scope': scope,
                        });
                        messenger.showSnackBar(
                          const SnackBar(
                            content: Text('✅ Agenda kegiatan RT berhasil disimpan ke Database!'),
                            backgroundColor: AppTheme.successGreen,
                          ),
                        );
                        _loadAgendaFromDb();
                      } catch (e) {
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text('⚠️ ${e.toString().replaceAll('Exception: ', '')}'),
                            backgroundColor: AppTheme.alertRed,
                          ),
                        );
                      }
                    },
                    child: const Text('Simpan & Terbitkan Agenda ke Database'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _handleDeleteAgenda(String id, String title) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Agenda?'),
        content: Text('Yakin ingin menghapus agenda "$title"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.alertRed),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        if (!id.startsWith('seed_')) {
          await ApiService.deleteAgenda(id);
        }
        if (!mounted) return;
        setState(() {
          _agendaList.removeWhere((item) => item['id'] == id);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Agenda berhasil dihapus'), backgroundColor: AppTheme.successGreen),
        );
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menghapus: $e'), backgroundColor: AppTheme.alertRed),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final rtNomor = _user?['rt']?['nomor'] ?? '03';
    final rwNomor = _user?['rw']?['nomor'] ?? '05';
    final role = _user?['role']?.toString().toUpperCase() ?? 'WARGA';
    final isPengurus = role == 'ADMIN_RT' || role == 'KETUA_RT' || role == 'SEKRETARIS';

    final days = [
      {'day': 'Sen', 'date': '8'},
      {'day': 'Sel', 'date': '9'},
      {'day': 'Rab', 'date': '10'},
      {'day': 'Kam', 'date': '11'},
      {'day': 'Jum', 'date': '12'},
      {'day': 'Sab', 'date': '13'},
      {'day': 'Min', 'date': '14'},
    ];

    final filtered = _agendaList.where((item) {
      if (_selectedCategory == 'SEMUA') return true;
      return item['category'] == _selectedCategory;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text('Agenda Kegiatan RT $rtNomor'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh DB',
            onPressed: _loadAgendaFromDb,
          ),
          if (isPengurus)
            IconButton(
              icon: const Icon(Icons.add_circle_outline_rounded, color: AppTheme.electricBlue),
              tooltip: 'Tambah Agenda',
              onPressed: _showTambahAgendaModal,
            ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadAgendaFromDb,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Info Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.primaryNavy, Color(0xFF1E293B)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '📅 Kalender Kegiatan Lingkungan',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Wilayah RT $rtNomor / RW $rwNomor (Tersinkron Database)',
                            style: const TextStyle(color: AppTheme.skyAzure, fontSize: 11),
                          ),
                        ],
                      ),
                      if (isPengurus)
                        ElevatedButton(
                          onPressed: _showTambahAgendaModal,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.electricBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('+ Buat', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),

                // Calendar Days Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(days.length, (index) {
                    final isSelected = index == _selectedDateIndex;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedDateIndex = index),
                      child: Container(
                        width: 44,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.electricBlue : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isSelected ? AppTheme.electricBlue : AppTheme.slateBorder,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: AppTheme.electricBlue.withValues(alpha: 0.3),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  )
                                ]
                              : null,
                        ),
                        child: Column(
                          children: [
                            Text(
                              days[index]['day']!,
                              style: TextStyle(
                                fontSize: 10,
                                color: isSelected ? Colors.white.withValues(alpha: 0.85) : AppTheme.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              days[index]['date']!,
                              style: TextStyle(
                                fontSize: 14,
                                color: isSelected ? Colors.white : AppTheme.textPrimary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 18),

                // Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('SEMUA', 'Semua Agenda'),
                      _buildFilterChip('KERJA_BAKTI', '🧹 Kerja Bakti'),
                      _buildFilterChip('RAPAT_RT', '🏛️ Rapat RT'),
                      _buildFilterChip('POSYANDU', '👶 Posyandu PKK'),
                      _buildFilterChip('KESEHATAN', '💉 Kesehatan/Fogging'),
                      _buildFilterChip('KEAGAMAAN', '🕌 Pengajian'),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Agenda List Cards
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Daftar Kegiatan (${filtered.length})',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                    ),
                    if (_isLoading)
                      const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                  ],
                ),
                const SizedBox(height: 12),

                if (filtered.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.slateBorder),
                    ),
                    child: Center(
                      child: Column(
                        children: [
                          const Icon(Icons.event_busy_rounded, color: AppTheme.textMuted, size: 36),
                          const SizedBox(height: 8),
                          const Text('Belum ada agenda pada kategori ini',
                              style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                          if (isPengurus) ...[
                            const SizedBox(height: 8),
                            TextButton.icon(
                              onPressed: _showTambahAgendaModal,
                              icon: const Icon(Icons.add, size: 16),
                              label: const Text('Tambah Agenda Baru', style: TextStyle(fontSize: 12)),
                            ),
                          ],
                        ],
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: filtered.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      final isReminded = _remindedIds.contains(item['id']);

                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppTheme.slateBorder),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: (item['levelColor'] as Color).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    item['level'],
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: item['levelColor'] as Color,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: Icon(
                                        isReminded ? Icons.notifications_active_rounded : Icons.notifications_none_rounded,
                                        color: isReminded ? AppTheme.electricBlue : AppTheme.textMuted,
                                        size: 20,
                                      ),
                                      tooltip: isReminded ? 'Pengingat Aktif' : 'Pasang Pengingat',
                                      onPressed: () {
                                        setState(() {
                                          if (isReminded) {
                                            _remindedIds.remove(item['id']);
                                          } else {
                                            _remindedIds.add(item['id']);
                                          }
                                        });
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(
                                            content: Text(!isReminded
                                                ? '🔔 Pengingat "${item['title']}" telah diaktifkan!'
                                                : '🔕 Pengingat dinonaktifkan.'),
                                            duration: const Duration(seconds: 2),
                                          ),
                                        );
                                      },
                                    ),
                                    if (isPengurus)
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline_rounded, color: AppTheme.alertRed, size: 18),
                                        tooltip: 'Hapus Agenda',
                                        onPressed: () => _handleDeleteAgenda(item['id'], item['title']),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item['title'],
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.access_time_rounded, size: 13, color: AppTheme.textSecondary),
                                const SizedBox(width: 4),
                                Text(
                                  '${item['day']}, ${item['time']}',
                                  style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on_outlined, size: 13, color: AppTheme.textMuted),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    item['location'],
                                    style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                                  ),
                                ),
                              ],
                            ),
                            if (item['description'] != null) ...[
                              const SizedBox(height: 10),
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppTheme.slateLight,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  item['description'],
                                  style: const TextStyle(fontSize: 11, color: AppTheme.textPrimary, height: 1.3),
                                ),
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String cat, String label) {
    final isSelected = _selectedCategory == cat;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: GestureDetector(
        onTap: () => setState(() => _selectedCategory = cat),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primaryNavy : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppTheme.primaryNavy : AppTheme.slateBorder,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : AppTheme.textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}
