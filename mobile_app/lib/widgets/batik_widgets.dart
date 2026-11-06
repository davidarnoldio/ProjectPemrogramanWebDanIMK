import 'package:flutter/material.dart';

/**
 * Reusable Indonesian Batik Widgets for UG Attendance Mobile
 * Features authentic Gunadarma Purple & Gold Batik pattern
 */

/// Horizontal ribbon trim with the authentic batik pattern
class BatikRibbonTrim extends StatelessWidget {
  final double height;
  final BorderRadius? borderRadius;

  const BatikRibbonTrim({
    super.key,
    this.height = 4.0,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: SizedBox(
        width: double.infinity,
        height: height,
        child: Image.asset(
          'assets/images/batik_pattern_purple_gold.jpg',
          fit: BoxFit.cover,
          alignment: Alignment.center,
          errorBuilder: (context, error, stackTrace) => Container(
            color: const Color(0xFF581C87),
          ),
        ),
      ),
    );
  }
}

/// Container that layers the authentic batik pattern with a gradient overlay
class BatikCardContainer extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final BorderRadius? borderRadius;
  final double batikOpacity;
  final List<Color>? gradientColors;

  const BatikCardContainer({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.borderRadius,
    this.batikOpacity = 0.22,
    this.gradientColors,
  });

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? BorderRadius.circular(22);
    final colors = gradientColors ??
        [
          const Color(0xFF3B0764), // Deep Purple
          const Color(0xFF581C87), // Gunadarma Purple
          const Color(0xFF7E22CE), // Rich Violet
        ];

    return Container(
      decoration: BoxDecoration(
        borderRadius: radius,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF581C87).withValues(alpha: 0.35),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: radius,
        child: Stack(
          children: [
            // 1. Background gradient
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: colors,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            ),

            // 2. Authentic Batik image texture layer
            Positioned.fill(
              child: Opacity(
                opacity: batikOpacity,
                child: Image.asset(
                  'assets/images/batik_pattern_purple_gold.jpg',
                  fit: BoxFit.cover,
                  alignment: Alignment.center,
                  errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                ),
              ),
            ),

            // 3. Top Batik Ribbon Trim
            const Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: BatikRibbonTrim(height: 3.5),
            ),

            // 4. Content
            Padding(
              padding: padding,
              child: child,
            ),
          ],
        ),
      ),
    );
  }
}

/// Cultural badge highlighting Indonesian heritage in the mobile app
class BatikHeritageBadge extends StatelessWidget {
  final String label;

  const BatikHeritageBadge({
    super.key,
    this.label = "KULTUR NUSANTARA",
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: Color(0xFFD97706),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              fontSize: 9.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF92400E),
              letterSpacing: 0.4,
            ),
          ),
        ],
      ),
    );
  }
}

/// Full-screen royal purple gradient + authentic Indonesian Batik pattern background
/// supporting both dark and light modes with subtle ambient lighting orbs and watermark.
class BatikPageBackground extends StatelessWidget {
  final Widget child;
  final bool showAmbientOrbs;
  final double? batikOpacity;
  final bool isLight;

  const BatikPageBackground({
    super.key,
    required this.child,
    this.showAmbientOrbs = true,
    this.batikOpacity,
    this.isLight = true,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveOpacity = batikOpacity ?? (isLight ? 0.035 : 0.16);

    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        color: isLight ? const Color(0xFFFAF9FD) : const Color(0xFF140224),
        gradient: isLight
            ? const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFFFAF9FD),
                  Color(0xFFF5F3FF),
                  Color(0xFFFAF9FD),
                ],
              )
            : const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFF140224), // Ultra deep purple
                  Color(0xFF2E0854), // Royal Gunadarma purple
                  Color(0xFF140224),
                ],
              ),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Authentic Indonesian Batik pattern texture layer
          Opacity(
            opacity: effectiveOpacity,
            child: Image.asset(
              'assets/images/batik_pattern_purple_gold.jpg',
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => const SizedBox(),
            ),
          ),

          // Ambient glowing orbs for depth and aesthetic lighting
          if (showAmbientOrbs) ...[
            Positioned(
              top: -60,
              right: -60,
              child: Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isLight
                      ? const Color(0xFF9333EA).withValues(alpha: 0.05)
                      : const Color(0xFF9333EA).withValues(alpha: 0.14),
                ),
              ),
            ),
            Positioned(
              bottom: 40,
              left: -50,
              child: Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isLight
                      ? const Color(0xFFD97706).withValues(alpha: 0.04)
                      : const Color(0xFFD97706).withValues(alpha: 0.10),
                ),
              ),
            ),
          ],

          // Content
          child,
        ],
      ),
    );
  }
}

