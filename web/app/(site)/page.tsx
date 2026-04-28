/**
 * Homepage stub. Real implementation arrives in Phase 6 (page port).
 * This exists only so the dev server has something to render at "/".
 */
export default function HomePage() {
  return (
    <main style={{ padding: '4rem 2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--cod-gray--900)' }}>
        OncoDigest
      </h1>
      <p style={{ color: 'var(--cod-gray--600)', lineHeight: 1.6 }}>
        Phase 1 scaffold. Site shell, animations, and content port arrive in
        subsequent phases (see <code>docs/MIGRATION.md</code>).
      </p>
      <ul style={{ marginTop: '2rem', listStyle: 'disc', paddingLeft: '1.5rem' }}>
        <li><a href="/admin">Admin (gated)</a></li>
        <li><a href="/admin/studio">Sanity Studio (admin only)</a></li>
        <li><a href="/connexion">Connexion</a></li>
        <li><a href="/inscription">Inscription</a></li>
      </ul>
    </main>
  );
}
