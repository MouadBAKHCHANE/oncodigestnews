'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './account.module.css';

export function SignOutInline() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} disabled={pending} className={styles.signOut}>
      {pending ? 'Déconnexion…' : 'Se déconnecter'}
    </button>
  );
}
