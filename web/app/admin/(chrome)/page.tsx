import { redirect } from 'next/navigation';

/**
 * /admin defaults to the Users tab. (Studio at /admin/studio is the other tab.)
 */
export default function AdminIndex() {
  redirect('/admin/users');
}
