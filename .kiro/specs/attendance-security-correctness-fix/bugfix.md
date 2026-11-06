# Bugfix Requirements Document

## Introduction

UG Attendance records class attendance at Universitas Gunadarma. A lecturer projects a rolling QR code, students scan it with the Flutter mobile app, and the parent receives a WhatsApp notification. The system currently has no working authentication and trusts identities supplied by the client. It also accepts a permanent master QR token and stores its working data in server memory rather than in Supabase. As a result, anyone can mark any student present, take over student accounts, administer the system, or read parents' phone numbers. Data disappears on restart, and several attendance figures are wrong.

This spec fixes all reviewed findings in one pass. They are grouped as follows:

- **A.** Data source and persistence (root cause behind several other findings)
- **B.** Web authentication and authorization
- **C.** Account passwords
- **D.** Student identity on mobile and student endpoints
- **E.** QR token integrity
- **F.** Enrollment checks
- **G.** QR projector behavior
- **H.** Attendance statistics and lecturer corrections
- **I.** Database access rules and server configuration
- **J.** Mobile networking

**Assumptions** (the user can adjust these):

- Supabase Auth is the identity source for web logins (admin, lecturer) and mobile logins (student). Every API route derives the caller's identity and role from a verified Supabase session/JWT, with the role taken from `profiles.role`. Identity fields in request bodies or query strings are never trusted.
- Supabase is the source of truth for all reads and writes. The in-memory demo store stops being authoritative. Every Supabase call checks the returned `error` and reports failures.
- Students log in with their NIM, which maps to the account email `{nim}@student.ug.ac.id`.
- The default password stays equal to the NIM (students) or NIDN (lecturers) as an initial credential, provided the server enforces `must_change_password`.
- The token validity window is 7 seconds (5 s rotation + 2 s tolerance), matching the README and projector UI.
- When a student has no CLOSED sessions yet, the attendance rate is reported as 0%.
- The Fonnte dev simulation mode (used when `FONNTE_TOKEN` is not configured) is intentional and stays.
- UI text stays in Indonesian. UI design changes only where a fix requires it: removing pre-filled credentials, removing the lecturer switcher, and showing real statuses in the live feed.

## Bug Analysis

### Current Behavior (Defect)

**A. Data source and persistence**

1.1 WHEN an API route reads students, lecturers, courses, schedules, enrollments, sessions, attendances, or permissions THEN the system answers from an in-memory store in the server process, seeded with hardcoded demo data, and ignores Supabase. The admin student list does query Supabase first, but it falls back to the demo data when the query errors or returns no rows.

1.2 WHEN an API route creates, updates, or deletes data THEN the system applies the change to the in-memory store and writes to Supabase afterwards only as a best-effort copy, so Supabase drifts from what the UI shows

1.3 WHEN the web server restarts or runs as more than one instance THEN the system loses data created since startup (sessions, attendances, permissions, rolling QR tokens), or each instance shows different data

1.4 WHEN a Supabase query or write returns an error (for example a constraint violation, a permission denial, or a misconfigured key) THEN the system does not detect it, because supabase-js returns errors instead of throwing them, and responds as if the operation succeeded

1.5 WHEN an admin creates a student or lecturer and creating the Supabase Auth account fails THEN the system still creates the student/lecturer record with a random profile ID that is not linked to any account, and returns success

1.6 WHEN a student submits an IZIN/SAKIT permission, or a lecturer approves or rejects one THEN the system keeps the permission, and any resulting IZIN/SAKIT attendance, only in memory and never writes them to Supabase

**B. Web authentication and authorization**

1.7 WHEN a user submits the web login form THEN the system ignores the password and navigates to the dashboard of the selected role tab without verifying any credentials

1.8 WHEN the "Mahasiswa" tab is selected and the web login form is submitted THEN the system redirects to a lecturer session (QR projector) page

