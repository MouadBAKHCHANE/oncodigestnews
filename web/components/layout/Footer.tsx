'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Logo } from '@/components/ui/Logo';
import styles from './Footer.module.css';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    // Real submission wired in Phase 7. For Phase 3 we just acknowledge optimistically.
    await new Promise((resolve) => setTimeout(resolve, 250));
    setStatus('success');
    setEmail('');
  }

  return (
    <footer className={styles.footer}>
      <div className="padding-global">
        <div className="container-large">
          {/* Newsletter + CTA */}
          <div className={styles.footerPaddingVertical}>
            <div className={styles.footerTop}>
              {/* Left — newsletter card */}
              <div className={styles.footerLeftCard}>
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <h2 className={`${styles.footerLeftHeading} animate-on-scroll`}>
                      Restez informé
                    </h2>
                  </div>
                  <div style={{ marginBottom: 48 }}>
                    <p className={styles.footerSubtext}>
                      Recevez chaque semaine une synthèse des dernières publications en
                      oncologie digestive.
                    </p>
                  </div>
                </div>
                <form className={styles.footerEmailForm} onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    className={styles.footerEmailInput}
                    placeholder="Votre email professionnel"
                    aria-label="Email professionnel"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'submitting' || status === 'success'}
                  />
                  <button
                    type="submit"
                    className={styles.footerSubscribeBtn}
                    disabled={status === 'submitting' || status === 'success'}
                  >
                    {status === 'success' ? 'Inscrit ✓' : "S'abonner"}
                  </button>
                </form>
              </div>

              {/* Right — CTA card */}
              <div className={styles.footerRightCard}>
                <div className={styles.footerRightIcon} aria-hidden>
                  <svg width="23" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="4" cy="4" r="2.5" fill="#E9E6DD" />
                    <circle cx="12" cy="4" r="2.5" fill="#72604F" />
                    <circle cx="20" cy="4" r="2.5" fill="#E9E6DD" />
                    <circle cx="4" cy="12" r="2.5" fill="#72604F" />
                    <circle cx="12" cy="12" r="2.5" fill="#E9E6DD" />
                    <circle cx="20" cy="12" r="2.5" fill="#72604F" />
                    <circle cx="4" cy="20" r="2.5" fill="#E9E6DD" />
                    <circle cx="12" cy="20" r="2.5" fill="#72604F" />
                    <circle cx="20" cy="20" r="2.5" fill="#E9E6DD" />
                  </svg>
                </div>
                <div style={{ marginBottom: 32 }}>
                  <h2 className={`${styles.footerRightHeading} animate-on-scroll`}>
                    Accédez à l&apos;information oncologique de référence.
                  </h2>
                </div>
                <div>
                  <Link href="/inscription" className={styles.footerCtaBtn}>
                    Créer mon compte
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/arrow-dots-light.svg" alt="" width={16} height={16} aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Links section */}
          <div className={styles.footerLinksSection}>
            <div className={styles.footerLinksBottom}>
              <div className={styles.footerLinks}>
                <div className={styles.footerLinksLeft}>
                  <Link href="/" className={styles.footerLogoLink} aria-label="OncoDigest news — accueil">
                    <Logo size={42} dark />
                  </Link>
                  <p className={styles.footerSlogan}>
                    L&apos;information oncologique, rigoureuse et accessible.
                  </p>
                  <div className={styles.footerSocial}>
                    <span className={styles.footerSocialLabel}>Nous suivre</span>
                    <div className={styles.footerSocialIcons}>
                      <a
                        href="https://www.youtube.com/@DrABMOncoDigest"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                        className={styles.footerSocialIcon}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </a>
                      <a
                        href="https://linkedin.com/company/oncodigest/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className={styles.footerSocialIcon}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.65-1.85 3.4-1.85 3.64 0 4.31 2.39 4.31 5.5v6.24zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06s.92-2.06 2.06-2.06 2.06.92 2.06 2.06-.92 2.06-2.06 2.06zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <div className={styles.footerLinksRight}>
                  <FooterColumn heading="Plateforme">
                    <Link href="/">Accueil</Link>
                    <Link href="/actualites">Actualités</Link>
                    <Link href="/articles-scientifiques">Articles scientifiques</Link>
                    <Link href="/congres">Congrès</Link>
                    <Link href="/videos">Vidéos</Link>
                  </FooterColumn>
                  <FooterColumn heading="Ressources">
                    <Link href="/comite-scientifique">Comité scientifique</Link>
                    <Link href="/a-propos">À propos</Link>
                    <Link href="/contact">Contact</Link>
                  </FooterColumn>
                  <FooterColumn heading="Légal">
                    <Link href="/mentions-legales">Mentions légales</Link>
                    <Link href="/politique-de-confidentialite">Politique de confidentialité</Link>
                  </FooterColumn>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footerCredit}>
            OncoDigest est une plateforme d&apos;information médicale spécialisée en chirurgie
            digestive et oncologie. Le contenu publié a une vocation informative et ne se substitue
            pas à l&apos;avis médical. OncoDigest — oncodigestnews.com
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.footerLinkColumn}>
      <div className={styles.footerLinkHeading}>{heading}</div>
      <div className={styles.footerLinkList}>{children}</div>
    </div>
  );
}
