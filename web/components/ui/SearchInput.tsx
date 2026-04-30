'use client';

import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'className'> {
  className?: string;
  /** Visual label hidden from view but read by screen readers. */
  ariaLabel?: string;
}

/**
 * Standalone search input with a leading magnifying-glass icon.
 *
 * Verbatim from .search_input + .search_icon in actualites.html (633-666).
 * Pure presentation; the parent owns state + filtering logic.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, ariaLabel = 'Rechercher', placeholder = 'Rechercher...', ...rest },
  ref,
) {
  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={styles.input}
        {...rest}
      />
    </div>
  );
});
