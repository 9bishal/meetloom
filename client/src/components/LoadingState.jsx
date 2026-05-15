// LoadingState Component
// Animated loading indicator

import { useState, useEffect } from 'react';

export const LoadingState = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      gap: '1rem',
    }}>
      <div className="loading-spinner"></div>
      <p style={{
        color: '#B0AEA5',
        fontSize: '1rem',
        margin: 0,
      }}>
        Analyzing your meeting{dots}
      </p>
      <p style={{
        color: '#E8E6DC',
        fontSize: '0.85rem',
        margin: 0,
      }}>
        This may take a moment
      </p>
    </div>
  );
};
