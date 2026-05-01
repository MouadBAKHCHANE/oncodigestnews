'use client';

import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Logo } from '@/components/ui/Logo';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  loginSchema,
  forgotPasswordSchema,
  type LoginInput,
  type ForgotPasswordInput,
} from '@/lib/forms/schemas';
import styles from './login.module.css';

type Mode = 'login' | 'forgot';

export function LoginCard() {
  const [mode, setMode] = useState<Mode>('login');
  const searchParams = useSearchParams();
  const revokedNotice = searchParams.get('revoked') === '1';

  return (
    <div className={`${styles.card} animate-on-scroll`}>
      <div className={styles.logoSlot}>
        <Logo />
      </div>

      {mode === 'login' ? (
        <LoginState onForgotClick={() => setMode('forgot')} revokedNotice={revokedNotice} />
      ) : (
        <ForgotPasswordState onBack={() => setMode('login')} />
      )}
    </div>
  );
}

function LoginState({
  onForgotClick,
  revokedNotice,
}: {
  onForgotClick: () => void;
  revokedNotice: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(
    revokedNotice
      ? "Votre compte a été désactivé. Contactez-nous si vous pensez qu'il s'agit d'une erreur."
      : null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  function safeNext(): string {
    const raw = searchParams.get('next');
    if (!raw) return '/';
    if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
    return '/';
  }

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setFormError('Email ou mot de passe incorrect.');
      return;
    }
    router.push(safeNext());
    router.refresh();
  }

  return (
    <>
      <h1 className={styles.heading}>Accédez à votre espace professionnel.</h1>
      <p className={styles.subtitle}>
        Connectez-vous pour accéder aux articles, rapports et vidéos exclusives.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldEmail
          id="loginEmail"
          label="Adresse email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <FieldPassword
          id="loginPassword"
          label="Mot de passe"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <label className={styles.rememberRow}>
          <input type="checkbox" {...register('rememberMe')} />
          <span className={styles.rememberLabel}>Se souvenir de moi</span>
        </label>

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </button>

        {formError ? (
          <div className={styles.error} role="alert">
            {formError}
          </div>
        ) : null}
      </form>

      <button type="button" className={styles.forgotLink} onClick={onForgotClick}>
        Mot de passe oublié&nbsp;?
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>ou</span>
        <span className={styles.dividerLine} />
      </div>

      <p className={styles.registerHint}>
        Pas encore inscrit&nbsp;? <Link href="/inscription">Créer un compte</Link>
      </p>
    </>
  );
}

function ForgotPasswordState({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    const supabase = getSupabaseBrowserClient();
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
    // Always render the success message — anti-enumeration.
    await supabase.auth.resetPasswordForEmail(values.email, { redirectTo });
    setSubmitted(true);
  }

  return (
    <>
      <h1 className={styles.heading}>Réinitialiser votre mot de passe</h1>
      <p className={styles.forgotInfo}>
        Entrez votre email, nous vous enverrons un lien de réinitialisation.
      </p>

      {submitted ? (
        <div className={styles.success} role="status" aria-live="polite">
          Un email de réinitialisation vous a été envoyé.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldEmail
            id="forgotEmail"
            label="Adresse email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <button
            type="submit"
            className={`${styles.submit} ${styles.submitDark}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Envoi…' : 'Envoyer le lien'}
          </button>
        </form>
      )}

      <button type="button" className={styles.backLink} onClick={onBack}>
        ← Retour à la connexion
      </button>
    </>
  );
}

const FieldEmail = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<'input'> & { label: string; error?: string }
>(function FieldEmail({ label, error, id, ...rest }, ref) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        type="email"
        placeholder="nom@exemple.com"
        required
        className={styles.input}
        {...rest}
      />
      {error ? (
        <span className={styles.fieldError} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});

const FieldPassword = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<'input'> & { label: string; error?: string }
>(function FieldPassword({ label, error, id, ...rest }, ref) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        type="password"
        placeholder="Votre mot de passe"
        required
        className={styles.input}
        {...rest}
      />
      {error ? (
        <span className={styles.fieldError} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});
