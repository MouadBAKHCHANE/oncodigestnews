'use client';

import { forwardRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { registrationSchema, type RegistrationInput } from '@/lib/forms/schemas';
import styles from './inscription.module.css';

export function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      passwordConfirm: '',
      profession: undefined,
      specialite: '',
      ville: '',
      acceptTerms: false as unknown as true,
    },
  });

  async function onSubmit(values: RegistrationInput) {
    setFormError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: `${values.prenom} ${values.nom}`.trim(),
          specialty: values.specialite || null,
          hospital: values.ville || null,
          profession: values.profession,
        },
        emailRedirectTo:
          typeof window !== 'undefined' ? `${window.location.origin}/account/pending` : undefined,
      },
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
        setFormError('Cet email est déjà enregistré. Connectez-vous ou utilisez un autre email.');
      } else {
        setFormError('Une erreur est survenue. Réessayez dans un instant.');
      }
      return;
    }

    // Fire-and-forget admin notification — don't block UX if email fails.
    void fetch('/api/notify-signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fullName: `${values.prenom} ${values.nom}`.trim(),
        email: values.email,
        profession: values.profession,
        specialty: values.specialite || undefined,
        hospital: values.ville || undefined,
      }),
    }).catch(() => {});

    // The handle_new_user trigger creates the profiles row automatically
    // (status='pending'). Admin approval is required before login → access.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={`${styles.success} ${styles.successVisible}`} role="status" aria-live="polite">
        <div className={styles.successIcon} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h3>Compte créé avec succès&nbsp;!</h3>
        <p>
          Vérifiez votre email pour confirmer votre adresse. Une fois validée, notre équipe
          examinera votre demande et vous recevrez un email d&apos;activation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.formRow}>
        <Field
          id="nom"
          label="Nom"
          placeholder="Votre nom"
          autoComplete="family-name"
          error={errors.nom?.message}
          {...register('nom')}
        />
        <Field
          id="prenom"
          label="Prénom"
          placeholder="Votre prénom"
          autoComplete="given-name"
          error={errors.prenom?.message}
          {...register('prenom')}
        />
      </div>

      <Field
        id="email"
        label="Adresse email"
        type="email"
        placeholder="exemple@hopital.fr"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Field
        id="password"
        label="Mot de passe"
        type="password"
        placeholder="8 caractères minimum"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Field
        id="passwordConfirm"
        label="Confirmer le mot de passe"
        type="password"
        placeholder="Confirmez votre mot de passe"
        autoComplete="new-password"
        error={errors.passwordConfirm?.message}
        {...register('passwordConfirm')}
      />

      <SelectField id="profession" label="Profession" error={errors.profession?.message} {...register('profession')}>
        <option value="" disabled>
          Sélectionnez votre profession
        </option>
        <option value="chirurgien">Chirurgien</option>
        <option value="oncologue">Oncologue</option>
        <option value="gastro-enterologue">Gastro-entérologue</option>
        <option value="interne">Interne</option>
        <option value="autre">Autre</option>
      </SelectField>

      <div className={styles.formRow}>
        <Field
          id="specialite"
          label="Spécialité"
          placeholder="Ex: Oncologie digestive"
          error={errors.specialite?.message}
          {...register('specialite')}
        />
        <Field
          id="ville"
          label="Ville"
          placeholder="Votre ville"
          autoComplete="address-level2"
          error={errors.ville?.message}
          {...register('ville')}
        />
      </div>

      <label className={styles.termsRow}>
        <input type="checkbox" {...register('acceptTerms')} />
        <span>
          J&apos;accepte les{' '}
          <Link href="/mentions-legales">conditions d&apos;utilisation</Link>.
        </span>
      </label>
      {errors.acceptTerms?.message ? (
        <span className={styles.fieldError} role="alert">
          {errors.acceptTerms.message}
        </span>
      ) : null}

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? 'Création…' : 'Créer mon compte'}
      </button>

      <p className={styles.terms}>
        En vous inscrivant, vous acceptez nos conditions d&apos;utilisation.
      </p>
      <p className={styles.loginLink}>
        Déjà inscrit&nbsp;? <Link href="/connexion">Se connecter</Link>
      </p>
    </form>
  );
}

interface FieldBaseProps {
  label: string;
  error?: string;
  id: string;
}

const Field = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<'input'> & FieldBaseProps
>(function Field({ label, error, id, ...rest }, ref) {
  return (
    <div className={`${styles.field} ${error ? styles.fieldHasError : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input ref={ref} id={id} {...rest} />
      {error ? <span className={styles.fieldErrorText} role="alert">{error}</span> : null}
    </div>
  );
});

const SelectField = forwardRef<
  HTMLSelectElement,
  Omit<ComponentPropsWithoutRef<'select'>, 'children'> & FieldBaseProps & { children: ReactNode }
>(function SelectField({ label, error, id, children, ...rest }, ref) {
  return (
    <div className={`${styles.field} ${error ? styles.fieldHasError : ''}`}>
      <label htmlFor={id}>{label}</label>
      <select ref={ref} id={id} defaultValue="" {...rest}>
        {children}
      </select>
      {error ? <span className={styles.fieldErrorText} role="alert">{error}</span> : null}
    </div>
  );
});
