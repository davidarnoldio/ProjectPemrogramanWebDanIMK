# Implementation Plan

Conventions used in this plan:

- `npm test` runs `vitest run` once (unit, property, and component tests). Never run Vitest in watch mode.
- `npm run test:http` runs the HTTP suite once. It **requires a running dev server**, which the user starts manually with `npm run dev` in a separate terminal. It also needs a **dev Supabase project** configured in `.env.local` (never production).
- **[MANUAL]** marks checks a person has to perform (browser, Supabase dashboard, Flutter on a device).
- Seed IDs used below: session 501 = `55555555-5555-5555-5555-555555555501` (OPEN, class 302, lecturer `11111111-…-111111111102`), session 502 = `55555555-5555-5555-5555-555555555502` (CLOSED, class 301), class 305 = `33333333-3333-3333-3333-333333333305` (2KA01, lecturer `…105`). Students: Ahmad Fauzi `44444444-4444-4444-4444-444444444401` / NIM `10124001` and Nadya `…402` / `10124002` (both 2KA01, both enrolled in 301 and 302, only Ahmad enrolled in 305), Rizky `…403` / `10124003` (2KA02, no enrollments).
- Tasks 1–2 are design step 1. Tasks 3–9 follow design steps 2–8 in order. The web and mobile apps stay runnable after each parent task. The sub-tasks of task 7 ship together.

- [-] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Verified identity, persisted data, and integrity checks
  - **CRITICAL**: These tests MUST FAIL on unfixed code. Failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: The tests encode the expected behavior. They validate the fix when they pass after implementation (task 10.3)
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: The bugs are deterministic, so each property is scoped to concrete failing cases: seed IDs for the HTTP cases and a fixed fake-timer schedule for the projector
  - Setup first (test tooling only, no app behavior change):
    - Add dev dependencies with exact versions: `vitest`, `fast-check`, `@testing-library/react`, `jsdom`
    - Create `vitest.config.ts`: alias `@` → `./src`, alias `server-only` → an empty stub `tests/stubs/server-only.ts` (the real package throws outside React Server Components), `esbuild.jsx = "automatic"`, include `src/**/*.test.{ts,tsx}`, default environment `node` (component tests opt into jsdom with `// @vitest-environment jsdom`)
    - Create `vitest.http.config.ts`: include `tests/http/**/*.test.ts`, load `.env.local` with Vite's `loadEnv` (all prefixes), `testTimeout` of at least 60 000 ms (window cases wait about 8 s), `fileParallelism: false`
    - Add npm scripts `"test": "vitest run"` and `"test:http": "vitest run --config vitest.http.config.ts"` (`seed:demo-users` is added in 4.3)
    - Create `tests/http/helpers.ts` with `TEST_BASE_URL` (default `http://localhost:3000`), a JSON fetch helper, and the seed IDs
  - HTTP exploration `tests/http/exploration.test.ts` (**requires `npm run dev` started manually**). The seed IDs exist in F's memory and in the dev database. Assertions only require that each request is rejected, so the same file also passes on F', where most requests stop at 401:
    - Unauthenticated access (C_B, C_C, C_D, C_E): `POST /api/qr/rotate {sessionId: 501}`, `GET /api/student/me`, `POST /api/student/change-password {nim: "10124002", newPassword: "hacked1"}`, `GET /api/admin/students`, `GET /api/student/permissions`, `PATCH /api/lecturer/sessions/501 {studentId: Ahmad, status: "HADIR"}`. Each must return 401 with no token, no profile data (`parent_phone`), and no success message
    - Master token and impersonation (1.20, 1.25): scan 501 with `token: "INITIAL_UG_QR_TOKEN_DEMO"` and `studentNim: "10124002"` → 4xx and no `data.attendanceId`
    - Window (1.27): rotate 501, wait 8 s, scan with `studentNim: "10124001"` → rejected
    - Enrollment shortcut (1.29): open a session for class 305 with the body fields F reads, rotate it, scan with `studentNim: "10124002"` (Nadya, 2KA01, not enrolled in 305) → rejected. If opening the session is already rejected (as on F'), the case passes
    - Reopen or create via rotate (1.23, 1.24): rotate CLOSED 502 and unknown `00000000-0000-4000-8000-000000000000` → no `token` in either response
    - Enum (1.37, 1.40): `PATCH /api/lecturer/sessions/501 {studentId: Ahmad, status: "BOLOS"}` and `PUT /api/lecturer/sessions/501 {status: "ARCHIVED"}` → rejected
    - Run order: read-only and token cases first. Cases that mutate F's memory (the unauthenticated PATCH, rotate on 502, the enum cases) run last. Restart the dev server afterwards to reset F's memory
  - Component exploration `src/components/DynamicQRProjector.exploration.test.tsx` (jsdom, rendered inside `<React.StrictMode>`, fake timers, mocked `fetch`, mocked `@/lib/supabase` channel, mocked `next/image`, mocked `qrcode.react` that records every `value` prop) (1.31–1.35):
    - The QR `value` is identical across 100 ms ticks while no new token arrives
    - Over 30 s there are exactly 1 + 6 `/api/qr/rotate` requests
    - `channel()` is called once after toggling sound twice
    - With one HADIR and one IZIN record in the polling response and `totalEnrolled = 2`, the counter reads "1 / 2 Hadir" and the IZIN row shows an IZIN badge
    - The parsed payload has exactly the keys `{app, s, t, m}` (no `ts`, no `h`)
  - Run `npm test -- src/components/DynamicQRProjector.exploration.test.tsx` and `npm run test:http -- tests/http/exploration.test.ts` on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct, it proves the bugs exist)
  - Document the counterexamples in the task notes, for example "rotate without a cookie returns 200 with a token", "`GET /api/student/me` returns `parent_phone: 6281299990001`", "502 becomes OPEN after rotate", "token accepted after 8 s", "about 12 rotations per 30 s under Strict Mode", "IZIN counted as Hadir"
  - For findings that have no runtime harness on F, record code-level counterexamples by searching the source: pre-filled credentials and tab-based routing in `src/app/login/page.tsx` (1.7, 1.8, 1.13), the switcher in `src/app/lecturer/dashboard/page.tsx` (1.12), `192.168.100.58`, `10.0.2.2`, the `h` host, and the Ahmad Fauzi fallback in `mobile_app/lib` (1.17, 1.18, 1.43, 1.44), dummy Supabase values and the anon-key fallback in `src/lib/supabase.ts` (1.42), the hardcoded QR secret (1.28), `class_group` matching (1.29, 1.30), and the rate formula in `src/app/api/student/me/route.ts` (1.36)
  - Mark the task complete when the tests are written, run, and the failures are documented
  - _Requirements: 1.10, 1.11, 1.15, 1.19, 1.20, 1.21, 1.22, 1.23, 1.24, 1.25, 1.27, 1.29, 1.31, 1.32, 1.33, 1.34, 1.35, 1.37, 1.40 (expected behavior: 2.10, 2.11, 2.15, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24, 2.25, 2.27, 2.29, 2.31, 2.32, 2.33, 2.34, 2.35, 2.37, 2.40)_

