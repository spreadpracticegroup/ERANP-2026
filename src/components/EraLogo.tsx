import React from 'react';

interface EraLogoProps {
  variant?: 'full' | 'compact';
  className?: string;
}

/**
 * Clean, high-precision vector rendition of the ERA NETWORK PARTNERS identity:
 * - Africa silhouette (including Madagascar) in crisp white
 * - Bold "ERA" wordmark
 * - Interlocked white & gold "N" ribbon + "ETWORK"
 * - "PARTNERS" with architectural hairline rule
 */
export const EraLogo: React.FC<EraLogoProps> = ({ variant = 'full', className = '' }) => {
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-3 whitespace-nowrap shrink-0 ${className}`}>
        <svg
          viewBox="0 0 64 64"
          className="h-9 w-9 shrink-0"
          fill="none"
          aria-hidden="true"
        >
          {/* Crisp Africa + Madagascar silhouette */}
          <path
            d="M27.5 4.5C22.2 4.5 17.8 6.4 14.5 9.8C11.9 12.5 10.8 15.8 11.4 19.3C11.9 22.1 14.4 23.6 17.5 23.9C20.3 24.2 21.8 25.7 22.4 28.4C23.1 31.8 23.9 35.1 25.4 37.9C26.7 40.3 29.4 40.8 31.8 39.2C34.2 37.6 35.8 34.4 36.6 31.1C37.4 28 39.5 25.7 42.1 23.7C43.8 22.4 44.3 20.6 42.8 18.8C41.4 17.1 39.6 15.8 38.4 13.7C37.2 11.6 36.8 8.9 34.8 7C32.8 5.1 30.3 4.5 27.5 4.5Z"
            fill="#FFFFFF"
          />
          <path
            d="M41.2 31.4C40.1 32.9 39.4 35.3 40.1 36.9C40.7 38.2 42 37.4 42.6 35.6C43.2 33.8 42.3 30.2 41.2 31.4Z"
            fill="#FFFFFF"
          />
          {/* Interlocked N ribbon */}
          <path
            d="M14 59V41.5L32 51.5V46L10.5 34V59H14Z"
            fill="#FFFFFF"
          />
          <path
            d="M36 41V58.5L18 48.5V54L39.5 63.5V41H36Z"
            fill="#E5A93B"
          />
        </svg>
        <span className="flex items-baseline gap-1.5 font-extrabold tracking-tight text-white">
          <span className="text-lg">ERA</span>
          <span className="text-sm font-semibold tracking-wider text-[#E5A93B]">
            NETWORK PARTNERS
          </span>
        </span>
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 420 200"
      className={className}
      fill="none"
      role="img"
      aria-label="ERA NETWORK PARTNERS"
    >
      {/* Clean Africa continent silhouette */}
      <g transform="translate(22, 14)">
        <path
          d="M34.5 2.5C27.1 2.2 19.8 4.4 14.3 9.1C9.5 13.2 5.4 19.2 4.8 25.8C4.2 32.1 7.6 38.5 13.4 41.4C17.2 43.3 21.8 43.1 25.5 44.6C29.4 46.2 31.2 50.4 31.9 54.5C32.8 59.8 33.6 65.2 35.2 70.3C36.6 74.8 39.1 79.4 43.2 81.4C46.8 83.2 51.4 81.7 54.4 79.1C58.2 75.8 60.5 70.8 62.2 66.1C64.2 60.6 65.8 54.7 69.2 49.9C72.4 45.4 77.6 42.1 79.8 36.9C81.2 33.6 79.9 29.7 76.9 27.6C73.4 25.1 68.7 24.4 65.6 21.3C62.5 18.2 61.9 13.2 59.1 9.8C56.1 6.1 51.3 4.6 46.7 3.7C42.7 2.9 38.6 2.7 34.5 2.5Z"
          fill="#FFFFFF"
        />
        {/* Madagascar */}
        <path
          d="M72.8 61.8C70.9 64.9 69.6 69.2 70.9 72.5C71.9 75.1 74.6 74.1 76.1 71.1C77.5 68.2 78.2 63.9 76.7 61.4C75.7 59.8 73.8 60.2 72.8 61.8Z"
          fill="#FFFFFF"
        />
      </g>

      {/* Bold ERA wordmark */}
      <text
        x="116"
        y="94"
        fill="#FFFFFF"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="800"
        fontSize="86"
        letterSpacing="4"
      >
        ERA
      </text>

      {/* Interlocked Clean Geometric N Ribbon (White + ERA Gold) */}
      <g>
        {/* Left white chevron pillar */}
        <path
          d="M34 176V102L88 134V151L48 127V176H34Z"
          fill="#FFFFFF"
        />
        {/* Right gold interlocking pillar */}
        <path
          d="M104 114V188L50 156V139L90 163V114H104Z"
          fill="#E5A93B"
        />
      </g>

      {/* ETWORK completing NETWORK */}
      <text
        x="118"
        y="151"
        fill="#FFFFFF"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="800"
        fontSize="45"
        letterSpacing="2.5"
      >
        ETWORK
      </text>

      {/* PARTNERS + architectural hairline */}
      <text
        x="120"
        y="181"
        fill="#FFFFFF"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="600"
        fontSize="20"
        letterSpacing="3.8"
      >
        PARTNERS
      </text>
      <line
        x1="264"
        y1="174"
        x2="386"
        y2="174"
        stroke="#E5A93B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
