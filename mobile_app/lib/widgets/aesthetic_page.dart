import 'package:flutter/material.dart';

/// AestheticPageWrapper provides a graceful, silky entrance animation (fade + subtle slide-up)
/// for screens and tabs, giving every page an aesthetic "splash" reveal.
class AestheticPageWrapper extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final double slideOffset;
  final bool showTopTrim;

  const AestheticPageWrapper({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 450),
    this.slideOffset = 18.0,
    this.showTopTrim = false,
  });

  @override
  State<AestheticPageWrapper> createState() => _AestheticPageWrapperState();
}

class _AestheticPageWrapperState extends State<AestheticPageWrapper>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    );

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    );

    _slideAnimation = Tween<Offset>(
      begin: Offset(0, widget.slideOffset / 100),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}

/// AestheticPageRoute provides a smooth iOS/Android-style fade & scale page transition
class AestheticPageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;

  AestheticPageRoute({required this.page})
      : super(
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionDuration: const Duration(milliseconds: 380),
          reverseTransitionDuration: const Duration(milliseconds: 300),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            final curved = CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            );
            return FadeTransition(
              opacity: curved,
              child: ScaleTransition(
                scale: Tween<double>(begin: 0.97, end: 1.0).animate(curved),
                child: child,
              ),
            );
          },
        );
}
