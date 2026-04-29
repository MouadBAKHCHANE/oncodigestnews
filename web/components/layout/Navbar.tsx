'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import styles from './Navbar.module.css';

const links = [
  { href: '/actualites', label: 'Actualités' },
  { href: '/articles-scientifiques', label: 'Articles scientifiques' },
  { href: '/congres', label: 'Congrès' },
  { href: '/videos', label: 'Vidéos' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu on route change so navigation doesn't leave it stuck open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className={styles.navFixed} id="navbar">
      <div className={styles.navbarComponent}>
        <Link href="/" className={styles.navbarLogoLink} aria-label="OncoDigest — accueil">
          <Logo />
        </Link>

        <nav
          className={`${styles.navbarMenu} ${open ? styles.navbarMenuOpen : ''}`}
          aria-label="Navigation principale"
        >
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

        <div className={styles.navbarButtonWrapper}>
          <Button href="/inscription" variant="white" size="sm">
            S&apos;inscrire
          </Button>
          <Button href="/connexion" variant="yellow" size="sm">
            Accès Pro
          </Button>
        </div>

        <button
          type="button"
          className={`${styles.navbarHamburger} ${open ? styles.navbarHamburgerOpen : ''}`}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="navbar"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>
  );
}
