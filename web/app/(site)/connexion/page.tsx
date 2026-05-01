import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginCard } from './LoginCard';
import styles from './login.module.css';

export const metadata: Metadata = {
  title: 'Connexion',
  description:
    'Connectez-vous à OncoDigest pour accéder aux articles, rapports de congrès et vidéos exclusives réservés aux professionnels de santé.',
};

export default function ConnexionPage() {
  return (
    <section className={styles.section}>
      <Suspense fallback={null}>
        <LoginCard />
      </Suspense>
    </section>
  );
}
