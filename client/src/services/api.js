// API Service Client
// Handles all communication with the MeetLoom backend

import axios from 'axios';

// Configure API base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.error || 'Failed to analyze transcript');
    } else if (error.request) {
      // Request was made but no response
      throw new Error('No response from server. Is it running?');
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

export default apiClient;
