import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import styles from './Field.module.css';

interface InputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'className'> {
  label?: string;
  error?: string;
  help?: string;
  /** Visual indicator only — actual required validation comes from the parent form schema. */
  required?: boolean;
  className?: string;
  /** ID is auto-derived from `name` if not given. */
  id?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, help, required, className, id, name, ...rest },
  ref,
) {
  const inputId = id ?? (name ? `field-${name}` : undefined);
  const describedBy = error
    ? `${inputId}-error`
    : help
      ? `${inputId}-help`
      : undefined;

  return (
    <label htmlFor={inputId} className={`${styles.field} ${className ?? ''}`}>
      {label ? (
        <span className={styles.label}>
          {label}
          {required ? <span className={styles.required} aria-hidden>*</span> : null}
        </span>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`${styles.controlBase} ${error ? styles.invalid : ''}`}
        {...rest}
      />
      {error ? (
        <span id={`${inputId}-error`} className={styles.errorText} role="alert">
          {error}
        </span>
      ) : help ? (
        <span id={`${inputId}-help`} className={styles.helpText}>
          {help}
        </span>
      ) : null}
    </label>
  );
});
