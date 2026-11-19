import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  withBadge?: boolean;
}

export function DevOSLogo({
  size = 32,
  className = '',
  withText = false,
  withBadge = false,
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Bespoke Geometric DevOS Prism Mark */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Ambient Base Gradient */}
            <linearGradient id="devos-base-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Specular Facet Gradient */}
            <linearGradient id="devos-facet-top" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="devos-facet-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="devos-facet-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.5" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="devos-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Rounded Obsidian Hexagon Shell */}
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="16"
            fill="#090d16"
            stroke="url(#devos-base-grad)"
            strokeWidth="2"
            strokeOpacity="0.6"
          />

          {/* Inner Geometric Workstation Core */}
          {/* Top Facet */}
          <polygon
            points="32,15 48,24 32,33 16,24"
            fill="url(#devos-facet-top)"
            stroke="#c7d2fe"
            strokeWidth="1"
            strokeOpacity="0.7"
          />

          {/* Left Facet (Terminal & Logic Bracket) */}
          <polygon
            points="16,24 32,33 32,49 16,40"
            fill="url(#devos-facet-left)"
            stroke="#d8b4fe"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* Right Facet (Data, Flow & Telemetry) */}
          <polygon
            points="32,33 48,24 48,40 32,49"
            fill="url(#devos-facet-right)"
            stroke="#a7f3d0"
            strokeWidth="1"
            strokeOpacity="0.6"
          />

          {/* Center Radiant Core Dot */}
          <circle cx="32" cy="33" r="2.5" fill="#ffffff" filter="url(#devos-glow)" />
        </svg>
      </div>

      {/* Optional Brand Typography */}
      {withText && (
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-white tracking-tight font-sans">
            DevOS
          </span>
          {withBadge && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold tracking-wider">
              2.0
            </span>
          )}
        </div>
      )}
    </div>
  );
}
