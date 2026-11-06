import 'package:flutter/material.dart';
import 'package:ug_attendance_mobile/screens/permission_screen.dart';
import 'package:ug_attendance_mobile/widgets/aesthetic_page.dart';

class HomeTab extends StatelessWidget {
  final Map<String, dynamic> student;
  final Map<String, dynamic>? dashboardData;
  final Future<void> Function()? onRefresh;
  final VoidCallback onOpenScanner;
  final VoidCallback onNavigateToSchedule;
  final VoidCallback onNavigateToHistory;

  const HomeTab({
    super.key,
    required this.student,
    this.dashboardData,
    this.onRefresh,
    required this.onOpenScanner,
    required this.onNavigateToSchedule,
    required this.onNavigateToHistory,
  });

  String _formatIndonesianDate() {
    final now = DateTime.now();
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des'
    ];
    final dayName = days[now.weekday % 7];
    final monthName = months[now.month - 1];
    return '$dayName, ${now.day} $monthName ${now.year}';
  }

  @override
  Widget build(BuildContext context) {
    final studentName = student["name"] ?? "Ahmad Fauzi";
    final firstName = studentName.toString().split(" ").first;

    final stats = dashboardData?["stats"] as Map<String, dynamic>?;
    final double rawAttendanceRate =
        (stats?["attendanceRate"] as num?)?.toDouble() ?? 92.4;
    final double attendanceRate = rawAttendanceRate > 0 ? rawAttendanceRate : 92.4;
    final double progressValue = (attendanceRate / 100.0).clamp(0.0, 1.0);
    final schedulesList = (dashboardData?["schedules"] as List<dynamic>?) ?? [];

    final formattedDate = _formatIndonesianDate();

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: AestheticPageWrapper(
          child: RefreshIndicator(
            onRefresh: onRefresh ?? () async {},
            color: const Color(0xFF581C87),
            backgroundColor: Colors.white,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 110),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Top Brand Header: Gunadarma Logo + "UG ATTENDANCE" + Action Menu
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF581C87).withValues(alpha: 0.12),
                                  blurRadius: 10,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                              border: Border.all(
                                color: const Color(0xFF7E22CE).withValues(alpha: 0.2),
                                width: 1.5,
                              ),
                            ),
                            child: ClipOval(
                              child: Image.asset(
                                'assets/images/logogundar.png',
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) =>
                                    const Icon(
                                  Icons.school_rounded,
                                  size: 20,
                                  color: Color(0xFF581C87),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'UG ATTENDANCE',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF3B0764),
                                  letterSpacing: 0.3,
                                  height: 1.1,
                                ),
                              ),
                              Text(
                                'Universitas Gunadarma',
                                style: TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.menu_rounded,
                          size: 20,
                          color: Color(0xFF334155),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // 2. Royal Purple Gradient Greeting Banner (Mockup Reference)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFF3B0764), // Deep Gunadarma purple
                          Color(0xFF581C87), // Core royal purple
                          Color(0xFF7E22CE), // Vivid violet accent
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF581C87).withValues(alpha: 0.30),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Halo, $firstName!',
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  letterSpacing: -0.4,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Semangat kuliah hari ini',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFFE9D5FF),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.16),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.28),
                              width: 1.5,
                            ),
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.school_rounded,
                              color: Color(0xFFFDE047),
                              size: 24,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 3. Attendance Gauge Card (Solid White Card + Emerald Ring)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFFE2E8F0),
                        width: 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF581C87).withValues(alpha: 0.05),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Emerald Green Circular Gauge
                        SizedBox(
                          width: 66,
                          height: 66,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 66,
                                height: 66,
                                child: CircularProgressIndicator(
                                  value: progressValue,
                                  strokeWidth: 6.5,
                                  backgroundColor: const Color(0xFFDCFCE7), // Soft mint track
                                  valueColor: const AlwaysStoppedAnimation<Color>(
                                    Color(0xFF10B981), // Vibrant emerald progress
                                  ),
                                  strokeCap: StrokeCap.round,
                                ),
                              ),
                              const Icon(
                                Icons.check_rounded,
                                color: Color(0xFF10B981),
                                size: 24,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${attendanceRate.toStringAsFixed(1).replaceAll('.', ',')}%',
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF0F172A),
                                  letterSpacing: -0.6,
                                  height: 1.0,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Total Kehadiran',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFAF5FF),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: const Color(0xFFE9D5FF),
                            ),
                          ),
                          child: const Text(
                            'Target >=75%',
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF7E22CE),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  // 4. Section: Jadwal Kuliah Hari Ini & Date Indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.calendar_today_rounded,
                            size: 16,
                            color: Color(0xFF581C87),
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Jadwal Kuliah Hari Ini',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                              letterSpacing: -0.3,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        formattedDate,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // 5. Course Schedule Cards
                  if (schedulesList.isNotEmpty) ...[
                    ...schedulesList.map((item) {
                      final courseName = (item["courses"]?["name"] ??
                          item["name"] ??
                          "Pemrograman Web") as String;
                      final courseTime =
                          "${item["start_time"] ?? "08.00"} - ${item["end_time"] ?? "10.00"} WIB";
                      final courseRoom =
                          "Kelas ${item["class_name"] ?? student["class_group"] ?? "2KA01"}";

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _buildCourseCard(
                          icon: Icons.code_rounded,
                          title: courseName,
                          time: courseTime,
                          room: courseRoom,
                          badgeText: 'Hadir',
                          isHadir: true,
                        ),
                      );
                    }),
                  ] else ...[
                    // Default mockup course schedule: Pemrograman Web (08.00 - 10.00 WIB)
                    _buildCourseCard(
                      icon: Icons.code_rounded,
                      title: 'Pemrograman Web',
                      time: '08.00 - 10.00 WIB',
                      room: 'Kelas 2KA01 • Lab E301',
                      badgeText: 'Hadir',
                      isHadir: true,
                    ),
                    const SizedBox(height: 10),
                    _buildCourseCard(
                      icon: Icons.storage_rounded,
                      title: 'Sistem Basis Data Lanjut',
                      time: '10.00 - 11.40 WIB',
                      room: 'Kelas 2KA01 • Lab E302',
                      badgeText: 'Menunggu',
                      isHadir: false,
                    ),
                    const SizedBox(height: 10),
                    _buildCourseCard(
                      icon: Icons.developer_mode_rounded,
                      title: 'Analisis & Perancangan SI',
                      time: '13.00 - 14.40 WIB',
                      room: 'Kelas 2KA01 • Ruang 2.3',
                      badgeText: 'Belum',
                      isHadir: false,
                    ),
                  ],

                  const SizedBox(height: 22),

                  // 6. Quick Dynamic 5s QR Presensi Action Banner
                  GestureDetector(
                    onTap: onOpenScanner,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            Color(0xFF581C87),
                            Color(0xFF7E22CE),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF7E22CE).withValues(alpha: 0.28),
                            blurRadius: 14,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(
                              Icons.qr_code_scanner_rounded,
                              color: Color(0xFF581C87),
                              size: 26,
                            ),
                          ),
                          const SizedBox(width: 14),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Presensi QR Dinamis (5 Detik)',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Scan barcode di proyektor kelas',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFFF3E8FF),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFDE047),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Row(
                              children: [
                                Text(
                                  'Scan',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF581C87),
                                  ),
                                ),
                                SizedBox(width: 2),
                                Icon(
                                  Icons.arrow_forward_rounded,
                                  size: 14,
                                  color: Color(0xFF581C87),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 18),

                  // 7. Grid Actions: Jadwal, Riwayat, Dispensasi
                  Row(
                    children: [
                      Expanded(
                        child: _buildActionTile(
                          icon: Icons.calendar_month_rounded,
                          title: 'Jadwal Kuliah',
                          subtitle: 'Minggu ini',
                          onTap: onNavigateToSchedule,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildActionTile(
                          icon: Icons.history_rounded,
                          title: 'Riwayat Hadir',
                          subtitle: 'Catatan presensi',
                          onTap: onNavigateToHistory,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildActionTile(
                          icon: Icons.assignment_turned_in_rounded,
                          title: 'Dispensasi',
                          subtitle: 'Surat izin sakit',
                          onTap: () {
                            Navigator.push(
                              context,
                              AestheticPageRoute(
                                page: PermissionScreen(student: student),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCourseCard({
    required IconData icon,
    required String title,
    required String time,
    required String room,
    required String badgeText,
    required bool isHadir,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
          width: 1.1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFFFAF5FF),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: const Color(0xFFE9D5FF),
              ),
            ),
            child: Icon(
              icon,
              color: const Color(0xFF581C87),
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.2,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '$time • $room',
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: isHadir ? const Color(0xFFDCFCE7) : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              badgeText,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w800,
                color: isHadir ? const Color(0xFF15803D) : const Color(0xFF64748B),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: const Color(0xFFFAF5FF),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE9D5FF)),
              ),
              child: Icon(
                icon,
                size: 18,
                color: const Color(0xFF581C87),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
