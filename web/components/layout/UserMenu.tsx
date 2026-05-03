'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './UserMenu.module.css';

interface ProfileSnapshot {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'revoked';
}

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join('') || '?';
  }
  return (email[0] ?? '?').toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileSnapshot | null | 'loading'>('loading');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Load profile + listen for auth state changes
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, status')
        .eq('id', user.id)
        .maybeSingle();
      if (!active) return;
      setProfile((data as ProfileSnapshot) ?? null);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setProfile(null);
      else load();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click / escape
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  // ── Logged out: show signup + login pills ──
  if (profile === null) {
    return (
      <div className={styles.guestWrap}>
        <Link href="/inscription" className={styles.guestSignup}>
          S&apos;inscrire
        </Link>
        <Link href="/connexion" className={styles.guestLogin}>
          Accès Pro
        </Link>
      </div>
    );
  }

  // ── Loading: small skeleton ──
  if (profile === 'loading') {
    return <div className={styles.skeleton} aria-hidden />;
  }

  // ── Logged in: avatar + dropdown ──
  const isApproved = profile.status === 'approved';
  const isAdmin = profile.role === 'admin';
  const avatarText = initials(profile.full_name, profile.email);

  return (
    <div ref={wrapperRef} className={styles.wrap}>
      <button
        type="button"
        className={styles.avatarBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        title={profile.full_name ?? profile.email}
      >
        <span className={styles.avatarText}>{avatarText}</span>
        {isApproved && <span className={styles.proBadge} aria-hidden />}
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.menuHeader}>
            <div className={styles.avatarLg}>{avatarText}</div>
            <div className={styles.menuName}>
              {profile.full_name ?? profile.email}
            </div>
            <div className={styles.menuEmail}>{profile.email}</div>
            <div className={styles.menuBadges}>
              {isApproved ? (
                <span className={styles.badgePro}>● Pro</span>
              ) : profile.status === 'pending' ? (
                <span className={styles.badgePending}>● En attente</span>
              ) : (
                <span className={styles.badgeRevoked}>● Compte révoqué</span>
              )}
              {isAdmin && <span className={styles.badgeAdmin}>Admin</span>}
            </div>
          </div>

          <div className={styles.menuDivider} />

          <Link
            href={profile.status === 'pending' ? '/account/pending' : '/account'}
            className={styles.menuItem}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3 13c.5-2.5 2.5-4 5-4s4.5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Mon profil
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={styles.menuItem}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <rect x="2.5" y="2.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9.5" y="2.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="2.5" y="9.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9.5" y="9.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              Espace admin
            </Link>
          )}

          <div className={styles.menuDivider} />

          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={signOut}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6 2H3v12h3M10 11l3-3-3-3M13 8H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
