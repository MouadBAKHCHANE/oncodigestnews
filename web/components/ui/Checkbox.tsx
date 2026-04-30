import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import styles from './Field.module.css';

interface CheckboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'className' | 'children'> {
  /** The visible label sitting next to the checkbox. */
  label: ReactNode;
  error?: string;
  className?: string;
  id?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, className, id, name, ...rest },
  ref,
) {
  const inputId = id ?? (name ? `cb-${name}` : undefined);
  return (
    <div className={className}>
      <label htmlFor={inputId} className={styles.checkbox}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          name={name}
          className={styles.checkboxInput}
          aria-invalid={!!error}
          {...rest}
        />
        <span className={styles.checkboxBox} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span>{label}</span>
      </label>
      {error ? (
        <span className={styles.errorText} role="alert" style={{ marginTop: 6, display: 'block' }}>
          {error}
        </span>
      ) : null}
    </div>
  );
});
