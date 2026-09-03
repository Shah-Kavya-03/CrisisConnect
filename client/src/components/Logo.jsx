import React from 'react';

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const dimensions = {
    sm: { box: 'w-7 h-7', svg: 28, text: 'text-base' },
    md: { box: 'w-10 h-10', svg: 40, text: 'text-xl' },
    lg: { box: 'w-14 h-14', svg: 56, text: 'text-2xl' },
    xl: { box: 'w-20 h-20', svg: 80, text: 'text-4xl' },
  }[size] || { box: 'w-10 h-10', svg: 40, text: 'text-xl' };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Icon recreating the hexagonal connected network logo */}
      <div className={`relative ${dimensions.box} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Glow Container */}
          <circle cx="50" cy="50" r="48" fill="url(#bgGlow)" opacity="0.15" />

          <defs>
            <linearGradient id="bgGlow" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
            <linearGradient id="tealGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
            <linearGradient id="nodeFill" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>

          {/* Connection Lines (Network Mesh Triangle) */}
          <line x1="32" y1="62" x2="62" y2="24" stroke="url(#tealGrad)" strokeWidth="6" strokeLinecap="round" />
          <line x1="62" y1="24" x2="74" y2="76" stroke="url(#tealGrad)" strokeWidth="6" strokeLinecap="round" />
          <line x1="32" y1="62" x2="74" y2="76" stroke="url(#tealGrad)" strokeWidth="6" strokeLinecap="round" />

          {/* 1. Large Hexagon (Bottom-Left) */}
          <g transform="translate(30, 62)">
            {/* Outer Hexagon */}
            <polygon
              points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11"
              fill="url(#nodeFill)"
              stroke="url(#tealGrad)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Inner Hexagon */}
            <polygon
              points="0,-10 8.5,-5 8.5,5 0,10 -8.5,5 -8.5,-5"
              fill="none"
              stroke="#0891B2"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>

          {/* 2. Medium Hexagon (Top-Right) */}
          <g transform="translate(62, 24)">
            {/* Outer Hexagon */}
            <polygon
              points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8"
              fill="url(#nodeFill)"
              stroke="url(#tealGrad)"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* Inner Circle */}
            <circle cx="0" cy="0" r="5.5" fill="#0891B2" />
          </g>

          {/* 3. Small Hexagon (Bottom-Right) */}
          <g transform="translate(74, 76)">
            {/* Outer Hexagon */}
            <polygon
              points="0,-12 10.5,-5.5 10.5,5.5 0,12 -10.5,5.5 -10.5,-5.5"
              fill="url(#nodeFill)"
              stroke="url(#tealGrad)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Inner Circle */}
            <circle cx="0" cy="0" r="4" fill="#0891B2" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight ${dimensions.text} font-outfit text-white leading-none`}>
            Crisis<span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">Connect</span>
          </span>
          <span className="text-[10px] text-cyan-300 font-semibold tracking-wider uppercase opacity-90">
            Emergency Network
          </span>
        </div>
      )}
    </div>
  );
}
