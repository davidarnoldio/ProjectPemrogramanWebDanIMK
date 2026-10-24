import 'package:flutter/material.dart';

class UGLogoBadge extends StatelessWidget {
  final double size;
  final bool showText;
  final Color? color;
  final Color? textColor;

  const UGLogoBadge({
    super.key,
    this.size = 48,
    this.showText = true,
    this.color,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    final primaryColor = color ?? const Color(0xFF581C87);

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: size,
          height: size,
          child: Image.asset(
            'assets/images/logogundar.png',
            width: size,
            height: size,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) => Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                color: primaryColor,
                borderRadius: BorderRadius.circular(size * 0.28),
              ),
              child: Center(
                child: Icon(
                  Icons.school_rounded,
                  color: Colors.white,
                  size: size * 0.58,
                ),
              ),
            ),
          ),
        ),
        if (showText) ...[
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'UG',
                style: TextStyle(
                  fontSize: size * 0.46,
                  fontWeight: FontWeight.w900,
                  color: primaryColor,
                  letterSpacing: -0.5,
                  height: 1.0,
                ),
              ),
              Text(
                'Attendance',
                style: TextStyle(
                  fontSize: size * 0.28,
                  fontWeight: FontWeight.w700,
                  color: textColor ?? const Color(0xFF1E293B),
                  letterSpacing: -0.2,
                  height: 1.1,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
