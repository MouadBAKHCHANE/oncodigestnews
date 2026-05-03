'use client';

import { useState, useTransition } from 'react';
import { approveUser } from './users/actions';
import styles from './overview.module.css';

export function QuickApproveButton({
  profileId,
  disabled,
}: {
  profileId: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) return <span className={styles.approvedTag}>✓ Approuvé</span>;

  return (
    <>
      <button
        type="button"
        className={styles.approveBtn}
        disabled={disabled || isPending}
        onClick={() => {
          startTransition(async () => {
            const r = await approveUser(profileId);
            if (r.ok) setDone(true);
            else setError(r.error);
          });
        }}
        title={disabled ? 'Vous ne pouvez pas vous approuver vous-même' : 'Approuver ce compte'}
      >
        {isPending ? '…' : 'Approuver'}
      </button>
      {error && <span className={styles.approveError}>{error}</span>}
    </>
  );
}
