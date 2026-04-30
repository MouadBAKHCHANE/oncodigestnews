'use client';

import styles from './FilterPills.module.css';

export interface FilterPill<T extends string = string> {
  value: T;
  label: string;
}

interface FilterPillsProps<T extends string = string> {
  pills: FilterPill<T>[];
  /** Currently active value. */
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Horizontal row of pill-shaped filter buttons. Active pill uses the
 * btn-dark visual variant; inactive uses btn-text.
 *
 * Verbatim from actualites.html .filter_pills (667-677) + the active/inactive
 * btn variants. Generic over T so consumers get type-safe filter values.
 */
export function FilterPills<T extends string = string>({
  pills,
  value,
  onChange,
  className,
  ariaLabel = 'Filtres',
}: FilterPillsProps<T>) {
  return (
    <div
      className={`${styles.pills} ${className ?? ''}`}
      role="group"
      aria-label={ariaLabel}
    >
      {pills.map((pill) => {
        const active = pill.value === value;
        return (
          <button
            key={pill.value}
            type="button"
            onClick={() => onChange(pill.value)}
            aria-pressed={active}
            className={`${styles.pill} ${active ? styles.active : styles.inactive}`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
