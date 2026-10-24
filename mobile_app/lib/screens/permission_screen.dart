import 'package:flutter/material.dart';
import 'package:ug_attendance_mobile/services/api_service.dart';
import 'package:ug_attendance_mobile/widgets/batik_widgets.dart';

class PermissionScreen extends StatefulWidget {
  final Map<String, dynamic> student;
  final String? preselectedSessionId;
  final VoidCallback? onSubmitted;

  const PermissionScreen({
    super.key,
    required this.student,
    this.preselectedSessionId,
    this.onSubmitted,
  });

  @override
  State<PermissionScreen> createState() => _PermissionScreenState();
}

class _PermissionScreenState extends State<PermissionScreen> {
  final ApiService _apiService = ApiService();
  String _selectedType = "IZIN"; // "IZIN" or "SAKIT"
  final TextEditingController _reasonController = TextEditingController();
  final TextEditingController _attachmentController = TextEditingController(
    text: "https://gunadarma.ac.id/surat_keterangan_dokter_10124001.pdf",
  );
  bool _isLoading = false;

  Future<void> _handleSubmit() async {
    final reason = _reasonController.text.trim();
    if (reason.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Alasan permohonan izin/sakit wajib diisi."),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final sessionId = widget.preselectedSessionId ??
          "55555555-5555-5555-5555-555555555501"; // Fallback to active demo session
      final studentId = widget.student["id"] ?? "44444444-4444-4444-4444-444444444401";

      final res = await _apiService.submitPermission(
        sessionId: sessionId,
        studentId: studentId,
        type: _selectedType,
        reason: reason,
        attachmentUrl: _attachmentController.text.trim(),
      );

      if (!mounted) return;

      if (res["success"] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Pengajuan izin berhasil dikirim ke Dosen Pengampu."),
            backgroundColor: Color(0xFF15803D),
          ),
        );
        widget.onSubmitted?.call();
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res["error"] ?? "Gagal mengirim pengajuan izin."),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
      );
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
      appBar: AppBar(
        backgroundColor: const Color(0xFF140224),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          "Pengajuan Izin / Dispensasi",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(3),
          child: BatikRibbonTrim(height: 3),
        ),
      ),
      body: BatikPageBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Student summary card - Solid White
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.14),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFFFAF5FF),
                      foregroundColor: const Color(0xFF581C87),
                      child: Text(
                        (widget.student["name"] ?? "M").substring(0, 1),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.student["name"] ?? "Mahasiswa",
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "NIM: ${widget.student["nim"]} • Kelas ${widget.student["class_group"]}",
                          style: const TextStyle(
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
              const SizedBox(height: 20),

              // Select Type
              const Text(
                "TIPE DISPENSASI",
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFDE047),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _selectedType = "IZIN";
                        });
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: _selectedType == "IZIN"
                              ? const Color(0xFFFDE047)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _selectedType == "IZIN"
                                ? const Color(0xFFFDE047)
                                : const Color(0xFFE2E8F0),
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.12),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.assignment_outlined,
                              color: _selectedType == "IZIN"
                                  ? const Color(0xFF140224)
                                  : const Color(0xFF581C87),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              "IZIN KEPERLUAN",
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: _selectedType == "IZIN"
                                    ? const Color(0xFF140224)
                                    : const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _selectedType = "SAKIT";
                        });
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: _selectedType == "SAKIT"
                              ? const Color(0xFF38BDF8)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _selectedType == "SAKIT"
                                ? const Color(0xFF38BDF8)
                                : const Color(0xFFE2E8F0),
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.12),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.medical_services_outlined,
                              color: _selectedType == "SAKIT"
                                  ? const Color(0xFF0F172A)
                                  : const Color(0xFF0284C7),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              "SURAT SAKIT",
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: _selectedType == "SAKIT"
                                    ? const Color(0xFF0F172A)
                                    : const Color(0xFF0F172A),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Reason
              const Text(
                "ALASAN / KETERANGAN",
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFDE047),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _reasonController,
                maxLines: 4,
                style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14),
                decoration: InputDecoration(
                  hintText: "Jelaskan alasan ketidakhadiran Anda secara terperinci...",
                  hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFF581C87), width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Attachment Link
              const Text(
                "LAMPIRAN SURAT / BUKTI (LINK PDF/GAMBAR)",
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFDE047),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _attachmentController,
                style: const TextStyle(color: Color(0xFF0F172A), fontSize: 13),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.link, color: Color(0xFF581C87)),
                  hintText: "https://...",
                  hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: Color(0xFF581C87), width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Submit Button - Solid White
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF581C87),
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(26),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF581C87)),
                          ),
                        )
                      : const Text(
                          "Kirim Pengajuan ke Dosen",
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF581C87),
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
