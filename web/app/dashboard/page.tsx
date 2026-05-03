import { redirect } from 'next/navigation';

/**
 * /dashboard is no longer a dedicated page — Pro users experience the
 * regular site with locked content unlocked. The avatar dropdown in the
 * navbar exposes profile actions and the admin shortcut.
 */
export default function DashboardRedirect() {
  redirect('/');
}