- [~] 2. Write preservation property tests (BEFORE implementing the fix)
  - **Property 2: Preservation** - Legitimate callers see unchanged behavior
  - **IMPORTANT**: Follow observation-first methodology. Run F with non-buggy inputs (¬C(X): legitimate callers with valid input), record the actual outputs, then write tests that assert them
  - Pure helper `src/lib/utils.test.ts` (fast-check, at least 200 runs):
    - Observe on F: `normalizeWhatsAppNumber("081234567890")`, `("+62 812-3456-7890")`, and `("81234567890")` all return `"6281234567890"`
    - Property: for any 9–12 digit local number n starting with 8, the inputs `0n`, `+62n`, `62n`, `n`, and variants with spaces or dashes all normalize to `62n`. Normalizing twice gives the same result. The output contains only digits (3.22)
  - Projector `src/components/DynamicQRProjector.preservation.test.tsx` (jsdom, **no** Strict Mode, fake timers, same mocks as task 1). Assert only behavior outside the bug condition, measured after the first server token is shown:
    - Consecutive `/api/qr/rotate` requests are 5 000 ms apart (± 150 ms) (3.11)
    - The countdown bar width decreases within a cycle and resets after each new token. The rotation counter increases by 1 per token received (assert the increment, not the absolute number) (3.11)
    - "Refresh Token" sends one rotate request immediately and shows the new token (3.11)
    - The fullscreen button calls the fullscreen API (observe which call F makes) (3.11)
    - A new attendance delivered through the Realtime callback plays the chime when sound is on, and does not after sound is turned off (3.11)
    - The channel subscribes to `postgres_changes` INSERT on `attendances` for the session, and the session detail is polled every 3 000 ms (3.12)
  - HTTP observation `tests/http/observe-f.test.ts` (**requires `npm run dev` started manually**; runs only when `OBSERVE_F=1`, skipped otherwise). It uses seed data and the body/query identity fields F reads (`studentNim`, `nim`, `student_id`, `lecturerId`). For each case it writes the status, message, `code`, and sorted response keys to `tests/http/observed-f.json`, replacing names, IDs, and timestamps with placeholders such as `{nama}` and `{status}`:
    - Scan: a fresh token for 501 as Ahmad → success message and the 8 `data` keys; a second scan → `alreadyAttended: true`; CLOSED 502 → 400 message; unknown token → 400 `EXPIRED_TOKEN`; Rizky (not enrolled) → 403 `NOT_ENROLLED` message; missing fields → 400 message; raw QR JSON in `token` (`s`/`t` and `sessionId`/`token`) is unpacked (3.1, 3.4–3.8)
    - Lecturer: open session → 201 message and `data` keys; session detail keys and `stats` keys; correction message; close → `ended_at` set and a later scan rejected (3.13–3.16)
    - Permissions: submit → 201 message and PENDING; approve → attendance becomes IZIN/SAKIT; reject → REJECTED (3.17, 3.18)
    - `GET /api/student/me?nim=10124001` → key set of the response and of `stats` (3.19)
    - Change password: a new password shorter than 6 characters → message (3.21). Do not call it with a valid password; take the success message text from the source
    - Admin: create a student with a unique NIM → 201 keys including auth info, phone normalized to `628…`, enrollments created; duplicate NIM message; create a lecturer with a unique NIDN; duplicate NIDN message; schedule create/update/delete messages (3.22–3.24). F also writes these to Supabase, so `afterAll` deletes the created auth users and rows through the service role
    - [MANUAL] Note the WhatsApp simulation log line that F prints in the `npm run dev` terminal for the successful scan, and that the repeated scan prints none (3.2–3.4)
    - Restart the dev server after the run to reset F's memory
  - HTTP preservation `tests/http/preservation.test.ts` and fixtures helper `tests/http/fixtures.ts`:
    - `fixtures.ts` creates, through the service role, lecturers LA (teaches class X) and LB (teaches class Y) and students S1 (enrolled in X), S2 (`class_group` = X's name, not enrolled), and S3 (enrolled in X, `must_change_password = true`), each with a unique suffix. It signs each one in through the anon client to get a Bearer token, and removes everything in `afterAll`
    - `preservation.test.ts` repeats the observation cases as LA/S1 with Bearer tokens and asserts that the status, message template, `code`, and key sets equal `observed-f.json`. It also asserts the boundary case: the previous token, scanned 1 s after a rotation, is accepted (3.9)
    - This file can only run on F', because F ignores Bearer tokens and cannot see Supabase fixtures. It is executed in 10.4. On F, the observation run is the baseline
  - Run `npm test -- src/lib/utils.test.ts src/components/DynamicQRProjector.preservation.test.tsx` and `set "OBSERVE_F=1" && npm run test:http -- tests/http/observe-f.test.ts` on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms the baseline behavior to preserve) and `tests/http/observed-f.json` is written
  - Mark the task complete when the tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19, 3.21, 3.22, 3.23, 3.24_

