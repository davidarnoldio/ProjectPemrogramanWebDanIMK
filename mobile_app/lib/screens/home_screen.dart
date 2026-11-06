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

  void _openSchedulePage() {
    Navigator.push(
      context,
      AestheticPageRoute(
        page: Scaffold(
          backgroundColor: const Color(0xFFFAF9FD),
          appBar: AppBar(
            backgroundColor: const Color(0xFF581C87),
            foregroundColor: Colors.white,
            title: const Text(
              'Jadwal Kuliah',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
              ),
            ),
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          body: BatikPageBackground(
            isLight: true,
            child: ScheduleTab(
              student: _currentStudent,
              schedules: _dashboardData?["schedules"] as List<dynamic>?,
            ),
          ),
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
        onNavigateToSchedule: _openSchedulePage,
        onNavigateToHistory: () {
          setState(() {
            _currentIndex = 1;
          });
        },
      ),
      HistoryTab(
        student: _currentStudent,
        attendances: _dashboardData?["attendances"] as List<dynamic>?,
        sessions: _dashboardData?["sessions"] as List<dynamic>?,
        onRefresh: _loadDashboard,
      ),
      ProfileTab(
        student: _currentStudent,
        onNavigateToSchedule: _openSchedulePage,
        onNavigateToHistory: () {
          setState(() {
            _currentIndex = 1;
          });
        },
      ),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FD),
      body: BatikPageBackground(
        isLight: true,
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 250),
          switchInCurve: Curves.easeOutCubic,
          switchOutCurve: Curves.easeInCubic,
          child: KeyedSubtree(
            key: ValueKey<int>(_currentIndex),
            child: pages[_currentIndex],
          ),
        ),
      ),

      // Floating QR Scanner Action Button
      floatingActionButton: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF7E22CE), Color(0xFF581C87)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFFFDE047), width: 2),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF581C87).withValues(alpha: 0.35),
              blurRadius: 14,
              offset: const Offset(0, 5),
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
                size: 26,
              ),
            ),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,

      // Clean 3-Tab Bottom Navigation Bar matching the Mockup Reference
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(
              color: const Color(0xFFE2E8F0).withValues(alpha: 0.9),
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF581C87).withValues(alpha: 0.06),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                // 1. Beranda
                _buildNavItem(
                  index: 0,
                  icon: Icons.home_rounded,
                  label: 'Beranda',
                  isSelected: _currentIndex == 0,
                ),

                // 2. Riwayat
                _buildNavItem(
                  index: 1,
                  icon: Icons.history_rounded,
                  label: 'Riwayat',
                  isSelected: _currentIndex == 1,
                ),

                // 3. Profil
                _buildNavItem(
                  index: 2,
                  icon: Icons.person_rounded,
                  label: 'Profil',
                  isSelected: _currentIndex == 2,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
    required bool isSelected,
  }) {
    const activeColor = Color(0xFF581C87);
    const inactiveColor = Color(0xFF94A3B8);

    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() {
            _currentIndex = index;
          });
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
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
            const SizedBox(height: 3),
            // Active underline indicator
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOutCubic,
              width: isSelected ? 18 : 0,
              height: 2.5,
              decoration: BoxDecoration(
                color: isSelected ? activeColor : Colors.transparent,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
