import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('success_check.json is valid Bodymovin and decodes into LottieComposition', () async {
    final file = File('assets/lottie/success_check.json');
    expect(file.existsSync(), isTrue);

    final bytes = await file.readAsBytes();
    final comp = await LottieComposition.fromBytes(bytes);
    expect(comp, isNotNull);
    expect(comp.duration.inMilliseconds, greaterThan(0));
  });

  test('qr_scanning.json is valid Bodymovin and decodes into LottieComposition', () async {
    final file = File('assets/lottie/qr_scanning.json');
    expect(file.existsSync(), isTrue);

    final bytes = await file.readAsBytes();
    final comp = await LottieComposition.fromBytes(bytes);
    expect(comp, isNotNull);
    expect(comp.duration.inMilliseconds, greaterThan(0));
  });

  test('student_beacon.json is valid Bodymovin and decodes into LottieComposition', () async {
    final file = File('assets/lottie/student_beacon.json');
    expect(file.existsSync(), isTrue);

    final bytes = await file.readAsBytes();
    final comp = await LottieComposition.fromBytes(bytes);
    expect(comp, isNotNull);
    expect(comp.duration.inMilliseconds, greaterThan(0));
  });
}
