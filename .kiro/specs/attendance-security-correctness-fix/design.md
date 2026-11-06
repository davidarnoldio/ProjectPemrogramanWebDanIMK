# Attendance Security & Correctness Fix Bugfix Design

## Overview

UG Attendance has no real authentication, keeps its working data in an in-memory store (`src/lib/store.ts`, `dbStore`), and treats Supabase as a best-effort copy. API routes take the caller's identity from request bodies and query strings. The QR flow accepts a permanent master token and a ~16 s window. Several fallbacks for demos (first student, NIM `10124001`, a hardcoded lecturer, LAN hosts, dummy Supabase keys, a hardcoded HMAC secret) are still in the production code paths. The projector, the statistics, and the mobile networking each have smaller correctness bugs on top of this.

The fix keeps the existing pages, routes, response shapes, and Indonesian messages, and changes what sits underneath them:

1. **Supabase becomes the only source of truth.** Every route reads and writes through a small server-side data module (`src/lib/server/data.ts`) that replaces the `dbStore` helpers one-for-one and checks every returned `error`. Issued QR tokens move to a new `qr_tokens` table, so they survive restarts and are shared across instances.
2. **One verified identity per request.** A shared helper (`src/lib/server/auth.ts`) verifies the caller from either a Supabase session cookie (web) or an `Authorization: Bearer` access token (mobile), loads `profiles.role` and the linked lecturer/student row, and enforces `must_change_password`. Request-supplied identity fields are ignored everywhere.
3. **Pages are guarded by middleware.** `src/middleware.ts` refreshes the cookie session (`@supabase/ssr`) and gates `/admin/*`, `/lecturer/*`, and the new `/change-password` page by role.
4. **Database access is closed.** A migration drops the `USING (true)` policies, denies `anon`, gives authenticated students and lecturers scoped read access (enough for the projector's Realtime feed), and leaves all writes to the server's service-role client.
5. **Targeted fixes** for the projector (stable payload, one rotation per cycle, sound toggle, real statuses), statistics, enum validation, enrollment checks, and mobile configuration.

The work is ordered in vertical slices so the app stays runnable after each step (see [Implementation Order](#implementation-order)).

## Glossary

- **Bug_Condition (C)**: The set of interactions (API calls, page visits, projector events, mobile actions, direct database access, server configurations) that trigger any finding in bugfix.md 1.1–1.44. Formalized as `isBugCondition` below.
- **Property (P)**: The required behavior for interactions in C, from bugfix.md 2.1–2.44. Formalized as `expectedBehavior`.
- **Preservation**: Behavior for interactions outside C that must stay as it is today (bugfix.md 3.1–3.26): messages, response shapes, status codes, notifications, and UI.
- **F / F'**: The current (unfixed) code and the fixed code.
- **Legitimate caller**: A signed-in user whose `profiles.role` matches the operation, whose `must_change_password` is false (except for the password change), and who owns the target (the lecturer teaches the class; the student is the subject of the request and is enrolled).
- **AuthContext**: The verified caller, as returned by `requireAuth()`: `{ userId, email, name, role, mustChangePassword, lecturer, student }`.
- **`requireAuth(req, { roles, allowMustChangePassword })`**: Server helper in `src/lib/server/auth.ts`. Verifies the Bearer token or session cookie, loads the profile and linked record, and throws an `HttpError` with status 401 or 403 when the caller is not allowed.
- **Service-role client**: `getSupabaseAdmin()` in `src/lib/server/supabase-admin.ts`. Bypasses RLS, server-only, and refuses to start without `SUPABASE_SERVICE_ROLE_KEY`.
- **Browser client**: `getBrowserSupabase()` in `src/lib/supabase-browser.ts`. A `createBrowserClient` singleton whose session is stored in cookies. Used for web login, logout, and the projector's Realtime channel.
- **Issued token**: A row in `qr_tokens` (`token_hash`, `session_id`, `issued_at`, `expires_at`) written by `/api/qr/rotate`. Only issued tokens for the same session, within their window, are accepted by `/api/attendance/scan`.
- **Validity window**: 7 000 ms from `issued_at` (5 s rotation + 2 s tolerance). Constants `QR_ROTATION_INTERVAL_MS = 5000` and `QR_TOKEN_VALIDITY_MS = 7000` live in `src/lib/qr-payload.ts` and are shared by the server and the projector.
- **Enrollment (KRS)**: A `course_enrollments` row linking a student to a class. It is the only basis for "enrolled".
- **`dbStore`**: The in-memory singleton in `src/lib/store.ts` that this fix retires.
- **Live feed**: The attendee list on the projector (`DynamicQRProjector`), updated by Supabase Realtime with 3 s polling as a fallback.

## Bug Details

### Bug Condition

The defects share three mechanisms. Routes read and write `dbStore` and wrap non-throwing supabase-js calls in `try/catch`, so errors go unseen. No layer verifies who the caller is, so routes trust body and query identity. Demo shortcuts (master token, fallback student, hardcoded hosts and secrets, dummy keys) sit in normal code paths. The bug condition is the union of the per-group conditions in bugfix.md.

**Formal Specification:**
```
TYPE Interaction = {
  surface : ApiRoute | WebLogin | WebPage | LecturerDashboard | Projector | MobileApp | Database | ServerConfig
  route, method, path, event, body, query, qrPayload
  caller  : ANON | { role, mustChangePassword, lecturerId?, studentId?, nim? }
  state   : persisted data, env vars, failures injected by Supabase, instance/restart history
  now     : server time (ms)
}

FUNCTION isBugCondition(X)
  INPUT: X of type Interaction
  OUTPUT: boolean
  RETURN C_A(X) OR C_B(X) OR C_C(X) OR C_D(X) OR C_E(X)
      OR C_F(X) OR C_G(X) OR C_H(X) OR C_I(X) OR C_J(X)
END FUNCTION

// A. Data source and persistence (1.1–1.6)
FUNCTION C_A(X)
  RETURN X.surface = ApiRoute AND touchesDomainData(X.route)        // students … permissions, QR tokens
     AND ( X.state.memoryDiffersFromSupabase                          // 1.1, 1.2, 1.6
        OR X.state.restartedOrMultiInstance                           // 1.3
        OR X.state.supabaseReturnsError                               // 1.4
        OR (X.route IN {POST /api/admin/students, POST /api/admin/lecturers}
            AND X.state.authAccountProfileOrRecordStepFails) )        // 1.5
END FUNCTION

// B. Web authentication and authorization (1.7–1.13)
FUNCTION C_B(X)
  RETURN (X.surface = WebLogin AND X.event IN {load, selectTab, submit})                      // 1.7, 1.8, 1.13
      OR (X.surface = WebPage AND X.path MATCHES '/admin/*' | '/lecturer/*'
          AND NOT hasRole(X.caller, requiredRole(X.path)))                                    // 1.9
      OR (X.route MATCHES '/api/admin/**'
          AND NOT (X.caller.role = ADMIN OR isLecturerScopedRead(X)))                          // 1.10
      OR (isLecturerOperation(X.route)
          AND NOT (X.caller.role = LECTURER AND teaches(X.caller, targetClass(X)))
          AND NOT (X.caller.role = ADMIN AND isSessionRead(X)))                                // 1.11
      OR (X.surface = LecturerDashboard)                                                       // 1.12
END FUNCTION

// C. Account passwords (1.14–1.16)
FUNCTION C_C(X)
  RETURN (X.caller.mustChangePassword AND X.route ≠ changePassword)                          // 1.14
      OR (X.route = POST changePassword
          AND ( X.caller = ANON OR X.body.nim ≠ X.caller.nim
             OR NOT verifiesCurrentPassword(X.caller, X.body.currentPassword)
             OR X.state.userBeyondFirstAuthPage OR X.state.passwordOrFlagUpdateFails ))       // 1.15, 1.16
END FUNCTION

// D. Student identity on mobile and student endpoints (1.17–1.21)
FUNCTION C_D(X)
  RETURN (X.surface = MobileApp AND X.event = login
          AND (NOT credentialsValid(X.body.nim, X.body.password) OR X.state.serverFailsOrUnreachable)) // 1.17, 1.18
      OR (X.route = GET /api/student/me
          AND (X.caller.role ≠ STUDENT OR X.query.nim ≠ X.caller.nim))                        // 1.19 (missing nim ⇒ '10124001')
      OR (X.route = POST /api/attendance/scan
          AND (X.caller.role ≠ STUDENT OR bodyStudent(X) ≠ X.caller.studentId))               // 1.20 (no match ⇒ first student)
      OR (X.route = POST /api/student/permissions
          AND (X.body.student_id ≠ X.caller.studentId OR X.body.type ∉ {IZIN, SAKIT}
               OR NOT enrolled(X.caller.studentId, sessionClass(X.body.session_id))))          // 1.21
      OR (X.route = GET /api/student/permissions
          AND EXISTS p IN allPermissions WHERE NOT entitled(X.caller, p))                      // 1.21
      OR (X.route = PATCH /api/student/permissions
          AND (X.body.status ∉ {APPROVED, REJECTED}
               OR NOT teaches(X.caller, permissionClass(X.body.permissionId))))                // 1.21
END FUNCTION

// E. QR token integrity (1.22–1.28)
FUNCTION C_E(X)
  LET s := session(X.body.sessionId)
  RETURN (X.route = POST /api/qr/rotate
          AND ( NOT (X.caller.role = LECTURER AND teaches(X.caller, s.class))               // 1.22
             OR s.status ≠ OPEN                                                             // 1.23
             OR s = NONE                                                                    // 1.24
             OR X.state.env.QR_SECRET_KEY unset ))                                          // 1.28
      OR (X.route = POST /api/attendance/scan
          AND ( X.body.token = 'INITIAL_UG_QR_TOKEN_DEMO'                                   // 1.25
             OR (X.body.token = s.active_qr_token AND NOT issuedWithin(X.body.token, s, 7000, X.now)) // 1.26
             OR (issuedFor(X.body.token, s) AND X.now − issuedAt(X.body.token) > 7000) ))   // 1.27
      OR (X.route = POST /api/lecturer/sessions)        // initial token from Math.random     // 1.26
END FUNCTION

// F. Enrollment checks (1.29–1.30)
FUNCTION C_F(X)
  RETURN (X.route = POST /api/attendance/scan
          AND NOT enrolled(X.caller.studentId, s.class_id)
          AND lower(student.class_group) = lower(s.class.class_name))                       // 1.29
      OR (X.route = GET /api/student/me
          AND EXISTS c WHERE c.class_name = student.class_group AND NOT enrolled(student, c)) // 1.30
END FUNCTION

// G. QR projector behavior (1.31–1.35)
FUNCTION C_G(X)
  RETURN X.surface = Projector AND (
         X.event = rerenderWithoutNewToken                                                  // 1.31 (ts changes)
      OR (X.event = countdownReachesZero AND X.strictMode)                                  // 1.32
      OR X.event = toggleSound                                                              // 1.33
      OR (X.event = feedUpdate AND EXISTS a IN feed WHERE a.status ≠ HADIR)                 // 1.34
      OR X.event = buildPayload )                       // payload carries h (and LAN fallback) // 1.35
END FUNCTION

// H. Attendance statistics and lecturer corrections (1.36–1.40)
FUNCTION C_H(X)
  RETURN (X.route = GET /api/student/me AND rate_F(X.state) ≠ expectedRate(X.state))         // 1.36
      OR (X.route = PATCH /api/lecturer/sessions/[id]
          AND ( X.body.status ∉ {HADIR, IZIN, SAKIT, ALPA}                                  // 1.37
             OR session(X.path.id) = NONE                                                   // 1.38
             OR NOT enrolled(X.body.studentId, session(X.path.id).class_id) ))              // 1.39
      OR (X.route = PUT /api/lecturer/sessions/[id]
          AND X.body.status PRESENT AND X.body.status ∉ {DRAFT, OPEN, CLOSED})              // 1.40
END FUNCTION

// I. Database access rules and server configuration (1.41–1.42)
FUNCTION C_I(X)
  RETURN (X.surface = Database AND X.key = anon
          AND (X.caller = ANON OR EXISTS r IN X.rowsTouched WHERE NOT entitled(X.caller, r)
               OR X.operation IN {INSERT, UPDATE, DELETE}))                                 // 1.41
      OR (X.surface = ServerConfig
          AND ANY OF {NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
                      SUPABASE_SERVICE_ROLE_KEY} IS unset)                                  // 1.42
END FUNCTION

// J. Mobile networking (1.43–1.44)
FUNCTION C_J(X)
  RETURN X.surface = MobileApp
     AND (X.event = anyServerRequest                     // hardcoded base URL and fallback hosts // 1.43
          OR (X.event = submitScan AND X.qrPayload.h PRESENT))                              // 1.44
END FUNCTION
```

### Examples

Seed IDs: session `…501` (OPEN, class `…302`, lecturer Rina Wijaya), session `…502` (CLOSED, class `…301`), students Ahmad Fauzi `10124001`, Nadya `10124002` (both 2KA01), Rizky `10124003` (2KA02, no enrollments).

- **Token without a projector (1.22):** `POST /api/qr/rotate {"sessionId":"…501"}` with no cookie. Actual: 200 with a valid token. Expected: 401.
- **Master token + impersonation (1.20, 1.25):** `POST /api/attendance/scan {"sessionId":"…501","token":"INITIAL_UG_QR_TOKEN_DEMO","studentNim":"10124002"}` with no auth. Actual: Nadya is marked HADIR and her parent is messaged. Expected: 401. With Ahmad's session the master token gets 400 `EXPIRED_TOKEN`, and the attendance is Ahmad's no matter what `studentNim` says.
- **Account takeover (1.15):** `POST /api/student/change-password {"nim":"10124002","newPassword":"hacked1"}` with no auth. Actual: "Password berhasil diperbarui…". Expected: 401.
- **Data leak (1.19):** `GET /api/student/me` with no auth. Actual: Ahmad's profile including `parent_phone: 6281299990001`. Expected: 401.
- **Reopening (1.23):** rotate on CLOSED session `…502`. Actual: the session becomes OPEN. Expected: 400 with an Indonesian message, and the status stays CLOSED.
- **Window (1.27):** a token issued at t is accepted at t + 15 s on F. On F' it is accepted at t + 6.9 s and rejected at t + 7.1 s.
- **Enrollment shortcut (1.29):** Nadya (2KA01, not enrolled in class `…305`, which is also 2KA01) scans an OPEN session of `…305`. Actual: HADIR. Expected: 403 `NOT_ENROLLED`.
- **Rate (1.36):** Nadya is corrected to ALPA in CLOSED `…502` and scans OPEN `…501`. Actual: 1 HADIR / 1 closed = 100%. Expected: 0 HADIR in closed sessions / 1 = 0%.
- **Arbitrary status (1.37, 1.40):** `PATCH …/sessions/…501 {"studentId":"…401","status":"BOLOS"}` stores "BOLOS". `PUT {"status":"ARCHIVED"}` stores "ARCHIVED". Expected: 400, nothing changed.
- **Projector (1.31, 1.34):** the QR `value` differs between two renders 100 ms apart because of `ts: Date.now()`. A record corrected to IZIN shows a HADIR badge and counts as "1 / 2 Hadir".
- **Edge case (3.9):** token T1 issued at t, T2 at t + 5 s. A scan of T1 at t + 6 s must be accepted, and a scan of T1 at t + 7.5 s must be rejected.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Scan success: exactly one HADIR record, the "Presensi Berhasil! …" message, and the same `data` fields (`attendanceId, studentName, studentNim, course, class, room, scannedAt, parentPhone`) (3.1).
- WhatsApp: same message text, sent fire-and-forget after recording, failures never fail the scan, dev simulation when `FONNTE_TOKEN` is unset or a dummy value (3.2, 3.3).
- Scan error responses: already attended (`alreadyAttended: true`, no second record or message), closed session (400), expired or unknown token (400 `EXPIRED_TOKEN`), not enrolled (403 `NOT_ENROLLED` with name, class group, class), missing fields (400), and raw QR JSON in `token` unpacked (3.4–3.8).
- The previous token is accepted until its own 7 s window ends (3.9). The mobile app reads `app`, `s`, `t`, `m` (3.10).
- Projector: 5 s rotation, smooth countdown bar, rotation counter, "Refresh Token", fullscreen, chime when sound is on, Realtime feed with 3 s polling (3.11, 3.12).
- Lecturer: open session (201 "Sesi perkuliahan berhasil dibuka" and navigation to the projector), close (sets `ended_at`, clears tokens, rejects scans), topic/room updates, session detail shape and stats, manual correction message and `attendances` payload, permission approve/reject effects (3.13–3.17).
- Student: permission submit (PENDING, same message), `/api/student/me` response shape, first-login change-password flow, minimum length message, success message (3.18–3.21).
- Admin: student and lecturer creation (default password = NIM/NIDN, `must_change_password = true`, WhatsApp normalization to `628…`, auto-enrollment by `class_group`, duplicate messages), and all CRUD operations with the same validation messages and response shapes (3.22–3.24).
- Role landing pages after login: `/admin/dashboard` and `/lecturer/dashboard` (3.25).
- Indonesian text, layout, and styling everywhere except the changes listed in bugfix.md (3.26).

**Scope:**
All interactions outside C must be unaffected. These are requests from legitimate callers with valid inputs:
- Enrolled, authenticated students scanning fresh tokens for OPEN sessions, loading their dashboard, filing valid IZIN/SAKIT permissions, changing their own password with the correct current password.
- Lecturers operating on sessions of classes they teach with valid statuses and enrolled students.
- Admins using the management pages with valid data.
- Projector behavior that does not involve the payload, rotation trigger, sound toggle, or non-HADIR records.

For comparisons with F, a legitimate request to F' is paired with the F request that identifies the same user through the body/query fields F used (`studentNim`, `nim`, `lecturerId`). Observable results compared are status code, message, response keys and values, records created, and notifications sent. Where data lives (memory vs Supabase) is not part of the comparison.

## Hypothesized Root Cause

Most causes are confirmed by reading the code. The exploratory tests will confirm them at runtime.

1. **Memory as source of truth, with silent writes** (A). Every route calls `dbStore` first and wraps `supabaseAdmin` calls in `try/catch`. supabase-js returns `{ data, error }` instead of throwing, so the `catch` never runs and `error` is never read (`api/**/route.ts`). The admin GET routes fall back to `dbStore` on errors or empty results. Permissions never call Supabase at all (`api/student/permissions/route.ts`). Admin create flows start from `authUserId = crypto.randomUUID()` and keep it when `createUser` fails.
2. **No authentication layer** (B, C, D). `@supabase/ssr` and `middleware.ts` don't exist. `login/page.tsx` only calls `router.push` based on the selected tab. Routes take identity from `studentId`, `studentNim`, `nim`, `student_id`, and `lecturerId`. `change-password` uses `listUsers()` (first page of 50 only) and returns success unconditionally.
3. **Demo shortcuts in production paths** (D, E, G, I, J). These include `INITIAL_UG_QR_TOKEN_DEMO` (store, scan route, seed, projector default), the fallback to `dbStore.students[0]` and NIM `10124001`, the hardcoded lecturer `…102` in the dashboard, `"192.168.100.58:3000"`, the dummy Supabase URL/keys, the service-role fallback to the anon key, and the hardcoded `QR_SECRET_KEY` value (also used in `.env.example`).
4. **Inconsistent token validation** (E). Expiry is set to 12 s, `isValidToken` adds 4 s of grace, the active token is accepted without an expiry check, and rotation forces `status: "OPEN"` and creates sessions for unknown IDs. The valid-token cache is a per-process `Map`.
5. **The `class_group` shortcut** (F). Both the scan route and `student/me` treat `class_name == class_group` as enrollment.
6. **Projector React issues** (G). `ts: Date.now()` is computed in render. `rotateToken()` is called inside the `setCountdown` updater, a side effect that React may call twice. The Realtime effect lists `soundEnabled` as a dependency. The feed renders a fixed HADIR badge and counts `liveAttendances.length`.
7. **Statistics formula** (H). The numerator is HADIR over all of the student's attendances, the denominator is CLOSED sessions or 1, and the result is clamped with `Math.min(…, 100)`.
8. **No enum or existence validation** (H). `PATCH`/`PUT` write `status` as given and never look up the session or enrollment.
9. **Permissive RLS** (I). Every table has `FOR SELECT USING (true)` and `FOR ALL USING (true)` with no `TO` clause, so the rules apply to `anon`. The "Service Role" policies were never needed, because the service role bypasses RLS.
10. **Mobile trust issues** (D, J). `ApiService.login` never sends the password, and `mustChangePassword` is computed as `password == nim` on the device. `submitScan` tries the QR's `h` host first, then three hardcoded hosts. The login screen falls back to a hardcoded Ahmad Fauzi.

## Correctness Properties

Property 1: Bug Condition - Verified identity, persisted data, and integrity checks

_For any_ interaction X where isBugCondition(X) returns true, the fixed system SHALL satisfy expectedBehavior(X, F'(X)), where expectedBehavior requires, by group:
- **A:** reads and writes go to Supabase. A Supabase error yields a non-2xx response with an Indonesian `error` and a server log entry. Admin creation either fully succeeds or leaves no auth account, profile, record, or enrollment behind. Results are identical across instances and restarts.
- **B:** login verifies the credentials and routes by `profiles.role`. Students get no web access. Guarded pages redirect anonymous visitors to `/login` and deny wrong roles. Admin APIs return 401/403 (except lecturer-scoped reads). Lecturer operations are limited to classes the caller teaches. The dashboard shows only the signed-in lecturer's data, with no switcher and no pre-filled credentials.
- **C:** every API except the password change returns 403 `MUST_CHANGE_PASSWORD` while the flag is set. A password change applies only to the caller, requires the correct current password, and reports success only if both the password update and the flag update succeed.
- **D:** student endpoints use only the authenticated student. Mobile login verifies the password and never falls back to a hardcoded student. Permission endpoints validate `type`/`status`, enrollment, and ownership.
- **E:** only the owning lecturer gets tokens, and only for OPEN, existing sessions. Fixed or master tokens are rejected. Every token comes from `crypto.randomBytes`, is signed with a configured secret, and is accepted only for its own session within 7 000 ms of issue. `validitySeconds` is 7.
- **F:** scanning and schedules depend only on enrollment rows.
- **G:** the QR value changes only when a new token arrives. Exactly one rotation request is made per 5 s cycle under Strict Mode. Toggling sound does not resubscribe. The feed counts and labels the real statuses. The payload has no network address.
- **H:** the rate is `round(100 × HADIR in CLOSED enrolled sessions / CLOSED enrolled sessions)`, or 0 when there are none. Invalid statuses get 400, unknown sessions 404, non-enrolled students are rejected, and nothing changes in those cases.
- **I:** `anon` can read and write nothing. Authenticated users read only rows they are entitled to and write nothing directly. Missing Supabase configuration fails with a clear error.
- **J:** the mobile app uses only the build-configured base URL and ignores `h`.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24, 2.25, 2.26, 2.27, 2.28, 2.29, 2.30, 2.31, 2.32, 2.33, 2.34, 2.35, 2.36, 2.37, 2.38, 2.39, 2.40, 2.41, 2.42, 2.43, 2.44**

Property 2: Preservation - Legitimate callers see unchanged behavior

_For any_ interaction X where isBugCondition(X) returns false (a legitimate caller with valid input), the fixed system SHALL produce the same observable result as the original system for the paired request: the same status code, message text, response keys and values, attendance/permission records created or changed, and WhatsApp notifications. This preserves scanning (including the previous-token window and raw-JSON unpacking), notifications, projector rotation and feed, lecturer session control and corrections, permissions, the student dashboard shape, the first-login password flow, admin CRUD and account creation, role landing pages, and the Indonesian UI.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19, 3.20, 3.21, 3.22, 3.23, 3.24, 3.25, 3.26**

**Formal Specification (Property 1 expected behavior, summarized):**
```
FUNCTION expectedBehavior(X, result)
  INPUT: X of type Interaction, result of F'(X)
  OUTPUT: boolean
  IF X.surface = ApiRoute AND X.caller = ANON                 THEN RETURN result.status = 401
  IF X.surface = ApiRoute AND X.caller.mustChangePassword
     AND X.route ≠ changePassword                             THEN RETURN result.status = 403 AND result.code = 'MUST_CHANGE_PASSWORD'
  IF X.surface = ApiRoute AND NOT authorizedFor(X.caller, X)  THEN RETURN result.status = 403 AND noStateChange(X)
  IF X.surface = ApiRoute AND X.state.supabaseReturnsError    THEN RETURN result.status >= 500 AND isIndonesian(result.error)
                                                                     AND serverLogged(X) AND noPartialRecords(X)
  IF X.route = POST /api/attendance/scan                      THEN RETURN acceptedOnlyIf(issuedFor(token, session)
                                                                     AND 0 <= X.now − issuedAt(token) <= 7000
                                                                     AND enrolled(X.caller.studentId, session.class_id))
                                                                     AND recordedFor(X.caller.studentId)
  IF X.route = POST /api/qr/rotate                            THEN RETURN (session = NONE ⇒ status 404 AND nothingCreated)
                                                                     AND (session.status ≠ OPEN ⇒ status 400 AND statusUnchanged)
                                                                     AND (secretUnset ⇒ status 500 AND noTokenIssued)
                                                                     AND (issued ⇒ validitySeconds = 7)
  IF isEnumInput(X) AND X.value ∉ allowedValues(X)            THEN RETURN result.status = 400 AND noStateChange(X)
  IF X.route = GET /api/student/me                            THEN RETURN result.student.id = X.caller.studentId
                                                                     AND schedules ⊆ enrolledClasses(X.caller)
                                                                     AND rate = closed = 0 ? 0 : round(100 × hadirClosed / closed)
  IF X.surface = Projector                                    THEN RETURN qrValueChangesOnlyOnNewToken AND rotationsPerCycle = 1
                                                                     AND subscriptionsCreated = 1 AND presentCount = |{a : a.status = HADIR}|
                                                                     AND payloadKeys = {app, s, t, m}
  IF X.surface = Database                                     THEN RETURN rowsVisible ⊆ entitled(X.caller) AND writesDenied
  IF X.surface = MobileApp                                    THEN RETURN requestHost = API_BASE_URL AND noHardcodedStudent
  IF X.surface = ServerConfig                                 THEN RETURN failsWithConfigError AND noDummyOrAnonFallback
END FUNCTION
```

## Fix Implementation

### Changes Required

Assuming the root cause analysis is correct, the changes are listed by layer. Paths are relative to the workspace root.

#### 1. Dependencies and tooling

**File**: `package.json`

**Specific Changes**:
1. **Runtime**: add `@supabase/ssr` and `server-only`. Raise `@supabase/supabase-js` to the installed line (2.118.x, which provides `auth.getClaims`). Pin exact versions and commit `package-lock.json`.
2. **Dev**: add `vitest`, `fast-check`, `@testing-library/react`, and `jsdom`.
3. **Scripts**: `"test": "vitest run"`, `"test:http": "vitest run --config vitest.http.config.ts"`, `"seed:demo-users": "node --env-file=.env.local scripts/seed-demo-users.mjs"`.
4. **`vitest.config.ts`**: alias `@` → `./src`, alias `server-only` → an empty stub (the real package throws outside React Server Components), `esbuild.jsx = "automatic"`, include `src/**/*.test.{ts,tsx}`, default environment `node` (component tests opt into `jsdom` per file).
5. **`vitest.http.config.ts`**: include `tests/http/**/*.test.ts`, load `.env.local` with Vite's `loadEnv`, a long `testTimeout` (the token window tests wait up to ~8 s), and `fileParallelism: false`.

`next.config.mjs` keeps `reactStrictMode: false`. The projector fix doesn't depend on it, and Strict Mode is covered by a component test.

#### 2. Configuration and Supabase clients

**File**: `src/lib/env.ts` (new)
- `getSupabasePublicConfig()` returns `{ url, anonKey }` and throws `ConfigError` naming the missing variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). It never substitutes dummy values (2.42).
- `getServiceRoleKey()` throws when `SUPABASE_SERVICE_ROLE_KEY` is unset, or when it equals the anon key.
- `getQrSecret()` throws when `QR_SECRET_KEY` is unset, shorter than 32 characters, or equal to the previously hardcoded value `ug_attendance_super_secret_dynamic_qr_key_2026`. That value is public in the repo and `.env.example`, so accepting it would recreate 1.28.
- Validation is lazy (runs on first call), so `next build` doesn't fail on import.

**File**: `src/lib/supabase.ts`
- Keep only the type exports (`UserRole`, `Profile`, `Student`, …) so existing type imports keep working. Remove the `supabase` and `supabaseAdmin` client exports and the dummy fallbacks.

**File**: `src/lib/supabase-browser.ts` (new)
- `getBrowserSupabase()` is a `createBrowserClient(url, anonKey)` singleton from `@supabase/ssr`. The session is stored in cookies, and Realtime automatically uses the user's access token, so the lecturer's RLS applies to the projector channel.

**File**: `src/lib/server/supabase-admin.ts` (new, `import "server-only"`)
- `getSupabaseAdmin()` is a lazy service-role client (`persistSession: false`, `autoRefreshToken: false`), using `getServiceRoleKey()`. It is used for all reads and writes in API routes.

**File**: `src/lib/server/supabase-server.ts` (new, `import "server-only"`)
- `createSupabaseServerClient()` builds a `createServerClient` with `cookies()` `getAll`/`setAll` from `next/headers`, for verifying cookie sessions in route handlers, following the documented `@supabase/ssr` pattern.

#### 3. Shared server helpers

**File**: `src/lib/server/http.ts` (new)
- `class HttpError(status, message, code?)`.
- `throwIfDbError(error, context, userMessage)` logs `console.error("[db]", context, { code, message, details, hint })` and throws `HttpError(500, userMessage)`. It is used after every supabase-js call (2.4).
- `isUniqueViolation(error)` checks `error?.code === "23505"`.
- `errorResponse(err, fallbackMessage)` returns `{ error, code? }` for `HttpError`. For `ConfigError` it returns 500 "Konfigurasi server belum lengkap. Hubungi administrator." and logs the variable names. For anything else it returns 500 with the route's existing Indonesian fallback (for example "Gagal menambahkan mahasiswa") and logs the details. Raw `error.message` is no longer sent to clients.
- `isUuid(value)`. Malformed IDs map to the route's 404 message instead of a Postgres cast error.

**File**: `src/lib/server/authz.ts` (new, pure, no I/O)
- `authorize(ctx | null, { roles, allowMustChangePassword }) → { ok: true } | { ok: false, status, code, message }`:
  - `null` → 401 `UNAUTHENTICATED` "Sesi login tidak valid atau telah berakhir. Silakan login kembali."
  - `mustChangePassword && !allowMustChangePassword` → 403 `MUST_CHANGE_PASSWORD` "Anda wajib mengganti password terlebih dahulu sebelum melanjutkan."
  - `role ∉ roles` → 403 `FORBIDDEN` "Anda tidak memiliki akses untuk melakukan tindakan ini."
  - LECTURER without a lecturer row → 403 "Data dosen untuk akun ini tidak ditemukan." STUDENT without a student row → 403 "Data mahasiswa untuk akun ini tidak ditemukan." (2.20).
- `teachesClass(ctx, lecturerId)` returns `ctx.role === "LECTURER" && ctx.lecturer?.id === lecturerId`.

**File**: `src/lib/server/auth.ts` (new, `import "server-only"`)
- `getAuthContext(req)`:
  1. If `Authorization: Bearer <jwt>` is present, verify it with `auth.getClaims(jwt)` on a stateless anon client, and don't fall back to cookies. Otherwise verify the cookie session with `createSupabaseServerClient().auth.getClaims()`. `getSession()` is never trusted on the server.
  2. Load `profiles(id, name, role, must_change_password)` by `claims.sub` with the service-role client. If no profile exists, return 403 "Profil akun tidak ditemukan. Hubungi Admin BAAK."
  3. Load `lecturers` or `students` by `profile_id = claims.sub` according to the role.
  4. The role always comes from `profiles.role`. `user_metadata` (set at account creation and editable by users) is never used for authorization.
- `requireAuth(req, opts)` calls `getAuthContext` and then `authorize`, and throws `HttpError` when the decision is negative.
- CSRF: cookie-authenticated mutations rely on the `SameSite=Lax` cookies set by `@supabase/ssr`. Browsers don't send these cookies on cross-site POST/PUT/PATCH/DELETE requests.

**File**: `src/lib/server/data.ts` (new, `import "server-only"`). These are Supabase-backed replacements for the `dbStore` helpers, and each one calls `throwIfDbError`:
- `getEnrichedSession(id)` → `class_sessions` with `classes(*, courses(*), lecturers(*))`, or `null`.
- `listSessions({ lecturerId? })` → for lecturers it uses `classes!inner(...)` filtered by `classes.lecturer_id`, ordered by `created_at desc`.
- `getAttendancesForSession(id)` → `attendances` with `students(*)`, ordered by `scanned_at desc`, which matches the current newest-first order.
- `getEnrolledStudents(classId)`, `isStudentEnrolled(studentId, classId)`, `getEnrolledClassIds(studentId)`.
- `setAttendanceStatus(sessionId, studentId, status)` updates the status of an existing row (keeping `scanned_at`) or inserts one with `scanned_at = now`. On a `23505` race it retries as an update. This matches the current correction semantics.
- `insertIssuedToken({ tokenHash, sessionId, issuedAt, expiresAt })`, `findIssuedToken(sessionId, tokenHash)`, `deleteTokensExpiredBefore(sessionId, iso)`, `deleteTokensForSession(sessionId)`.
- `getLecturerByProfileId`, `getStudentByProfileId`, `getProfile`.

**File**: `src/lib/server/qr-token.ts` (new, `import "server-only"`, Node `crypto`)
- `generateQrToken(secret, sessionId, issuedAtMs, saltHex = randomBytes(16).toString("hex"))` → HMAC-SHA256 hex (64 characters), the same construction as today.
- `hashToken(token)` → SHA-256 hex. Only the hash is stored, so read access to `qr_tokens` doesn't reveal usable tokens.
- `isWithinValidity(issuedAtMs, nowMs)` returns `0 <= nowMs − issuedAtMs <= QR_TOKEN_VALIDITY_MS`. This is the single expiry rule for every token, including the newest (2.26, 2.27).
- Previous-token window (3.9): each issued token has its own row and its own `issued_at`. A rotation adds a row and never invalidates earlier ones, so the previous token stays valid until 7 s after its own issue. Cleanup only deletes rows that expired more than 60 s ago.
- Clock: `issued_at` and `now` both come from the app server's clock. With several instances this assumes NTP-synced hosts, which is the norm. The alternative is to issue and check through SQL functions that use the database's `now()`. That removes the assumption but moves the expiry rule out of testable TypeScript, so it isn't chosen.

**File**: `src/lib/qr-payload.ts` (new, pure, safe to import in the browser)
- `QR_ROTATION_INTERVAL_MS = 5000`, `QR_TOKEN_VALIDITY_MS = 7000`.
- `buildQrPayload(sessionId, token, meetingNumber)` returns `JSON.stringify({ app: "UG_ATTENDANCE", s, t, m })`, which is deterministic and contains no `ts` or `h` (2.31, 2.35, 3.10).
- `parseScanInput(body)` returns `{ sessionId, token }`, unpacking a raw JSON `token` with `s`/`t` or `sessionId`/`token` keys exactly as the scan route does today (3.8).

**File**: `src/lib/attendance.ts` (new, pure)
- `ATTENDANCE_STATUSES`, `SESSION_STATUSES`, `PERMISSION_TYPES = ["IZIN","SAKIT"]`, `PERMISSION_DECISIONS = ["APPROVED","REJECTED"]`, and type guards for each (exact, case-sensitive match).
- `computeAttendanceRate(sessions, attendances)` uses the CLOSED sessions among `sessions`, which are already restricted to enrolled classes. It counts the distinct sessions in that set where the student has a HADIR record and returns `closed === 0 ? 0 : Math.round(100 × hadir / closed)`, with no clamping (2.36).
- `countPresent(attendances)` counts records with status HADIR (2.34).
- `matchesClassGroup(className, classGroup)` keeps today's case-insensitive equality for auto-enrollment at creation time (3.22).

**File**: `src/lib/utils.ts`
- Keep `normalizeWhatsAppNumber` unchanged. Extract `isValidParentPhone(normalized)` with the current rule (`startsWith("628") && length >= 10`) so it can be tested.

#### 4. Middleware and page guards

**File**: `src/lib/route-guard.ts` (new, pure, Edge-safe)
- `requiredAccess(path)` returns `"ADMIN"` for `/admin/*`, `"LECTURER"` for `/lecturer/*`, `"ANY"` for `/change-password`, and `null` otherwise.
- `decidePageAccess(profile | null, path)` returns `next`, `redirect:/login`, `redirect:/change-password`, or `redirect:/login?error=akses-ditolak`.

**File**: `src/middleware.ts` (new)
- Create a `createServerClient` over the request and response cookies and call `auth.getClaims()` on every matched request to refresh the session (the documented Next.js 14 `middleware.ts` pattern). Return the response built in `setAll`, and copy its cookies and cache headers onto any redirect.
- For guarded paths, read `profiles(role, must_change_password)` through the user-scoped client (allowed by the "own profile" RLS policy) and apply `decidePageAccess` (2.9, 2.14).
- Matcher: all paths except `_next/static`, `_next/image`, `favicon.ico`, and image files. API routes do their own authorization and never rely on the middleware.

#### 5. API routes

Every handler wraps its body in `try { … } catch (e) { return errorResponse(e, "<existing fallback message>") }`. Every `dbStore` call is replaced by a `data.ts` function or a checked query. GET handlers export `const dynamic = "force-dynamic"`. Today's argument-less `GET()` handlers could otherwise be cached statically by Next 14, which would show stale data (2.1, 2.3).

| Route | Access | Changes |
|---|---|---|
| `GET /api/admin/courses` | ADMIN | Supabase query; returns `[]` when there are no rows. |
| `GET /api/admin/students` | ADMIN | Supabase only, with no demo fallback. |
| `POST /api/admin/students` | ADMIN | (1) Validate and normalize the phone as today. (2) Duplicate NIM via `students.nim` → same 400 message. (3) `auth.admin.createUser` (password = NIM, `email_confirm`). On error, return 400/500 and write nothing. (4) Insert the profile (`must_change_password: true`). (5) Insert the student with `profile_id = authUserId`. (6) Select classes and filter with `matchesClassGroup`. (7) Batch-insert enrollments. Compensation if a step fails: delete the student row (which cascades enrollments), then `auth.admin.deleteUser(authUserId)` (which cascades the profile), then return the error. A failed compensation step is logged as `[rollback-failed]` with the IDs. Same 201 response shape (2.5, 3.22). |
| `PUT/DELETE /api/admin/students/[id]` | ADMIN | `.update(...).eq("id", id).select().maybeSingle()` / `.delete().eq("id", id).select("id")`. Unknown ID → 404 "Data mahasiswa tidak ditemukan". Same success messages. |
| `GET /api/admin/lecturers` | ADMIN (all), LECTURER (`[ownRecord]`) | Scoped read for the lecturer dashboard (2.10). |
| `POST /api/admin/lecturers` | ADMIN | Same pattern as students: duplicate NIDN (same message), createUser (password = NIDN), profile, lecturer row. On failure, delete the auth user. A unique-violation on email → 400 "Email {email} sudah digunakan oleh akun lain." (2.5, 3.23). |
| `PUT/DELETE /api/admin/lecturers/[id]` | ADMIN | Checked update/delete. 404 on unknown ID. |
| `GET /api/admin/schedules` | ADMIN (all), LECTURER (`lecturer_id = ctx.lecturer.id`) | `select("*, courses(*), lecturers(*)")`, with no fallback. |
| `POST`, `PUT/DELETE /api/admin/schedules[/id]` | ADMIN | Checked writes. The response `data` is the enriched row selected after the write. |
| `GET /api/lecturer/sessions` | LECTURER (own), ADMIN (all) | The `lecturerId` query parameter is ignored (2.11). |
| `POST /api/lecturer/sessions` | LECTURER | Look up the class (404 "Kelas tidak ditemukan") and check `teachesClass` (403 "Anda bukan dosen pengampu kelas ini."). Insert an OPEN session with `active_qr_token: null`. The first token comes from `/api/qr/rotate` (2.26). Same 201 message and data. |
| `GET /api/lecturer/sessions/[id]` | Owning LECTURER, ADMIN | Same `{ session, attendances, enrolledStudents, stats }` (3.15). 404 "Sesi tidak ditemukan". |
| `PUT /api/lecturer/sessions/[id]` | Owning LECTURER | `status` must be DRAFT, OPEN, or CLOSED, otherwise 400 "Status sesi tidak valid. Gunakan DRAFT, OPEN, atau CLOSED." CLOSED sets `ended_at`, nulls `active_qr_token`/`token_expires_at`, and calls `deleteTokensForSession` (2.40, 3.14). |
| `PATCH /api/lecturer/sessions/[id]` | Owning LECTURER | Order of checks: required fields (existing 400), status enum (400 "Status presensi tidak valid. Gunakan HADIR, IZIN, SAKIT, atau ALPA."), session exists (404 "Sesi tidak ditemukan"), ownership (403), student exists (404 "Mahasiswa tidak ditemukan"), enrolled (400 `NOT_ENROLLED` "Mahasiswa {nama} tidak terdaftar pada kelas ini."), then `setAttendanceStatus`. Same success message and `attendances` (2.37–2.39, 3.16). |
| `POST /api/qr/rotate` | Owning LECTURER | Order: auth, `getQrSecret()` (500 with the config message and a log entry, no token issued), `sessionId` required (existing 400), UUID and existence check (404 "Sesi perkuliahan tidak ditemukan.", nothing created), ownership (403), `status !== "OPEN"` → 400 "Sesi perkuliahan tidak sedang dibuka. Token QR tidak dapat diterbitkan." with no status change. Then generate the token, `insertIssuedToken` with `expiresAt = issuedAt + 7000`, and run the opportunistic cleanup `deleteTokensExpiredBefore(sessionId, now − 60 s)` (logged, not fatal). It no longer writes `class_sessions`. The response shape is unchanged with `validitySeconds: 7` and `rotationIntervalSeconds: 5` (2.22–2.28). |
| `POST /api/attendance/scan` | STUDENT | Order: auth (401/403), `parseScanInput` (missing → existing 400), UUID and existence (404), status OPEN (existing 400), token: `findIssuedToken(sessionId, hashToken(token))` and `isWithinValidity`, else the existing 400 `EXPIRED_TOKEN`. The master token is no longer special-cased. Then enrollment row (existing 403 `NOT_ENROLLED` message, with no `class_group` shortcut), existing attendance (existing `alreadyAttended` response), insert HADIR. A `23505` on insert (concurrent double scan) returns the `alreadyAttended` response without a second WhatsApp message. Then the fire-and-forget WhatsApp and the same 200 response. `studentId`/`studentNim` in the body are ignored (2.20, 2.25–2.27, 2.29, 3.1–3.9). |
| `GET /api/student/me` | STUDENT | Uses `ctx.student` and ignores `nim`. Schedules come only from enrolled class IDs. Session columns are selected explicitly without `active_qr_token`/`token_expires_at`, so tokens never reach students. `stats.attendanceRate` uses `computeAttendanceRate`. `totalCourses` and `totalPresent` (HADIR across all of the student's records) keep their current meaning, and the response shape is unchanged (2.19, 2.30, 2.36, 3.19). |
| `GET /api/student/permissions` | STUDENT (own), LECTURER (sessions of own classes via `class_sessions!inner(classes!inner(...))`) | Same joined shape (`students`, `class_sessions`) (2.21). |
| `POST /api/student/permissions` | STUDENT | Required fields `session_id`, `type`, `reason` (existing message, `student_id` no longer read). `type` must be IZIN or SAKIT (400 "Tipe pengajuan harus IZIN atau SAKIT."). Session exists (404). Enrolled (403 `NOT_ENROLLED` "Anda tidak terdaftar pada kelas untuk sesi ini."). Insert PENDING. Same 201 message (2.6, 2.21, 3.18). |
| `PATCH /api/student/permissions` | Owning LECTURER | `status` must be APPROVED or REJECTED (400 "Status persetujuan harus APPROVED atau REJECTED."). Permission exists (existing 404). Ownership through the session's class (403). Update the permission. If APPROVED, run `setAttendanceStatus(…, perm.type)`. If that fails, restore the previous permission status and return 500. Same message (2.6, 2.21, 3.17). |
| `POST /api/auth/change-password` (new) and `POST /api/student/change-password` | Any role, `allowMustChangePassword: true` | Shared handler in `src/lib/server/change-password.ts`. The student route re-exports it so the mobile path keeps working. Body: `{ currentPassword, newPassword }`, and `nim` is ignored. Checks: `newPassword.length < 6` → existing 400. Missing `currentPassword` → 400 "Password lama wajib diisi." Verify it with `signInWithPassword({ email: ctx.email, password })` on a stateless anon client, then `signOut({ scope: "local" })` on that temporary session. A wrong password → 400 `INVALID_CURRENT_PASSWORD` "Password lama tidak sesuai." Then `auth.admin.updateUserById(ctx.userId, { password })` and `profiles.update({ must_change_password: false })`. If the profile update fails, restore the old password (already verified) and return 500. Success message unchanged (2.15, 2.16, 3.21). |

#### 6. Web pages and components

**File**: `src/app/login/page.tsx`
1. Empty `identifier`/`password` on load and on every tab change. Remove the "Kredensial Default Terisi" label and the student hint's NIM. Keep the role description as "Petunjuk Login" (2.13).
2. Submitting on the "Mahasiswa" tab shows "Akun mahasiswa hanya dapat digunakan melalui Aplikasi Mobile UG Attendance." without signing in (2.8).
3. Otherwise call `getBrowserSupabase().auth.signInWithPassword`. On an invalid-credentials error show "Email atau kata sandi salah." On other errors show "Gagal terhubung ke server autentikasi. Silakan coba lagi." Then read the user's own profile. A STUDENT is signed out and shown the mobile-app message. A missing profile is signed out and shown "Profil akun tidak ditemukan. Hubungi Admin BAAK." If `must_change_password` is set, go to `/change-password`. Otherwise ADMIN → `/admin/dashboard` and LECTURER → `/lecturer/dashboard`, regardless of the tab (2.7, 3.25).
4. `?error=akses-ditolak` shows "Akun Anda tidak memiliki akses ke halaman tersebut." The submit button shows a loading state.

**File**: `src/app/change-password/page.tsx` (new, required by 2.14)
- Same card layout as the login page. Fields "Password Lama", "Password Baru", "Konfirmasi Password Baru". Calls `/api/auth/change-password`. On success it shows the server message, signs out, and redirects to `/login`, as the message instructs.

**File**: `src/app/lecturer/dashboard/page.tsx`
- Remove `selectedLecturerId`, the switcher `<select>`, and the client-side filter. `schedules` and `sessions` are already scoped, and `currentLecturer` is `lecturers[0]` from the scoped endpoint. The modal lists only the lecturer's own classes. The empty state text becomes "Tidak ada jadwal perkuliahan yang di-plotting untuk Anda." / "Hubungi Admin BAAK untuk plotting jadwal." (2.12).

**File**: `src/app/lecturer/sessions/[id]/page.tsx`
- Stop passing `initialToken`. When the detail request fails, show the API's `error` instead of rendering the "Sesi Perkuliahan Telah Ditutup" view. This is needed so that 403/404 responses don't look like a closed session.

**File**: `src/components/DynamicQRProjector.tsx`
1. **Token state**: remove the `initialToken` prop and its `INITIAL_UG_QR_TOKEN_DEMO` default. `token` starts as `null`. Until the first token arrives, and after the current token's `expiresAt` passes without a replacement, render a non-scannable placeholder "Menyiapkan token QR dari server..." or the server's error message (2.25).
2. **Stable payload**: `const qrPayload = useMemo(() => buildQrPayload(sessionId, token, meetingNumber), [sessionId, token, meetingNumber])`, rendered through a `React.memo` `QrImage` wrapper. Remove `currentHost`, `ts`, and `h` (2.31, 2.35).
3. **Rotation scheduling**: `rotate` is a `useCallback` guarded by `inFlightRef`. It clears any pending timer, fetches `/api/qr/rotate` with an `AbortController`, applies the token, sets `nextRotationAtRef = Date.now() + QR_ROTATION_INTERVAL_MS` in `finally`, and schedules exactly one `setTimeout(rotate, QR_ROTATION_INTERVAL_MS)` while mounted. The mount effect calls `rotate()`, and its cleanup clears the timer and aborts. Refs persist across Strict Mode's simulated remount, so the duplicate mount call is dropped by `inFlightRef`. "Refresh Token" calls the same `rotate`, which keeps a single timer chain (2.32, 3.11).
4. **Countdown**: a 100 ms interval calls `setCountdown(Math.max(0, (nextRotationAtRef.current − Date.now()) / 1000))`. It only computes the value and never triggers a rotation. The bar animation is unchanged.
5. **Sound**: `soundEnabledRef.current = soundEnabled` in an effect, and `playChime` reads the ref. The Realtime and polling effect depends on `[sessionId]` only (2.33).
6. **Realtime**: the channel uses `getBrowserSupabase()`, so it carries the lecturer's JWT and the attendance SELECT policy delivers the INSERT events. 3 s polling stays (3.12).
7. **Live feed**: the counter shows `countPresent(liveAttendances) / totalEnrolled Hadir`. Each row's badge shows `att.status` with the colors the session table already uses (HADIR emerald with `CheckCircle2`, IZIN amber, SAKIT blue, ALPA rose) (2.34).
8. **Header text** uses `QR_TOKEN_VALIDITY_MS / 1000` for "Toleransi Masa Berlaku 7 Detik". The rotation counter starts at 0, so the first server token shows "#1".

#### 7. Database

**File**: `supabase/migrations/<timestamp>_attendance_security_fix.sql` (new; create it with `supabase migration new attendance_security_fix` if the Supabase CLI is adopted, or name it `YYYYMMDDHHMMSS_attendance_security_fix.sql`). It is idempotent and wrapped in one transaction:

```sql
-- 1. Issued QR tokens (service role only, not in the realtime publication)
create table if not exists public.qr_tokens (
  token_hash text primary key,
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  issued_at  timestamptz not null,
  expires_at timestamptz not null check (expires_at > issued_at)
);
create index if not exists qr_tokens_session_id_expires_at_idx on public.qr_tokens (session_id, expires_at);
alter table public.qr_tokens enable row level security;            -- no policies
revoke all on public.qr_tokens from anon, authenticated;
grant select, insert, delete on public.qr_tokens to service_role;

-- 2. No usable stored tokens (removes INITIAL_UG_QR_TOKEN_DEMO)
update public.class_sessions set active_qr_token = null, token_expires_at = null
 where active_qr_token is not null or token_expires_at is not null;

-- 3. Drop the 18 permissive policies ("Public Read …" / "Service Role …")
drop policy if exists "Public Read Profiles" on public.profiles;  -- … one per policy

-- 4. Lookup helpers in a non-exposed schema
create schema if not exists private;
grant usage on schema private to authenticated;
create or replace function private.current_student_id()  returns uuid language sql stable security definer set search_path = ''
  as $$ select s.id from public.students  s where s.profile_id = (select auth.uid()) $$;
create or replace function private.current_lecturer_id() returns uuid language sql stable security definer set search_path = ''
  as $$ select l.id from public.lecturers l where l.profile_id = (select auth.uid()) $$;
create or replace function private.taught_class_ids()   returns setof uuid language sql stable security definer set search_path = ''
  as $$ select c.id from public.classes c where c.lecturer_id = (select private.current_lecturer_id()) $$;
create or replace function private.taught_session_ids() returns setof uuid language sql stable security definer set search_path = ''
  as $$ select cs.id from public.class_sessions cs join public.classes c on c.id = cs.class_id
        where c.lecturer_id = (select private.current_lecturer_id()) $$;
revoke all on function private.current_student_id(), private.current_lecturer_id(),
                       private.taught_class_ids(), private.taught_session_ids() from public, anon;
grant execute on function private.current_student_id(), private.current_lecturer_id(),
                          private.taught_class_ids(), private.taught_session_ids() to authenticated;

-- 5. Table privileges: nothing for anon, read-only for authenticated (RLS filters rows)
revoke all on public.profiles, public.lecturers, public.students, public.courses, public.classes,
              public.course_enrollments, public.class_sessions, public.attendances, public.permissions from anon;
revoke insert, update, delete, truncate on <same tables> from authenticated;
grant select on <same tables> to authenticated;

-- 6. Scoped SELECT policies (authenticated only); courses gets none (served via API)
create policy profiles_select_own        on public.profiles           for select to authenticated using (id = (select auth.uid()));
create policy lecturers_select_own       on public.lecturers          for select to authenticated using (profile_id = (select auth.uid()));
create policy students_select_own        on public.students           for select to authenticated using (profile_id = (select auth.uid()));
create policy classes_select_taught      on public.classes            for select to authenticated using (lecturer_id = (select private.current_lecturer_id()));
create policy enrollments_select_scoped  on public.course_enrollments for select to authenticated
  using (student_id = (select private.current_student_id()) or class_id in (select private.taught_class_ids()));
create policy sessions_select_taught     on public.class_sessions     for select to authenticated using (class_id in (select private.taught_class_ids()));
create policy attendances_select_scoped  on public.attendances        for select to authenticated
  using (student_id = (select private.current_student_id()) or session_id in (select private.taught_session_ids()));
create policy permissions_select_scoped  on public.permissions        for select to authenticated
  using (student_id = (select private.current_student_id()) or session_id in (select private.taught_session_ids()));

-- 7. Indexes for policy and foreign-key lookups
create index if not exists classes_lecturer_id_idx            on public.classes (lecturer_id);
create index if not exists class_sessions_class_id_idx        on public.class_sessions (class_id);
create index if not exists attendances_student_id_idx         on public.attendances (student_id);
create index if not exists course_enrollments_student_id_idx  on public.course_enrollments (student_id);
create index if not exists permissions_session_id_idx         on public.permissions (session_id);
create index if not exists permissions_student_id_idx         on public.permissions (student_id);
```

Rationale:
- Students read only their own profile, student row (including their own `parent_phone`), enrollments, attendances, and permissions. They cannot read `class_sessions` at all, so tokens can't leak through PostgREST or Realtime.
- Lecturers read their own profile and lecturer row, plus the classes, sessions, enrollments, attendances, and permissions of classes they teach. That is what the Realtime `postgres_changes` INSERT subscription on `attendances` needs (2.41, 3.12).
- The helper functions are `SECURITY DEFINER` only to avoid RLS recursion. They live in `private` (not exposed by PostgREST), check `auth.uid()` inside, and are executable only by `authenticated`.
- Policy predicates use uncorrelated `(select …)` / `in (select …)` subqueries so they run once per statement.

**File**: `supabase/schema_and_seed.sql` (explicit, documented edits)
1. Add `DROP TABLE IF EXISTS qr_tokens CASCADE;` to the reset block.
2. Remove the 18 permissive `CREATE POLICY` statements and keep `ENABLE ROW LEVEL SECURITY`. A fresh seed is then deny-all until the migration runs. A comment states the run order.
3. Seed session `…501`: `active_qr_token = NULL`, `token_expires_at = NULL` (2.25). All other seed data is unchanged.

**File**: `scripts/seed-demo-users.mjs` (new; the seed has no `profiles`/auth users and no admin)
- Uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Creates or reuses an admin (`DEMO_ADMIN_EMAIL`, default `admin@ug.ac.id`; password from the required `DEMO_ADMIN_PASSWORD`; `must_change_password = false`), one account per seed lecturer (`lecturers.email`, password = NIDN, `must_change_password = true`), and one per seed student (`{nim}@student.ug.ac.id`, password = NIM, `must_change_password = true`).
- Inserts the profiles and sets `lecturers.profile_id` / `students.profile_id`. It is idempotent (it skips linked rows and resolves existing emails by paging `listUsers`, which is acceptable in a one-off script), checks every error, and exits non-zero on failure. It prints the emails and the rule for the initial password, never the passwords themselves.

**Run order:** `schema_and_seed.sql` → migration → `npm run seed:demo-users`. The README is updated accordingly.

#### 8. Mobile app (`mobile_app/`)

**File**: `lib/config/app_config.dart` (new)
- `const apiBaseUrl = String.fromEnvironment('API_BASE_URL')`, plus `supabaseUrl` and `supabaseAnonKey` from `--dart-define`, and an `isComplete` getter.
- Run with `flutter run --dart-define-from-file=config/dev.json`. Commit `config/dev.example.json` with placeholders and add `mobile_app/config/dev.json` to `.gitignore` (2.43).

**File**: `lib/main.dart`
- When the config is incomplete, show a minimal screen "Konfigurasi aplikasi belum lengkap (API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY). Hubungi pengembang." Otherwise run `await Supabase.initialize(url, anonKey)` before `runApp`. The splash screen still goes to `LoginScreen`.

**File**: `lib/services/api_service.dart`
- `Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl, …))` with an interceptor that refreshes an expired session (`auth.refreshSession()` when `currentSession.isExpired`) and sets `Authorization: Bearer <accessToken>`. Remove `static baseUrl` and all host lists (2.17, 2.43).
- `login(nim, password)`: `signInWithPassword(email: '$nim@student.ug.ac.id', password)`. An `AuthException` returns "NIM atau password salah." Then `GET /api/student/me`: 200 returns `{ success, student, mustChangePassword: false }`. A 403 `MUST_CHANGE_PASSWORD` returns `{ success: true, mustChangePassword: true }`. A 403 for another role signs out and shows "Akun ini bukan akun mahasiswa." Network errors show "Gagal terhubung ke server kampus." The flag now comes from the server (2.14, 2.17).
- `getStudentDashboard()` without a NIM. `submitScan({ sessionId, token })` makes one POST to the configured server with no identity fields (2.44). `submitPermission(...)` without `student_id`. `changePassword({ currentPassword, newPassword })`. `logout()` calls `auth.signOut()`.

**File**: `lib/services/qr_payload.dart` (new)
- `QrPayload.parse(raw)` reads `s`/`sessionId` and `t`/`token` and ignores `h`, `host`, `ts`, and any other key. A non-JSON payload is passed through as the token with an empty session ID, so the server returns its existing 400 (3.10, 2.44).

**Screens:**
- `login_screen.dart`: no pre-filled NIM or password, no demo-credentials text, and every Ahmad Fauzi fallback removed. Errors keep the user on the login screen (2.18). When the flag is set, navigate to `ChangePasswordScreen(currentPassword: password)`. The password the student just typed is kept in memory only, so the screen layout doesn't change.
- `change_password_screen.dart`: send `currentPassword`, `newPassword`. On success, fetch `/api/student/me` and open `HomeScreen(student)` as today (3.20).
- `qr_scanner_screen.dart`: use `QrPayload.parse`. Remove the demo session/NIM/ID fallbacks. Remove the offline `NETWORK_ERROR` + `ts` branch that showed "Presensi Berhasil" without a server record. The payload no longer has `ts`, and a forged QR could trigger it.
- `permission_screen.dart`: stop sending `student_id`.
- `profile_tab.dart`: call `logout()` before returning to `LoginScreen`.
- `welcome_screen.dart`: the unused "Mulai" button builds `HomeScreen` with a hardcoded student, so point it to `LoginScreen` (2.18).

#### 9. Documentation and environment

**File**: `.env.example`
```
# Dynamic QR Code HMAC-SHA256 Secret (WAJIB, minimal 32 karakter acak)
# Buat dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
QR_SECRET_KEY=

# Akun admin demo (hanya untuk npm run seed:demo-users)
DEMO_ADMIN_EMAIL=admin@ug.ac.id
DEMO_ADMIN_PASSWORD=

# Pengujian HTTP (npm run test:http) — gunakan project Supabase dev, bukan produksi
TEST_BASE_URL=http://localhost:3000
```
The existing Supabase keys stay. A publishable key (`sb_publishable_…`) also works in `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Mobile dart-defines:** `API_BASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` (in `config/dev.example.json`).

**File**: `README.md`: replace the "Kredensial Akses Cepat" section with the run order, the demo-user script, the initial-password rule, the `QR_SECRET_KEY` requirement, and the mobile `--dart-define-from-file` command.

#### 10. Removals (last step)
- Delete `src/lib/store.ts` once a search for `dbStore` and `@/lib/store` finds nothing.
- Replace `test_api.mjs` with the `tests/http/` suite. The old script calls the open endpoints without authentication, which is the bug.

### Implementation Order

Each step leaves the web app and the mobile app runnable.

1. **Tooling and observation.** Add Vitest and fast-check. Write the exploratory HTTP and component tests and the preservation tests for `normalizeWhatsAppNumber`, and run them on F to record the counterexamples and the current messages and shapes. No behavior changes.
2. **Pure helpers and server foundations.** Add `env.ts`, the clients, `http.ts`, `authz.ts`, `auth.ts`, `data.ts`, `qr-token.ts`, `qr-payload.ts`, `attendance.ts`, and `route-guard.ts`, with their unit and property tests. Nothing calls them yet. Add `QR_SECRET_KEY` to `.env.local` now: it is currently missing, so F signs tokens with the hardcoded fallback.
3. **Database.** Apply the seed edits and the migration to the dev project, then run `seed:demo-users`. F keeps working because its data is in memory and its Supabase writes are best-effort. The projector's anonymous Realtime channel stops receiving events, and the 3 s polling keeps the feed updated until step 4.
4. **Web authentication.** Login page, `/change-password` page and API, middleware guards. Pages now require a matching role, and the existing fetches carry the cookie automatically.
5. **Admin APIs and lecturer dashboard.** Migrate the admin routes (Supabase, `requireAuth`, rollback, scoped lecturer reads) and remove the switcher in the same change.
6. **Session, QR, attendance, student, and permission APIs, together with the mobile app.** These routes share session, token, and attendance state, so they move to Supabase in one slice to avoid split reads between memory and Supabase. The mobile changes (config, Supabase login, Bearer, payload parsing) ship in the same slice because the student endpoints start requiring a Bearer token. The projector stops using `initialToken` here.
7. **Projector UI fixes** (payload, scheduler, sound, feed).
8. **Cleanup.** Delete `store.ts` and `test_api.mjs`, update `.env.example` and the README, and run grep checks for `dbStore`, `192.168.100.58`, `INITIAL_UG_QR_TOKEN_DEMO`, `dummy` Supabase fallbacks, `admin123`, `10124001` (outside seed and docs), and `ug_attendance_super_secret`.

### Behavior Differences Caused by Using Supabase

These follow from making Supabase authoritative. They are not new features:
- Deleting a lecturer now cascades to their classes, sessions, and attendances, through the existing `ON DELETE CASCADE` foreign keys. Deleting a student cascades to enrollments, attendances, and permissions. The in-memory store didn't cascade.
- `PUT`/`DELETE` on unknown IDs return 404 instead of a success message.
- Unexpected 500 responses no longer echo raw `error.message`.

### Observed Issues Outside bugfix.md (not changed by this spec)

- The web has no logout button. Navbar links to the other role ("Admin" / "Dosen") and the hardcoded projector link `/lecturer/sessions/5555…501` (also on the admin dashboard) will lead to access-denied or 403 for most users after the fix.
- The mobile home, schedule, and history tabs, and the attendance success screen, show hardcoded data instead of server data.
- Deleting a student or lecturer leaves their auth account. The account can sign in but gets 403 from every endpoint.
- The fire-and-forget WhatsApp call can be cut off on serverless hosts after the response is sent.
- `class_sessions.active_qr_token` and `token_expires_at` stay in the schema unused and can be dropped later.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach. First, surface counterexamples that demonstrate the bug on the unfixed code. Then verify that the fix works and preserves existing behavior. The tests run in four layers: pure unit and property tests (Vitest + fast-check), component tests (Vitest + jsdom + Testing Library), an HTTP contract suite against a running server and a dev Supabase project, and manual checks for the browser, the projector, and the device.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: The HTTP suite (`tests/http/exploration.test.ts`) sends attacker-style requests to a running server (`npm run dev`, started manually) using seed IDs, which exist both in F's memory and in the dev database. Assertions only require that the request is rejected (a 4xx, with no token, profile data, or record returned), so the same file also passes on F', where most of these requests are stopped at 401. The exact codes (400, 403 `NOT_ENROLLED`, `EXPIRED_TOKEN`) are asserted with authenticated fixtures in Fix Checking. The projector component tests render `DynamicQRProjector` inside `<React.StrictMode>` with fake timers, mocked `fetch`, a mocked Supabase channel, and a mocked `qrcode.react` that records the `value` prop. When the fix moves the Supabase import to `@/lib/supabase-browser`, only the mock target changes and the assertions stay the same.

**Test Cases** (all expected to fail on unfixed code):
1. **Unauthenticated access**: `POST /api/qr/rotate`, `GET /api/student/me`, `POST /api/student/change-password {nim:"10124002"}`, `GET /api/admin/students`, `GET /api/student/permissions`, `PATCH /api/lecturer/sessions/…501`. Each must return 401.
2. **Master token**: scan `…501` with `INITIAL_UG_QR_TOKEN_DEMO` and `studentNim: "10124002"`. Must be rejected.
3. **Reopen or create via rotate**: rotate the CLOSED `…502` and the unknown `00000000-0000-4000-8000-000000000000`. Neither may return a token.
4. **Window**: a token from rotate, scanned after 8 s with `studentNim: "10124001"`, must be rejected. On F it is accepted, because the window is about 16 s.
5. **Enum**: `PATCH {studentId:"…401", status:"BOLOS"}` and `PUT {status:"ARCHIVED"}` on `…501` must be rejected.
6. **Enrollment**: open a session for class `…305`, rotate, and scan with `studentNim: "10124002"` (Nadya, 2KA01, not enrolled in `…305`). Must be rejected.

Cases that mutate state (5, and 3 on F) run last or on a session the test opens itself. On F the changes live in memory, so restarting the dev server resets them.
7. **Projector** (component): the QR `value` must be identical across 100 ms ticks; over 30 s exactly 1 + 6 rotation requests; one `channel()` call after toggling sound twice; the counter reads "1 / 2 Hadir" for HADIR + IZIN; the payload has no `ts`/`h`.
8. **Edge (may pass on F)**: the previous token scanned 1 s after rotation is accepted.

**Expected Counterexamples**:
- 200 responses with tokens, profile data (including `parent_phone`), and password changes for anonymous callers. Attendance recorded for the student named in the body.
- CLOSED sessions reopened, and sessions created for unknown IDs. Tokens accepted after 7 s.
- QR value changing on every tick, about 12 rotations per 30 s under Strict Mode, two subscriptions after a sound toggle, IZIN counted as present.
- Possible causes, matching root causes 1–8: memory store, no auth layer, demo shortcuts, inconsistent windows, React side effects.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  result := F'(X)
  ASSERT expectedBehavior(X, result)
END FOR
```

`tests/http/fix-checking.test.ts` runs against F' with fresh fixtures created through the service role in `beforeAll`: lecturers LA (teaches class X) and LB (teaches class Y); students S1 (enrolled in X), S2 (`class_group` = X's name, not enrolled), and S3 (enrolled in X, `must_change_password = true`), all with unique suffixes. Each signs in through the anon client to get a Bearer token, and `afterAll` removes all fixtures. It covers role and ownership matrices (S1 on admin/lecturer routes, LB on LA's session, rotate, correction, and permissions), identity spoofing (S1 sends S2's `studentId`, and the record is S1's), `MUST_CHANGE_PASSWORD` for S3 on every route except the password change, password change with a wrong or missing current password, the token window at 6.5 s (accepted) and 7.5 s (rejected), a token from another session (rejected), rotate on DRAFT/CLOSED/unknown sessions with the status checked unchanged through the service role, enum and existence errors with no DB change, S2's scan → `NOT_ENROLLED`, the rate computed for a fixture with OPEN and CLOSED sessions, and RLS checks (below).

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT observe(F(pair(X))) = observe(F'(X))
END FOR
```
`observe` keeps the status code, message, response keys and values, records written, and notifications. `pair` maps the Bearer identity to the body/query identity that F used.

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for legitimate requests (step 1 of the implementation order). Record the exact messages and response keys in `tests/http/observed-f.json` (scan success and its error messages, the `alreadyAttended` shape, the open-session 201, the session detail keys and stats, the correction message, permission messages, the `student/me` keys, admin CRUD messages and shapes, the change-password messages). Then assert those against F' with the fixtures. The pure helpers that exist on F (`normalizeWhatsAppNumber`, the phone rule) get property tests that pass on F and must still pass on F'.

**Test Cases**:
1. **Scan happy path**: on unfixed code, a fresh token scan by an enrolled student returns the success message and the 8 data fields. Verify on F' that exactly one HADIR row exists and a WhatsApp send was logged (dev simulation) (3.1–3.3).
2. **Scan error messages**: the already-attended, closed, expired, not-enrolled, and missing-field responses keep the same text, codes, and statuses. Raw JSON in `token` is still unpacked (3.4–3.8).
3. **Boundary scan**: scanning the previous token 1 s after rotation is accepted (3.9).
4. **Lecturer flows**: open → 201 with the same message; close → `ended_at` set and later scans rejected; topic/room update; detail stats; correction message; approve → attendance IZIN/SAKIT; reject → REJECTED (3.13–3.17).
5. **Student flows**: permission submit → PENDING with the same message; the `student/me` key set is unchanged; change password (minimum length message, success message, flag cleared) (3.18–3.21).
6. **Admin flows**: create a student (auth info in the response, phone normalized, enrollments created, duplicate NIM message), create a lecturer (duplicate NIDN message), schedule CRUD messages (3.22–3.24).

### Unit Tests

- `authorize` decision table and `teachesClass`. `decidePageAccess` for every path prefix × role × flag.
- `isWithinValidity` at −1, 0, 7000, and 7001 ms. `generateQrToken` format and determinism. `getQrSecret` rejects missing, short, and old-default secrets.
- `parseScanInput` with `s`/`t`, `sessionId`/`token`, malformed JSON, and missing fields. `buildQrPayload` key set.
- `computeAttendanceRate` with no CLOSED sessions → 0, the seed-like example → 0% (bugfix.md example), and OPEN sessions ignored.
- Enum guards (including lowercase and whitespace variants, which are rejected). `countPresent`. `matchesClassGroup`. `isValidParentPhone`.
- `env.ts` throws `ConfigError` naming the missing variables and rejects a service role key equal to the anon key.
- Mobile (`flutter test`): `QrPayload.parse` ignores `h`/`host`/`ts` and keeps `s`/`t`.

### Property-Based Tests

fast-check, 200+ runs for pure functions:
- **Token window**: for any `issuedAt` and `delta ∈ [−20 000, 30 000]`, `isWithinValidity` holds iff `0 ≤ delta ≤ 7000`. Rolling model: for any rotation schedule (5 s ± 500 ms jitter) and any scan time t, the accepted tokens are exactly those issued in `[t − 7000, t]`, so the previous token is accepted at the boundary (2.27, 3.9).
- **Token generation**: for any session ID and distinct salts, tokens are distinct 64-character lowercase hex. The same inputs give the same token (2.26).
- **Attendance rate**: for random sessions (DRAFT/OPEN/CLOSED) and attendances (unique per session, random status), the rate equals the formula, stays in `[0, 100]`, and doesn't change when OPEN sessions or their attendances are added (2.36).
- **Enum guards**: for any string, a guard accepts it iff it is in the allowed set (2.21, 2.37, 2.40).
- **Authorization**: for any `ctx` (null or any role/flag/linked-record combination) and options, `authorize` gives 401 iff ctx is null, then `MUST_CHANGE_PASSWORD`, then `FORBIDDEN`, otherwise ok (2.10, 2.11, 2.14, 2.19, 2.20, 2.22).
- **Payload**: for any session ID, token, and meeting number, `buildQrPayload` is deterministic, has keys exactly `{app, s, t, m}`, and round-trips through `parseScanInput` and `QrPayload.parse` (2.31, 2.35, 3.8, 3.10).
- **Live feed**: for any list of records, `countPresent` equals the number of HADIR records and is never more than the list length (2.34).
- **Phone normalization (preservation)**: for any 9–12 digit local number n starting with 8, the variants `0n`, `+62n`, `62n`, `n`, and versions with spaces or dashes all normalize to `62n`. The function is idempotent and outputs digits only (3.22).
- **HTTP, few runs (about 20)**: random non-enum strings on `PATCH`/`PUT`/permission `PATCH` → 400 with the row unchanged. Random role × admin endpoint → 401/403 (2.10, 2.37, 2.40).

### Integration Tests

- **HTTP suite on F'** (`npm run test:http` with `npm run dev` running manually and a dev Supabase project): the full scan flow (rotate as LA → scan as S1 → detail shows HADIR → second scan `alreadyAttended`), the close flow, the permission flow, admin create with rollback (force a failure by inserting a student whose NIM already exists in the auth users but not in `students`, then check that no profile or student row remains), and the restart check (rotate, restart the dev server, scan the still-valid token → accepted, 2.3).
- **RLS**: with the anon key and no session, selects on every table return no rows or a permission error, and any insert, update, or delete fails. As S1: only S1's own student row (no other `parent_phone`), own attendances and permissions, no `class_sessions`, no `qr_tokens`. As LA: the classes, sessions, enrollments, attendances, and permissions of class X only, and nothing from Y. Every direct write fails (2.41).
- **Realtime**: as LA, subscribe to `attendances` INSERT for the fixture session, scan as S1, and expect the event within 5 s. As LB, the same subscription receives nothing (2.41, 3.12).
- **Static checks**: `npx tsc --noEmit`, `npm run lint`, `npm run build`, and the grep list in step 8 of the implementation order.

**Manual checks** (browser and device):
- Web: wrong password message; Mahasiswa tab message; admin and lecturer landing pages; a new lecturer forced to `/change-password`; direct URL visits while signed out or with the wrong role; no pre-filled fields; no lecturer switcher; the banner shows only the lecturer's own OPEN session.
- Projector: the QR stays visually stable between rotations; the countdown is smooth; "Refresh Token", fullscreen, and the chime with sound on and off; the live feed updates within a second of a scan (Realtime) and keeps updating with Realtime blocked (polling); IZIN/SAKIT badges after a manual correction. Temporarily set `reactStrictMode: true` and confirm one `/api/qr/rotate` request per 5 s in the Network tab.
- Mobile on a device: missing dart-defines show the configuration screen; wrong password stays on the login screen; with the server stopped, the error shows and there is no demo login; first login → change password → home; scanning the projector works; a hand-made QR with `"h":"evil.example"` still posts only to `API_BASE_URL` (check the server log or a proxy); logout returns to the login screen.
