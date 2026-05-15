// Hero Component
// Landing section with title and description

export const Hero = () => {
  return (
    <div className="hero-section">
      <h1 style={{
        fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
        fontWeight: '700',
        letterSpacing: '-0.02em',
        marginBottom: '1rem',
        color: '#141413',
      }}>
        AI Meeting Intelligence
      </h1>
      <p style={{
        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
        color: '#B0AEA5',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: '1.6',
      }}>
        Turn messy discussions into structured action.
      </p>
      <p style={{
        fontSize: '0.95rem',
        color: '#B0AEA5',
        marginTop: '1.5rem',
      }}>
        Powered by advanced AI ✨
      </p>
    </div>
  );
};
