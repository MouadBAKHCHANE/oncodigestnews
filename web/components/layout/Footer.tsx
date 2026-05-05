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
                  <Link href="/" className={styles.footerLogoLink} aria-label="OncoDigest — accueil">
                    <Logo size={22} />
                  </Link>
                </div>
                <div className={styles.footerLinksRight}>
                  <FooterColumn heading="Plateforme">
                    <Link href="/actualites">Actualités</Link>
                    <Link href="/articles-scientifiques">Articles scientifiques</Link>
                    <Link href="/congres">Congrès</Link>
                    <Link href="/videos">Vidéos</Link>
                    <Link href="/evenements">Évènements</Link>
                  </FooterColumn>
                  <FooterColumn heading="Ressources">
                    <Link href="/comite-scientifique">Comité scientifique</Link>
                    <Link href="/a-propos">À propos</Link>
                    <Link href="/contact">Contact</Link>
                  </FooterColumn>
                  <FooterColumn heading="Nous suivre">
                    <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" className={styles.isBtn}>
                      YouTube
                    </a>
                    <a
                      href="https://linkedin.com/company/oncodigest/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.isBtn}
                    >
                      <svg width="14" height="15" viewBox="0 0 14 15" fill="none" aria-hidden>
                        <path
                          d="M12.96 0.5H1.03C0.46 0.5 0 0.96 0 1.53V13.47C0 14.04 0.46 14.5 1.03 14.5H12.96C13.54 14.5 14 14.04 14 13.47V1.53C14 0.96 13.54 0.5 12.96 0.5ZM4.15 12.47H2.08V5.87H4.15V12.47ZM3.12 4.96C2.45 4.96 1.91 4.42 1.91 3.75C1.91 3.08 2.45 2.54 3.12 2.54C3.79 2.54 4.33 3.08 4.33 3.75C4.33 4.42 3.79 4.96 3.12 4.96ZM11.96 12.47H9.89V9.26C9.89 8.47 9.87 7.45 8.79 7.45C7.69 7.45 7.52 8.31 7.52 9.2V12.47H5.46V5.87H7.44V6.81H7.47C7.74 6.27 8.44 5.7 9.47 5.7C11.56 5.7 11.96 7.08 11.96 8.87V12.47Z"
                          fill="currentColor"
                        />
                      </svg>
                      LinkedIn
                    </a>
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
