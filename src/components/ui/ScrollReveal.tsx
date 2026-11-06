"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  scale?: boolean;
  once?: boolean;
  amount?: number | "some" | "all";
  className?: string;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.55,
  distance = 24,
  scale = false,
  once = true,
  amount = 0.15,
  className = "",
  ...props
}: ScrollRevealProps) {
  let initialX = 0;
  let initialY = 0;

  if (direction === "up") initialY = distance;
  else if (direction === "down") initialY = -distance;
  else if (direction === "left") initialX = distance;
  else if (direction === "right") initialX = -distance;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: initialX,
        y: initialY,
        scale: scale ? 0.96 : 1,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom smooth easeOutQuart
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ScrollStaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  className?: string;
}

export function ScrollStaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0.05,
  once = true,
  amount = 0.15,
  className = "",
  ...props
}: ScrollStaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScrollStaggerItem({
  children,
  direction = "up",
  distance = 20,
  duration = 0.5,
  className = "",
  ...props
}: HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  className?: string;
}) {
  let initialX = 0;
  let initialY = 0;

  if (direction === "up") initialY = distance;
  else if (direction === "down") initialY = -distance;
  else if (direction === "left") initialX = distance;
  else if (direction === "right") initialX = -distance;

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: initialX, y: initialY },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

