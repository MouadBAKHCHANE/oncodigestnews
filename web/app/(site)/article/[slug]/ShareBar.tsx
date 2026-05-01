'use client';

import { useState } from 'react';
import styles from './article.module.css';

interface ShareBarProps {
  title: string;
}

/**
 * Share buttons under the article header. LinkedIn / X open share dialogs;
 * the third button copies the canonical URL to clipboard with a 2s confirmation.
 */
export function ShareBar({ title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  function shareLinkedIn() {
    if (typeof window === 'undefined') return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function shareX() {
    if (typeof window === 'undefined') return;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function copyLink() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — silently swallow */
    }
  }

  return (
    <div className={styles.shareBar}>
      <button
        type="button"
        className={styles.shareBtn}
        onClick={shareLinkedIn}
        aria-label="Partager sur LinkedIn"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.shareBtn}
        onClick={shareX}
        aria-label="Partager sur X"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.shareBtn}
        onClick={copyLink}
        aria-label={copied ? 'Lien copié' : 'Copier le lien'}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
    </div>
  );
}
