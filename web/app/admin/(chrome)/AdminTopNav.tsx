'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './admin.module.css';

type Accent = 'slate' | 'canary' | 'husk' | 'dark' | 'mint';

interface Launcher {
  href: string;
  label: string;
  accent: Accent;
  icon: React.ReactNode;
}

const LAUNCHERS: Launcher[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    accent: 'slate',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.4" />
        <rect x="14" y="3" width="7" height="7" rx="1.4" />
        <rect x="3" y="14" width="7" height="7" rx="1.4" />
        <rect x="14" y="14" width="7" height="7" rx="1.4" />
      </svg>
    ),
  },
  {
    href: '/admin/users?tab=pending',
    label: 'Inscriptions',
    accent: 'canary',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </svg>
    ),
  },
  {
    href: '/admin/studio',
    label: 'Contenu',
    accent: 'husk',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    href: '/admin/studio/structure/site;siteSettings',
    label: 'Réglages',
    accent: 'dark',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Espace Pro',
    accent: 'mint',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export function AdminTopNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer on Escape + lock body scroll while open
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Desktop: 4 inline launchers */}
      <nav className={styles.launcherRow} aria-label="Raccourcis">
        {LAUNCHERS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`${styles.launcher} ${styles[`launcher_${l.accent}`]}`}
            title={l.label}
            aria-label={l.label}
          >
            <span className={styles.launcherIcon} aria-hidden>
              {l.icon}
            </span>
            <span className={styles.launcherLabel}>{l.label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile: hamburger that opens a right-side drawer */}
      <button
        type="button"
        className={styles.hamburger}
        aria-label="Ouvrir le menu"
        aria-expanded={drawerOpen}
        aria-controls="admin-drawer"
        onClick={() => setDrawerOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {mounted && drawerOpen
        ? createPortal(
            <>
              <div
                className={styles.drawerBackdrop}
                onClick={() => setDrawerOpen(false)}
                aria-hidden
              />
              <aside
                id="admin-drawer"
                className={styles.drawer}
                role="dialog"
                aria-modal="true"
                aria-label="Menu admin"
              >
                <div className={styles.drawerHead}>
                  <span className={styles.drawerTitle}>Raccourcis</span>
                  <button
                    type="button"
                    className={styles.drawerClose}
                    aria-label="Fermer le menu"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <ul className={styles.drawerList}>
                  {LAUNCHERS.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={styles.drawerItem}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <span
                          className={`${styles.launcherIcon} ${styles[`launcher_${l.accent}`]}`}
                          aria-hidden
                        >
                          {l.icon}
                        </span>
                        <span>{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
