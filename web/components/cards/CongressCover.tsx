/**
 * CongressCover — pure-SVG cover used when a Sanity congress document has
 * no uploaded coverImage. Each (shortName, year) combo gets its own
 * distinctive geometric pattern + palette (ported from the legacy
 * congres.html mock).
 */

interface Props {
  shortName: string;
  year: string | number;
  className?: string;
}

export function CongressCover({ shortName, year, className }: Props) {
  const key = `${shortName.toUpperCase()}-${year}`;
  return (
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width="100%"
      height="100%"
      role="img"
      aria-label={`${shortName} ${year}`}
    >
      {key === 'SFCD-2026' ? <SfcdFeaturedLayer /> : null}
      {key === 'ASCO-2026' ? <AscoLayer /> : null}
      {key === 'ESMO-2025' ? <EsmoLayer /> : null}
      {key === 'JFHOD-2026' ? <JfhodLayer /> : null}
      {key === 'SFCD-2025' ? <SfcdLayer /> : null}
      {key === 'SNFGE-2025' ? <SnfgeLayer /> : null}
      {key === 'WCGC-2025' ? <WcgcLayer /> : null}
      {/* Generic fallback: warm sand + name */}
      {!['SFCD-2026', 'ASCO-2026', 'ESMO-2025', 'JFHOD-2026', 'SFCD-2025', 'SNFGE-2025', 'WCGC-2025'].includes(key) ? (
        <GenericLayer shortName={shortName} year={year} />
      ) : null}
    </svg>
  );
}

/* ────── SFCD 2026 (featured — dark with canary accents) ────── */
function SfcdFeaturedLayer() {
  return (
    <>
      <defs>
        <linearGradient id="grad-sfcd2026-f" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a2601" />
          <stop offset="100%" stopColor="#3d4f0a" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad-sfcd2026-f)" />
      <g stroke="#c8e632" fill="none" opacity="0.15">
        <circle cx="420" cy="180" r="30" strokeWidth="2" />
        <circle cx="420" cy="180" r="60" strokeWidth="1.6" />
        <circle cx="420" cy="180" r="90" strokeWidth="1.3" />
        <circle cx="420" cy="180" r="120" strokeWidth="1" />
        <circle cx="420" cy="180" r="150" strokeWidth="0.8" />
        <line x1="280" y1="340" x2="560" y2="20" strokeWidth="2" />
      </g>
      <text x="40" y="330" fontFamily="Georgia, serif" fontSize="140" fontWeight="400" fill="#f0ff4d" opacity="0.9">SFCD</text>
      <text x="42" y="372" fontFamily="Georgia, serif" fontSize="40" fontWeight="400" fill="#f0ff4d" opacity="0.6">2026</text>
      <line x1="30" y1="350" x2="570" y2="350" stroke="#f0ff4d" strokeWidth="0.5" opacity="0.2" />
    </>
  );
}

/* ────── ASCO 2026 — warm sand + honeycomb hexagons ────── */
function AscoLayer() {
  return (
    <>
      <defs>
        <linearGradient id="grad-asco" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#faf8f0" />
          <stop offset="100%" stopColor="#e5dcc0" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad-asco)" />
      <g stroke="#8a7a50" fill="none" opacity="0.12">
        <polygon points="380,55 401.65,67.5 401.65,92.5 380,105 358.35,92.5 358.35,67.5" strokeWidth="1.2" />
        <polygon points="430,55 451.65,67.5 451.65,92.5 430,105 408.35,92.5 408.35,67.5" strokeWidth="1.2" />
        <polygon points="480,55 501.65,67.5 501.65,92.5 480,105 458.35,92.5 458.35,67.5" strokeWidth="1.2" />
        <polygon points="405,98 426.65,110.5 426.65,135.5 405,148 383.35,135.5 383.35,110.5" strokeWidth="1.2" />
        <polygon points="455,98 476.65,110.5 476.65,135.5 455,148 433.35,135.5 433.35,110.5" strokeWidth="1.2" />
        <polygon points="505,98 526.65,110.5 526.65,135.5 505,148 483.35,135.5 483.35,110.5" strokeWidth="1.2" />
        <polygon points="390,155 405.59,164 405.59,182 390,191 374.41,182 374.41,164" strokeWidth="1" />
        <polygon points="440,155 455.59,164 455.59,182 440,191 424.41,182 424.41,164" strokeWidth="1" />
        <polygon points="490,155 505.59,164 505.59,182 490,191 474.41,182 474.41,164" strokeWidth="1" />
        <polygon points="415,192 430.59,201 430.59,219 415,228 399.41,219 399.41,201" strokeWidth="1" />
        <polygon points="465,192 480.59,201 480.59,219 465,228 449.41,219 449.41,201" strokeWidth="1" />
      </g>
      <text x="30" y="300" fontFamily="Georgia, serif" fontSize="110" fontWeight="400" fill="#5a4e2f" opacity="0.9">ASCO</text>
      <text x="32" y="334" fontFamily="Georgia, serif" fontSize="32" fontWeight="400" fill="#5a4e2f" opacity="0.6">2026</text>
      <line x1="30" y1="350" x2="570" y2="350" stroke="#5a4e2f" strokeWidth="0.5" opacity="0.2" />
    </>
  );
}

