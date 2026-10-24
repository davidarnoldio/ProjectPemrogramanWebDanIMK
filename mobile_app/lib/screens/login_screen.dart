import 'package:flutter/material.dart';
import 'package:ug_attendance_mobile/services/api_service.dart';
import 'package:ug_attendance_mobile/screens/home_screen.dart';
import 'package:ug_attendance_mobile/screens/change_password_screen.dart';
import 'package:ug_attendance_mobile/widgets/ug_logo.dart';
import 'package:ug_attendance_mobile/widgets/batik_widgets.dart';
import 'package:ug_attendance_mobile/widgets/aesthetic_page.dart';
import 'package:lottie/lottie.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Real active master student in system: Ahmad Fauzi (NIM: 10124001, Class: 2KA01)
  final TextEditingController _nimController = TextEditingController(text: "10124001");
  final TextEditingController _passwordController = TextEditingController(text: "10124001");
  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;

  final ApiService _apiService = ApiService();

  Future<void> _handleLogin() async {
    final nim = _nimController.text.trim();
    final password = _passwordController.text.trim();

    if (nim.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = "NIM dan Password wajib diisi.";
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await _apiService.login(nim, password);

      if (!mounted) return;

      if (res["success"] == true) {
        final student = res["student"] ?? {
          "id": "44444444-4444-4444-4444-444444444401",
          "nim": nim,
          "name": "Ahmad Fauzi",
          "department": "Sistem Informasi",
          "class_group": "2KA01",
          "parent_phone": "6281299990001",
        };
        final bool mustChangePassword = res["mustChangePassword"] == true;

        if (mustChangePassword) {
          Navigator.pushReplacement(
            context,
            AestheticPageRoute(
              page: ChangePasswordScreen(
                student: student,
                nim: nim,
              ),
            ),
          );
        } else {
          Navigator.pushReplacement(
            context,
            AestheticPageRoute(
              page: HomeScreen(student: student),
            ),
          );
        }
      } else {
        // Fallback for demo when backend is offline or student is Ahmad Fauzi
        if (nim == "10124001") {
          final student = {
            "id": "44444444-4444-4444-4444-444444444401",
            "nim": "10124001",
            "name": "Ahmad Fauzi",
            "department": "Sistem Informasi",
            "class_group": "2KA01",
            "semester": 4,
            "parent_phone": "6281299990001",
          };
          Navigator.pushReplacement(
            context,
            AestheticPageRoute(
              page: HomeScreen(student: student),
            ),
          );
        } else {
          setState(() {
            _errorMessage = res["error"] ?? "NIM tidak terdaftar di sistem kampus.";
          });
        }
      }
    } catch (e) {
      // Fallback for student demo
      if (nim == "10124001") {
        final student = {
          "id": "44444444-4444-4444-4444-444444444401",
          "nim": "10124001",
          "name": "Ahmad Fauzi",
          "department": "Sistem Informasi",
          "class_group": "2KA01",
          "semester": 4,
          "parent_phone": "6281299990001",
        };
        Navigator.pushReplacement(
          context,
          AestheticPageRoute(
            page: HomeScreen(student: student),
          ),
        );
      } else {
        setState(() {
          _errorMessage = "Gagal terhubung ke server: $e";
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF140224),
      body: BatikPageBackground(
        child: SafeArea(
          child: AestheticPageWrapper(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand Logo at top with Portal BAAK Badge
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const UGLogoBadge(
                          size: 42,
                          color: Color(0xFFFACC15),
                          textColor: Colors.white,
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
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
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Lottie pulsing beacon and Academic title
                    Row(
                      children: [
                        SizedBox(
                          width: 14,
                          height: 14,
                          child: Lottie.asset(
                            'assets/lottie/student_beacon.json',
                            repeat: true,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) => Container(
                              width: 10,
                              height: 10,
                              decoration: const BoxDecoration(
                                color: Color(0xFF10B981),
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'SISTEM PRESENSI TERINTEGRASI',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.2,
                            color: Color(0xFFFDE047),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Headline & Description
                    const Text(
                      'Masuk ke Akun',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -0.6,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Gunakan akun mahasiswa terdaftar untuk memulai presensi perkuliahan.',
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFFCBD5E1),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Error banner if any
                    if (_errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF7F1D1D).withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFEF4444)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline_rounded, size: 20, color: Color(0xFFFCA5A5)),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(fontSize: 12, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                    ],

                    // Solid White Card Container for Login Inputs
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: const Color(0xFFE2E8F0),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.25),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // NIM Input
                          TextField(
                            controller: _nimController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(
                              color: Color(0xFF0F172A),
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                            decoration: InputDecoration(
                              labelText: 'NIM Mahasiswa',
                              labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                              hintText: 'Masukkan 8 digit NIM',
                              hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                              prefixIcon: const Icon(Icons.badge_outlined, color: Color(0xFF581C87), size: 20),
                              filled: true,
                              fillColor: const Color(0xFFF8FAFC),
                              contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: const BorderSide(color: Color(0xFF581C87), width: 1.8),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Password Input
                          TextField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            style: const TextStyle(
                              color: Color(0xFF0F172A),
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                            decoration: InputDecoration(
                              labelText: 'Password',
                              labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                              hintText: 'Masukkan password akun',
                              hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                              prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF581C87), size: 20),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                  color: const Color(0xFF64748B),
                                  size: 20,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                              filled: true,
                              fillColor: const Color(0xFFF8FAFC),
                              contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: const BorderSide(color: Color(0xFF581C87), width: 1.8),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Primary Button ("Login")
                          SizedBox(
                            height: 52,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _handleLogin,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF581C87),
                                foregroundColor: Colors.white,
                                elevation: 4,
                                shadowColor: const Color(0xFF581C87).withValues(alpha: 0.35),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(26),
                                ),
                              ),
                              child: _isLoading
                                  ? const SizedBox(
                                      width: 22,
                                      height: 22,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.5,
                                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      ),
                                    )
                                  : const Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'Login',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w800,
                                            color: Colors.white,
                                            letterSpacing: 0.3,
                                          ),
                                        ),
                                        SizedBox(width: 8),
                                        Icon(
                                          Icons.arrow_forward_rounded,
                                          size: 19,
                                          color: Colors.white,
                                        ),
                                      ],
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Pre-filled Demo Student Account Credential Card - Solid White
                    Container(
                      padding: const EdgeInsets.all(14),
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
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.verified_user_rounded, size: 15, color: Color(0xFF581C87)),
                              SizedBox(width: 7),
                              Text(
                                'Akun Uji Coba Mahasiswa',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF581C87),
                                ),
                              ),
                              Spacer(),
                              BatikHeritageBadge(label: "KULTUR NUSANTARA"),
                            ],
                          ),
                          SizedBox(height: 6),
                          Text(
                            'Nama: Ahmad Fauzi • Kelas: 2KA01\nNIM: 10124001 • Password Default: NIM',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFF64748B),
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Help link
                    Center(
                      child: TextButton(
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              backgroundColor: const Color(0xFF1E0A3C),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                                side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                              ),
                              title: const Text(
                                'Bantuan Akun Mahasiswa',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                              content: const Text(
                                'Akun mahasiswa UG Attendance disinkronisasi langsung dari data KRS Biro Administrasi Akademik (BAAK).\n\nJika lupa password atau terkendala akses, silakan hubungi BAAK Margonda di Gedung 4 Lt. 1 atau kirim email ke baak@gunadarma.ac.id.',
                                style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.4),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: const Text('Mengerti', style: TextStyle(color: Color(0xFFFDE047))),
                                ),
                              ],
                            ),
                          );
                        },
                        child: const Text(
                          'Lupa password?',
                          style: TextStyle(
                            color: Color(0xFFCBD5E1),
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
