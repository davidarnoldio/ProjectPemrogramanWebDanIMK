"use client";

import React from "react";

/**
 * Reusable Indonesian Batik Components for UG Attendance
 * Motifs featured:
 * 1. Batik Kawung (Represents wisdom, justice, purity, and self-control — classic academic heritage)
 * 2. Batik Parang / Lereng (Diagonal continuous waves representing perseverance and ceaseless striving)
 * 3. Batik Rosette / Medallion (Centerpiece for section dividers and badges)
 */

interface BatikProps {
  className?: string;
  opacity?: number;
  color?: string;
}

/**
 * High-visibility photo ribbon using the authentic Gunadarma Purple & Gold Batik pattern
 */
export function BatikPhotoRibbon({
  className = "w-full h-2.5",
}: {
  className?: string;
}) {
  return (
    <div
      className={`w-full overflow-hidden shadow-sm ${className}`}
      style={{
        backgroundImage: "url('/images/batik_pattern_purple_gold.jpg')",
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        backgroundPosition: "center",
      }}
    />
  );
}

/**
 * Visible tiling SVG pattern of Batik Kawung with strong contrast lines.
 */
export function BatikKawungPattern({
  className = "absolute inset-0 pointer-events-none",
  opacity = 0.12,
  color = "#581C87", // Gunadarma Purple
}: BatikProps) {
  const patternId = React.useId().replace(/:/g, "_");

  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`kawung-pattern-${patternId}`}
          width="54"
          height="54"
          patternUnits="userSpaceOnUse"
        >
          {/* Center Petal Top */}
          <ellipse cx="27" cy="14" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.8" />
          <ellipse cx="27" cy="14" rx="3.5" ry="7" fill={color} fillOpacity="0.4" />
          
          {/* Center Petal Bottom */}
          <ellipse cx="27" cy="40" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.8" />
          <ellipse cx="27" cy="40" rx="3.5" ry="7" fill={color} fillOpacity="0.4" />

          {/* Center Petal Left */}
          <ellipse cx="14" cy="27" rx="11" ry="7" fill="none" stroke={color} strokeWidth="1.8" />
          <ellipse cx="14" cy="27" rx="7" ry="3.5" fill={color} fillOpacity="0.4" />

          {/* Center Petal Right */}
          <ellipse cx="40" cy="27" rx="11" ry="7" fill="none" stroke={color} strokeWidth="1.8" />
          <ellipse cx="40" cy="27" rx="7" ry="3.5" fill={color} fillOpacity="0.4" />

          {/* Center diamond core (Gold/Amber) */}
          <polygon
            points="27,21 33,27 27,33 21,27"
            fill="#D97706"
            fillOpacity="0.85"
          />
          <circle cx="27" cy="27" r="2.5" fill="#FFFFFF" />

          {/* 4 Inner decorative dots inside the petals */}
          <circle cx="27" cy="14" r="2" fill="#D97706" />
          <circle cx="27" cy="40" r="2" fill="#D97706" />
          <circle cx="14" cy="27" r="2" fill="#D97706" />
          <circle cx="40" cy="27" r="2" fill="#D97706" />

          {/* Corner quarter-petals for seamless tiling */}
          <ellipse cx="0" cy="0" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.8" />
          <ellipse cx="54" cy="0" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.8" />
          <ellipse cx="0" cy="54" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.8" />
          <ellipse cx="54" cy="54" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.8" />
          <polygon points="0,5 5,0 0,0" fill="#D97706" />
          <polygon points="54,5 49,0 54,0" fill="#D97706" />
          <polygon points="0,49 5,54 0,54" fill="#D97706" />
          <polygon points="54,49 49,54 54,54" fill="#D97706" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#kawung-pattern-${patternId})`} />
    </svg>
  );
}

/**
 * Centered ornamental Batik Divider with a prominent central Kawung Rosette.
 */
export function BatikDivider({
  className = "my-12",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="flex-grow border-t-2 border-purple-200" />
      <div className="mx-4 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-purple-200 shadow-xs">
        {/* Left wing ornament */}
        <svg width="28" height="14" viewBox="0 0 28 14" className="text-amber-500">
          <path
            d="M28,7 C18,7 12,2 0,0 C12,5 18,10 28,7 Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
        </svg>

        {/* Center Kawung Rosette */}
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-900 border border-amber-400 shadow-xs">
          <svg width="18" height="18" viewBox="0 0 36 36" fill="none">
            <ellipse cx="18" cy="9" rx="4.5" ry="7" fill="#FFFFFF" />
            <ellipse cx="18" cy="27" rx="4.5" ry="7" fill="#FFFFFF" />
            <ellipse cx="9" cy="18" rx="7" ry="4.5" fill="#FFFFFF" />
            <ellipse cx="27" cy="18" rx="7" ry="4.5" fill="#FFFFFF" />
            <polygon points="18,15 21,18 18,21 15,18" fill="#FBBF24" />
            <circle cx="18" cy="18" r="1.5" fill="#581C87" />
          </svg>
        </div>

        {title && (
          <span className="text-xs font-black tracking-widest uppercase text-purple-950 px-1">
            {title}
          </span>
        )}

        {/* Right wing ornament */}
        <svg width="28" height="14" viewBox="0 0 28 14" className="text-amber-500 rotate-180">
          <path
            d="M28,7 C18,7 12,2 0,0 C12,5 18,10 28,7 Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
        </svg>
      </div>
      <div className="flex-grow border-t-2 border-purple-200" />
    </div>
  );
}

/**
 * Batik Rosette Medallion Badge (Single vector emblem)
 */
export function BatikRosette({
  size = 20,
  className = "",
  primaryColor = "#581C87",
  goldColor = "#D97706",
}: {
  size?: number;
  className?: string;
  primaryColor?: string;
  goldColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="18" r="17" stroke={goldColor} strokeWidth="1.5" />
      {/* 4 Petals */}
      <ellipse cx="18" cy="9" rx="5" ry="7.5" fill={primaryColor} />
      <ellipse cx="18" cy="27" rx="5" ry="7.5" fill={primaryColor} />
      <ellipse cx="9" cy="18" rx="7.5" ry="5" fill={primaryColor} />
      <ellipse cx="27" cy="18" rx="7.5" ry="5" fill={primaryColor} />
      
      {/* Gold diamond center */}
      <polygon points="18,13 23,18 18,23 13,18" fill={goldColor} />
      <circle cx="18" cy="18" r="2.5" fill="#FFFFFF" />
      
      {/* 4 Inner seeds */}
      <circle cx="18" cy="9" r="1.5" fill="#FFFFFF" />
      <circle cx="18" cy="27" r="1.5" fill="#FFFFFF" />
      <circle cx="9" cy="18" r="1.5" fill="#FFFFFF" />
      <circle cx="27" cy="18" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Corner flourish for cards and hero elements
 */
export function BatikCornerFlourish({
  className = "w-10 h-10 text-purple-900/25 pointer-events-none",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0,0 L40,0 C30,10 20,20 20,40 L0,40 Z"
        fill="currentColor"
      />
      <circle cx="10" cy="10" r="3" fill="#D97706" />
      <circle cx="22" cy="22" r="2" fill="#581C87" />
    </svg>
  );
}