/* ────── ESMO 2025 — sky-blue + diamond grid + circle ────── */
function EsmoLayer() {
  return (
    <>
      <defs>
        <linearGradient id="grad-esmo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#edf0f5" />
          <stop offset="100%" stopColor="#cdd5e2" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad-esmo)" />
      <g stroke="#3d4d6b" fill="none" opacity="0.12">
        {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220].map((d) => (
          <line key={`d1-${d}`} x1={300 + d} y1="0" x2="600" y2={300 - d} strokeWidth="0.8" />
        ))}
        {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map((d) => (
          <line key={`d2-${d}`} x1="300" y1={300 - d} x2={600 - d} y2="0" strokeWidth="0.8" />
        ))}
        <circle cx="440" cy="160" r="80" strokeWidth="1.8" />
      </g>
      <text x="30" y="300" fontFamily="Georgia, serif" fontSize="110" fontWeight="400" fill="#2d3748" opacity="0.9">ESMO</text>
      <text x="32" y="334" fontFamily="Georgia, serif" fontSize="32" fontWeight="400" fill="#2d3748" opacity="0.6">2025</text>
      <line x1="30" y1="350" x2="570" y2="350" stroke="#2d3748" strokeWidth="0.5" opacity="0.2" />
    </>
  );
}

/* ────── JFHOD 2026 — warm cream + radial burst ────── */
function JfhodLayer() {
  const cx = 430;
  const cy = 200;
  const angles = Array.from({ length: 24 }, (_, i) => (i * 15) * Math.PI / 180);
  return (
    <>
      <defs>
        <linearGradient id="grad-jfhod" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#faf7f0" />
          <stop offset="100%" stopColor="#e5dbc8" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad-jfhod)" />
      <g stroke="#7a6c4d" fill="none" opacity="0.12">
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * 120} y2={cy + Math.sin(a) * 120} strokeWidth="0.8" />
        ))}
        <circle cx={cx} cy={cy} r="40" strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r="80" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="120" strokeWidth="0.8" />
      </g>
      <text x="30" y="300" fontFamily="Georgia, serif" fontSize="100" fontWeight="400" fill="#5a4e35" opacity="0.9">JFHOD</text>
      <text x="32" y="334" fontFamily="Georgia, serif" fontSize="32" fontWeight="400" fill="#5a4e35" opacity="0.6">2026</text>
      <line x1="30" y1="350" x2="570" y2="350" stroke="#5a4e35" strokeWidth="0.5" opacity="0.2" />
    </>
  );
}

/* ────── SFCD 2025 — sage-green + circle grid + triangle ────── */
function SfcdLayer() {
  return (
    <>
      <defs>
        <linearGradient id="grad-sfcd25" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eff2ea" />
          <stop offset="100%" stopColor="#d5ddca" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad-sfcd25)" />
      <g stroke="#3d4a30" fill="none" opacity="0.12">
        {[60, 100, 140, 180].map((y) =>
          [340, 380, 420, 460, 500].map((x) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="15" strokeWidth="1" />
              {((x === 340 || x === 420 || x === 500) && (y === 60 || y === 140)) ||
              ((x === 380 || x === 460) && (y === 100 || y === 180)) ? (
                <circle cx={x} cy={y} r="7" strokeWidth="0.8" />
              ) : null}
            </g>
          )),
        )}
        <polygon points="340,60 500,60 500,180" strokeWidth="1.5" />
      </g>
      <text x="30" y="300" fontFamily="Georgia, serif" fontSize="110" fontWeight="400" fill="#3a4030" opacity="0.9">SFCD</text>
      <text x="32" y="334" fontFamily="Georgia, serif" fontSize="32" fontWeight="400" fill="#3a4030" opacity="0.6">2025</text>
      <line x1="30" y1="350" x2="570" y2="350" stroke="#3a4030" strokeWidth="0.5" opacity="0.2" />
    </>
  );
}

