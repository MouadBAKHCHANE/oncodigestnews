import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { SignOutButton } from './SignOutButton';
import styles from './pending.module.css';

export const metadata: Metadata = {
  title: 'Compte en attente',
  robots: { index: false, follow: false },
};

export default async function AccountPendingPage() {
  const profile = await getProfile();

  // Anonymous → /connexion. Approved/admin → home. Only pending stays here.
  if (!profile) redirect('/connexion');
  if (profile.status === 'approved') redirect('/');

  const submittedDate = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className={styles.section}>
      <div className={styles.card}>
        <div className={styles.iconWrap} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h1 className={styles.heading}>Votre compte est en attente d&apos;approbation</h1>

        <p className={styles.lead}>
          Votre demande a été reçue le <strong>{submittedDate}</strong>. Notre équipe vérifie
          votre profil — vous recevrez un email dès que votre accès sera activé. Cela prend
          généralement moins de 48&nbsp;heures.
        </p>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Nom</span>
            <span>{profile.full_name}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Email</span>
            <span>{profile.email}</span>
          </div>
          {profile.specialty ? (
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Spécialité</span>
              <span>{profile.specialty}</span>
            </div>
          ) : null}
          {profile.hospital ? (
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Ville</span>
              <span>{profile.hospital}</span>
            </div>
          ) : null}
        </div>

        <p className={styles.help}>
          Une question&nbsp;? Écrivez-nous à{' '}
          <a href="mailto:contact@oncodigestnews.com">contact@oncodigestnews.com</a>.
        </p>

        <SignOutButton />
      </div>
    </main>
  );
}
