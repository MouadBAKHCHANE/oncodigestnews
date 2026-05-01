'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './PartnersSection.module.css';

interface Stat {
  target: number;
  suffix?: string;
  label: string;
}

const STATS: Stat[] = [
  { target: 200, suffix: '+', label: 'Articles publiés' },
  { target: 50, suffix: '+', label: 'Congrès couverts' },
  { target: 1000, suffix: '+', label: 'Professionnels inscrits' },
];

const DURATION_MS = 2000;

export function PartnersSection() {
  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <h2 className={`${styles.heading} animate-on-scroll`}>OncoDigest en chiffres</h2>
          <div className={`${styles.stats} animate-on-scroll`}>
            {STATS.map((s) => (
              <Counter key={s.label} stat={s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Counter({ stat }: { stat: Stat }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setValue(stat.target);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setValue(stat.target);
      return;
    }
    let started = false;
    let raf = 0;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / DURATION_MS);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(Math.round(eased * stat.target));
              if (t < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stat.target, reducedMotion]);

  return (
    <div ref={ref} className={styles.statItem}>
      <div className={styles.statValue}>
        {value.toLocaleString('fr-FR')}
        {stat.suffix ?? ''}
      </div>
      <div className={styles.statLabel}>{stat.label}</div>
    </div>
  );
}
