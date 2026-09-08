import React, { useId } from 'react';

/**
 * The pyrolysis carbon journey, drawn natively.
 *
 * Four stages read left to right: atmospheric CO₂ is pulled into biomass,
 * the biomass is carbonised in an oxygen-limited reactor, the carbon
 * reorganises into an aromatic lattice, and the lattice is buried in soil.
 *
 * Everything is inline SVG + CSS keyframes — no external requests, no
 * third-party player, and it degrades to a static diagram under
 * prefers-reduced-motion.
 */

/** Points for a pointy-top hexagon, used for the aromatic carbon lattice. */
const hexPoints = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');

/* Honeycomb centres — a compact fused-ring cluster. */
const R = 26;
const dx = R * Math.sqrt(3);
const dy = R * 1.5;
const LATTICE = [
  [0, 0], [dx, 0], [-dx, 0],
  [dx / 2, -dy], [-dx / 2, -dy], [dx * 1.5, -dy], [-dx * 1.5, -dy],
  [dx / 2, dy], [-dx / 2, dy], [dx * 1.5, dy], [-dx * 1.5, dy],
];

const STAGES = [
  { x: 152, label: 'Photosynthesis', sub: 'CO₂ captured' },
  { x: 434, label: 'Pyrolysis', sub: '500–700°C' },
  { x: 716, label: 'Stable carbon', sub: 'Aromatic lattice' },
  { x: 924, label: 'Application', sub: 'Locked in soil' },
];

