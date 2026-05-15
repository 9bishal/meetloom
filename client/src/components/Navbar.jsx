// Navbar Component
// Top navigation bar with branding

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="section" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#D97757',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.25rem',
          }}>
             ✨
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
            MeetLoom
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#B0AEA5' }}>
          AI Meeting Intelligence
        </p>
      </div>
    </nav>
  );
};