1.9 WHEN an unauthenticated visitor, or a user with a different role, opens an `/admin/*` or `/lecturer/*` page directly THEN the system renders the page

1.10 WHEN any caller, with or without a session, calls an `/api/admin/**` endpoint THEN the system performs the requested read, create, update, or delete

1.11 WHEN any caller calls a lecturer operation (list, open, update, or close sessions; read session detail; manual attendance correction; approve or reject permissions) THEN the system performs it without checking who the caller is or whether they teach the class. `GET /api/lecturer/sessions` filters by a `lecturerId` query parameter that the caller chooses.

1.12 WHEN a user opens the lecturer dashboard THEN the system shows a lecturer switcher that defaults to a hardcoded lecturer and lets the user act as any lecturer. The "active session" banner can show another lecturer's OPEN session.

1.13 WHEN the web login page loads or a role tab is selected THEN the system pre-fills demo credentials (`admin@ug.ac.id` / `admin123`, a lecturer's NIDN as the password, a student's NIM as the password) and labels them "Kredensial Default Terisi"

**C. Account passwords**

1.14 WHEN an account has `must_change_password = true` THEN the server does not enforce it. The mobile app decides client-side whether to show the change-password screen (`password == nim`), and the web app never checks the flag.

1.15 WHEN `POST /api/student/change-password` is called with any NIM and a new password THEN the system changes that student's password without authenticating the caller or checking the current password (account takeover)

1.16 WHEN the target student's auth account is not on the first page of the auth user list (beyond the first 50 accounts), or the password update fails THEN the system changes nothing and still returns "Password berhasil diperbarui"

**D. Student identity on mobile and student endpoints**

1.17 WHEN a student logs in on the mobile app with a registered NIM and any password THEN the login succeeds, because the app only calls `GET /api/student/me?nim=...` and never sends the password to the server

1.18 WHEN mobile login fails for NIM `10124001`, or the server response lacks student data THEN the app logs in anyway as the hardcoded demo student Ahmad Fauzi

1.19 WHEN `GET /api/student/me` is called THEN the system returns the profile (including `parent_phone`), schedules, and attendances of whatever NIM is in the query string, defaults to NIM `10124001` when the parameter is missing, and requires no authentication

1.20 WHEN `POST /api/attendance/scan` is called THEN the system identifies the student from `studentId`/`studentNim` in the request body. If neither matches, it falls back to the first student (Ahmad Fauzi), so anyone can record attendance for any student.

1.21 WHEN `POST /api/student/permissions` is called with any `student_id` THEN the system files a permission on behalf of that student without validating `type` against IZIN/SAKIT. `GET` returns every student's permissions to any caller, and `PATCH` accepts any approval status string.

**E. QR token integrity**

1.22 WHEN any caller sends `POST /api/qr/rotate` with a session ID THEN the system returns a fresh valid token, so a student can obtain valid tokens without seeing the projector

1.23 WHEN `/api/qr/rotate` is called for a CLOSED or DRAFT session THEN the system sets the session status to OPEN, reopening it

1.24 WHEN `/api/qr/rotate` is called with an unknown session ID THEN the system creates a new OPEN in-memory session attached to the first class

1.25 WHEN the token `INITIAL_UG_QR_TOKEN_DEMO` is submitted for any OPEN session THEN the system accepts it, at any time and forever. The seed session stores this token, and the projector uses it as its default initial token.

1.26 WHEN the submitted token equals the session's current `active_qr_token` THEN the system accepts it without checking its expiry. Sessions opened by a lecturer start with a token built from a non-cryptographic random value.

1.27 WHEN a token is issued THEN the system sets its expiry to 12 seconds and adds another 4 seconds of grace during validation, so the token is accepted for about 16 seconds. Meanwhile the rotate response reports `validitySeconds: 7` and the projector shows "Toleransi Masa Berlaku 7 Detik".

1.28 WHEN `QR_SECRET_KEY` is not configured THEN the system signs tokens with a secret hardcoded in the source

