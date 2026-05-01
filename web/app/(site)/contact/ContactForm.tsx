'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { contactSchema, type ContactInput } from '@/lib/forms/schemas';
import { submitContact } from './actions';
import styles from './contact.module.css';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nom: '',
      email: '',
      sujet: 'question',
      message: '',
      website: '',
    },
  });

  async function onSubmit(values: ContactInput) {
    setFormError(null);
    const result = await submitContact(values);
    if (result.ok) {
      setSubmitted(true);
      return;
    }
    if (result.fieldErrors) {
      for (const [field, msg] of Object.entries(result.fieldErrors)) {
        if (!msg) continue;
        setError(field as keyof ContactInput, { type: 'server', message: msg });
      }
    }
    setFormError(
      result.formError ?? 'Une erreur est survenue. Vérifiez votre connexion et réessayez.',
    );
  }

  if (submitted) {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        Message envoyé. Nous vous répondrons dans les plus brefs délais.
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Nom"
        placeholder="Votre nom"
        autoComplete="name"
        required
        error={errors.nom?.message}
        {...register('nom')}
      />
      <Input
        label="Adresse email"
        type="email"
        placeholder="votre@email.com"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <Select
        label="Sujet"
        required
        error={errors.sujet?.message}
        {...register('sujet')}
      >
        <option value="question">Question générale</option>
        <option value="article">Proposition d&apos;article</option>
        <option value="partenariat">Partenariat</option>
        <option value="erreur">Signaler une erreur</option>
        <option value="autre">Autre</option>
      </Select>
      <Textarea
        label="Message"
        placeholder="Votre message..."
        rows={6}
        required
        error={errors.message?.message}
        {...register('message')}
      />

      {/* Honeypot — hidden from real users + screen readers */}
      <div aria-hidden style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
        <label>
          Website (do not fill in)
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  );
}
