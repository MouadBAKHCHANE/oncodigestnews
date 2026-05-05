'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { UserMenu } from './UserMenu';
import styles from './Navbar.module.css';

const links = [
  { href: '/actualites', label: 'Actualités' },
  { href: '/articles-scientifiques', label: 'Articles scientifiques' },
  { href: '/congres', label: 'Congrès' },
  { href: '/videos', label: 'Vidéos' },
  { href: '/evenements', label: 'Évènements' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div className={styles.navFixed} id="navbar">
        <div className={styles.navbarComponent}>

          {/* Logo */}
          <Link href="/" className={styles.navbarLogoLink} aria-label="OncoDigest — accueil">
            <Logo />
          </Link>

          {/* Desktop nav links */}
          <nav className={styles.navbarMenu} aria-label="Navigation principale">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navbarLink} ${active ? styles.navbarLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop user menu (avatar dropdown when logged in, or guest pills) */}
          <div className={styles.navbarButtonWrapper}>
            <UserMenu />
          </div>

          {/* Mobile right zone:
              - Logged out → "Nous rejoindre" canary pill + hamburger
              - Logged in  → avatar circle (UserMenu compact) + hamburger
                (the static "Nous rejoindre" link is auto-hidden by CSS
                when the avatar button is present, via :has())  */}
          <div className={styles.mobileRight}>
            <Link href="/inscription" className={styles.mobileJoinBtn}>
              Nous rejoindre
            </Link>
            <UserMenu compact />
            <button
              type="button"
              className={`${styles.navbarHamburger} ${open ? styles.navbarHamburgerOpen : ''}`}
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((p) => !p)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

        </div>
      </div>

      {/* Full-screen mobile menu — light theme, RockFi-style */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!open}
      >
        <nav className={styles.mobileNav} aria-label="Navigation mobile">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
                tabIndex={open ? 0 : -1}
              >
                {link.label}
              </Link>
            );
          })}
          {/* "Mon espace" with icon — inside the menu list */}
          <Link
            href="/connexion"
            className={`${styles.mobileNavLink} ${styles.mobileNavSpace}`}
            tabIndex={open ? 0 : -1}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3 13c.5-2.5 2.5-4 5-4s4.5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Mon espace
          </Link>
        </nav>
      </div>
    </>
  );
}
