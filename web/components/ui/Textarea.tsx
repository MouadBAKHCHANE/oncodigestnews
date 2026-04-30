import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import styles from './Field.module.css';

interface TextareaProps extends Omit<ComponentPropsWithoutRef<'textarea'>, 'className'> {
  label?: string;
  error?: string;
  help?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
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
      <textarea
        ref={ref}
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`${styles.controlBase} ${styles.textarea} ${error ? styles.invalid : ''}`}
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