**F. Enrollment checks**

1.29 WHEN a student with no enrollment (KRS) row for the session's class scans, and their `class_group` equals the class name (case-insensitive) THEN the system accepts the scan and records attendance

1.30 WHEN `GET /api/student/me` builds the schedule list THEN the system includes classes whose name equals the student's `class_group` even when the student is not enrolled in them, plus those classes' sessions

**G. QR projector behavior**

1.31 WHEN the projector displays a token THEN the QR payload includes `ts: Date.now()` recomputed on every render. Because the 100 ms countdown re-renders the component, the QR image changes about 10 times per second instead of every 5 seconds, which can hurt scanning.

1.32 WHEN the countdown reaches zero THEN the system calls the token rotation inside the `setCountdown` state updater function, so React Strict Mode (development) can trigger two rotations per cycle

1.33 WHEN the lecturer toggles the sound button THEN the system tears down and recreates the realtime subscription and polling timer and refetches the live feed

1.34 WHEN the live feed contains IZIN, SAKIT, or ALPA records THEN the "X / Y Hadir" counter counts every record as present and every row shows a HADIR badge

1.35 WHEN the projector cannot read `window.location.host` THEN the system embeds the hardcoded LAN address `192.168.100.58:3000` in the QR payload

**H. Attendance statistics and lecturer corrections**

1.36 WHEN `GET /api/student/me` computes the attendance rate THEN the system divides HADIR records from all sessions, including OPEN ones, by the number of CLOSED sessions only (using 1 when there are none) and clamps the result to 100%, so the rate is wrong

1.37 WHEN a lecturer sends a manual correction (`PATCH /api/lecturer/sessions/[id]`) with a status other than HADIR, IZIN, SAKIT, or ALPA THEN the system stores that arbitrary status

1.38 WHEN a manual correction targets a session ID that does not exist THEN the system still creates an attendance record for it

1.39 WHEN a manual correction targets a student who is not enrolled in the session's class THEN the system still creates or updates an attendance record for that student

1.40 WHEN `PUT /api/lecturer/sessions/[id]` is called with any status string THEN the system stores it as the session status

**I. Database access rules and server configuration**

1.41 WHEN a client uses the public anon key against Supabase THEN the client can read and write every table, including students' `parent_phone`, because every table has unrestricted `FOR SELECT USING (true)` and `FOR ALL USING (true)` policies

1.42 WHEN `SUPABASE_SERVICE_ROLE_KEY` is not configured THEN the server's privileged client silently uses the anon key. When the Supabase URL or keys are not configured, it uses dummy values, so the misconfiguration goes unnoticed and writes fail silently.

**J. Mobile networking**

1.43 WHEN the mobile app talks to the server THEN it uses the hardcoded LAN address `http://192.168.100.58:3000` as its base URL and also tries hardcoded fallback hosts (`192.168.100.58:3000`, `10.0.2.2:3000`, `localhost:3000`)

1.44 WHEN the mobile app submits a scan THEN it first sends the request to the host named in the QR payload's `h` field. A forged QR code can therefore redirect the student's request, and, once authentication exists, the student's access token, to an attacker-controlled host.

### Expected Behavior (Correct)

**A. Data source and persistence**

2.1 WHEN an API route reads students, lecturers, courses, schedules, enrollments, sessions, attendances, or permissions THEN the system SHALL read them from Supabase. It SHALL return an error response when the query fails and an empty result when no rows exist, never demo data.

2.2 WHEN an API route creates, updates, or deletes data THEN the system SHALL write the change to Supabase and report success only after Supabase confirms it. No in-memory copy SHALL be treated as authoritative.

2.3 WHEN the web server restarts or runs as more than one instance THEN the system SHALL show the same persisted data on every instance and after every restart, including which QR tokens are currently valid for a session

