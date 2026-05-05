import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { ProfileForm } from './ProfileForm';
import { SignOutInline } from './SignOutInline';
import styles from './account.module.css';

export const metadata: Metadata = {
  title: 'Mon compte',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const profile = await getProfile();

  if (!profile) redirect('/connexion?next=/account');
  if (profile.status === 'pending') redirect('/account/pending');
  if (profile.status === 'revoked') redirect('/connexion?revoked=1');

  return (
    <main className={styles.section}>
      <div className="padding-global">
        <div className="container-large">
          <div className={styles.wrap}>
            <Link href="/" className={styles.backLink}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Retour
            </Link>

            <header className={styles.header}>
              <h1 className={styles.heading}>Mon compte</h1>
              <SignOutInline />
            </header>

            <section className={styles.card}>
              <h2 className={styles.cardHeading}>Informations</h2>
              <p className={styles.cardHint}>
                Mettez à jour votre profil. L&apos;email ne peut pas être modifié ici —
                contactez-nous si besoin.
              </p>
              <ProfileForm
                initial={{
                  full_name: profile.full_name,
                  specialty: profile.specialty ?? '',
                  hospital: profile.hospital ?? '',
                  rpps_number: profile.rpps_number ?? '',
                }}
                email={profile.email}
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
