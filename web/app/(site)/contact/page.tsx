import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from './ContactForm';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Une question, une proposition d'article, un partenariat ? Écrivez-nous à contact@oncodigestnews.com.",
};

export default function ContactPage() {
  return (
    <section className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <div className={styles.grid}>
            <div className={styles.left}>
              <span className={`${styles.tag} animate-on-scroll`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/dot-grid.svg" alt="" width={16} height={16} className={styles.dotIcon} />
                <span>Contact</span>
              </span>
              <h1 className={`${styles.heading} animate-on-scroll`}>Contactez-nous.</h1>
              <p className={`${styles.lead} animate-on-scroll delay-1`}>
                Une question, une proposition d&apos;article, un partenariat&nbsp;? Écrivez-nous.
              </p>
              <a
                href="mailto:contact@oncodigestnews.com"
                className={`${styles.emailLink} animate-on-scroll delay-2`}
              >
                contact@oncodigestnews.com
              </a>
              <div className={`${styles.socialRow} animate-on-scroll delay-3`}>
                <Link
                  href="https://youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                  YouTube
                </Link>
                <Link
                  href="https://linkedin.com/company/oncodigest/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <svg width="14" height="15" viewBox="0 0 14 15" fill="none" aria-hidden>
                    <path
                      d="M12.96 0.5H1.03C0.46 0.5 0 0.96 0 1.53V13.47C0 14.04 0.46 14.5 1.03 14.5H12.96C13.54 14.5 14 14.04 14 13.47V1.53C14 0.96 13.54 0.5 12.96 0.5ZM4.15 12.47H2.08V5.87H4.15V12.47ZM3.12 4.96C2.45 4.96 1.91 4.42 1.91 3.75C1.91 3.08 2.45 2.54 3.12 2.54C3.79 2.54 4.33 3.08 4.33 3.75C4.33 4.42 3.79 4.96 3.12 4.96ZM11.96 12.47H9.89V9.26C9.89 8.47 9.87 7.45 8.79 7.45C7.69 7.45 7.52 8.31 7.52 9.2V12.47H5.46V5.87H7.44V6.81H7.47C7.74 6.27 8.44 5.7 9.47 5.7C11.56 5.7 11.96 7.08 11.96 8.87V12.47Z"
                      fill="currentColor"
                    />
                  </svg>
                  LinkedIn
                </Link>
              </div>
            </div>

            <div className={styles.right}>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