2.4 WHEN a Supabase query or write returns an error THEN the system SHALL check the returned error, SHALL NOT report success, SHALL return an error response with an Indonesian message, and SHALL log the details server-side

2.5 WHEN an admin creates a student or lecturer and creating the Supabase Auth account, profile, or record fails THEN the system SHALL return an error and SHALL NOT leave partial records behind. Any auth account already created in that request SHALL be removed.

2.6 WHEN a student submits an IZIN/SAKIT permission, or a lecturer approves or rejects one THEN the system SHALL persist the permission, its status, and any resulting IZIN/SAKIT attendance in Supabase

**B. Web authentication and authorization**

2.7 WHEN a user submits the web login form THEN the system SHALL verify the email and password with Supabase Auth, SHALL show an Indonesian error message when they are wrong, and SHALL route the user by the role stored in their profile, not by the selected tab

2.8 WHEN a STUDENT account, or the "Mahasiswa" tab, is used on the web login form THEN the system SHALL NOT give access to any admin or lecturer page and SHALL show an Indonesian message directing the student to the mobile app

2.9 WHEN an unauthenticated visitor opens an `/admin/*` or `/lecturer/*` page THEN the system SHALL redirect them to `/login`. WHEN an authenticated user without the matching role (ADMIN for `/admin/*`, LECTURER for `/lecturer/*`) opens such a page THEN the system SHALL deny access.

2.10 WHEN an `/api/admin/**` endpoint is called without a valid session THEN the system SHALL return 401. WHEN it is called by a user whose `profiles.role` is not ADMIN THEN the system SHALL return 403 and perform nothing. The exception is the read access that lecturer pages need: a LECTURER SHALL receive only the classes they teach and their own lecturer record.

2.11 WHEN a lecturer operation is called THEN the system SHALL require a LECTURER session (401/403 otherwise) and SHALL derive the lecturer from that session. It SHALL allow the operation only on sessions and classes the lecturer teaches (403 otherwise), and SHALL list only that lecturer's own sessions regardless of any `lecturerId` parameter. An ADMIN SHALL still be able to read all sessions for the admin dashboard.

2.12 WHEN a lecturer opens the lecturer dashboard THEN the system SHALL show only the signed-in lecturer's identity, schedules, and sessions, with no switcher for acting as another lecturer. The "active session" banner SHALL show only that lecturer's own OPEN session.

2.13 WHEN the web login page loads or a role tab is selected THEN the system SHALL leave the identifier and password fields empty and SHALL NOT display any credentials. The role description hint may remain.

**C. Account passwords**

2.14 WHEN an account has `must_change_password = true` THEN the server SHALL reject every API request from that account except the password change, with a 403 response, an identifiable code, and an Indonesian message. The web and mobile apps SHALL read the flag from the server and send the user to the change-password screen.

2.15 WHEN a password change is requested THEN the system SHALL change only the authenticated caller's own password, SHALL require and verify the current password, and SHALL ignore any NIM or user identifier in the request body

2.16 WHEN a password change is processed THEN the system SHALL locate the account by the authenticated user's ID, without scanning a paginated user list. It SHALL return success only when both the password update and clearing `must_change_password` succeed, and SHALL return an error otherwise.

**D. Student identity on mobile and student endpoints**

2.17 WHEN a student logs in on the mobile app THEN the system SHALL verify the NIM and password with Supabase Auth, SHALL reject a wrong password with an Indonesian error message, and SHALL send the resulting session token with every later API request

2.18 WHEN mobile login fails for any NIM, or the server is unreachable THEN the app SHALL show the error and stay on the login screen. It SHALL NOT sign in as any hardcoded student.

2.19 WHEN `GET /api/student/me` is called THEN the system SHALL require a STUDENT session (401 otherwise), SHALL return only the caller's own data, and SHALL ignore any `nim` parameter

