// ErrorState Component
// Error message display

export const ErrorState = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="error-alert" role="alert">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <strong>❌ Error</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
            {error}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: '#D97757',
              padding: '0.25rem',
              marginLeft: '1rem',
            }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
