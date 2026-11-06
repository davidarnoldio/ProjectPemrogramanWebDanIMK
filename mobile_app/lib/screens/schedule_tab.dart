import 'package:flutter/material.dart';
import 'package:ug_attendance_mobile/widgets/batik_widgets.dart';
import 'package:ug_attendance_mobile/widgets/aesthetic_page.dart';

class ScheduleTab extends StatefulWidget {
  final Map<String, dynamic> student;
  final List<dynamic>? schedules;

  const ScheduleTab({
    super.key,
    required this.student,
    this.schedules,
  });

  @override
  State<ScheduleTab> createState() => _ScheduleTabState();
}

class _ScheduleTabState extends State<ScheduleTab> {
  int _selectedDayIndex = 0;

  final List<Map<String, String>> _weekdays = [
    {"day": "Sen", "date": "20"},
    {"day": "Sel", "date": "21"},
    {"day": "Rab", "date": "22"},
    {"day": "Kam", "date": "23"},
    {"day": "Jum", "date": "24"},
    {"day": "Sab", "date": "25"},
  ];

  // Real class data for student Ahmad Fauzi (Class 2KA01 - Sistem Informasi)
  final List<Map<String, dynamic>> _realClasses = [
    {
      "time": "08:00 - 09:40",
      "course": "Pemrograman Web Berbasis Framework",
      "room": "Kelas 2KA01 • Ruang Lab E301",
      "lecturer": "Dr. Budi Santoso, S.Kom., M.M.S.I.",
      "status": "Hadir",
      "color": const Color(0xFF15803D),
      "bgColor": const Color(0xFFDCFCE7),
    },
    {
      "time": "10:00 - 11:40",
      "course": "Sistem Basis Data Lanjut",
      "room": "Kelas 2KA01 • Ruang Lab E302",
      "lecturer": "Rina Wijaya, S.T., M.Kom.",
      "status": "Menunggu",
      "color": const Color(0xFF1D4ED8),
      "bgColor": const Color(0xFFDBEAFE),
    },
    {
      "time": "13:00 - 14:40",
      "course": "Analisis & Perancangan Sistem Informasi",
      "room": "Kelas 2KA01 • Ruang 2.3",
      "lecturer": "Hendra Kusuma, S.Kom., M.T.I.",
      "status": "Belum",
      "color": const Color(0xFF64748B),
      "bgColor": const Color(0xFFF1F5F9),
    },
    {
      "time": "15:00 - 16:40",
      "course": "Pemrograman Perangkat Bergerak (Mobile)",
      "room": "Kelas 2KA01 • Ruang Lab E303",
      "lecturer": "Siti Aminah, S.Si., M.Kom.",
      "status": "Belum",
      "color": const Color(0xFF64748B),
      "bgColor": const Color(0xFFF1F5F9),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: AestheticPageWrapper(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                child: Row(
                  children: [
                    const Text(
                      'Jadwal Kuliah',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.12),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Text(
                        'T.A. 2026/2027 Ganjil',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF581C87),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Top Batik Ribbon Trim
              const BatikRibbonTrim(height: 3),
              const SizedBox(height: 14),

              // Horizontal Weekday Selector - Solid White for unselected, Gold for selected
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(_weekdays.length, (index) {
                    final isSelected = index == _selectedDayIndex;
                    final item = _weekdays[index];
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedDayIndex = index;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 48,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFFDE047) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? const Color(0xFFFDE047)
                                : const Color(0xFFE2E8F0),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: isSelected
                                  ? const Color(0xFFFDE047).withValues(alpha: 0.35)
                                  : Colors.black.withValues(alpha: 0.12),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              item["day"]!,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: isSelected
                                    ? const Color(0xFF140224)
                                    : const Color(0xFF64748B),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item["date"]!,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: isSelected
                                    ? const Color(0xFF140224)
                                    : const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),

              const SizedBox(height: 18),

              // Class list for selected day - Solid White Cards
              Expanded(
                child: Builder(
                  builder: (context) {
                    final displayedClasses = widget.schedules ?? _realClasses;

                    if (displayedClasses.isEmpty) {
                      return Center(
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.12),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.event_busy_rounded,
                                size: 48,
                                color: Color(0xFF94A3B8),
                              ),
                              SizedBox(height: 12),
                              Text(
                                'Belum Ada Jadwal Kuliah',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              SizedBox(height: 6),
                              Text(
                                'Jadwal perkuliahan belum diunggah oleh Dosen Pengampu.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    return ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
                      itemCount: displayedClasses.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final item = displayedClasses[index];
                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.16),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.access_time_rounded,
                                        size: 14,
                                        color: Color(0xFF64748B),
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        (item["time"] ?? "08:00 - 09:40") as String,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                          color: Color(0xFF64748B),
                                        ),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: (item["bgColor"] ?? const Color(0xFFDCFCE7)) as Color,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      (item["status"] ?? "Menunggu") as String,
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        color: (item["color"] ?? const Color(0xFF15803D)) as Color,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(
                                (item["course"] ?? item["name"] ?? "Mata Kuliah") as String,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0F172A),
                                  letterSpacing: -0.2,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                (item["room"] ?? "Ruang Kuliah") as String,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
