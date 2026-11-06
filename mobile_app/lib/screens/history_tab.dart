import 'package:flutter/material.dart';
import 'package:ug_attendance_mobile/widgets/batik_widgets.dart';
import 'package:ug_attendance_mobile/widgets/aesthetic_page.dart';

class HistoryTab extends StatefulWidget {
  final Map<String, dynamic> student;
  final List<dynamic>? historyRecords;
  final List<dynamic>? sessions;
  final List<dynamic>? attendances;
  final Future<void> Function()? onRefresh;

  const HistoryTab({
    super.key,
    required this.student,
    this.historyRecords,
    this.sessions,
    this.attendances,
    this.onRefresh,
  });

  @override
  State<HistoryTab> createState() => _HistoryTabState();
}

class _HistoryTabState extends State<HistoryTab> {
  final String _selectedCourse = "Semua Mata Kuliah";
  final String _selectedMonth = "Oktober 2026";

  // Default fallback records for student Ahmad Fauzi
  final List<Map<String, dynamic>> _records = [
    {
      "date": "Sen, 20 Okt 2026",
      "time": "08:35 WIB",
      "course": "Pemrograman Web Berbasis Framework",
      "topic": "Pertemuan 5: State Management & Supabase Realtime",
      "status": "Hadir",
      "color": const Color(0xFF15803D),
      "bgColor": const Color(0xFFDCFCE7),
      "icon": Icons.check_circle_rounded,
    },
    {
      "date": "Kam, 16 Okt 2026",
      "time": "10:15 WIB",
      "course": "Sistem Basis Data Lanjut",
      "topic": "Pertemuan 4: Optimasi Query & Indexing Postgres",
      "status": "Hadir",
      "color": const Color(0xFF15803D),
      "bgColor": const Color(0xFFDCFCE7),
      "icon": Icons.check_circle_rounded,
    },
    {
      "date": "Sel, 14 Okt 2026",
      "time": "13:00 WIB",
      "course": "Analisis & Perancangan SI",
      "topic": "Pertemuan 4: Use Case Diagram & Flowchart",
      "status": "Izin",
      "color": const Color(0xFF1D4ED8),
      "bgColor": const Color(0xFFDBEAFE),
      "icon": Icons.assignment_turned_in_rounded,
    },
    {
      "date": "Sen, 13 Okt 2026",
      "time": "08:12 WIB",
      "course": "Pemrograman Web Berbasis Framework",
      "topic": "Pertemuan 4: Rest API & CRUD Handler",
      "status": "Hadir",
      "color": const Color(0xFF15803D),
      "bgColor": const Color(0xFFDCFCE7),
      "icon": Icons.check_circle_rounded,
    },
    {
      "date": "Kam, 9 Okt 2026",
      "time": "10:05 WIB",
      "course": "Sistem Basis Data Lanjut",
      "topic": "Pertemuan 3: Normalisasi Relasional",
      "status": "Hadir",
      "color": const Color(0xFF15803D),
      "bgColor": const Color(0xFFDCFCE7),
      "icon": Icons.check_circle_rounded,
    },
    {
      "date": "Jum, 3 Okt 2026",
      "time": "-",
      "course": "Pemrograman Perangkat Bergerak",
      "topic": "Pertemuan 2: Layout Flutter & State",
      "status": "Alpa",
      "color": const Color(0xFFB91C1C),
      "bgColor": const Color(0xFFFEE2E2),
      "icon": Icons.cancel_rounded,
    },
  ];

  static String _monthName(int month) {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    if (month >= 1 && month <= 12) return months[month - 1];
    return "";
  }

