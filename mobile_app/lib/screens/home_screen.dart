import 'package:flutter/material.dart';
import 'package:ug_attendance_mobile/screens/home_tab.dart';
import 'package:ug_attendance_mobile/screens/schedule_tab.dart';
import 'package:ug_attendance_mobile/screens/history_tab.dart';
import 'package:ug_attendance_mobile/screens/profile_tab.dart';
import 'package:ug_attendance_mobile/screens/qr_scanner_screen.dart';
import 'package:ug_attendance_mobile/services/api_service.dart';
import 'package:ug_attendance_mobile/widgets/aesthetic_page.dart';
import 'package:ug_attendance_mobile/widgets/batik_widgets.dart';

class HomeScreen extends StatefulWidget {
  final Map<String, dynamic> student;

  const HomeScreen({super.key, required this.student});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  Map<String, dynamic>? _dashboardData;
  late Map<String, dynamic> _currentStudent;

  @override
  void initState() {
    super.initState();
    _currentStudent = Map<String, dynamic>.from(widget.student);
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      final nim = (_currentStudent["nim"] ?? "10124001").toString();
      final data = await ApiService().getStudentDashboard(nim);
      if (mounted) {
        setState(() {
          _dashboardData = data;
          if (data["student"] != null && data["student"] is Map) {
            _currentStudent = Map<String, dynamic>.from(data["student"]);
          }
        });
      }
    } catch (e) {
      debugPrint("Failed to load student dashboard: $e");
    }
  }

  void _openScanner() {
    Navigator.push(
      context,
      AestheticPageRoute(
        page: QRScannerScreen(
          student: _currentStudent,
          onScanSuccess: () {
            _loadDashboard();
            setState(() {});
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      HomeTab(
        student: _currentStudent,
        dashboardData: _dashboardData,
        onRefresh: _loadDashboard,
        onOpenScanner: _openScanner,
        onNavigateToSchedule: () {
          setState(() {
            _currentIndex = 1;
          });
        },
        onNavigateToHistory: () {
          setState(() {
            _currentIndex = 2;
          });
        },
      ),
      ScheduleTab(
        student: _currentStudent,
        schedules: _dashboardData?["schedules"] as List<dynamic>?,
      ),
      HistoryTab(
        student: _currentStudent,
        attendances: _dashboardData?["attendances"] as List<dynamic>?,
        sessions: _dashboardData?["sessions"] as List<dynamic>?,
        onRefresh: _loadDashboard,
      ),
      ProfileTab(
        student: _currentStudent,
        onNavigateToSchedule: () {
          setState(() {
            _currentIndex = 1;
          });
        },
        onNavigateToHistory: () {
          setState(() {
            _currentIndex = 2;
          });
        },
      ),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF140224),
      body: BatikPageBackground(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          switchInCurve: Curves.easeOutCubic,
          switchOutCurve: Curves.easeInCubic,
          transitionBuilder: (child, animation) {
            return FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0.0, 0.02),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              ),
            );
          },
          child: KeyedSubtree(
            key: ValueKey<int>(_currentIndex),
            child: pages[_currentIndex],
          ),
        ),
      ),

      // Center Elevated Floating Action Button (QR Scanner)
      floatingActionButton: Container(
        width: 58,
        height: 58,
        margin: const EdgeInsets.only(top: 30),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF7E22CE), Color(0xFF581C87)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(color: const Color(0xFFFDE047), width: 2),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF9333EA).withValues(alpha: 0.5),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: _openScanner,
            customBorder: const CircleBorder(),
            child: const Center(
              child: Icon(
                Icons.qr_code_scanner_rounded,
                color: Colors.white,
                size: 28,
              ),
            ),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

      // Bottom Navigation Bar with Notch
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF140224),
          border: Border(
            top: BorderSide(
              color: Colors.white.withValues(alpha: 0.15),
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.5),
              blurRadius: 18,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: BottomAppBar(
          color: const Color(0xFF140224),
          surfaceTintColor: Colors.transparent,
          shape: const CircularNotchedRectangle(),
          notchMargin: 8.0,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          height: 68,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // Beranda (0)
              _buildNavButton(
                icon: Icons.home_rounded,
                label: 'Beranda',
                isSelected: _currentIndex == 0,
                onTap: () => setState(() => _currentIndex = 0),
              ),

              // Jadwal (1)
              _buildNavButton(
                icon: Icons.calendar_today_rounded,
                label: 'Jadwal',
                isSelected: _currentIndex == 1,
                onTap: () => setState(() => _currentIndex = 1),
              ),

              // Placeholder gap for Center Floating Action Button
              const SizedBox(width: 48),

              // Riwayat (2)
              _buildNavButton(
                icon: Icons.access_time_rounded,
                label: 'Riwayat',
                isSelected: _currentIndex == 2,
                onTap: () => setState(() => _currentIndex = 2),
              ),

              // Profil (3)
              _buildNavButton(
                icon: Icons.person_rounded,
                label: 'Profil',
                isSelected: _currentIndex == 3,
                onTap: () => setState(() => _currentIndex = 3),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavButton({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    const activeColor = Color(0xFFFDE047);
    const inactiveColor = Color(0xFF94A3B8);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected ? activeColor : inactiveColor,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? activeColor : inactiveColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
