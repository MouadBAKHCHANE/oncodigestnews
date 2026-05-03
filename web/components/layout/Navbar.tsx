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

          {/* Mobile right: user menu + hamburger */}
          <div className={styles.mobileRight}>
            <UserMenu />
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

      {/* Full-screen mobile menu */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!open}
      >
        <nav className={styles.mobileNav} aria-label="Navigation mobile">
          {links.map((link, i) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
                tabIndex={open ? 0 : -1}
              >
                <span className={styles.mobileNavNum} aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.mobileNavLabel}>{link.label}</span>
                <svg className={styles.mobileNavArrow} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            );
          })}
        </nav>

        <div className={styles.mobileMenuFooter}>
          <Link
            href="/inscription"
            className={styles.mobileSignupLink}
            tabIndex={open ? 0 : -1}
          >
            Pas encore inscrit&nbsp;? <span>S&apos;inscrire gratuitement →</span>
          </Link>
        </div>
      </div>
    </>
  );
}