- [ ] 3. Fix: server foundations (design step 2; nothing calls these modules yet, app behavior unchanged)

  - [~] 3.1 Add the runtime dependencies
    - Add `@supabase/ssr` and `server-only`. Raise `@supabase/supabase-js` to the 2.118.x line, which provides `auth.getClaims`. Pin exact versions and commit `package-lock.json`
    - Run `npx tsc --noEmit` and `npm run build` to confirm F still builds with the upgraded client
    - _Bug_Condition: isBugCondition(X) where C_B/C_D hold because no session verification layer exists (prerequisite)_
    - _Expected_Behavior: enables the verified-identity branches of expectedBehavior_
    - _Preservation: no behavior change; F's routes keep working with the upgraded client_
    - _Requirements: 2.7, 2.9, 2.17_

  - [~] 3.2 Add the config module and the Supabase clients
    - `src/lib/env.ts`: `ConfigError`; `getSupabasePublicConfig()` returns `{ url, anonKey }` and throws a `ConfigError` naming the missing `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, never substituting dummy values; `getServiceRoleKey()` throws when `SUPABASE_SERVICE_ROLE_KEY` is unset or equals the anon key; `getQrSecret()` throws when `QR_SECRET_KEY` is unset, shorter than 32 characters, or equal to `ug_attendance_super_secret_dynamic_qr_key_2026`
    - Validation is lazy (on first call) so `next build` does not fail on import. Read `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` with literal property access, because Next.js only inlines literal references into the browser bundle
    - `src/lib/supabase-browser.ts`: `getBrowserSupabase()`, a `createBrowserClient(url, anonKey)` singleton with a cookie session
    - `src/lib/server/supabase-admin.ts` (`import "server-only"`): lazy `getSupabaseAdmin()` with `persistSession: false`, `autoRefreshToken: false`, and the key from `getServiceRoleKey()`
    - `src/lib/server/supabase-server.ts` (`import "server-only"`): `createSupabaseServerClient()` using `createServerClient` with `cookies()` `getAll`/`setAll` from `next/headers`
    - Keep the existing `supabase`/`supabaseAdmin` exports in `src/lib/supabase.ts` until 9.1 so F's routes keep working
    - `src/lib/env.test.ts`: each missing variable is named in the `ConfigError`; a service role key equal to the anon key is rejected; a missing, 31-character, or old-default QR secret is rejected; a 64-character hex secret is accepted
    - Add `QR_SECRET_KEY` to `.env.local`, generated with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. `.env.local` is gitignored; never commit or print the value
    - _Bug_Condition: isBugCondition(X) where C_I(X): ServerConfig with a Supabase variable unset (1.42), or C_E(X): `QR_SECRET_KEY` unset (1.28)_
    - _Expected_Behavior: failsWithConfigError AND noDummyOrAnonFallback; secretUnset ⇒ no token issued_
    - _Preservation: lazy validation keeps `next build` and the existing pages working_
    - _Requirements: 2.28, 2.42_

  - [~] 3.3 Add the shared HTTP helpers
    - `src/lib/server/http.ts`: `HttpError(status, message, code?)`; `throwIfDbError(error, context, userMessage)` logs `console.error("[db]", context, { code, message, details, hint })` and throws `HttpError(500, userMessage)`; `isUniqueViolation(error)` checks `code === "23505"`; `isUuid(value)`
    - `errorResponse(err, fallbackMessage)`: `HttpError` → `{ error, code? }` with its status; `ConfigError` → 500 "Konfigurasi server belum lengkap. Hubungi administrator." and a log of the variable names; anything else → 500 with the route's existing Indonesian fallback and a log entry. Raw `error.message` is never sent to clients
    - `src/lib/server/http.test.ts`: each branch of `errorResponse`, `throwIfDbError` with and without an error, `isUuid` on valid, malformed, and empty input
    - _Bug_Condition: isBugCondition(X) where C_A(X) with `supabaseReturnsError` (1.4)_
    - _Expected_Behavior: status ≥ 500 AND isIndonesian(result.error) AND serverLogged(X)_
    - _Preservation: each route keeps its existing fallback message_
    - _Requirements: 2.4_

  - [~] 3.4 Add the pure authorization decision function
    - `src/lib/server/authz.ts` (no I/O): `authorize(ctx | null, { roles, allowMustChangePassword })` returns `{ ok: true }` or `{ ok: false, status, code, message }`, checked in this order:
      - `null` → 401 `UNAUTHENTICATED` "Sesi login tidak valid atau telah berakhir. Silakan login kembali."
      - flag set and not allowed → 403 `MUST_CHANGE_PASSWORD` "Anda wajib mengganti password terlebih dahulu sebelum melanjutkan."
      - role not in `roles` → 403 `FORBIDDEN` "Anda tidak memiliki akses untuk melakukan tindakan ini."
      - LECTURER without a lecturer row → 403 "Data dosen untuk akun ini tidak ditemukan."; STUDENT without a student row → 403 "Data mahasiswa untuk akun ini tidak ditemukan."
    - `teachesClass(ctx, lecturerId)` returns `ctx.role === "LECTURER" && ctx.lecturer?.id === lecturerId`
    - `src/lib/server/authz.test.ts`: the decision table, plus a fast-check property (at least 200 runs): for any ctx (null, or any role, flag, and linked-record combination) and any options, the result is 401 iff ctx is null, then `MUST_CHANGE_PASSWORD`, then `FORBIDDEN`, then the missing-record 403, otherwise ok. `teachesClass` is true only for the matching lecturer
    - _Bug_Condition: isBugCondition(X) where C_B, C_C (1.14), C_D (1.19, 1.20), or C_E (1.22) hold because the caller is never verified_
    - _Expected_Behavior: ANON ⇒ 401; mustChangePassword ⇒ 403 MUST_CHANGE_PASSWORD; NOT authorizedFor ⇒ 403 AND noStateChange_
    - _Preservation: legitimate callers (matching role, flag false, linked record present) get `ok`_
    - _Requirements: 2.10, 2.11, 2.14, 2.19, 2.20, 2.22_

  - [~] 3.5 Add the Supabase-backed data module
    - `src/lib/server/data.ts` (`import "server-only"`) with one-for-one replacements for the `dbStore` helpers. Every supabase-js call is followed by `throwIfDbError`:
      - `getEnrichedSession(id)` (`class_sessions` with `classes(*, courses(*), lecturers(*))`, or `null`); `listSessions({ lecturerId? })` (`classes!inner(...)` filtered by `classes.lecturer_id`, ordered by `created_at desc`); `getAttendancesForSession(id)` (with `students(*)`, ordered by `scanned_at desc`)
      - `getEnrolledStudents(classId)`, `isStudentEnrolled(studentId, classId)`, `getEnrolledClassIds(studentId)`
      - `setAttendanceStatus(sessionId, studentId, status)`: update the existing row and keep `scanned_at`, or insert one with `scanned_at = now`; on a `23505` race, retry as an update
      - `insertIssuedToken({ tokenHash, sessionId, issuedAt, expiresAt })`, `findIssuedToken(sessionId, tokenHash)`, `deleteTokensExpiredBefore(sessionId, iso)`, `deleteTokensForSession(sessionId)` (the table is created in 4.1)
      - `getProfile`, `getLecturerByProfileId`, `getStudentByProfileId`
    - `dbStore` stays in place until 9.1. The module is verified against the dev database by the HTTP suites (10.1, 10.4)
    - _Bug_Condition: isBugCondition(X) where C_A(X): memory as source of truth and unchecked errors (1.1–1.4, 1.6)_
    - _Expected_Behavior: reads and writes go to Supabase; errors ⇒ ≥ 500 with a log entry; results identical across instances and restarts_
    - _Preservation: newest-first attendance order and correction semantics (3.15, 3.16)_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [~] 3.6 Add the shared auth helper
    - `src/lib/server/auth.ts` (`import "server-only"`), `getAuthContext(req)`:
      - With `Authorization: Bearer <jwt>`, verify it with `auth.getClaims(jwt)` on a stateless anon client and do not fall back to cookies. Otherwise verify the cookie session with `createSupabaseServerClient().auth.getClaims()`. Never trust `getSession()` on the server
      - Load the profile by `claims.sub` through the service role. No profile → 403 "Profil akun tidak ditemukan. Hubungi Admin BAAK." Load the lecturer or student row by `profile_id` according to the role
      - Take the role only from `profiles.role`, never from `user_metadata`
      - Return the `AuthContext` `{ userId, email, name, role, mustChangePassword, lecturer, student }`
    - `requireAuth(req, opts)` calls `getAuthContext` and `authorize`, and throws an `HttpError` when the decision is negative
    - Verified end to end by the HTTP fix-checking suite (10.1)
    - _Bug_Condition: isBugCondition(X) where C_B, C_C, or C_D hold because identity comes from the body or query_
    - _Expected_Behavior: one verified identity per request; ANON ⇒ 401_
    - _Preservation: web cookie sessions and mobile Bearer tokens resolve to the same AuthContext shape_
    - _Requirements: 2.10, 2.11, 2.14, 2.17, 2.19, 2.20, 2.22_

  - [~] 3.7 Add the QR payload and token helpers
    - `src/lib/qr-payload.ts` (pure, browser-safe): `QR_ROTATION_INTERVAL_MS = 5000`, `QR_TOKEN_VALIDITY_MS = 7000`; `buildQrPayload(sessionId, token, meetingNumber)` returns `JSON.stringify({ app: "UG_ATTENDANCE", s, t, m })`; `parseScanInput(body)` returns `{ sessionId, token }` and unpacks a raw JSON `token` with `s`/`t` or `sessionId`/`token` keys exactly as the current scan route does
    - `src/lib/server/qr-token.ts` (`import "server-only"`, Node `crypto`): `generateQrToken(secret, sessionId, issuedAtMs, saltHex = randomBytes(16).toString("hex"))` (HMAC-SHA256 hex, same construction as today); `hashToken(token)` (SHA-256 hex); `isWithinValidity(issuedAtMs, nowMs)` returns `0 <= nowMs − issuedAtMs <= QR_TOKEN_VALIDITY_MS`
    - `src/lib/qr-payload.test.ts`: `parseScanInput` with `s`/`t`, `sessionId`/`token`, malformed JSON, and missing fields. Property: for any session ID, token, and meeting number, `buildQrPayload` is deterministic, has exactly the keys `{app, s, t, m}`, and round-trips through `parseScanInput`
    - `src/lib/server/qr-token.test.ts`: `isWithinValidity` at −1, 0, 7000, and 7001 ms. Property: for any `issuedAt` and delta in [−20 000, 30 000], the token is valid iff 0 ≤ delta ≤ 7000. Rolling-model property: for any rotation schedule (5 s ± 500 ms jitter) and scan time t, the accepted tokens are exactly those issued in [t − 7000, t], so the previous token is accepted at the boundary. Property: distinct salts give distinct 64-character lowercase hex tokens, and the same inputs give the same token
    - _Bug_Condition: isBugCondition(X) where C_E(X) (1.25–1.27) or C_G(X): buildPayload (1.31, 1.35)_
    - _Expected_Behavior: acceptedOnlyIf 0 ≤ now − issuedAt ≤ 7000; payloadKeys = {app, s, t, m}; tokens from cryptographic randomness_
    - _Preservation: raw-JSON unpacking (3.8), previous-token window (3.9), payload fields read by the mobile app (3.10)_
    - _Requirements: 2.25, 2.26, 2.27, 2.31, 2.35, 3.8, 3.9, 3.10_

  - [~] 3.8 Add the attendance helpers and extract the phone rule
    - `src/lib/attendance.ts` (pure): `ATTENDANCE_STATUSES`, `SESSION_STATUSES`, `PERMISSION_TYPES = ["IZIN","SAKIT"]`, `PERMISSION_DECISIONS = ["APPROVED","REJECTED"]`, with exact, case-sensitive type guards; `computeAttendanceRate(sessions, attendances)` (distinct CLOSED sessions with a HADIR record divided by CLOSED sessions, `closed === 0 ? 0 : Math.round(100 × hadir / closed)`, no clamping); `countPresent(attendances)`; `matchesClassGroup(className, classGroup)` (today's case-insensitive equality, used only for auto-enrollment at creation)
    - `src/lib/utils.ts`: add `isValidParentPhone(normalized)` with the current rule (`startsWith("628") && length >= 10`). `normalizeWhatsAppNumber` stays unchanged
    - `src/lib/attendance.test.ts`: no CLOSED sessions → 0; the bugfix example (ALPA in CLOSED 502, HADIR in OPEN 501) → 0. Property (at least 200 runs) for random DRAFT/OPEN/CLOSED sessions and unique-per-session attendances: the rate equals the formula, stays in [0, 100], and does not change when OPEN sessions or their attendances are added. Enum-guard property: for any string, a guard accepts it iff it is in the allowed set (lowercase and whitespace variants are rejected). `countPresent` property: equals the HADIR count and never exceeds the list length. `matchesClassGroup` is case-insensitive
    - Extend `src/lib/utils.test.ts` with `isValidParentPhone` cases matching the rule in the current admin student route
    - _Bug_Condition: isBugCondition(X) where C_H(X) (1.36, 1.37, 1.40), C_D(X) permission enums (1.21), or C_G(X) feedUpdate (1.34)_
    - _Expected_Behavior: rate = closed = 0 ? 0 : round(100 × hadirClosed / closed); isEnumInput AND value ∉ allowed ⇒ 400; presentCount = |{a : a.status = HADIR}|_
    - _Preservation: phone normalization and validation, `class_group` auto-enrollment (3.22)_
    - _Requirements: 2.21, 2.34, 2.36, 2.37, 2.40, 3.22_

  - [~] 3.9 Add the page route guard
    - `src/lib/route-guard.ts` (pure, Edge-safe): `requiredAccess(path)` returns `"ADMIN"` for `/admin/*`, `"LECTURER"` for `/lecturer/*`, `"ANY"` for `/change-password`, and `null` otherwise; `decidePageAccess(profile | null, path)` returns `next`, `redirect:/login`, `redirect:/change-password`, or `redirect:/login?error=akses-ditolak`
    - `src/lib/route-guard.test.ts`: every path prefix × role (ADMIN, LECTURER, STUDENT, no profile) × flag
    - Run `npm test`, `npx tsc --noEmit`, and `npm run build`. All pass and the app behaves as before
    - _Bug_Condition: isBugCondition(X) where C_B(X): WebPage without the matching role (1.9), or C_C(X) (1.14)_
    - _Expected_Behavior: anonymous ⇒ /login; wrong role ⇒ access denied; flag set ⇒ /change-password_
    - _Preservation: unguarded paths (`/`, `/login`) are unaffected; role landing pages (3.25)_
    - _Requirements: 2.8, 2.9, 2.14_

- [ ] 4. Fix: database access rules, seed, and demo users (design step 3)

  - [~] 4.1 Write the RLS migration
    - Create `supabase/migrations/YYYYMMDDHHMMSS_attendance_security_fix.sql` (or run `supabase migration new attendance_security_fix` if the Supabase CLI is used). It is idempotent and wrapped in one transaction
    - `qr_tokens` table (`token_hash` primary key, `session_id` foreign key with `on delete cascade`, `issued_at`, `expires_at` with `check (expires_at > issued_at)`), index on `(session_id, expires_at)`, RLS enabled with no policies, `revoke all … from anon, authenticated`, `grant select, insert, delete … to service_role`. Not added to the realtime publication
    - Set all stored `active_qr_token` and `token_expires_at` values to null
    - `drop policy if exists` for the 18 permissive policies ("Public Read …" and "Service Role …" on the 9 tables)
    - `private` schema with `SECURITY DEFINER` helpers using `set search_path = ''`: `current_student_id()`, `current_lecturer_id()`, `taught_class_ids()`, `taught_session_ids()`. Execute revoked from `public, anon` and granted to `authenticated`
    - Revoke all table privileges from `anon`; revoke insert, update, delete, and truncate from `authenticated`; grant select to `authenticated`
    - Scoped SELECT policies `to authenticated`, each preceded by `drop policy if exists`: `profiles_select_own`, `lecturers_select_own`, `students_select_own`, `classes_select_taught`, `enrollments_select_scoped`, `sessions_select_taught`, `attendances_select_scoped`, `permissions_select_scoped`. No policy on `courses`. Predicates use `(select …)` and `in (select …)` subqueries
    - Indexes on `classes(lecturer_id)`, `class_sessions(class_id)`, `attendances(student_id)`, `course_enrollments(student_id)`, `permissions(session_id)`, `permissions(student_id)`
    - _Bug_Condition: isBugCondition(X) where C_I(X): Database access with the anon key (1.41), or C_A(X): per-process token cache (1.3)_
    - _Expected_Behavior: rowsVisible ⊆ entitled(caller) AND writesDenied; issued tokens persisted and shared across instances_
    - _Preservation: the lecturer's attendance SELECT policy keeps the projector Realtime feed working (3.12)_
    - _Requirements: 2.3, 2.25, 2.41_

  - [~] 4.2 Edit the seed file
    - `supabase/schema_and_seed.sql`: add `DROP TABLE IF EXISTS qr_tokens CASCADE;` to the reset block; remove the 18 permissive `CREATE POLICY` statements and keep `ENABLE ROW LEVEL SECURITY`; add a comment with the run order (seed → migration → `npm run seed:demo-users`); set session 501 to `active_qr_token = NULL`, `token_expires_at = NULL`. All other seed data stays unchanged
    - _Bug_Condition: isBugCondition(X) where C_E(X): seed token `INITIAL_UG_QR_TOKEN_DEMO` (1.25), or C_I(X): permissive policies (1.41)_
    - _Expected_Behavior: seed data contains no usable token; a fresh seed is deny-all until the migration runs_
    - _Preservation: seed IDs, students, classes, enrollments, and sessions unchanged_
    - _Requirements: 2.25, 2.41_

  - [~] 4.3 Write the demo user seeding script
    - `scripts/seed-demo-users.mjs` and the npm script `"seed:demo-users": "node --env-file=.env.local scripts/seed-demo-users.mjs"`
    - Uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Creates or reuses an admin (`DEMO_ADMIN_EMAIL`, default `admin@ug.ac.id`; password from the required `DEMO_ADMIN_PASSWORD`; `must_change_password = false`), one account per seed lecturer (`lecturers.email`, password = NIDN, flag true), and one per seed student (`{nim}@student.ug.ac.id`, password = NIM, flag true)
    - Inserts the profiles and sets `lecturers.profile_id` / `students.profile_id`. Idempotent: skips linked rows and resolves existing emails by paging `listUsers`. Checks every error and exits non-zero on failure. Prints the emails and the initial-password rule, never the passwords
    - _Bug_Condition: isBugCondition(X) where C_B(X): WebLogin submit (1.7); no real accounts exist to verify against_
    - _Expected_Behavior: every seed user can sign in through Supabase Auth, with the role taken from `profiles`_
    - _Preservation: default password = NIM/NIDN with `must_change_password = true` (3.20, 3.22, 3.23)_
    - _Requirements: 2.7, 2.17, 3.20, 3.25_

  - [~] 4.4 [MANUAL] Apply the database changes to the dev Supabase project
    - **Dev project only.** `schema_and_seed.sql` drops and recreates every table, so confirm with the user before running it
    - Run `supabase/schema_and_seed.sql`, then the migration (SQL editor or `supabase db push`). Add `DEMO_ADMIN_PASSWORD` to `.env.local` and run `npm run seed:demo-users`
    - With `npm run dev` started manually, confirm F still runs: admin pages load, and the projector feed still updates through the 3 s polling (the anonymous Realtime channel stops receiving events until 8.2)
    - In the Supabase dashboard, confirm that only the 8 scoped policies exist and that `qr_tokens` has none
    - _Requirements: 2.41, 3.12_

- [ ] 5. Fix: web authentication (design step 4)

  - [~] 5.1 Rewrite the login page
    - `src/app/login/page.tsx`: empty identifier and password on load and on every tab change; remove "Kredensial Default Terisi" and the NIM in the student hint; keep the role description as "Petunjuk Login"
    - Submitting on the "Mahasiswa" tab shows "Akun mahasiswa hanya dapat digunakan melalui Aplikasi Mobile UG Attendance." without signing in
    - Otherwise call `getBrowserSupabase().auth.signInWithPassword`. Invalid credentials → "Email atau kata sandi salah."; other errors → "Gagal terhubung ke server autentikasi. Silakan coba lagi." Then read the user's own profile: STUDENT → sign out and show the mobile-app message; no profile → sign out and show "Profil akun tidak ditemukan. Hubungi Admin BAAK."; flag set → `/change-password`; ADMIN → `/admin/dashboard`, LECTURER → `/lecturer/dashboard`, regardless of the tab
    - `?error=akses-ditolak` shows "Akun Anda tidak memiliki akses ke halaman tersebut." The submit button shows a loading state
    - _Bug_Condition: isBugCondition(X) where C_B(X): WebLogin load, selectTab, or submit (1.7, 1.8, 1.13)_
    - _Expected_Behavior: credentials verified, routing by `profiles.role`, no pre-filled credentials, no web access for students_
    - _Preservation: role landing pages (3.25); Indonesian text and layout (3.26)_
    - _Requirements: 2.7, 2.8, 2.13, 3.25, 3.26_

  - [~] 5.2 Add the shared change-password handler and `/api/auth/change-password`
    - `src/lib/server/change-password.ts`: `requireAuth(req, { roles: all roles, allowMustChangePassword: true })`. Body `{ currentPassword, newPassword }`; `nim` is ignored
    - Checks: `newPassword.length < 6` → existing 400 "Password baru minimal 6 karakter"; missing `currentPassword` → 400 "Password lama wajib diisi."; verify it with `signInWithPassword({ email: ctx.email, password })` on a stateless anon client, then `signOut({ scope: "local" })` on that temporary session; wrong password → 400 `INVALID_CURRENT_PASSWORD` "Password lama tidak sesuai."
    - Then `auth.admin.updateUserById(ctx.userId, { password })` and `profiles.update({ must_change_password: false })`. If the profile update fails, restore the old (already verified) password and return 500. The success message is unchanged
    - `src/app/api/auth/change-password/route.ts` exports the handler
    - `/api/student/change-password` switches to this handler in 7.7, together with the mobile app, because the current app still sends `nim` without a Bearer token
    - _Bug_Condition: isBugCondition(X) where C_C(X): POST changePassword (1.15, 1.16)_
    - _Expected_Behavior: changes only the caller's password, requires the current password, reports success only when both updates succeed_
    - _Preservation: minimum-length and success messages; flag cleared (3.21)_
    - _Requirements: 2.15, 2.16, 3.21_

  - [~] 5.3 Add the `/change-password` page
    - `src/app/change-password/page.tsx`: same card layout as the login page; fields "Password Lama", "Password Baru", "Konfirmasi Password Baru"; posts to `/api/auth/change-password`. On success it shows the server message, signs out, and redirects to `/login`
    - _Bug_Condition: isBugCondition(X) where C_C(X): the web never checks `must_change_password` (1.14)_
    - _Expected_Behavior: the web reads the flag from the server and sends the user to change the password_
    - _Preservation: Indonesian text and the existing card styling (3.26)_
    - _Requirements: 2.14, 3.26_

  - [~] 5.4 Add the middleware
    - `src/middleware.ts`: `createServerClient` over the request and response cookies; call `auth.getClaims()` on every matched request to refresh the session; return the response built in `setAll`, and copy its cookies and cache headers onto any redirect
    - For guarded paths, read `profiles(role, must_change_password)` through the user-scoped client (allowed by the own-profile policy) and apply `decidePageAccess`
    - Matcher: all paths except `_next/static`, `_next/image`, `favicon.ico`, and image files. API routes do their own authorization and never rely on the middleware
    - _Bug_Condition: isBugCondition(X) where C_B(X): `/admin/*` or `/lecturer/*` without the matching role (1.9), or C_C(X) (1.14)_
    - _Expected_Behavior: anonymous ⇒ redirect to `/login`; wrong role ⇒ `/login?error=akses-ditolak`; flag set ⇒ `/change-password`_
    - _Preservation: public pages keep working; existing page fetches now carry the cookie_
    - _Requirements: 2.9, 2.14_

  - [~] 5.5 [MANUAL] Check web authentication in the browser
    - Run `npm test`, `npx tsc --noEmit`, and `npm run build`
    - With `npm run dev` started manually: a wrong password shows the error message; the Mahasiswa tab shows the mobile-app message; the admin lands on `/admin/dashboard` and a lecturer on `/lecturer/dashboard`; a seeded lecturer (flag set) is forced to `/change-password`, changes the password, is signed out, and then logs in to the dashboard; signed-out visits to `/admin/*` and `/lecturer/*` go to `/login`; a lecturer opening `/admin/dashboard` sees the access-denied message; the fields are empty on load and on tab change
    - _Requirements: 2.7, 2.8, 2.9, 2.13, 2.14, 3.25_

- [ ] 6. Fix: admin APIs and lecturer dashboard (design step 5)

  - [~] 6.1 Migrate the admin read routes
    - `GET /api/admin/courses` (ADMIN; `[]` when there are no rows), `GET /api/admin/students` (ADMIN; Supabase only, no demo fallback), `GET /api/admin/lecturers` (ADMIN gets all; LECTURER gets `[ownRecord]`), `GET /api/admin/schedules` (ADMIN gets all; LECTURER gets `lecturer_id = ctx.lecturer.id`; `select("*, courses(*), lecturers(*)")`)
    - Each handler uses `requireAuth`, checked queries via `throwIfDbError`, `try/catch` with `errorResponse` and the existing fallback message, and `export const dynamic = "force-dynamic"`
    - _Bug_Condition: isBugCondition(X) where C_A(X): reads from memory or demo fallback (1.1), or C_B(X): `/api/admin/**` called without ADMIN (1.10)_
    - _Expected_Behavior: Supabase reads; 401/403 for other callers; lecturer-scoped reads only_
    - _Preservation: same response shapes for the admin pages (3.24)_
    - _Requirements: 2.1, 2.4, 2.10, 3.24_

  - [~] 6.2 Migrate `POST /api/admin/students` with rollback
    - ADMIN only. Steps: (1) validate and normalize the phone with `normalizeWhatsAppNumber` and `isValidParentPhone` (same message); (2) duplicate NIM via `students.nim` → same 400 message; (3) `auth.admin.createUser` (password = NIM, `email_confirm`); on error return 400/500 and write nothing; (4) insert the profile (`must_change_password: true`); (5) insert the student with `profile_id = authUserId`; (6) select classes and filter with `matchesClassGroup`; (7) batch-insert enrollments
    - Compensation when a later step fails: delete the student row (cascades enrollments), then `auth.admin.deleteUser(authUserId)` (cascades the profile), then return the error. A failed compensation step is logged as `[rollback-failed]` with the IDs
    - Same 201 response shape, including the auth info
    - _Bug_Condition: isBugCondition(X) where C_A(X): admin create with a failing auth, profile, or record step (1.5)_
    - _Expected_Behavior: fully succeeds, or leaves no auth account, profile, record, or enrollment behind_
    - _Preservation: default password = NIM, flag true, `628…` normalization, auto-enrollment by `class_group`, duplicate NIM message (3.22)_
    - _Requirements: 2.2, 2.4, 2.5, 3.22_

  - [~] 6.3 Migrate `POST /api/admin/lecturers` with rollback
    - ADMIN only. Duplicate NIDN (same message); `createUser` (password = NIDN); profile; lecturer row. On failure, delete the auth user. A unique violation on email → 400 "Email {email} sudah digunakan oleh akun lain."
    - _Bug_Condition: isBugCondition(X) where C_A(X): admin create with a failing step (1.5)_
    - _Expected_Behavior: no partial records after a failure_
    - _Preservation: default password = NIDN, flag true, duplicate NIDN message (3.23)_
    - _Requirements: 2.2, 2.4, 2.5, 3.23_

  - [~] 6.4 Migrate the admin write routes
    - `PUT/DELETE /api/admin/students/[id]` and `/api/admin/lecturers/[id]`: `.update(...).eq("id", id).select().maybeSingle()` and `.delete().eq("id", id).select("id")`. An unknown or malformed ID (`isUuid`) → 404 "Data mahasiswa tidak ditemukan" or the lecturer equivalent. Same success messages
    - `POST /api/admin/schedules` and `PUT/DELETE /api/admin/schedules/[id]`: checked writes; the response `data` is the enriched row selected after the write
    - ADMIN only; `errorResponse` with the existing fallback messages
    - _Bug_Condition: isBugCondition(X) where C_A(X): memory-first writes with best-effort Supabase copies (1.2, 1.4), or C_B(X) (1.10)_
    - _Expected_Behavior: success only after Supabase confirms; 404 for unknown IDs_
    - _Preservation: same validation messages and response shapes (3.24). Documented differences: cascading deletes and 404 for unknown IDs_
    - _Requirements: 2.2, 2.4, 2.10, 3.24_

  - [~] 6.5 Remove the lecturer switcher from the dashboard
    - `src/app/lecturer/dashboard/page.tsx`: remove `selectedLecturerId`, the switcher `<select>`, and the client-side filter. `currentLecturer` is `lecturers[0]` from the scoped endpoint. The open-session modal lists only the lecturer's own classes. Empty state: "Tidak ada jadwal perkuliahan yang di-plotting untuk Anda." / "Hubungi Admin BAAK untuk plotting jadwal."
    - Until 7.1 makes `/api/lecturer/sessions` derive the lecturer from the session, keep passing `currentLecturer.id` as `lecturerId`, so the banner shows only the lecturer's own OPEN session
    - Run `npm test`, `npx tsc --noEmit`, and `npm run build`
    - [MANUAL] With `npm run dev` started manually: as the admin, create, edit, and delete on each management page; as a lecturer, confirm that only their own identity and schedules appear and there is no switcher
    - _Bug_Condition: isBugCondition(X) where C_B(X): LecturerDashboard (1.12)_
    - _Expected_Behavior: only the signed-in lecturer's identity, schedules, and sessions; no switcher_
    - _Preservation: dashboard layout and the open-session flow (3.13, 3.26)_
    - _Requirements: 2.12, 3.24, 3.26_

- [ ] 7. Fix: session, QR, attendance, student, and permission APIs with the mobile app (design step 6; complete 7.1–7.12 before running the web or mobile app again)

  - [~] 7.1 Migrate `GET/POST /api/lecturer/sessions`
    - GET: LECTURER gets their own sessions via `listSessions({ lecturerId: ctx.lecturer.id })`; ADMIN gets all; the `lecturerId` query parameter is ignored; `force-dynamic`
    - POST: LECTURER only. Look up the class (404 "Kelas tidak ditemukan") and check `teachesClass` (403 "Anda bukan dosen pengampu kelas ini."). Insert an OPEN session with `active_qr_token: null`; the first token comes from `/api/qr/rotate`. Same 201 "Sesi perkuliahan berhasil dibuka" and `data`
    - Remove the `lecturerId` query parameter from the dashboard fetch (kept temporarily in 6.5)
    - _Bug_Condition: isBugCondition(X) where C_B(X): lecturer operation by a non-owner (1.11), or C_E(X): initial token from `Math.random` (1.26)_
    - _Expected_Behavior: own sessions only; no stored initial token_
    - _Preservation: open-session 201 message and data (3.13); the admin dashboard still reads all sessions_
    - _Requirements: 2.11, 2.26, 3.13_

  - [~] 7.2 Migrate `GET/PUT/PATCH /api/lecturer/sessions/[id]`
    - GET (owning LECTURER, ADMIN): same `{ session, attendances, enrolledStudents, stats }`; 404 "Sesi tidak ditemukan", also for malformed IDs
    - PUT (owning LECTURER): `status` must be DRAFT, OPEN, or CLOSED, otherwise 400 "Status sesi tidak valid. Gunakan DRAFT, OPEN, atau CLOSED." CLOSED sets `ended_at`, nulls `active_qr_token`/`token_expires_at`, and calls `deleteTokensForSession`. Topic and custom room updates are saved as today
    - PATCH (owning LECTURER), checks in this order: required fields (existing 400); status enum (400 "Status presensi tidak valid. Gunakan HADIR, IZIN, SAKIT, atau ALPA."); session exists (404 "Sesi tidak ditemukan"); ownership (403); student exists (404 "Mahasiswa tidak ditemukan"); enrolled (400 `NOT_ENROLLED` "Mahasiswa {nama} tidak terdaftar pada kelas ini."); then `setAttendanceStatus`. Same success message and `attendances`
    - _Bug_Condition: isBugCondition(X) where C_H(X) (1.37–1.40) or C_B(X) (1.11)_
    - _Expected_Behavior: invalid enum ⇒ 400, unknown session ⇒ 404, non-enrolled student ⇒ rejected, with noStateChange in each case_
    - _Preservation: detail shape and stats (3.15), close effects (3.14), correction message (3.16)_
    - _Requirements: 2.11, 2.37, 2.38, 2.39, 2.40, 3.14, 3.15, 3.16_

  - [~] 7.3 Migrate `POST /api/qr/rotate` to issued tokens
    - Order of checks: `requireAuth` (LECTURER); `getQrSecret()` (500 with the config message and a log entry, no token issued); `sessionId` required (existing 400); UUID and existence (404 "Sesi perkuliahan tidak ditemukan.", nothing created); ownership (403); `status !== "OPEN"` → 400 "Sesi perkuliahan tidak sedang dibuka. Token QR tidak dapat diterbitkan." with no status change
    - Generate the token with `generateQrToken`, call `insertIssuedToken({ tokenHash: hashToken(token), sessionId, issuedAt, expiresAt: issuedAt + 7000 })`, and run the opportunistic `deleteTokensExpiredBefore(sessionId, now − 60 s)` (logged, not fatal). The route no longer writes `class_sessions`
    - Same response shape, with `validitySeconds: 7` and `rotationIntervalSeconds: 5`
    - _Bug_Condition: isBugCondition(X) where C_E(X): rotate (1.22, 1.23, 1.24, 1.27, 1.28), or C_A(X): per-process token cache (1.3)_
    - _Expected_Behavior: session = NONE ⇒ 404 AND nothingCreated; status ≠ OPEN ⇒ 400 AND statusUnchanged; secretUnset ⇒ 500 AND noTokenIssued; issued ⇒ validitySeconds = 7_
    - _Preservation: 5 s rotation and the response fields the projector reads (3.11)_
    - _Requirements: 2.3, 2.22, 2.23, 2.24, 2.26, 2.27, 2.28_

  - [~] 7.4 Migrate `POST /api/attendance/scan`
    - Order of checks: `requireAuth` (STUDENT; 401/403); `parseScanInput` (missing fields → existing 400); UUID and existence (404); status OPEN (existing 400); `findIssuedToken(sessionId, hashToken(token))` and `isWithinValidity`, otherwise the existing 400 `EXPIRED_TOKEN`. `INITIAL_UG_QR_TOKEN_DEMO` is no longer special-cased
    - Then: enrollment row (existing 403 `NOT_ENROLLED` message, no `class_group` shortcut); existing attendance → existing `alreadyAttended` response; insert HADIR. A `23505` on insert (concurrent double scan) returns the `alreadyAttended` response without a second WhatsApp message
    - Then the fire-and-forget WhatsApp send and the same 200 response. `studentId`/`studentNim` in the body are ignored
    - _Bug_Condition: isBugCondition(X) where C_D(X): scan identity (1.20), C_E(X): master or unchecked active token (1.25, 1.26, 1.27), or C_F(X): `class_group` shortcut (1.29)_
    - _Expected_Behavior: acceptedOnlyIf(issuedFor(token, session) AND 0 ≤ now − issuedAt ≤ 7000 AND enrolled(caller.studentId, session.class_id)) AND recordedFor(caller.studentId)_
    - _Preservation: success message and the 8 data fields, WhatsApp text and dev simulation, error messages and codes, raw-JSON unpacking, previous-token window (3.1–3.9)_
    - _Requirements: 2.20, 2.25, 2.26, 2.27, 2.29, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [~] 7.5 Migrate `GET /api/student/me`
    - STUDENT only. Uses `ctx.student` and ignores `nim`. Schedules come only from `getEnrolledClassIds`. Session columns are selected explicitly without `active_qr_token`/`token_expires_at`. `stats.attendanceRate` uses `computeAttendanceRate`; `totalCourses` and `totalPresent` keep their current meaning; the response shape is unchanged; `force-dynamic`
    - _Bug_Condition: isBugCondition(X) where C_D(X) (1.19), C_F(X) (1.30), or C_H(X): rate formula (1.36)_
    - _Expected_Behavior: student.id = caller.studentId; schedules ⊆ enrolledClasses(caller); rate = closed = 0 ? 0 : round(100 × hadirClosed / closed)_
    - _Preservation: response shape with student, schedules, sessions, attendances, activeSessions, and stats (3.19)_
    - _Requirements: 2.19, 2.30, 2.36, 3.19_

  - [~] 7.6 Migrate `/api/student/permissions`
    - GET: STUDENT gets their own permissions; LECTURER gets permissions for sessions of their own classes via `class_sessions!inner(classes!inner(...))`. Same joined shape (`students`, `class_sessions`); `force-dynamic`
    - POST (STUDENT): required `session_id`, `type`, `reason` (existing message; `student_id` is no longer read); `type` must be IZIN or SAKIT (400 "Tipe pengajuan harus IZIN atau SAKIT."); session exists (404); enrolled (403 `NOT_ENROLLED` "Anda tidak terdaftar pada kelas untuk sesi ini."); insert PENDING. Same 201 message
    - PATCH (owning LECTURER): `status` must be APPROVED or REJECTED (400 "Status persetujuan harus APPROVED atau REJECTED."); permission exists (existing 404); ownership through the session's class (403); update the permission. If APPROVED, run `setAttendanceStatus(…, perm.type)`; if that fails, restore the previous permission status and return 500. Same message
    - _Bug_Condition: isBugCondition(X) where C_D(X): permission endpoints (1.21), or C_A(X): memory-only permissions (1.6)_
    - _Expected_Behavior: own or scoped reads, validated type and status, enrollment and ownership checks, persisted in Supabase_
    - _Preservation: PENDING submit message (3.18); approve and reject effects (3.17)_
    - _Requirements: 2.6, 2.21, 3.17, 3.18_

  - [~] 7.7 Switch `/api/student/change-password` to the shared handler
    - `src/app/api/student/change-password/route.ts` re-exports the handler from 5.2. The `listUsers()` scan and the `nim` lookup are removed
    - _Bug_Condition: isBugCondition(X) where C_C(X): POST changePassword (1.15, 1.16)_
    - _Expected_Behavior: only the authenticated caller, current password verified, success only when both updates succeed_
    - _Preservation: the mobile path and its messages stay the same (3.20, 3.21)_
    - _Requirements: 2.15, 2.16, 3.20, 3.21_

  - [~] 7.8 Stop using the initial token in the lecturer session page and the projector
    - `src/app/lecturer/sessions/[id]/page.tsx`: stop passing `initialToken`. When the detail request fails, show the API's `error` instead of the "Sesi Perkuliahan Telah Ditutup" view, so 403/404 responses don't look like a closed session
    - `src/components/DynamicQRProjector.tsx`: remove the `initialToken` prop and its `INITIAL_UG_QR_TOKEN_DEMO` default; `token` starts as `null`. Until the first token arrives, and after the current token's `expiresAt` passes without a replacement, render the non-scannable placeholder "Menyiapkan token QR dari server..." or the server's error message
    - _Bug_Condition: isBugCondition(X) where C_E(X): projector default master token (1.25)_
    - _Expected_Behavior: no scannable QR until the server has issued a token_
    - _Preservation: the closed-session view still appears for sessions that are actually CLOSED; layout unchanged (3.11, 3.26)_
    - _Requirements: 2.25, 3.11, 3.26_

  - [~] 7.9 Add the mobile build configuration and Supabase bootstrap
    - `mobile_app/lib/config/app_config.dart`: `apiBaseUrl`, `supabaseUrl`, and `supabaseAnonKey` from `String.fromEnvironment` (`API_BASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`), plus an `isComplete` getter
    - `mobile_app/config/dev.example.json` with placeholders; add `mobile_app/config/dev.json` to `.gitignore`
    - `mobile_app/lib/main.dart`: when the config is incomplete, show a minimal screen "Konfigurasi aplikasi belum lengkap (API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY). Hubungi pengembang." Otherwise `await Supabase.initialize(url, anonKey)` before `runApp`. The splash screen still goes to `LoginScreen`
    - _Bug_Condition: isBugCondition(X) where C_J(X): hardcoded base URL (1.43)_
    - _Expected_Behavior: requestHost = API_BASE_URL from build configuration_
    - _Preservation: splash → login flow (3.26)_
    - _Requirements: 2.43_

  - [~] 7.10 Rewrite the mobile ApiService
    - `mobile_app/lib/services/api_service.dart`: `Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl, …))` with an interceptor that calls `auth.refreshSession()` when `currentSession.isExpired` and sets `Authorization: Bearer <accessToken>`. Remove `static baseUrl` and all host lists
    - `login(nim, password)`: `signInWithPassword(email: '$nim@student.ug.ac.id', password)`; an `AuthException` returns "NIM atau password salah." Then `GET /api/student/me`: 200 → `{ success, student, mustChangePassword: false }`; 403 `MUST_CHANGE_PASSWORD` → `{ success: true, mustChangePassword: true }`; 403 for another role → sign out and show "Akun ini bukan akun mahasiswa."; network errors → "Gagal terhubung ke server kampus."
    - `getStudentDashboard()` without a NIM; `submitScan({ sessionId, token })` makes one POST to the configured server with no identity fields; `submitPermission(...)` without `student_id`; `changePassword({ currentPassword, newPassword })`; `logout()` calls `auth.signOut()`
    - _Bug_Condition: isBugCondition(X) where C_D(X): mobile login (1.17), C_C(X): client-side flag (1.14), or C_J(X): hosts and `h` (1.43, 1.44)_
    - _Expected_Behavior: password verified by Supabase Auth, Bearer token on every request, flag read from the server, a single configured host_
    - _Preservation: session ID and token submitted as today (3.10); Indonesian messages (3.26)_
    - _Requirements: 2.14, 2.17, 2.43, 2.44_

  - [~] 7.11 Add the mobile QR payload parser
    - `mobile_app/lib/services/qr_payload.dart`: `QrPayload.parse(raw)` reads `s`/`sessionId` and `t`/`token` and ignores `h`, `host`, `ts`, and any other key. A non-JSON payload is passed through as the token with an empty session ID, so the server returns its existing 400
    - `mobile_app/test/qr_payload_test.dart`: `s`/`t` kept, `sessionId`/`token` kept, `h`/`host`/`ts` ignored, non-JSON passthrough. Run once with `flutter test` in `mobile_app`
    - _Bug_Condition: isBugCondition(X) where C_J(X): submitScan with `qrPayload.h` present (1.44)_
    - _Expected_Behavior: a host named in the QR is never used_
    - _Preservation: the payload format `app`, `s`, `t`, `m` is still read (3.10)_
    - _Requirements: 2.44, 3.10_

  - [~] 7.12 Update the mobile screens
    - `login_screen.dart`: no pre-filled NIM or password, no demo-credentials text, every Ahmad Fauzi fallback removed. Errors keep the user on the login screen. When the flag is set, navigate to `ChangePasswordScreen(currentPassword: password)`; the password the student just typed is kept in memory only and never stored
    - `change_password_screen.dart`: send `currentPassword` and `newPassword`. On success, fetch `/api/student/me` and open `HomeScreen(student)` as today
    - `qr_scanner_screen.dart`: use `QrPayload.parse`. Remove the demo session/NIM/ID fallbacks and the offline `NETWORK_ERROR` + `ts` branch that showed "Presensi Berhasil" without a server record
    - `permission_screen.dart`: stop sending `student_id`. `profile_tab.dart`: call `logout()` before returning to `LoginScreen`. `welcome_screen.dart`: point the "Mulai" button to `LoginScreen` instead of a `HomeScreen` with a hardcoded student
    - Run `flutter analyze` and `flutter test` (single run) in `mobile_app`
    - _Bug_Condition: isBugCondition(X) where C_D(X): hardcoded student fallback (1.18), or C_C(X): client-side flag (1.14)_
    - _Expected_Behavior: noHardcodedStudent; errors stay on the login screen; the server flag drives the change-password screen_
    - _Preservation: first login → change password → home, and later login → home (3.20); screen layouts (3.26)_
    - _Requirements: 2.14, 2.18, 2.44, 3.20, 3.26_

  - [~] 7.13 [MANUAL] Verify this step on the web and on a device (Flutter)
    - Run `npm test`, `npx tsc --noEmit`, and `npm run build`
    - Web, with `npm run dev` started manually: a lecturer opens a session (201 and navigation to the projector); the projector shows the placeholder and then a server token; closing the session works
    - Device, with `flutter run --dart-define-from-file=config/dev.json` started manually and `API_BASE_URL` pointing at the dev server: missing dart-defines show the configuration screen; a wrong password stays on the login screen; with the server stopped, the error shows and there is no demo login; first login with the NIM → change password → home; a later login with the new password → home; scanning the projector records HADIR; a hand-made QR with `"h":"evil.example"` still posts only to `API_BASE_URL` (check the `npm run dev` log or a proxy); logout returns to the login screen
    - _Requirements: 2.17, 2.18, 2.43, 2.44, 3.10, 3.13, 3.14, 3.20_

- [ ] 8. Fix: projector UI (design step 7)

  - [~] 8.1 Stabilize the QR payload and the rotation scheduler
    - `src/components/DynamicQRProjector.tsx`: `const qrPayload = useMemo(() => buildQrPayload(sessionId, token, meetingNumber), [sessionId, token, meetingNumber])`, rendered through a `React.memo` `QrImage` wrapper. Remove `currentHost`, `ts`, and `h`
    - `rotate` is a `useCallback` guarded by `inFlightRef`. It clears any pending timer, fetches `/api/qr/rotate` with an `AbortController`, applies the token, sets `nextRotationAtRef = Date.now() + QR_ROTATION_INTERVAL_MS` in `finally`, and schedules exactly one `setTimeout(rotate, QR_ROTATION_INTERVAL_MS)` while mounted. The mount effect calls `rotate()`; its cleanup clears the timer and aborts. "Refresh Token" calls the same `rotate`, so there is a single timer chain
    - Countdown: a 100 ms interval calls `setCountdown(Math.max(0, (nextRotationAtRef.current − Date.now()) / 1000))` and never triggers a rotation. The bar animation is unchanged
    - _Bug_Condition: isBugCondition(X) where C_G(X): rerenderWithoutNewToken (1.31), countdownReachesZero under Strict Mode (1.32), or buildPayload (1.35)_
    - _Expected_Behavior: qrValueChangesOnlyOnNewToken AND rotationsPerCycle = 1 AND payloadKeys = {app, s, t, m}_
    - _Preservation: 5 s rotation, smooth countdown, rotation counter, Refresh Token (3.11)_
    - _Requirements: 2.31, 2.32, 2.35, 3.11_

  - [~] 8.2 Fix sound, Realtime, live feed, and header
    - `soundEnabledRef.current = soundEnabled` in an effect, and `playChime` reads the ref. The Realtime and polling effect depends on `[sessionId]` only
    - The channel uses `getBrowserSupabase()`, so it carries the lecturer's JWT and the attendance SELECT policy delivers the INSERT events. The 3 s polling stays
    - The counter shows `countPresent(liveAttendances) / totalEnrolled Hadir`. Each row's badge shows `att.status` with the colors the session table already uses (HADIR emerald with `CheckCircle2`, IZIN amber, SAKIT blue, ALPA rose)
    - The header text "Toleransi Masa Berlaku 7 Detik" uses `QR_TOKEN_VALIDITY_MS / 1000`. The rotation counter starts at 0, so the first server token shows "#1"
    - In both projector test files, change the mock target from `@/lib/supabase` to `@/lib/supabase-browser`. The assertions stay the same
    - _Bug_Condition: isBugCondition(X) where C_G(X): toggleSound (1.33), or feedUpdate with non-HADIR records (1.34)_
    - _Expected_Behavior: subscriptionsCreated = 1 AND presentCount = |{a : a.status = HADIR}|_
    - _Preservation: chime when sound is on; Realtime feed with 3 s polling (3.11, 3.12)_
    - _Requirements: 2.33, 2.34, 3.11, 3.12_

  - [~] 8.3 [MANUAL] Check the projector in the browser
    - Run `npm test -- src/components`
    - With `npm run dev` started manually and signed in as the owning lecturer: the QR stays visually stable between rotations; the countdown is smooth; "Refresh Token", fullscreen, and the chime work with sound on and off; the live feed updates within about a second of a scan (Realtime) and keeps updating with Realtime blocked in DevTools (polling); IZIN/SAKIT badges appear after a manual correction
    - Temporarily set `reactStrictMode: true` in `next.config.mjs`, confirm one `/api/qr/rotate` request per 5 s in the Network tab, then set it back to `false`
    - _Requirements: 2.31, 2.32, 2.33, 2.34, 3.11, 3.12_

- [ ] 9. Fix: cleanup, environment, and documentation (design step 8)

  - [~] 9.1 Remove the in-memory store and the old clients
    - Reduce `src/lib/supabase.ts` to the type exports (`UserRole`, `Profile`, `Student`, …). Remove the `supabase`/`supabaseAdmin` exports and the dummy fallbacks, and move any remaining imports to the new clients
    - Delete `src/lib/store.ts` once a search for `dbStore` and `@/lib/store` finds nothing
    - Delete `test_api.mjs`, which calls the endpoints without authentication; the `tests/http/` suite replaces it
    - _Bug_Condition: isBugCondition(X) where C_A(X): in-memory data path (1.1), or C_I(X): dummy and anon-key fallbacks (1.42)_
    - _Expected_Behavior: no in-memory data path and no dummy or anon fallback remain_
    - _Preservation: type imports keep compiling_
    - _Requirements: 2.1, 2.2, 2.42_

  - [~] 9.2 Update `.env.example`
    - `QR_SECRET_KEY=` left empty, with the comment "WAJIB, minimal 32 karakter acak" and the generation command; the hardcoded value is removed
    - `DEMO_ADMIN_EMAIL=admin@ug.ac.id` and `DEMO_ADMIN_PASSWORD=` (only for `npm run seed:demo-users`)
    - `TEST_BASE_URL=http://localhost:3000`, with a comment to use a dev Supabase project, not production
    - Keep the existing Supabase keys, and note that a publishable key (`sb_publishable_…`) also works in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - _Bug_Condition: isBugCondition(X) where C_E(X): the hardcoded secret is published in `.env.example` (1.28)_
    - _Expected_Behavior: no usable default secret; a configuration error when it is unset_
    - _Requirements: 2.28, 2.42_

  - [~] 9.3 Update the README
    - Replace the "Kredensial Akses Cepat" section with the run order (`schema_and_seed.sql` → migration → `npm run seed:demo-users`), the initial-password rule (NIM/NIDN, change required on first login), the `QR_SECRET_KEY` requirement, the mobile `flutter run --dart-define-from-file=config/dev.json` command, and how to run the tests (`npm test`; `npm run test:http` with `npm run dev` started manually and a dev Supabase project)
    - _Requirements: 2.13, 2.28, 2.43_

  - [~] 9.4 Run the static checks
    - Search the code (excluding `node_modules`, `.next`, `.dart_tool`, and build output) for `dbStore`, `192.168.100.58`, `10.0.2.2`, `INITIAL_UG_QR_TOKEN_DEMO` (allowed in `tests/`), dummy Supabase fallbacks, `admin123`, `10124001` (allowed in the seed, `tests/`, and docs), `ug_attendance_super_secret` (allowed in `env.ts` and its test as the rejected value), and `listUsers` (allowed only in `scripts/seed-demo-users.mjs`). Fix every finding outside the allowed places
    - Run `npx tsc --noEmit`, `npm run build`, and `npm test`. Run `npm run lint` only if an ESLint config exists; without one, `next lint` starts an interactive setup prompt
    - _Requirements: 2.25, 2.28, 2.42, 2.43, 2.44_

- [ ] 10. Validate the fix

  - [~] 10.1 Write and run the fix-checking HTTP suite
    - `tests/http/fix-checking.test.ts` (**requires `npm run dev` started manually** and the dev Supabase project with the migration applied), using `tests/http/fixtures.ts` from task 2
    - Role and ownership matrices: S1 on admin and lecturer routes; LB on LA's session for detail, PUT, PATCH, rotate, and permission PATCH
    - Identity spoofing: S1 sends S2's `studentId`, and the record is S1's. `MUST_CHANGE_PASSWORD` for S3 on every route except the password change. Password change with a wrong or missing current password
    - Tokens: accepted at 6.5 s and rejected at 7.5 s after issue; a token from another session is rejected; rotate on DRAFT, CLOSED, and unknown sessions, with the status checked unchanged through the service role
    - Enum and existence errors with no DB change; S2's scan → `NOT_ENROLLED`; the rate for a fixture with OPEN and CLOSED sessions
    - Few-run HTTP properties (about 20 runs each): random non-enum strings on `PATCH`/`PUT`/permission `PATCH` → 400 with the row unchanged; random role × admin endpoint → 401/403
    - Integration flows: rotate as LA → scan as S1 → detail shows HADIR → second scan `alreadyAttended`; the close flow; the permission flow; admin create with rollback (force a failure with a NIM whose auth email already exists but has no `students` row, then confirm no profile or student row remains)
    - [MANUAL] Restart check (2.3): create a session, an attendance, and a permission, restart `npm run dev`, and confirm they are still returned. For tokens, confirm the issued token row exists in `qr_tokens` after a rotate. Optionally run a second server (`npm run build`, then `npx next start -p 3001` started manually) and scan on port 3001 a token issued on port 3000 within 7 s
    - Run `npm run test:http -- tests/http/fix-checking.test.ts`. **EXPECTED OUTCOME**: Tests PASS
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.10, 2.11, 2.14, 2.15, 2.16, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24, 2.25, 2.26, 2.27, 2.29, 2.30, 2.36, 2.37, 2.38, 2.39, 2.40_

  - [~] 10.2 [MANUAL] Check the database access rules and Realtime
    - `tests/http/rls.test.ts` (needs the dev Supabase project; the dev server is needed only for the Realtime scan step):
      - With the anon key and no session: selects on every table return no rows or a permission error, and every insert, update, and delete fails
      - As S1: only S1's own student row (no other `parent_phone`), own attendances and permissions, no `class_sessions`, no `qr_tokens`
      - As LA: the classes, sessions, enrollments, attendances, and permissions of class X only, and nothing from class Y. Every direct write fails
      - Realtime: as LA, subscribe to `attendances` INSERT for the fixture session, scan as S1, and expect the event within 5 s. As LB, the same subscription receives nothing. Node 22+ has a global `WebSocket`; on older Node, pass `ws` as the Realtime transport
    - [MANUAL] Realtime delivery depends on the project's publication and network. If the test times out, confirm in the Supabase dashboard (Realtime inspector or logs), and confirm in the browser that the projector feed updates live (8.3)
    - _Requirements: 2.41, 3.12_

  - [~] 10.3 Verify the bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Verified identity, persisted data, and integrity checks
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests (only the Supabase mock target changed in 8.2)
    - The tests from task 1 encode the expected behavior. When they pass, the expected behavior is satisfied
    - Run `npm test -- src/components/DynamicQRProjector.exploration.test.tsx` and, with `npm run dev` started manually, `npm run test:http -- tests/http/exploration.test.ts`
    - **EXPECTED OUTCOME**: Tests PASS (confirms the bugs are fixed)
    - _Requirements: 2.10, 2.11, 2.15, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24, 2.25, 2.27, 2.29, 2.31, 2.32, 2.33, 2.34, 2.35, 2.37, 2.40_

  - [~] 10.4 Verify the preservation tests still pass
    - **Property 2: Preservation** - Legitimate callers see unchanged behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run `npm test -- src/lib/utils.test.ts src/components/DynamicQRProjector.preservation.test.tsx` and, with `npm run dev` started manually, `npm run test:http -- tests/http/preservation.test.ts`, which compares F' with `tests/http/observed-f.json`
    - The documented differences caused by using Supabase (cascading deletes, 404 for unknown IDs, no raw `error.message` in 500 responses) are not regressions
    - [MANUAL] In the `npm run dev` terminal, confirm that each successful scan logs one WhatsApp simulation in the same format observed in task 2, and that a repeated scan logs none
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19, 3.21, 3.22, 3.23, 3.24_

- [~] 11. Checkpoint - Ensure all tests pass
  - Run `npm test`, `npm run test:http` (with `npm run dev` started manually), `flutter test` in `mobile_app`, `npx tsc --noEmit`, and `npm run build`
  - Confirm that the manual checks in 4.4, 5.5, 6.5, 7.13, 8.3, 10.1 (restart check), 10.2, and 10.4 are done
  - Ensure all tests pass, ask the user if questions arise
