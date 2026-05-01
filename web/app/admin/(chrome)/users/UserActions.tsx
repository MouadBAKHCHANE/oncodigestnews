'use client';

import { useState, useTransition } from 'react';
import { approveUser, revokeUser, resetToPending } from './actions';
import styles from './users.module.css';

interface UserActionsProps {
  profileId: string;
  status: 'pending' | 'approved' | 'revoked';
  isCurrentUser: boolean;
  isAdmin: boolean;
}

export function UserActions({
  profileId,
  status,
  isCurrentUser,
  isAdmin,
}: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<'revoke' | null>(null);
  const [reason, setReason] = useState('');

  if (isCurrentUser) {
    return <span className={styles.placeholder}>(vous)</span>;
  }

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? 'Une erreur est survenue.');
    });
  }

  if (confirming === 'revoke') {
    return (
      <div className={styles.confirmBox}>
        <input
          type="text"
          className={styles.reasonInput}
          placeholder="Raison (optionnelle)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isPending}
          autoFocus
        />
        <div className={styles.actionRow}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            disabled={isPending}
            onClick={() =>
              run(async () => {
                const r = await revokeUser(profileId, reason || undefined);
                if (r.ok) setConfirming(null);
                return r;
              })
            }
          >
            {isPending ? '…' : 'Confirmer'}
          </button>
          <button
            type="button"
            className={styles.actionBtnGhost}
            onClick={() => {
              setConfirming(null);
              setReason('');
              setError(null);
            }}
            disabled={isPending}
          >
            Annuler
          </button>
        </div>
        {error ? <span className={styles.actionError}>{error}</span> : null}
      </div>
    );
  }

  return (
    <div className={styles.actionRow}>
      {status === 'pending' ? (
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          disabled={isPending}
          onClick={() => run(() => approveUser(profileId))}
        >
          {isPending ? '…' : 'Approuver'}
        </button>
      ) : null}

      {status === 'approved' && !isAdmin ? (
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnGhost}`}
          disabled={isPending}
          onClick={() => setConfirming('revoke')}
        >
          Révoquer
        </button>
      ) : null}

      {status === 'revoked' ? (
        <>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            disabled={isPending}
            onClick={() => run(() => approveUser(profileId))}
          >
            {isPending ? '…' : 'Réactiver'}
          </button>
          <button
            type="button"
            className={styles.actionBtnGhost}
            disabled={isPending}
            onClick={() => run(() => resetToPending(profileId))}
          >
            Re-mettre en attente
          </button>
        </>
      ) : null}

      {error ? <span className={styles.actionError}>{error}</span> : null}
    </div>
  );
}
