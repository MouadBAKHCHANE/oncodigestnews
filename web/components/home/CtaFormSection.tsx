'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { registrationSchema, type RegistrationInput } from '@/lib/forms/schemas';
import styles from './CtaFormSection.module.css';

/**
 * Homepage CTA section — "Rejoignez la communauté OncoDigest" with an
 * inline registration form (mirrors index.html .section_cta-block + .cta_form).
 *
 * Submits via Supabase signUp like /inscription, but compact (no benefits
 * column, no terms checkbox — terms are linked via inline copy below the
 * button per the original).
 */
export function CtaFormSection() {
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
      acceptTerms: true as unknown as true,
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
          typeof window !== 'undefined'
            ? `${window.location.origin}/account/pending`
            : undefined,
      },
    });
    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
        setFormError('Cet email est déjà enregistré.');
      } else {
        setFormError('Une erreur est survenue. Réessayez dans un instant.');
      }
      return;
    }
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
    setSubmitted(true);
  }

  return (
    <section className={styles.section}>
      <div className={styles.glow} aria-hidden />
      <div className="padding-global">
        <div className="container-large">
          <div className={styles.layout}>
            <div className={`${styles.signature} animate-on-scroll`}>
              <h2 className={styles.heading}>
                Rejoignez la communauté <em>OncoDigest</em>.
              </h2>
              <p className={styles.subtext}>
                Accédez aux articles, rapports de congrès et vidéos exclusives.
              </p>
            </div>

            <div className={`${styles.formWrap} animate-on-scroll delay-2`}>
              {submitted ? (
                <div className={styles.success} role="status" aria-live="polite">
                  <h3>Compte créé&nbsp;!</h3>
                  <p>
                    Vérifiez votre email pour confirmer votre adresse. Notre équipe
                    examinera votre demande.
                  </p>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className={styles.row}>
                    <Field id="cta-nom" label="Nom" placeholder="Votre nom" autoComplete="family-name" error={errors.nom?.message} {...register('nom')} />
                    <Field id="cta-prenom" label="Prénom" placeholder="Votre prénom" autoComplete="given-name" error={errors.prenom?.message} {...register('prenom')} />
                  </div>
                  <Field id="cta-email" label="Adresse email" type="email" placeholder="votre@email.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
                  <SelectField id="cta-profession" label="Profession" error={errors.profession?.message} {...register('profession')}>
                    <option value="" disabled>
                      Sélectionnez votre profession
                    </option>
                    <option value="chirurgien">Chirurgien</option>
                    <option value="oncologue">Oncologue</option>
                    <option value="gastro-enterologue">Gastro-entérologue</option>
                    <option value="interne">Interne</option>
                    <option value="autre">Autre</option>
                  </SelectField>
                  <div className={styles.row}>
                    <Field id="cta-specialite" label="Spécialité" placeholder="Votre spécialité" error={errors.specialite?.message} {...register('specialite')} />
                    <Field id="cta-ville" label="Ville" placeholder="Votre ville" autoComplete="address-level2" error={errors.ville?.message} {...register('ville')} />
                  </div>

                  <Field id="cta-password" label="Mot de passe" type="password" placeholder="8 caractères minimum" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
                  <Field id="cta-passwordConfirm" label="Confirmer le mot de passe" type="password" placeholder="Confirmez votre mot de passe" autoComplete="new-password" error={errors.passwordConfirm?.message} {...register('passwordConfirm')} />

                  {formError ? (
                    <p className={styles.formError} role="alert">{formError}</p>
                  ) : null}

                  <button type="submit" className={styles.submit} disabled={isSubmitting}>
                    {isSubmitting ? 'Création…' : 'Créer mon compte'}
                  </button>
                  <p className={styles.terms}>
                    En vous inscrivant, vous acceptez nos{' '}
                    <Link href="/mentions-legales">conditions d&apos;utilisation</Link>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FieldBaseProps {
  label: string;
  error?: string;
  id: string;
}

const Field = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'> & FieldBaseProps>(
  function Field({ label, error, id, ...rest }, ref) {
    return (
      <div className={`${styles.field} ${error ? styles.fieldHasError : ''}`}>
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...rest} />
        {error ? <span className={styles.fieldError} role="alert">{error}</span> : null}
      </div>
    );
  },
);

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
      {error ? <span className={styles.fieldError} role="alert">{error}</span> : null}
    </div>
  );
});
