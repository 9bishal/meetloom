// SummaryCard Component
// Displays AI-generated meeting summary

import { useState } from 'react';
import { motion } from 'framer-motion';

export const SummaryCard = ({ summary }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      className="card summary-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 1rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#141413',
          }}>
            📋 Meeting Summary
          </h3>
          <p style={{
            margin: 0,
            fontSize: '1rem',
            lineHeight: '1.6',
            color: '#141413',
          }}>
            {summary}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`copy-btn ${copied ? 'copied' : ''}`}
          title="Copy to clipboard"
          aria-label="Copy summary"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </motion.div>
  );
};