2.20 WHEN `POST /api/attendance/scan` is called THEN the system SHALL identify the student only from the authenticated session (the student record linked to the caller's profile) and SHALL ignore `studentId`/`studentNim` in the body. It SHALL return 401 without a valid session and 403 when the caller has no student record, and SHALL never fall back to another student.

2.21 WHEN `POST /api/student/permissions` is called THEN the system SHALL file the permission only for the authenticated student, SHALL accept only `type` IZIN or SAKIT, and SHALL accept only sessions of classes the student is enrolled in. `GET` SHALL return only the caller's own permissions to a student, or only permissions for the lecturer's classes to a lecturer. `PATCH` SHALL accept only APPROVED or REJECTED, and only from the lecturer of that session's class.

**E. QR token integrity**

2.22 WHEN `POST /api/qr/rotate` is called THEN the system SHALL issue a token only to the authenticated lecturer who teaches the session's class, and SHALL return 401/403 to anyone else

2.23 WHEN `/api/qr/rotate` is called for a session that is not OPEN THEN the system SHALL NOT change the session status, SHALL NOT issue a token, and SHALL return an Indonesian error message

2.24 WHEN `/api/qr/rotate` is called with an unknown session ID THEN the system SHALL return 404 "Sesi perkuliahan tidak ditemukan." and create nothing

2.25 WHEN any fixed or master token (including `INITIAL_UG_QR_TOKEN_DEMO`) is submitted THEN the system SHALL reject it. Only server-issued tokens for that specific session SHALL be accepted. The projector SHALL NOT display a scannable QR until it has received a token from the server, and seed data SHALL NOT contain a usable token.

2.26 WHEN any token is validated, including the session's current active token THEN the system SHALL apply the same expiry check. All tokens, including the first token of a newly opened session, SHALL be generated with cryptographic randomness.

2.27 WHEN a token is issued THEN the system SHALL accept it for at most 7 seconds after issue (5 s rotation + 2 s tolerance), with no extra grace. The `validitySeconds` value in the rotate response SHALL equal the enforced window.

2.28 WHEN `QR_SECRET_KEY` is not configured THEN the system SHALL refuse to issue tokens, return an error, and log a configuration error. It SHALL NOT sign with a built-in secret.

**F. Enrollment checks**

2.29 WHEN a student scans for a session THEN the system SHALL accept the scan only if an enrollment row exists for that student and the session's class. Otherwise it SHALL return 403 with code NOT_ENROLLED, regardless of `class_group`.

2.30 WHEN `GET /api/student/me` builds the schedule list THEN the system SHALL include only classes the student is enrolled in, and only those classes' sessions

**G. QR projector behavior**

2.31 WHEN the projector displays a token THEN the QR image SHALL stay identical until a new token is received, which happens about every 5 seconds or on a manual refresh. The countdown updates SHALL NOT change the QR image.

2.32 WHEN the countdown reaches zero THEN the system SHALL request exactly one token rotation per 5-second cycle, also under React Strict Mode, and SHALL NOT trigger the rotation from inside a state updater function

2.33 WHEN the lecturer toggles the sound button THEN the system SHALL keep the existing realtime subscription and polling timer, and the scan chime SHALL follow the current sound setting

2.34 WHEN the live feed contains IZIN, SAKIT, or ALPA records THEN the "X / Y Hadir" counter SHALL count only HADIR records, and each row SHALL show the record's actual status

2.35 WHEN the projector builds the QR payload THEN the payload SHALL NOT contain any hardcoded network address

**H. Attendance statistics and lecturer corrections**

2.36 WHEN `GET /api/student/me` computes the attendance rate THEN the system SHALL divide the number of HADIR records in CLOSED sessions of the student's enrolled classes by the number of those CLOSED sessions, excluding OPEN sessions from both counts. When there are no CLOSED sessions it SHALL report 0%. The result SHALL always be between 0 and 100 without clamping.

2.37 WHEN a manual correction is sent with a status other than HADIR, IZIN, SAKIT, or ALPA THEN the system SHALL return 400 with an Indonesian message and change nothing

2.38 WHEN a manual correction targets a session ID that does not exist THEN the system SHALL return 404 "Sesi tidak ditemukan" and create nothing

2.39 WHEN a manual correction targets a student who is not enrolled in the session's class THEN the system SHALL reject it with an Indonesian message and change nothing

2.40 WHEN `PUT /api/lecturer/sessions/[id]` is called with a status THEN the system SHALL accept only DRAFT, OPEN, or CLOSED and SHALL return 400 for any other value

**I. Database access rules and server configuration**

2.41 WHEN a client uses the public anon key against Supabase THEN the database SHALL deny access to all tables. Authenticated users SHALL be able to read only the rows they are entitled to: a student their own records, and a lecturer the classes, sessions, enrollments, and attendances of the classes they teach, so the projector's realtime feed keeps working. `parent_phone` SHALL NOT be readable by other students or by anonymous clients. Writes SHALL go through the server API only.

2.42 WHEN the Supabase URL, anon key, or service role key is not configured THEN the server SHALL fail with a clear configuration error. It SHALL NOT fall back to dummy values or use the anon key for privileged operations.

**J. Mobile networking**

2.43 WHEN the mobile app talks to the server THEN it SHALL use a base URL set through build configuration and SHALL NOT use any hardcoded LAN address or hardcoded fallback hosts

2.44 WHEN the mobile app submits a scan THEN it SHALL send the request only to the configured server and SHALL ignore any host named in the QR payload

### Unchanged Behavior (Regression Prevention)

**Attendance scanning**

3.1 WHEN an authenticated student enrolled in the class scans a token for an OPEN session within its 7-second validity THEN the system SHALL CONTINUE TO record exactly one HADIR attendance with the scan time and return the "Presensi Berhasil! ..." message with the same data fields (attendanceId, studentName, studentNim, course, class, room, scannedAt, parentPhone)

3.2 WHEN a scan is recorded successfully THEN the system SHALL CONTINUE TO send the WhatsApp notification to the parent's number in the same Indonesian message format, without blocking the scan response. A WhatsApp failure SHALL NOT fail the scan.

3.3 WHEN `FONNTE_TOKEN` is not configured THEN the system SHALL CONTINUE TO simulate WhatsApp sending by logging the message (dev mode)

3.4 WHEN a student scans again for a session they already attended THEN the system SHALL CONTINUE TO return "Anda sudah melakukan presensi pada sesi ini." with `alreadyAttended: true`, without creating a second record or sending a second notification

3.5 WHEN a student scans for a CLOSED session THEN the system SHALL CONTINUE TO return 400 "Sesi perkuliahan ini telah ditutup oleh Dosen."

3.6 WHEN a student scans an expired or unknown token THEN the system SHALL CONTINUE TO return 400 with code EXPIRED_TOKEN and the message "Token QR kedaluwarsa atau telah diperbarui. Silakan scan ulang layar proyektor."

3.7 WHEN a student who is not enrolled scans THEN the system SHALL CONTINUE TO return 403 with code NOT_ENROLLED and the message naming the student, their class group, and the class

3.8 WHEN the scan request lacks a session ID or token THEN the system SHALL CONTINUE TO return 400 "Session ID dan Token QR wajib disertakan." WHEN the token field contains the raw QR JSON (keys `s`/`t` or `sessionId`/`token`) THEN the system SHALL CONTINUE TO unpack it.

3.9 WHEN a student scans the previous token shortly after a rotation, still within that token's 7-second validity THEN the system SHALL CONTINUE TO accept it, so scans at the rotation boundary are not rejected

3.10 WHEN the mobile app scans a projector QR code THEN the app SHALL CONTINUE TO read the existing payload format (`app`, `s`, `t`, `m`) and submit the session ID and token

**QR projector**

3.11 WHEN a lecturer views the projector for an OPEN session THEN the system SHALL CONTINUE TO rotate the token every 5 seconds, animate the countdown bar smoothly, show the rotation counter, and support the manual "Refresh Token" button, fullscreen mode, and the scan chime when sound is enabled

3.12 WHEN attendance is recorded for the projected session THEN the live feed SHALL CONTINUE TO update through Supabase Realtime, with polling every 3 seconds as a fallback

**Lecturer features**

3.13 WHEN a lecturer opens a session for a class they teach THEN the system SHALL CONTINUE TO create an OPEN session, return 201 "Sesi perkuliahan berhasil dibuka", and navigate to the projector page

3.14 WHEN a lecturer closes a session (`PUT` with status CLOSED) THEN the system SHALL CONTINUE TO set `ended_at`, clear the active token, and reject further scans. WHEN they update the topic or custom room THEN the system SHALL CONTINUE TO save it.

3.15 WHEN a lecturer opens the session detail for their own session THEN the system SHALL CONTINUE TO return the session, attendances, enrolled students, and stats (totalEnrolled, totalPresent, totalPermission, totalSick, totalAbsent)

3.16 WHEN a lecturer sends a manual correction with a valid status for an enrolled student in their own existing session THEN the system SHALL CONTINUE TO update the existing record or create one, and return "Status presensi untuk {nama} berhasil diperbarui menjadi {status}" with the updated attendances

3.17 WHEN a lecturer approves an IZIN/SAKIT permission for their class THEN the system SHALL CONTINUE TO set the student's attendance for that session to IZIN or SAKIT. WHEN they reject it THEN the system SHALL CONTINUE TO mark it REJECTED.

**Student features**

3.18 WHEN an authenticated student submits a valid IZIN/SAKIT permission THEN the system SHALL CONTINUE TO store it as PENDING and return "Surat izin/sakit berhasil diajukan dan menunggu persetujuan dosen"

3.19 WHEN an authenticated student loads their dashboard THEN `GET /api/student/me` SHALL CONTINUE TO return the same response shape (student, schedules, sessions, attendances, activeSessions, and stats with totalCourses, totalPresent, attendanceRate)

3.20 WHEN a student logs in for the first time with the default password (their NIM) THEN the system SHALL CONTINUE TO let them in and take them to the change-password screen. WHEN they later log in with the new password THEN the app SHALL CONTINUE TO open the home screen.

3.21 WHEN a password change request has a new password shorter than 6 characters THEN the system SHALL CONTINUE TO return "Password baru minimal 6 karakter". WHEN the change succeeds THEN the system SHALL CONTINUE TO clear `must_change_password` and return "Password berhasil diperbarui. Silakan login kembali dengan password baru."

**Admin features**

3.22 WHEN an admin creates a student THEN the system SHALL CONTINUE TO create a Supabase Auth account with the NIM as the default password and `must_change_password = true`, validate and normalize the parent's WhatsApp number to the 628… format, enroll the student in the classes matching their `class_group` (as enrollment rows), and return the auth info. A duplicate NIM SHALL CONTINUE TO be rejected with the same message.

3.23 WHEN an admin creates a lecturer THEN the system SHALL CONTINUE TO create a Supabase Auth account with the NIDN as the default password and `must_change_password = true`, and to reject a duplicate NIDN with the same message

3.24 WHEN an authenticated admin uses the course, schedule, lecturer, or student management pages THEN the system SHALL CONTINUE TO provide the same create, read, update, and delete operations, with the same validation messages and response shapes

3.25 WHEN an authenticated admin or lecturer with the correct role logs in on the web THEN the system SHALL CONTINUE TO open `/admin/dashboard` for admins and `/lecturer/dashboard` for lecturers

**General**

3.26 WHEN any page or screen is shown THEN the system SHALL CONTINUE TO use Indonesian text and the existing layout and styling of the web pages, projector, and mobile screens, except for the changes required by the clauses above
