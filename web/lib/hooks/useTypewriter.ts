'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseTypewriterOptions {
  words: string[];
  /** Ms per character when typing. Default 65. */
  typeSpeed?: number;
  /** Ms per character when deleting. Default 35. */
  deleteSpeed?: number;
  /** Ms to hold the completed word before deleting. Default 2200. */
  pauseAfterType?: number;
  /** Ms before typing the next word. Default 400. */
  pauseAfterDelete?: number;
}

/**
 * Cycles through `words` with type/pause/delete/pause behavior.
 * Verbatim port of the IIFE in index.html lines 3823-3879.
 *
 * Reduced-motion: returns the first word statically and skips the loop.
 */
export function useTypewriter({
  words,
  typeSpeed = 65,
  deleteSpeed = 35,
  pauseAfterType = 2200,
  pauseAfterDelete = 400,
}: UseTypewriterOptions): string {
  const reducedMotion = useReducedMotion();
  const [text, setText] = useState(words[0] ?? '');

  useEffect(() => {
    if (reducedMotion || words.length === 0) return;

    let wordIndex = 0;
    let charIndex = words[0].length;
    let isDeleting = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    setText(words[0]);

    const tick = () => {
      if (cancelled) return;
      const currentWord = words[wordIndex];

      if (!isDeleting) {
        charIndex += 1;
        setText(currentWord.substring(0, charIndex));
        if (charIndex === currentWord.length) {
          timer = setTimeout(() => {
            isDeleting = true;
            tick();
          }, pauseAfterType);
          return;
        }
        timer = setTimeout(tick, typeSpeed);
      } else {
        charIndex -= 1;
        setText(currentWord.substring(0, charIndex));
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          timer = setTimeout(tick, pauseAfterDelete);
          return;
        }
        timer = setTimeout(tick, deleteSpeed);
      }
    };

    timer = setTimeout(() => {
      isDeleting = true;
      tick();
    }, pauseAfterType);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [words, typeSpeed, deleteSpeed, pauseAfterType, pauseAfterDelete, reducedMotion]);

  return text;
}
