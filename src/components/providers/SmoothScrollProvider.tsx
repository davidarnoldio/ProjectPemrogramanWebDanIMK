"use client";

import * as React from "react";
import { ReactLenis } from "lenis/react";
import { motion, useScroll, useSpring } from "framer-motion";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.05,
        touchMultiplier: 1.5,
      }}
    >
      {/* Global Scroll Progress Bar across all pages */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-800 via-purple-600 to-amber-400 z-50 origin-left pointer-events-none no-print shadow-sm"
        style={{ scaleX }}
      />
      {children}
    </ReactLenis>
  );
}
