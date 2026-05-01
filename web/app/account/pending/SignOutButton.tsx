'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './pending.module.css';

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/connexion');
    router.refresh();
  }

  return (
    <button
      type="button"
      className={styles.signOut}
      onClick={handleSignOut}
      disabled={pending}
    >
      {pending ? 'Déconnexion…' : 'Se déconnecter'}
    </button>
  );
}
