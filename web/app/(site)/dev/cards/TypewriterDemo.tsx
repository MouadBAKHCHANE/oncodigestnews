'use client';

import { useTypewriter } from '@/lib/hooks/useTypewriter';

const WORDS = ['les chirurgiens', 'les oncologues', 'les gastro-entérologues', 'les internes'];

export function TypewriterDemo() {
  const text = useTypewriter({ words: WORDS });
  return (
    <div
      style={{
        height: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
      }}
    >
      <span
        style={{
          fontSize: 18,
          color: 'rgb(176, 176, 176)',
          letterSpacing: '-0.3px',
          whiteSpace: 'nowrap',
        }}
      >
        Pour&nbsp;
      </span>
      <span
        style={{
          fontSize: 21,
          color: 'var(--cod-gray--600)',
          letterSpacing: '-0.3px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 1,
          height: 14,
          background: 'var(--cod-gray--400)',
          marginLeft: 1,
          verticalAlign: 'middle',
          animation: 'cursorBlink 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
        }}
      />
      <style jsx>{`
        @keyframes cursorBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
