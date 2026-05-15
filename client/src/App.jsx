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
import { analyzeTranscript, healthCheck } from './services/api.js';
import './App.css';

function App() {
  // State management
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [serverHealthy, setServerHealthy] = useState(false);

  // Check server health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await healthCheck();
      setServerHealthy(healthy);
      if (!healthy) {
        setError('Backend server is not responding. Make sure it\'s running on port 5001.');
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
      // Call API to analyze transcript
      const result = await analyzeTranscript(transcript);

      // Update state with results
      setAnalysis(result);
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
              disabled={!serverHealthy || !transcript.trim()}
            />
            {(transcript || analysis) && (
              <button
                className="btn"
                onClick={handleClear}
                style={{
                  background: '#E8E6DC',
                  color: '#141413',
                  border: 'none',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Server Status Indicator */}
          {!serverHealthy && (
            <p style={{
              marginTop: '1rem',
              fontSize: '0.85rem',
              color: '#D97757',
              textAlign: 'center',
            }}>
              ⚠️ Backend server is not responding
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
              <div style={{
                marginTop: '3rem',
                padding: '2rem',
                backgroundColor: '#FAF9F5',
                borderRadius: '1rem',
                textAlign: 'center',
                color: '#B0AEA5',
                fontSize: '0.9rem',
              }}>
                <p style={{ margin: 0 }}>
                  💡 Tip: Click the copy button on any card to copy the content to your clipboard.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!analysis && !isLoading && transcript && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '2rem',
            color: '#B0AEA5',
            textAlign: 'center',
          }}>
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
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid #E8E6DC',
        backgroundColor: 'rgba(250, 249, 245, 0.5)',
        fontSize: '0.85rem',
        color: '#B0AEA5',
      }}>
        <p style={{ margin: 0 }}>
          MeetLoom v1.0 • Powered by AI • <a href="#" style={{ color: '#D97757', textDecoration: 'none' }}>Learn More</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