  List<Map<String, dynamic>> get _displayRecords {
    if (widget.attendances != null && widget.attendances!.isNotEmpty) {
      final List<Map<String, dynamic>> list = [];
      for (final att in widget.attendances!) {
        dynamic session;
        if (widget.sessions != null) {
          try {
            session = widget.sessions!.firstWhere(
              (s) => s['id'] == att['session_id'],
              orElse: () => null,
            );
          } catch (_) {
            session = null;
          }
        }

        final statusStr = (att['status'] ?? 'HADIR').toString().toUpperCase();
        Color color;
        Color bgColor;
        IconData icon;

        switch (statusStr) {
          case 'IZIN':
            color = const Color(0xFF1D4ED8);
            bgColor = const Color(0xFFDBEAFE);
            icon = Icons.assignment_turned_in_rounded;
            break;
          case 'SAKIT':
            color = const Color(0xFFB45309);
            bgColor = const Color(0xFFFEF3C7);
            icon = Icons.medical_services_rounded;
            break;
          case 'ALPA':
            color = const Color(0xFFB91C1C);
            bgColor = const Color(0xFFFEE2E2);
            icon = Icons.cancel_rounded;
            break;
          case 'HADIR':
          default:
            color = const Color(0xFF15803D);
            bgColor = const Color(0xFFDCFCE7);
            icon = Icons.check_circle_rounded;
            break;
        }

        final rawDate = (att['scanned_at'] ?? session?['date'] ?? session?['created_at'] ?? '').toString();
        String formattedDate = "Hari ini";
        String formattedTime = "-";
        if (rawDate.isNotEmpty) {
          try {
            final dt = DateTime.parse(rawDate).toLocal();
            formattedDate = "${dt.day} ${_monthName(dt.month)} ${dt.year}";
            formattedTime = "${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} WIB";
          } catch (_) {
            formattedDate = rawDate;
          }
        }

        final courseName = (session != null && session['classes'] != null && session['classes']['courses'] != null)
            ? session['classes']['courses']['name'].toString()
            : (session != null && session['course_name'] != null)
                ? session['course_name'].toString()
                : "Mata Kuliah Kampus";

        final topic = (session != null && session['topic'] != null)
            ? "Pertemuan: ${session['topic']}"
            : "Pertemuan Perkuliahan";

        list.add({
          "date": formattedDate,
          "time": formattedTime,
          "course": courseName,
          "topic": topic,
          "status": statusStr[0] + statusStr.substring(1).toLowerCase(),
          "color": color,
          "bgColor": bgColor,
          "icon": icon,
        });
      }
      if (list.isNotEmpty) return list;
    }
    return _records;
  }

  int _countStatus(String status) {
    return _displayRecords.where((r) => (r["status"] as String).toLowerCase() == status.toLowerCase()).length;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: AestheticPageWrapper(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Header
              const Padding(
                padding: EdgeInsets.fromLTRB(20, 16, 20, 12),
                child: Text(
                  'Riwayat Presensi',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
              ),

              // Top Batik Ribbon Trim
              const BatikRibbonTrim(height: 3),
              const SizedBox(height: 14),

              // Dropdown filters - Solid White Boxes
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.12),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _selectedCourse,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                            const Icon(Icons.keyboard_arrow_down_rounded,
                                size: 18, color: Color(0xFF581C87)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.12),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Text(
                            _selectedMonth,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.keyboard_arrow_down_rounded,
                              size: 18, color: Color(0xFF581C87)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // 4 Stat Summary Pills
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    _buildStatPill("Hadir", "${_countStatus('Hadir')}", const Color(0xFFDCFCE7),
                        const Color(0xFF15803D)),
                    const SizedBox(width: 8),
                    _buildStatPill("Izin", "${_countStatus('Izin')}", const Color(0xFFDBEAFE),
                        const Color(0xFF1D4ED8)),
                    const SizedBox(width: 8),
                    _buildStatPill("Sakit", "${_countStatus('Sakit')}", const Color(0xFFFEF3C7),
                        const Color(0xFFB45309)),
                    const SizedBox(width: 8),
                    _buildStatPill("Alpa", "${_countStatus('Alpa')}", const Color(0xFFFEE2E2),
                        const Color(0xFFB91C1C)),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Chronological list - Solid White Cards
              Expanded(
                child: RefreshIndicator(
                  color: const Color(0xFF581C87),
                  backgroundColor: Colors.white,
                  onRefresh: widget.onRefresh ?? () async {},
                  child: _displayRecords.isEmpty
                      ? ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          children: const [
                            SizedBox(height: 60),
                            Center(
                              child: Text(
                                "Belum ada riwayat presensi tercatat.",
                                style: TextStyle(
                                  color: Color(0xFF94A3B8),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        )
                      : ListView.separated(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.fromLTRB(20, 4, 20, 100),
                          itemCount: _displayRecords.length,
                          separatorBuilder: (context, index) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final record = _displayRecords[index];
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
                                      Text(
                                        "${record['date']} • ${record['time']}",
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF64748B),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: record["bgColor"] as Color,
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          record["status"] as String,
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w800,
                                            color: record["color"] as Color,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    record["course"] as String,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF0F172A),
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    record["topic"] as String,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w400,
                                      color: Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatPill(
      String label, String value, Color bgColor, Color textColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.12),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: textColor,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
