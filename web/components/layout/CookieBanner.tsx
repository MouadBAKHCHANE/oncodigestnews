'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './CookieBanner.module.css';

const STORAGE_KEY = 'od_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch { /* */ }
    setVisible(false);
  }

  function decline() {
    try { localStorage.setItem(STORAGE_KEY, 'declined'); } catch { /* */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.root} role="dialog" aria-label="Gestion des cookies" aria-modal="false">
      <button type="button" className={styles.skipLink} onClick={decline}>
        Continuer sans accepter
      </button>
      <div className={styles.card}>
        <button type="button" className={styles.close} aria-label="Fermer" onClick={decline}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <p className={styles.title}>Gestion de vos données</p>
        <p className={styles.body}>
          Nous utilisons des cookies pour analyser notre trafic et améliorer votre expérience.{' '}
          <Link href="/politique-de-confidentialite" className={styles.policyLink}>
            Politique de confidentialité
          </Link>
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.btnRefuse} onClick={decline}>
            Tout refuser
          </button>
          <button type="button" className={styles.btnAccept} onClick={accept}>
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
