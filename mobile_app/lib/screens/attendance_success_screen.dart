import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:ug_attendance_mobile/widgets/batik_widgets.dart';

class AttendanceSuccessScreen extends StatelessWidget {
  final Map<String, dynamic> student;
  final String courseName;
  final String timeFormatted;
  final String roomInfo;
  final String parentPhone;

  const AttendanceSuccessScreen({
    super.key,
    required this.student,
    this.courseName = "Pemrograman Web Berbasis Framework",
    this.timeFormatted = "Senin, 20 Oktober 2026 • 08:35 WIB",
    this.roomInfo = "Kelas 2KA01 • Lab Sistem Informasi E301",
    this.parentPhone = "081299990001",
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF140224),
      body: BatikPageBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Spacer(),

                // Animated Lottie Success Checkmark
                SizedBox(
                  width: 140,
                  height: 140,
                  child: Lottie.asset(
                    'assets/lottie/success_check.json',
                    repeat: false,
                    animate: true,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 88,
                        height: 88,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF10B981).withValues(alpha: 0.35),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.check_rounded,
                            color: Colors.white,
                            size: 52,
                          ),
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 16),

                // Title & Subtitle
                const Text(
                  'Presensi Berhasil!',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Kehadiran kamu telah tercatat instan\npada sistem akademik BAAK Gunadarma.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    color: Color(0xFFCBD5E1),
                    height: 1.4,
                  ),
                ),

                const SizedBox(height: 28),

                // Verification Card
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.35),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const BatikRibbonTrim(height: 3.5),
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    courseName,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                      letterSpacing: -0.3,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF15803D),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text(
                                    'Hadir Tepat Waktu',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(
                                  Icons.calendar_today_rounded,
                                  size: 14,
                                  color: Color(0xFFFDE047),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  timeFormatted,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFFCBD5E1),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(
                                  Icons.room_rounded,
                                  size: 14,
                                  color: Color(0xFFFDE047),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  roomInfo,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFFCBD5E1),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Divider(height: 1, color: Colors.white.withValues(alpha: 0.12)),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                const Icon(
                                  Icons.mark_chat_read_rounded,
                                  size: 15,
                                  color: Color(0xFF4ADE80),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    'Notifikasi WhatsApp otomatis terkirim ke Orang Tua ($parentPhone)',
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF4ADE80),
                                      height: 1.3,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const Spacer(),

                // Button "Kembali ke Beranda" - High Contrast WHITE
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).popUntil((route) => route.isFirst);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF581C87),
                      elevation: 5,
                      shadowColor: Colors.black.withValues(alpha: 0.4),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(28),
                      ),
                    ),
                    child: const Text(
                      'Kembali ke Beranda',
                      style: TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF581C87),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
