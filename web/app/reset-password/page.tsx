import type { Metadata } from 'next';
import { ResetPasswordForm } from './ResetPasswordForm';
import styles from './reset.module.css';

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className={styles.section}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Choisissez un nouveau mot de passe</h1>
        <p className={styles.lead}>
          Au moins 8 caractères, avec une majuscule, une minuscule et un chiffre.
        </p>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
