'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/forms/schemas';
import styles from './reset.module.css';

/**
 * /reset-password — landing page from Supabase's password recovery email.
 *
 * Supabase Auth uses a hash-fragment session (#access_token=...) on this URL.
 * @supabase/ssr's browser client picks it up automatically and sets the
 * recovery session, after which updateUser({ password }) updates the password.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [linkExpired, setLinkExpired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', passwordConfirm: '' },
  });

  useEffect(() => {
    // Supabase parses the URL hash on page load. If there's no recovery session
    // by the time we mount, the link is expired or invalid.
    const supabase = getSupabaseBrowserClient();
    const t = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) setLinkExpired(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setFormError(error.message);
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push('/'), 1500);
  }

  if (linkExpired) {
    return (
      <div className={styles.expired} role="alert">
        <p>Ce lien a expiré ou est invalide.</p>
        <p>
          Demandez-en un nouveau depuis la page de{' '}
          <a href="/connexion">connexion</a>.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <p>Mot de passe mis à jour. Redirection en cours…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="password">Nouveau mot de passe</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          autoFocus
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password ? (
          <span className={styles.fieldError} role="alert">
            {errors.password.message}
          </span>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="passwordConfirm">Confirmer le mot de passe</label>
        <input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          {...register('passwordConfirm')}
          aria-invalid={!!errors.passwordConfirm}
        />
        {errors.passwordConfirm ? (
          <span className={styles.fieldError} role="alert">
            {errors.passwordConfirm.message}
          </span>
        ) : null}
      </div>

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
      </button>
    </form>
  );
}
