import 'package:dio/dio.dart';

class ApiService {
  // Use PC Wi-Fi LAN IP so physical Android devices and local emulators connect seamlessly
  static String baseUrl = "http://192.168.100.58:3000";

  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 5),
      headers: {
        "Content-Type": "application/json",
      },
    ),
  );

  /// Authenticate student via NIM
  Future<Map<String, dynamic>> login(String nim, String password) async {
    try {
      final res = await _dio.get(
        "$baseUrl/api/student/me",
        queryParameters: {"nim": nim},
      );

      if (res.statusCode == 200) {
        final data = res.data;
        return {
          "success": true,
          "student": data["student"],
          "mustChangePassword": password == nim,
        };
      }
      return {"success": false, "error": "NIM tidak terdaftar di sistem kampus."};
    } on DioException catch (e) {
      return {
        "success": false,
        "error": e.response?.data?["error"] ?? "Gagal terhubung ke server kampus.",
      };
    }
  }

  /// Get student profile, enrolled courses, and attendance records
  Future<Map<String, dynamic>> getStudentDashboard(String nim) async {
    try {
      final res = await _dio.get(
        "$baseUrl/api/student/me",
        queryParameters: {"nim": nim},
      );
      return res.data;
    } catch (e) {
      throw Exception("Gagal memuat data mahasiswa: $e");
    }
  }

  /// Scan dynamic QR code and validate token with auto-host retry
  Future<Map<String, dynamic>> submitScan({
    required String sessionId,
    required String token,
    required String studentNim,
    required String studentId,
    String? preferredHost,
    String? deviceId,
    double? latitude,
    double? longitude,
  }) async {
    final hostsToTry = <String>[];
    if (preferredHost != null && preferredHost.isNotEmpty) {
      hostsToTry.add(preferredHost.startsWith("http") ? preferredHost : "http://$preferredHost");
    }
    if (!hostsToTry.contains(baseUrl)) {
      hostsToTry.add(baseUrl);
    }
    // Also include common development fallbacks
    if (!hostsToTry.contains("http://192.168.100.58:3000")) {
      hostsToTry.add("http://192.168.100.58:3000");
    }
    if (!hostsToTry.contains("http://10.0.2.2:3000")) {
      hostsToTry.add("http://10.0.2.2:3000");
    }
    if (!hostsToTry.contains("http://localhost:3000")) {
      hostsToTry.add("http://localhost:3000");
    }

    String lastError = "Gagal terhubung ke server kampus.";

    for (final host in hostsToTry) {
      try {
        final res = await _dio.post(
          "$host/api/attendance/scan",
          data: {
            "sessionId": sessionId,
            "token": token,
            "studentNim": studentNim,
            "studentId": studentId,
            "deviceId": deviceId,
            "latitude": latitude,
            "longitude": longitude,
          },
        );

        if (res.statusCode == 200) {
          // Remember working host
          baseUrl = host;
          return {
            "success": true,
            "message": res.data["message"] ?? "Presensi Berhasil!",
            "data": res.data["data"],
          };
        }
      } on DioException catch (e) {
        if (e.response?.data != null) {
          // Server responded with explicit message (e.g. invalid token, expired, etc.)
          final errorMsg = e.response?.data?["error"] ?? "Token QR tidak valid.";
          final code = e.response?.data?["code"] ?? "ERROR";
          return {
            "success": false,
            "error": errorMsg,
            "code": code,
          };
        }
        lastError = "Koneksi ke $host terputus atau tidak dapat dijangkau.";
      } catch (err) {
        lastError = err.toString();
      }
    }

    return {
      "success": false,
      "error": lastError,
      "code": "NETWORK_ERROR",
    };
  }

  /// Submit leave of absence / medical note (Izin / Sakit)
  Future<Map<String, dynamic>> submitPermission({
    required String sessionId,
    required String studentId,
    required String type, // "IZIN" or "SAKIT"
    required String reason,
    String? attachmentUrl,
  }) async {
    try {
      final res = await _dio.post(
        "$baseUrl/api/student/permissions",
        data: {
          "session_id": sessionId,
          "student_id": studentId,
          "type": type,
          "reason": reason,
          "attachment_url": attachmentUrl,
        },
      );
      return {
        "success": true,
        "message": res.data["message"] ?? "Surat izin berhasil diajukan.",
      };
    } on DioException catch (e) {
      return {
        "success": false,
        "error": e.response?.data?["error"] ?? "Gagal mengajukan izin.",
      };
    }
  }

  /// Upload permission attachment file
  Future<Map<String, dynamic>> uploadAttachment({
    required String base64Data,
    required String fileName,
  }) async {
    try {
      final res = await _dio.post(
        "$baseUrl/api/upload",
        data: {
          "base64": base64Data,
          "name": fileName,
        },
      );
      if (res.statusCode == 200) {
        return {
          "success": true,
          "url": res.data["url"],
          "fileName": res.data["fileName"],
        };
      }
      return {"success": false, "error": "Gagal mengunggah file."};
    } on DioException catch (e) {
      return {
        "success": false,
        "error": e.response?.data?["error"] ?? "Gagal terhubung ke server upload.",
      };
    }
  }

  /// Change password when must_change_password is true
  Future<Map<String, dynamic>> changePassword({
    required String nim,
    required String newPassword,
  }) async {
    try {
      final res = await _dio.post(
        "$baseUrl/api/student/change-password",
        data: {
          "nim": nim,
          "newPassword": newPassword,
        },
      );
      return {
        "success": true,
        "message": res.data["message"] ?? "Password berhasil diubah.",
      };
    } on DioException catch (e) {
      return {
        "success": false,
        "error": e.response?.data?["error"] ?? "Gagal mengubah password.",
      };
    }
  }
}
