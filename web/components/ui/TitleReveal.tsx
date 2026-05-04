'use client';

import {
  type ElementType,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './TitleReveal.module.css';

/**
 * TitleReveal — animates large titles with a RockFi-style word-by-word slide-up
 * reveal. Each word is wrapped in an overflow:hidden mask; the inner span
 * starts at translateY(110%) and slides to 0 with a staggered delay when the
 * heading enters the viewport.
 *
 * Usage: pass a plain string. To italicize specific words, pass `emWords`
 * (a string substring or array of substrings) — those words will render in
 * the `<em>` style without breaking the per-word stagger.
 *
 *   <TitleReveal as="h1">L'information oncologique, rigoureuse.</TitleReveal>
 *
 * Honors `prefers-reduced-motion`.
 */

interface Props {
  as?: ElementType;
  children: string;
  className?: string;
  /** Extra delay (ms) before the first word starts animating */
  delay?: number;
  /** Words to render in italic (matched as substring against each word). */
  emWords?: string | string[];
}

export function TitleReveal({
  as: Component = 'h2',
  children,
  className,
  delay = 0,
  emWords,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Split into runs of word vs whitespace, preserving spaces
  const tokens = children.split(/(\s+)/);
  const emList = Array.isArray(emWords) ? emWords : emWords ? [emWords] : [];
  const isEm = (word: string) => emList.some((needle) => needle && word.includes(needle));

  let wordIndex = 0;
  return (
    <Component
      ref={ref as React.RefObject<HTMLElement>}
      className={`${styles.reveal} ${visible ? styles.revealVisible : ''} ${className ?? ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok) || tok === '') {
          return <span key={i}>{tok}</span>;
        }
        const idx = wordIndex++;
        const inner = isEm(tok) ? <em className={styles.em}>{tok}</em> : tok;
        return (
          <span key={i} className={styles.word}>
            <span
              className={styles.wordInner}
              style={{ '--i': idx } as CSSProperties}
            >
              {inner}
            </span>
          </span>
        );
      })}
    </Component>
  );
}
