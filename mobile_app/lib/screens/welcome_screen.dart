import 'package:flutter/material.dart';
import 'package:ug_attendance_mobile/widgets/ug_logo.dart';
import 'package:ug_attendance_mobile/widgets/batik_widgets.dart';
import 'package:ug_attendance_mobile/widgets/aesthetic_page.dart';
import 'package:ug_attendance_mobile/screens/home_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF140224),
      body: Stack(
        fit: StackFit.expand,
        children: [ 
          // Royal Gunadarma purple gradient background (matches SplashScreen)
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFF140224), // Ultra deep purple
                  Color(0xFF2E0854), // Royal Gunadarma purple
                  Color(0xFF140224),
                ],
              ),
            ),
          ),

          // Authentic Indonesian Batik pattern texture from SplashScreen
          Opacity(
            opacity: 0.16,
            child: Image.asset(
              'assets/images/batik_pattern_purple_gold.jpg',
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => const SizedBox(),
            ),
          ),

          // Ambient glowing orbs for depth and aesthetic lighting
          Positioned(
            top: -60,
            right: -60,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF9333EA).withValues(alpha: 0.15),
              ),
            ),
          ),
          Positioned(
            bottom: 40,
            left: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFD97706).withValues(alpha: 0.12),
              ),
            ),
          ),

          // Main Screen Content
          SafeArea(
            child: AestheticPageWrapper(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),

                    // Top Official Gunadarma Brand Badge
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const UGLogoBadge(
                          size: 42,
                          color: Color(0xFFFACC15), // Gold accent for "UG"
                          textColor: Colors.white,   // Clean white for "Attendance"
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.22),
                            ),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.school_rounded,
                                size: 13,
                                color: Color(0xFFFDE047),
                              ),
                              SizedBox(width: 5),
                              Text(
                                'Portal BAAK',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 22),

                    // Headline & Description (White typography for dark Batik background)
                    const Text(
                      'Presensi Kuliah\nLebih Mudah',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        height: 1.15,
                        letterSpacing: -0.8,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Kelola kehadiran perkuliahan dengan cepat, aman, dan terintegrasi.',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFFE2E8F0),
                        height: 1.45,
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Campus Building Image Card
                    Expanded(
                      child: Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.22),
                            width: 1.2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.4),
                              blurRadius: 24,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.asset(
                              'assets/images/campus_gunadarma.jpg',
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: const Color(0xFF2E0854),
                                  child: const Center(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.apartment_rounded,
                                          size: 64,
                                          color: Colors.white,
                                        ),
                                        SizedBox(height: 10),
                                        Text(
                                          'Universitas Gunadarma',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),

                            // Gradient overlay at bottom of photo
                            Positioned(
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 100,
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.bottomCenter,
                                    end: Alignment.topCenter,
                                    colors: [
                                      Colors.black.withValues(alpha: 0.6),
                                      Colors.transparent,
                                    ],
                                  ),
                                ),
                              ),
                            ),

                            // Top Batik Ribbon Trim on the photo card
                            const Positioned(
                              top: 0,
                              left: 0,
                              right: 0,
                              child: BatikRibbonTrim(height: 4.5),
                            ),

                            // Campus badge tags
                            Positioned(
                              bottom: 16,
                              left: 16,
                              right: 16,
                              child: Wrap(
                                spacing: 8,
                                runSpacing: 6,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.95),
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.15),
                                          blurRadius: 6,
                                        ),
                                      ],
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          Icons.verified_rounded,
                                          size: 14,
                                          color: Color(0xFF581C87),
                                        ),
                                        SizedBox(width: 6),
                                        Text(
                                          'Terakreditasi Unggul',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: Color(0xFF0F172A),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const BatikHeritageBadge(label: "KULTUR NUSANTARA"),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 22),

                    // Primary Button Section ("Mulai ->") - Adjusted to WHITE for high contrast
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pushReplacement(
                            context,
                            AestheticPageRoute(
                              page: const HomeScreen(
                                student: {
                                  "id": "44444444-4444-4444-4444-444444444401",
                                  "nim": "10124001",
                                  "name": "Ahmad Fauzi",
                                  "department": "Sistem Informasi",
                                  "class_group": "2KA01",
                                  "parent_phone": "6281299990001",
                                },
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF581C87),
                          elevation: 6,
                          shadowColor: Colors.black.withValues(alpha: 0.35),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(28),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Mulai',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF581C87),
                                letterSpacing: 0.2,
                              ),
                            ),
                            SizedBox(width: 10),
                            Icon(
                              Icons.arrow_forward_rounded,
                              size: 20,
                              color: Color(0xFF581C87),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
