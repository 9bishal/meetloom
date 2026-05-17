// MeetLoom - AI Meeting Intelligence App
// Main application component

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navbar,
  Hero,
  TranscriptInput,
  AnalyzeButton,
  LoadingState,
  ErrorState,
  SummaryCard,
  TaskList,
} from './components/index.js';
import { analyzeTranscript, healthCheck, waitForBackendReady } from './services/api.js';
import './App.css';

function App() {
  // State management
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [serverHealthy, setServerHealthy] = useState(false);
  const [isWakingBackend, setIsWakingBackend] = useState(false);

  // Check server health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await healthCheck();
      setServerHealthy(healthy);
      if (healthy && error === 'Waking up backend server... this can take up to 30 seconds on Render.') {
        setError(null);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  /**
   * Handles form submission and API call to analyze transcript
   */
  const handleAnalyze = async () => {
    // Clear previous errors
    setError(null);
    setAnalysis(null);

    // Validate input
    if (!transcript.trim()) {
      setError('Please paste a meeting transcript first.');
      return;
    }

    if (transcript.length < 50) {
      setError('Transcript is too short. Please provide more content.');
      return;
    }

    // Start loading
    setIsLoading(true);

    try {
      // Wake backend if it is sleeping (Render cold start)
      if (!serverHealthy) {
        setIsWakingBackend(true);
        setError('Waking up backend server... this can take up to 30 seconds on Render.');
        const ready = await waitForBackendReady();
        setIsWakingBackend(false);
        setServerHealthy(ready);

        if (!ready) {
          throw new Error('Backend is still starting. Please retry in a few seconds.');
        }
      }

      // Call API to analyze transcript
      const result = await analyzeTranscript(transcript);

      // Update state with results
      setAnalysis(result);
      setServerHealthy(true);
      setError(null);
    } catch (err) {
      // Handle errors
      setError(err.message || 'Failed to analyze transcript. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      // Stop loading
      setIsLoading(false);
    }
  };

  /**
   * Handles clearing the form and results
   */
  const handleClear = () => {
    setTranscript('');
    setAnalysis(null);
    setError(null);
  };

  /**
   * Handles dismissing errors
   */
  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <Hero />

        {/* Input Section */}
        <div className="section">
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ErrorState error={error} onDismiss={handleDismissError} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript Input */}
          <TranscriptInput transcript={transcript} setTranscript={setTranscript} />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <AnalyzeButton
              onClick={handleAnalyze}
              isLoading={isLoading}
              disabled={!transcript.trim() || isWakingBackend}
            />
            {(transcript || analysis) && (
              <button
                className="btn"
                onClick={handleClear}
                id="clear-btn"
              >
                Clear
              </button>
            )}
          </div>

          {/* Server Status Indicator */}
          {!serverHealthy && !isLoading && (
            <p className="server-status">
              ⚠️ Backend is sleeping. Click Analyze once to wake it up.
            </p>
          )}
          {isWakingBackend && (
            <p className="server-status">
              ⏳ Waking backend on Render...
            </p>
          )}
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {analysis && !isLoading && (
            <motion.div
              className="section results-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Summary */}
              <SummaryCard summary={analysis.summary} />

              {/* Task List */}
              <TaskList tasks={analysis.tasks} />

              {/* Export Hint */}
              <div className="tip-box">
                <p style={{ margin: 0 }}>
                  💡 Tip: Click the copy button on any card to copy the content to your clipboard.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!analysis && !isLoading && transcript && (
          <div className="empty-hint">
            <p style={{ fontSize: '3rem' }}>📝</p>
            <p style={{ margin: '0.5rem 0', fontSize: '1.1rem', fontWeight: '500' }}>
              Ready to analyze?
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Click the button above to get started
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p style={{ margin: 0 }}>
          MeetLoom v1.0 • Powered by AI • <a href="#" style={{ color: '#D97757', textDecoration: 'none' }}>Learn More</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
