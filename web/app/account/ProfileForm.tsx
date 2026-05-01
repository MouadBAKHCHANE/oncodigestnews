'use client';

import { useState, useTransition } from 'react';
import { updateOwnProfile, type ProfileUpdateInput } from './actions';
import styles from './account.module.css';

interface ProfileFormProps {
  initial: ProfileUpdateInput;
  email: string;
}

export function ProfileForm({ initial, email }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileUpdateInput>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileUpdateInput, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof ProfileUpdateInput>(k: K, v: ProfileUpdateInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setErrors({});

    startTransition(async () => {
      const result = await updateOwnProfile(values);
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        if (result.error) setFormError(result.error);
        return;
      }
      setSavedAt(Date.now());
      window.setTimeout(() => setSavedAt(null), 4000);
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="email">Adresse email</label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          aria-readonly
          className={styles.readOnly}
        />
        <span className={styles.hint}>
          Pour changer votre email, contactez-nous à contact@oncodigestnews.com.
        </span>
      </div>

      <div className={styles.field}>
        <label htmlFor="full_name">Nom complet</label>
        <input
          id="full_name"
          type="text"
          value={values.full_name}
          onChange={(e) => update('full_name', e.target.value)}
          aria-invalid={!!errors.full_name}
        />
        {errors.full_name ? (
          <span className={styles.error} role="alert">{errors.full_name}</span>
        ) : null}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="specialty">Spécialité</label>
          <input
            id="specialty"
            type="text"
            value={values.specialty ?? ''}
            onChange={(e) => update('specialty', e.target.value)}
            aria-invalid={!!errors.specialty}
            placeholder="Ex: Oncologie digestive"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="hospital">Ville / Hôpital</label>
          <input
            id="hospital"
            type="text"
            value={values.hospital ?? ''}
            onChange={(e) => update('hospital', e.target.value)}
            aria-invalid={!!errors.hospital}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="rpps_number">Numéro RPPS</label>
        <input
          id="rpps_number"
          type="text"
          inputMode="numeric"
          pattern="\d{11}"
          maxLength={11}
          value={values.rpps_number ?? ''}
          onChange={(e) => update('rpps_number', e.target.value)}
          aria-invalid={!!errors.rpps_number}
          placeholder="11 chiffres"
        />
        {errors.rpps_number ? (
          <span className={styles.error} role="alert">{errors.rpps_number}</span>
        ) : null}
      </div>

      {formError ? (
        <p className={styles.formError} role="alert">{formError}</p>
      ) : null}

      <div className={styles.submitRow}>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {savedAt ? (
          <span className={styles.saved} role="status" aria-live="polite">
            ✓ Enregistré
          </span>
        ) : null}
      </div>
    </form>
  );
}
