// API Service Client
// Handles all communication with the MeetLoom backend

import axios from 'axios';

const FALLBACK_PROD_API_URL = 'https://meetloom.onrender.com';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) return envUrl.trim();

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost =
      host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
    return isLocalHost ? 'http://localhost:5001' : FALLBACK_PROD_API_URL;
  }

  return FALLBACK_PROD_API_URL;
};

// Configure API base URL from environment or resilient fallback
const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Analyzes a meeting transcript
 * @param {string} transcript - The meeting transcript to analyze
 * @returns {Promise} Response with summary and tasks
 */
export const analyzeTranscript = async (transcript) => {
  try {
    // Validate input
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      throw new Error('Transcript cannot be empty');
    }

    // Send request to backend
    const response = await apiClient.post('/api/analyze', {
      transcript: transcript.trim(),
    });

    // Check for successful response
    if (!response.data.success) {
      throw new Error(response.data.error || 'Analysis failed');
    }

    return response.data.data;
  } catch (error) {
    if (error.request && !error.response) {
      // Try waking backend once, then retry analysis request.
      const ready = await waitForBackendReady(10, 3000);
      if (ready) {
        const retryResponse = await apiClient.post('/api/analyze', {
          transcript: transcript.trim(),
        });

        if (!retryResponse.data.success) {
          throw new Error(retryResponse.data.error || 'Analysis failed');
        }

        return retryResponse.data.data;
      }
    }

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.error || 'Failed to analyze transcript');
    } else if (error.request) {
      // Request was made but no response
      throw new Error('No response from backend. It may be cold-starting on Render. Please retry in a few seconds.');
    } else {
      // Error in request setup
      throw error;
    }
  }
};

/**
 * Health check - verifies backend is running
 * @returns {Promise<boolean>} Whether backend is healthy
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/api/health');
    return response.data.success === true;
  } catch {
    return false;
  }
};

/**
 * Waits for backend readiness (useful for Render free-tier cold starts)
 * @param {number} retries - Number of health-check attempts
 * @param {number} delayMs - Delay between attempts
 * @returns {Promise<boolean>} Backend readiness status
 */
export const waitForBackendReady = async (retries = 8, delayMs = 3000) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const healthy = await healthCheck();
    if (healthy) return true;

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
};

export default apiClient;
