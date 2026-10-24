import 'package:flutter_test/flutter_test.dart';
import 'package:ug_attendance_mobile/main.dart';

void main() {
  testWidgets('App launches with SplashScreen and transitions to LoginScreen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const UGAttendanceApp());

    // Verify splash screen branding elements exist initially
    expect(find.text('UG ATTENDANCE'), findsOneWidget);
    expect(find.text('UNIVERSITAS GUNADARMA'), findsOneWidget);

    // Advance time past the splash delay (2300ms) to transition to LoginScreen
    await tester.pump(const Duration(milliseconds: 2500));
    await tester.pump(const Duration(milliseconds: 500));

    // Verify login screen elements exist after splash transition
    expect(find.text('Masuk ke Akun'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
  });
}
