import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ug_attendance_mobile/screens/login_screen.dart';
import 'package:ug_attendance_mobile/screens/permission_screen.dart';
import 'package:ug_attendance_mobile/widgets/ug_logo.dart';
import 'package:ug_attendance_mobile/widgets/batik_widgets.dart';
import 'package:ug_attendance_mobile/widgets/aesthetic_page.dart';

class ProfileTab extends StatelessWidget {
  final Map<String, dynamic> student;
  final VoidCallback onNavigateToSchedule;
  final VoidCallback onNavigateToHistory;

  const ProfileTab({
    super.key,
    required this.student,
    required this.onNavigateToSchedule,
    required this.onNavigateToHistory,
  });

  @override
  Widget build(BuildContext context) {
    final studentName = student["name"] ?? "Ahmad Fauzi";
    final studentNim = student["nim"] ?? "10124001";
    final classGroup = student["class_group"] ?? "2KA01";
    final department = student["department"] ?? "Sistem Informasi";
    final parentPhone = student["parent_phone"] ?? "6281299990001";

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: AestheticPageWrapper(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Profil Mahasiswa',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.12),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.settings_outlined,
                        size: 20,
                        color: Color(0xFF475569),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Student Info Card with top Batik ribbon - Solid White
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.16),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
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
                        child: Row(
                          children: [
                            // Avatar Circle
                            Container(
                              width: 62,
                              height: 62,
                              decoration: BoxDecoration(
                                color: const Color(0xFFFAF5FF),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFD8B4FE), width: 2),
                              ),
                              child: const Center(
                                child: Icon(
                                  Icons.person_rounded,
                                  size: 36,
                                  color: Color(0xFF581C87),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    studentName,
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w900,
                                      color: Color(0xFF0F172A),
                                      letterSpacing: -0.3,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'NIM $studentNim',
                                    style: const TextStyle(
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF581C87),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '$department • $classGroup',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                      color: Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Menu Options Group - Solid White
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.16),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      _buildMenuItem(
                        icon: Icons.person_outline_rounded,
                        title: 'Data Pribadi',
                        onTap: () {
                          _showPersonalDataDialog(context, studentName, studentNim, department, classGroup, parentPhone);
                        },
                      ),
                      const Divider(height: 1, indent: 56, color: Color(0xFFF1F5F9)),
                      _buildMenuItem(
                        icon: Icons.calendar_today_outlined,
                        title: 'Jadwal Kuliah',
                        onTap: onNavigateToSchedule,
                      ),
                      const Divider(height: 1, indent: 56, color: Color(0xFFF1F5F9)),
                      _buildMenuItem(
                        icon: Icons.history_rounded,
                        title: 'Riwayat Presensi',
                        onTap: onNavigateToHistory,
                      ),
                      const Divider(height: 1, indent: 56, color: Color(0xFFF1F5F9)),
                      _buildMenuItem(
                        icon: Icons.assignment_outlined,
                        title: 'Pengajuan Dispensasi / Izin',
                        onTap: () {
                          Navigator.push(
                            context,
                            AestheticPageRoute(
                              page: PermissionScreen(student: student),
                            ),
                          );
                        },
                      ),
                      const Divider(height: 1, indent: 56, color: Color(0xFFF1F5F9)),
                      _buildMenuItem(
                        icon: Icons.mark_chat_read_outlined,
                        title: 'WhatsApp Wali Murid ($parentPhone)',
                        onTap: () {
                          _showParentPhoneDialog(context, parentPhone);
                        },
                      ),
                      const Divider(height: 1, indent: 56, color: Color(0xFFF1F5F9)),
                      _buildMenuItem(
                        icon: Icons.help_outline_rounded,
                        title: 'Bantuan & Loket BAAK',
                        onTap: () {
                          _showHelpDialog(context);
                        },
                      ),
                      const Divider(height: 1, indent: 56, color: Color(0xFFF1F5F9)),
                      _buildMenuItem(
                        icon: Icons.logout_rounded,
                        title: 'Keluar',
                        titleColor: const Color(0xFFEF4444),
                        iconColor: const Color(0xFFEF4444),
                        showChevron: false,
                        onTap: () {
                          _confirmLogout(context);
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Institutional Gunadarma Footer Badge - Solid White
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.12),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: const Row(
                    children: [
                      UGLogoBadge(size: 28, showText: false),
                      SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'UG Attendance',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          Text(
                            'Universitas Gunadarma • BAAK',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF64748B),
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
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? titleColor,
    Color? iconColor,
    bool showChevron = true,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFFAF5FF),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                size: 20,
                color: iconColor ?? const Color(0xFF581C87),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w600,
                  color: titleColor ?? const Color(0xFF0F172A),
                ),
              ),
            ),
            if (showChevron)
              const Icon(
                Icons.chevron_right_rounded,
                size: 18,
                color: Color(0xFF94A3B8),
              ),
          ],
        ),
      ),
    );
  }

  void _showPersonalDataDialog(BuildContext context, String name, String nim, String dept, String classGroup, String phone) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('Data Pribadi Mahasiswa', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDialogRow('Nama Lengkap', name),
            _buildDialogRow('NIM', nim),
            _buildDialogRow('Program Studi', dept),
            _buildDialogRow('Kelas', classGroup),
            _buildDialogRow('WhatsApp Ortu', phone),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tutup', style: TextStyle(color: Color(0xFF581C87), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildDialogRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
            ),
          ),
          const Text(': ', style: TextStyle(color: Color(0xFF64748B))),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
          ),
        ],
      ),
    );
  }

  void _showParentPhoneDialog(BuildContext context, String phone) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('WhatsApp Notifikasi Orang Tua', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
        content: Text(
          'Nomor terdaftar: $phone\n\nSetiap Anda berhasil memindai QR presensi kelas, sistem BAAK secara otomatis mengirimkan notifikasi bukti kehadiran resmi ke nomor WhatsApp ini.',
          style: const TextStyle(color: Color(0xFF475569), fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Mengerti', style: TextStyle(color: Color(0xFF581C87), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showHelpDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('Layanan BAAK Margonda', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
        content: const Text(
          'Gedung 4 Lantai 1 — Kampus Margonda Depok\n\nJam Pelayanan:\nSenin – Jumat: 08:30 – 15:30 WIB\nSabtu: 08:30 – 12:00 WIB\n\nEmail: baak@gunadarma.ac.id',
          style: TextStyle(color: Color(0xFF475569), fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tutup', style: TextStyle(color: Color(0xFF581C87), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('Konfirmasi Keluar', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
        content: const Text(
          'Apakah Anda yakin ingin keluar dari akun UG Attendance?',
          style: TextStyle(color: Color(0xFF475569)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove("student_session");

              if (context.mounted) {
                Navigator.pop(context);
                Navigator.pushAndRemoveUntil(
                  context,
                  AestheticPageRoute(page: const LoginScreen()),
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
            ),
            child: const Text('Keluar'),
          ),
        ],
      ),
    );
  }
}
