// TranscriptInput Component
// Textarea for users to paste meeting transcripts

export const TranscriptInput = ({ transcript, setTranscript, placeholder = "Paste your meeting transcript here..." }) => {
  return (
    <div className="input-container">
      <label htmlFor="transcript" style={{
        display: 'block',
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#141413',
        marginBottom: '0.5rem',
      }}>
        📝 Meeting Transcript
      </label>
      <textarea
        id="transcript"
        className="transcript-input"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder={placeholder}
      />
      <p style={{
        fontSize: '0.85rem',
        color: '#B0AEA5',
        margin: '0.5rem 0 0',
      }}>
        {transcript.length} characters
      </p>
    </div>
  );
};