const BiocharProcessAnimation = ({ className = '' }) => {
  // Namespaced ids so multiple instances never collide.
  const uid = useId().replace(/:/g, '');
  const id = (n) => `${n}-${uid}`;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl ${className}`}
      style={{ aspectRatio: '26 / 15', background: 'linear-gradient(160deg,#0a3138 0%,#061c21 55%,#04161a 100%)' }}
      role="img"
      aria-label="Diagram of the biochar carbon journey: atmospheric CO2 is captured by biomass, converted at 500 to 700 degrees Celsius through pyrolysis into a stable aromatic carbon lattice, and locked into soil."
    >
      <style>{`
        @keyframes bcDrift   { 0%{transform:translateY(0);opacity:0}
                              12%{opacity:.9}
                              88%{opacity:.9}
                              100%{transform:translateY(96px);opacity:0} }
        @keyframes bcGrow    { 0%,8%{transform:scaleY(.15)} 42%,100%{transform:scaleY(1)} }
        @keyframes bcFlow    { to { stroke-dashoffset:-64 } }
        @keyframes bcEmber   { 0%,100%{opacity:.35;transform:translateY(0) scaleY(.85)}
                               50%{opacity:1;transform:translateY(-5px) scaleY(1.15)} }
        @keyframes bcHeat    { 0%,100%{opacity:.45} 50%{opacity:.95} }
        @keyframes bcRing    { 0%{opacity:0;transform:scale(.4)}
                               18%{opacity:1;transform:scale(1)}
                               82%{opacity:1;transform:scale(1)}
                               100%{opacity:1;transform:scale(1)} }
        @keyframes bcSink    { 0%{transform:translateY(-26px);opacity:0}
                               25%{opacity:1}
                               60%,100%{transform:translateY(0);opacity:1} }
        @keyframes bcPulse   { 0%,100%{opacity:.25} 50%{opacity:.7} }
        @keyframes bcSweep   { 0%{transform:translateX(-120px)} 100%{transform:translateX(1180px)} }

        .bc-drift  { animation: bcDrift 4.4s linear infinite; }
        .bc-stalk  { transform-box: fill-box; transform-origin: bottom center; animation: bcGrow 7s ease-in-out infinite; }
        .bc-flow   { stroke-dasharray: 7 11; animation: bcFlow 1.6s linear infinite; }
        .bc-ember  { transform-box: fill-box; transform-origin: bottom center; animation: bcEmber 1.5s ease-in-out infinite; }
        .bc-heat   { animation: bcHeat 2.6s ease-in-out infinite; }
        .bc-ring   { transform-box: fill-box; transform-origin: center; animation: bcRing 7s ease-out infinite; }
        .bc-sink   { animation: bcSink 7s ease-out infinite; }
        .bc-pulse  { animation: bcPulse 3.4s ease-in-out infinite; }
        .bc-sweep  { animation: bcSweep 9s linear infinite; }

        /* Below ~768px the whole 1040-unit scene scales to about a third, which
           would render these labels at ~5px. Hide them and let the diagram read
           as an illustration — the step cards directly beneath the animation
           already carry every stage name, the temperature and the permanence
           figure as real, selectable text. */
        @media (max-width: 767px) {
          .bc-label { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bc-drift,.bc-stalk,.bc-flow,.bc-ember,.bc-heat,
          .bc-ring,.bc-sink,.bc-pulse,.bc-sweep { animation: none !important; }
          .bc-drift { opacity:.9 }
        }
      `}</style>

      <svg viewBox="0 0 1040 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* User space, not objectBoundingBox: the stalk stems are zero-width
              vertical lines, and a bbox gradient on those paints nothing. */}
          <linearGradient id={id('leaf')} gradientUnits="userSpaceOnUse" x1="0" y1="452" x2="0" y2="240">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="100%" stopColor="#a4fca1" />
          </linearGradient>
          <linearGradient id={id('fire')} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="55%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id={id('vessel')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#123c44" />
            <stop offset="100%" stopColor="#071f24" />
          </linearGradient>
          <radialGradient id={id('core')} cx="50%" cy="62%" r="55%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#ea580c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id('soil')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b3a2a" />
            <stop offset="100%" stopColor="#141f18" />
          </linearGradient>
          <linearGradient id={id('sweep')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a4fca1" stopOpacity="0" />
            <stop offset="50%" stopColor="#a4fca1" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#a4fca1" stopOpacity="0" />
          </linearGradient>
          <filter id={id('glow')} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Slow light sweep across the whole scene */}
        <rect className="bc-sweep" x="-120" y="0" width="240" height="600" fill={`url(#${id('sweep')})`} />

        {/* ── Soil plane: a full-width band so the scene sits on ground,
               with the application zone picked out under stage 4 ── */}
        <rect x="40" y="452" width="960" height="112" rx="12" fill={`url(#${id('soil')})`} fillOpacity="0.5" />
        {[478, 508, 538].map((y) => (
          <line key={y} x1="40" y1={y} x2="1000" y2={y} stroke="#a4fca1" strokeOpacity="0.06" strokeWidth="1" />
        ))}
        <line x1="40" y1="452" x2="1000" y2="452" stroke="#a4fca1" strokeOpacity="0.22" strokeWidth="1.5" />

        {/* ── Connecting flow rail ── */}
        <path
          className="bc-flow"
          d="M 250 300 H 1000"
          stroke="#a4fca1"
          strokeOpacity="0.4"
          strokeWidth="2"
          fill="none"
        />

        {/* ════ STAGE 1 — photosynthesis ════ */}
        <g>
          {/* Falling CO₂ molecules */}
          {[
            { x: 96, d: '0s' }, { x: 152, d: '1.1s' }, { x: 206, d: '2.2s' }, { x: 128, d: '3.3s' },
          ].map(({ x, d }) => (
            <g key={x + d} className="bc-drift" style={{ animationDelay: d }}>
              <circle cx={x} cy="126" r="13" fill="#a4fca1" fillOpacity="0.10" stroke="#a4fca1" strokeOpacity="0.5" strokeWidth="1" />
              <text x={x} y="131" textAnchor="middle" fontSize="11" fontWeight="600" fill="#a4fca1" fillOpacity="0.85" fontFamily="ui-monospace, monospace" className="bc-label">
                CO₂
              </text>
            </g>
          ))}

          {/* Stalks */}
          {[
            { x: 104, h: 142, d: '0s' }, { x: 152, h: 186, d: '.5s' }, { x: 200, h: 154, d: '1s' },
          ].map(({ x, h, d }) => (
            <g key={x} className="bc-stalk" style={{ animationDelay: d }}>
              <path d={`M ${x} 452 V ${452 - h}`} stroke={`url(#${id('leaf')})`} strokeWidth="4" strokeLinecap="round" fill="none" />
              <ellipse cx={x - 13} cy={452 - h * 0.62} rx="14" ry="6.5" fill={`url(#${id('leaf')})`} fillOpacity="0.8" transform={`rotate(-28 ${x - 13} ${452 - h * 0.62})`} />
              <ellipse cx={x + 13} cy={452 - h * 0.82} rx="14" ry="6.5" fill={`url(#${id('leaf')})`} fillOpacity="0.8" transform={`rotate(28 ${x + 13} ${452 - h * 0.82})`} />
            </g>
          ))}
        </g>

        {/* ════ STAGE 2 — pyrolysis reactor ════ */}
        <g>
          {/* Heat halo */}
          <ellipse className="bc-heat" cx="434" cy="330" rx="118" ry="112" fill={`url(#${id('core')})`} />

          {/* Vessel */}
          <path
            d="M 366 214 h 136 a 16 16 0 0 1 16 16 v 128 a 68 68 0 0 1 -68 68 h -32 a 68 68 0 0 1 -68 -68 v -128 a 16 16 0 0 1 16 -16 z"
            fill={`url(#${id('vessel')})`}
            stroke="#a4fca1"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          {/* Feed chute from stage 1 */}
          <path d="M 250 300 H 350" stroke="#a4fca1" strokeOpacity="0.35" strokeWidth="2" fill="none" className="bc-flow" />

          {/* Glowing core */}
          <ellipse className="bc-heat" cx="434" cy="340" rx="52" ry="46" fill={`url(#${id('core')})`} filter={`url(#${id('glow')})`} />

          {/* Embers rising inside the vessel */}
          {[
            { x: 410, d: '0s' }, { x: 434, d: '.4s' }, { x: 458, d: '.8s' }, { x: 422, d: '1.1s' },
          ].map(({ x, d }) => (
            <path
              key={x + d}
              className="bc-ember"
              style={{ animationDelay: d }}
              d={`M ${x} 388 c -7 -13 7 -19 0 -33 c 12 9 13 22 0 33 z`}
              fill={`url(#${id('fire')})`}
            />
          ))}

          {/* Sealed lid — the point of the process: no oxygen, no combustion */}
          <rect x="358" y="200" width="152" height="16" rx="8" fill="#0f3b43" stroke="#a4fca1" strokeOpacity="0.4" strokeWidth="1.5" />
          <text x="434" y="182" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fbbf24" fontFamily="ui-monospace, monospace" className="bc-pulse bc-label">
            O₂ LIMITED
          </text>

          {/* Temperature badge */}
          <g className="bc-label">
            <rect x="368" y="268" width="132" height="30" rx="15" fill="#04161a" fillOpacity="0.75" stroke="#fbbf24" strokeOpacity="0.5" strokeWidth="1" />
            <text x="434" y="288" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fde68a" fontFamily="ui-monospace, monospace">
              500–700°C
            </text>
          </g>
        </g>

        {/* ════ STAGE 3 — aromatic carbon lattice ════ */}
        <g transform="translate(716 300)">
          <circle r="112" fill="#a4fca1" fillOpacity="0.03" stroke="#a4fca1" strokeOpacity="0.12" strokeWidth="1" />
          {LATTICE.map(([cx, cy], i) => (
            <polygon
              key={`${cx}-${cy}`}
              className="bc-ring"
              style={{ animationDelay: `${(i * 0.16).toFixed(2)}s` }}
              points={hexPoints(cx, cy, R - 2)}
              fill="#0d2f24"
              fillOpacity="0.85"
              stroke="#a4fca1"
              strokeOpacity="0.75"
              strokeWidth="1.6"
            />
          ))}
          {/* Carbon vertices */}
          {LATTICE.map(([cx, cy], i) => (
            <circle
              key={`c-${cx}-${cy}`}
              className="bc-ring"
              style={{ animationDelay: `${(i * 0.16 + 0.3).toFixed(2)}s` }}
              cx={cx} cy={cy} r="2.6" fill="#a4fca1"
            />
          ))}
        </g>

        {/* ════ STAGE 4 — application into soil ════ */}
        <g>
          {/* Application zone — the stretch of soil receiving the char */}
          <rect x="848" y="452" width="152" height="112" rx="12" fill={`url(#${id('soil')})`} stroke="#a4fca1" strokeOpacity="0.22" strokeWidth="1.5" />

          {/* Char settling into the soil */}
          {[
            { x: 884, y: 488, d: '.6s' }, { x: 926, y: 514, d: '1.5s' },
            { x: 966, y: 484, d: '2.4s' }, { x: 906, y: 542, d: '3.2s' },
            { x: 962, y: 538, d: '4.1s' },
          ].map(({ x, y, d }) => (
            <polygon
              key={`${x}-${y}`}
              className="bc-sink"
              style={{ animationDelay: d }}
              points={hexPoints(x, y, 9)}
              fill="#0d2f24"
              stroke="#a4fca1"
              strokeOpacity="0.7"
              strokeWidth="1.3"
            />
          ))}

          {/* Rail drop into the soil */}
          <path d="M 924 300 V 438" stroke="#a4fca1" strokeOpacity="0.3" strokeWidth="2" fill="none" className="bc-flow" />
          <path d="M 916 430 l 8 12 l 8 -12" fill="none" stroke="#a4fca1" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Permanence marker */}
          <text x="924" y="592" textAnchor="middle" fontSize="13" fontWeight="700" fill="#a4fca1" fillOpacity="0.75" fontFamily="ui-monospace, monospace" letterSpacing="1" className="bc-label">
            100+ YEARS
          </text>
        </g>

        {/* ════ Stage captions ════ */}
        {STAGES.map(({ x, label, sub }, i) => (
          <g key={label} className="bc-label">
            <text x={x} y="44" textAnchor="middle" fontSize="12" fontWeight="700" fill="#a4fca1" fillOpacity="0.5" fontFamily="ui-monospace, monospace" letterSpacing="2">
              {String(i + 1).padStart(2, '0')}
            </text>
            <text x={x} y="68" textAnchor="middle" fontSize="17" fontWeight="600" fill="#ffffff" fillOpacity="0.92">
              {label}
            </text>
            <text x={x} y="90" textAnchor="middle" fontSize="13" fill="#ffffff" fillOpacity="0.42">
              {sub}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default BiocharProcessAnimation;
