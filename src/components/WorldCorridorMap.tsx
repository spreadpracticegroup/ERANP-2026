import React from 'react';
import { motion } from 'motion/react';

interface WorldCorridorMapProps {
  progress: number; // 0 to 1 within Scene 4
}

/**
 * Vector corridor map linking North America (New York, Toronto), Europe (Paris),
 * and Africa (Dakar, Abidjan, Libreville) with animated golden geodesic arcs.
 */
export const WorldCorridorMap: React.FC<WorldCorridorMapProps> = ({ progress }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 960 440"
        className="w-full h-full max-h-[340px] select-none"
        fill="none"
        aria-label="Carte des corridors Afrique, Europe et Amérique"
      >
        <defs>
          <radialGradient id="eraHubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E5A93B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E5A93B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="eraArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D078" />
            <stop offset="50%" stopColor="#E5A93B" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>

        {/* Subtle longitude / latitude technical grid */}
        <g stroke="#1E3363" strokeWidth="0.75" strokeDasharray="3 5" opacity="0.55">
          <line x1="60" y1="110" x2="900" y2="110" />
          <line x1="60" y1="220" x2="900" y2="220" />
          <line x1="60" y1="330" x2="900" y2="330" />
          <line x1="220" y1="30" x2="220" y2="410" />
          <line x1="480" y1="30" x2="480" y2="410" />
          <line x1="720" y1="30" x2="720" y2="410" />
        </g>

        {/* Stylized Continent Silhouettes: North America */}
        <path
          d="M110 72 L245 58 L295 88 L278 138 L244 168 L208 202 L166 206 L132 165 L96 120 Z"
          fill="#0F2147"
          stroke="#2E4B8A"
          strokeWidth="1.5"
        />

        {/* Stylized Continent Silhouettes: Europe */}
        <path
          d="M462 66 L548 54 L610 78 L602 126 L562 146 L508 148 L472 128 L458 96 Z"
          fill="#0F2147"
          stroke="#2E4B8A"
          strokeWidth="1.5"
        />

        {/* Stylized Continent Silhouettes: Africa */}
        <path
          d="M470 175 L548 166 L618 184 L662 222 L652 274 L616 324 L592 382 L552 394 L526 350 L512 294 L468 262 L448 220 Z"
          fill="#132957"
          stroke="#E5A93B"
          strokeOpacity="0.65"
          strokeWidth="1.75"
        />

        {/* Region Labels */}
        <text x="155" y="44" fill="#94A3B8" fontSize="11" fontWeight="600" letterSpacing="2">
          AMÉRIQUE DU NORD
        </text>
        <text x="498" y="44" fill="#94A3B8" fontSize="11" fontWeight="600" letterSpacing="2">
          EUROPE
        </text>
        <text x="546" y="416" fill="#E5A93B" fontSize="11" fontWeight="700" letterSpacing="2.4">
          AFRIQUE
        </text>

        {/* Corridor 1: Paris (514, 114) -> Libreville (548, 286) */}
        <motion.path
          d="M514 114 Q605 186 548 286"
          stroke="url(#eraArcGrad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />

        {/* Corridor 2: New York (242, 134) -> Dakar (458, 232) */}
        <motion.path
          d="M242 134 Q358 118 458 232"
          stroke="url(#eraArcGrad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.25, ease: 'easeOut' }}
        />

        {/* Corridor 3: Toronto (212, 118) -> Abidjan (494, 260) */}
        <motion.path
          d="M212 118 Q364 166 494 260"
          stroke="#E5A93B"
          strokeOpacity="0.48"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.0, delay: 0.45, ease: 'easeOut' }}
        />

        {/* Corridor 4: Paris (514, 114) -> Île Maurice (698, 342) */}
        <motion.path
          d="M514 114 Q656 184 698 342"
          stroke="#E5A93B"
          strokeOpacity="0.62"
          strokeWidth="1.75"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.0, delay: 0.55, ease: 'easeOut' }}
        />

        {/* Animated traveling gold signal packets along main corridors */}
        <circle r="4.5" fill="#FFF7D6">
          <animateMotion
            dur="3.2s"
            repeatCount="indefinite"
            path="M514 114 Q605 186 548 286"
          />
        </circle>
        <circle r="4.5" fill="#FFF7D6">
          <animateMotion
            dur="3.6s"
            repeatCount="indefinite"
            path="M242 134 Q358 118 458 232"
          />
        </circle>

        {/* City Nodes */}
        {[
          { x: 212, y: 118, label: 'Toronto', align: 'end', dx: -12, dy: -6, main: false },
          { x: 242, y: 134, label: 'New York', align: 'end', dx: -12, dy: 14, main: true },
          { x: 514, y: 114, label: 'Paris', align: 'start', dx: 12, dy: -6, main: true },
          { x: 458, y: 232, label: 'Dakar', align: 'end', dx: -12, dy: 4, main: true },
          { x: 494, y: 260, label: 'Abidjan', align: 'end', dx: -12, dy: 12, main: false },
          { x: 548, y: 286, label: 'Libreville', align: 'start', dx: 14, dy: 6, main: true },
          { x: 698, y: 342, label: 'Île Maurice', align: 'start', dx: 12, dy: 4, main: true },
        ].map((city) => (
          <g key={city.label} transform={`translate(${city.x}, ${city.y})`}>
            <circle
              r={city.main ? 16 : 11}
              fill="url(#eraHubGlow)"
              opacity={progress > 0.15 ? 0.9 : 0.45}
            />
            <circle
              r={city.main ? 5 : 3.5}
              fill={city.main ? '#E5A93B' : '#FFFFFF'}
              stroke="#060D1E"
              strokeWidth="1.5"
            />
            <text
              x={city.dx}
              y={city.dy}
              textAnchor={city.align as 'start' | 'end'}
              fill="#FFFFFF"
              fontSize={city.main ? '13' : '11.5'}
              fontWeight={city.main ? '700' : '500'}
            >
              {city.label}
            </text>
          </g>
        ))}

        {/* Corridor badges (clean unboxed text with gold arrows) */}
        <g transform="translate(650, 128)">
          <text x="0" y="0" fill="#E5A93B" fontSize="12" fontWeight="700" letterSpacing="1">
            CORRIDORS ACTIFS
          </text>
          <text x="0" y="24" fill="#FFFFFF" fontSize="13" fontWeight="600">
            Paris → Libreville
          </text>
          <text x="0" y="46" fill="#FFFFFF" fontSize="13" fontWeight="600">
            New York → Dakar
          </text>
          <text x="0" y="68" fill="#CBD5E1" fontSize="12" fontWeight="500">
            Paris → Île Maurice
          </text>
          <text x="0" y="88" fill="#CBD5E1" fontSize="12" fontWeight="500">
            Toronto → Abidjan
          </text>
        </g>
      </svg>
    </div>
  );
};