/* ────── SNFGE 2025 — cream + Venn circles ────── */
function SnfgeLayer() {
  return (
    <>
      <defs>
        <linearGradient id="grad-snfge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f2e8" />
          <stop offset="100%" stopColor="#ddd8c5" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad-snfge)" />
      <g stroke="#5a5340" fill="none" opacity="0.12">
        <circle cx="400" cy="180" r="70" strokeWidth="1.5" />
        <circle cx="440" cy="220" r="60" strokeWidth="1.5" />
        <circle cx="460" cy="170" r="50" strokeWidth="1.5" />
      </g>
      <text x="30" y="300" fontFamily="Georgia, serif" fontSize="100" fontWeight="400" fill="#4a4435" opacity="0.9">SNFGE</text>
      <text x="32" y="334" fontFamily="Georgia, serif" fontSize="32" fontWeight="400" fill="#4a4435" opacity="0.6">2025</text>
      <line x1="30" y1="350" x2="570" y2="350" stroke="#4a4435" strokeWidth="0.5" opacity="0.2" />
    </>
  );
}

/* ────── WCGC 2025 — dark + globe wireframe ────── */
function WcgcLayer() {
  return (
    <>
      <defs>
        <linearGradient id="grad-wcgc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#222222" />
          <stop offset="100%" stopColor="#383838" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad-wcgc)" />
      <g transform="translate(420,170) rotate(15)" stroke="#ffffff" fill="none" opacity="0.15">
        <circle cx="0" cy="0" r="90" strokeWidth="1.8" />
        <ellipse cx="0" cy="-60" rx="67" ry="12" strokeWidth="0.8" />
        <ellipse cx="0" cy="-30" rx="85" ry="14" strokeWidth="0.8" />
        <ellipse cx="0" cy="0" rx="90" ry="15" strokeWidth="1" />
        <ellipse cx="0" cy="30" rx="85" ry="14" strokeWidth="0.8" />
        <ellipse cx="0" cy="60" rx="67" ry="12" strokeWidth="0.8" />
        <ellipse cx="0" cy="0" rx="15" ry="90" strokeWidth="0.8" />
        <ellipse cx="0" cy="0" rx="45" ry="90" strokeWidth="0.8" />
        <ellipse cx="0" cy="0" rx="70" ry="90" strokeWidth="0.8" />
      </g>
      <text x="30" y="300" fontFamily="Georgia, serif" fontSize="110" fontWeight="400" fill="#ffffff" opacity="0.9">WCGC</text>
      <text x="32" y="334" fontFamily="Georgia, serif" fontSize="32" fontWeight="400" fill="#ffffff" opacity="0.6">2025</text>
      <line x1="30" y1="350" x2="570" y2="350" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
    </>
  );
}

/* ────── Generic fallback for new congresses ────── */
function GenericLayer({ shortName, year }: { shortName: string; year: string | number }) {
  return (
    <>
      <defs>
        <linearGradient id="grad-generic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f0e4" />
          <stop offset="100%" stopColor="#e0d3b5" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad-generic)" />
      <g stroke="#82734c" fill="none" opacity="0.12">
        <circle cx="440" cy="180" r="80" strokeWidth="1.2" />
        <circle cx="440" cy="180" r="50" strokeWidth="1" />
        <circle cx="440" cy="180" r="20" strokeWidth="0.8" />
      </g>
      <text x="30" y="300" fontFamily="Georgia, serif" fontSize="90" fontWeight="400" fill="#5a4e35" opacity="0.9">{shortName.toUpperCase()}</text>
      <text x="32" y="334" fontFamily="Georgia, serif" fontSize="32" fontWeight="400" fill="#5a4e35" opacity="0.6">{year}</text>
      <line x1="30" y1="350" x2="570" y2="350" stroke="#5a4e35" strokeWidth="0.5" opacity="0.2" />
    </>
  );
}
