// AnalyzeButton Component
// CTA button to trigger analysis

export const AnalyzeButton = ({ onClick, isLoading, disabled }) => {
  return (
    <button
      className="btn btn-primary"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label="Analyze meeting transcript"
    >
      {isLoading ? (
        <>
          <span className="loading-spinner" style={{
            width: '16px',
            height: '16px',
            borderWidth: '2px',
          }}></span>
          Analyzing...
        </>
      ) : (
        <>
          ✨ Analyze Meeting
        </>
      )}
    </button>
  );
};
