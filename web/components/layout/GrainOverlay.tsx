import styles from './GrainOverlay.module.css';

/**
 * Fixed SVG noise overlay — sits above all content, never intercepts pointer events.
 * Pure CSS/SVG; no JS, so safe to render server-side.
 *
 * Spec: PHASE-1-STATE-CATALOG.md §"Grain/Noise Overlay" — opacity 0.028,
 * mix-blend-mode multiply, z-index 9999.
 */
export function GrainOverlay() {
  return (
    <div className={styles.grainOverlay} aria-hidden role="presentation">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="oncodigest-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#oncodigest-noise)" opacity="1" />
      </svg>
    </div>
  );
}
