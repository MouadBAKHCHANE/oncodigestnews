import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import styles from './Field.module.css';

interface SelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'className' | 'children'> {
  label?: string;
  error?: string;
  help?: string;
  required?: boolean;
  className?: string;
  id?: string;
  /** Native <option> children passed in. */
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, help, required, className, id, name, children, ...rest },
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
      <select
        ref={ref}
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`${styles.controlBase} ${styles.select} ${error ? styles.invalid : ''}`}
        {...rest}
      >
        {children}
      </select>
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
