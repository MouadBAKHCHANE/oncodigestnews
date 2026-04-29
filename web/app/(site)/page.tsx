/**
 * Homepage stub — Phase 3 placeholder.
 * Real hero + sections arrive in Phase 6 (page port).
 */
export default function HomePage() {
  return (
    <section className="padding-global" style={{ minHeight: '60vh', paddingTop: 80, paddingBottom: 80 }}>
      <div
        className="container-large"
        style={{ maxWidth: 720, margin: '0 auto' }}
      >
        <h1
          className="animate-on-scroll"
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontFamily: 'var(--font-display-stack)',
            color: 'var(--cod-gray--900)',
            letterSpacing: '-1.2px',
            lineHeight: 1.05,
            marginBottom: 24,
          }}
        >
          OncoDigest
        </h1>
        <p
          className="animate-on-scroll delay-1"
          style={{ color: 'var(--cod-gray--600)', fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}
        >
          Phase 3 layout shell is now wired. Navbar, footer, page loader, grain overlay,
          and scroll-driven body background are all live. Hero + content sections arrive
          in Phase 6 (see <code>docs/MIGRATION.md</code>).
        </p>
        <ul
          className="animate-on-scroll delay-2"
          style={{ marginTop: 32, listStyle: 'disc', paddingLeft: 24, color: 'var(--cod-gray--600)' }}
        >
          <li>
            <a href="/admin/studio" style={{ color: 'var(--cod-gray--900)' }}>
              Sanity Studio (admin)
            </a>
          </li>
          <li>
            <a href="/admin/users" style={{ color: 'var(--cod-gray--900)' }}>
              Users dashboard
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
