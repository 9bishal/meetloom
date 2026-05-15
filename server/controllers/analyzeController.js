// Analyze Controller
// Handles API requests for meeting analysis

import grokService from '../services/grokService.js';

/**
 * POST /api/analyze
 * Analyzes a meeting transcript and returns structured insights
 */
export const analyzeTranscript = async (req, res) => {
  try {
    const { transcript } = req.body;

    // Validate transcript
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required and must be non-empty',
      });
    }

    // Limit transcript length to prevent API abuse
    const maxLength = 50000; // ~10,000 words
    if (transcript.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: `Transcript is too long. Maximum length is ${maxLength} characters.`,
      });
    }

    console.log(`📊 Analyzing transcript (${transcript.length} characters)...`);

    // Call Grok service to analyze meeting
    const analysis = await grokService.analyzeMeeting(transcript);

    // Validate response structure
    if (!analysis.summary || !Array.isArray(analysis.tasks)) {
      throw new Error('Invalid analysis response structure');
    }

    console.log(`✅ Analysis complete. Found ${analysis.tasks.length} tasks.`);

    // Return successful response
    return res.status(200).json({
      success: true,
      data: analysis,
    });

  } catch (error) {
    // Log error for debugging
    console.error('❌ Analysis error:', error.message);

    // Return error response
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to analyze transcript',
    });
  }
};

/**
 * GET /api/health
 * Health check endpoint
 */
export const healthCheck = async (req, res) => {
  try {
    const isHealthy = await grokService.healthCheck();

    if (isHealthy) {
      return res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(503).json({
        success: false,
        message: 'AI service unavailable',
      });
    }
  } catch (error) {
    return res.status(503).json({
      success: false,
      error: 'Health check failed',
    });
  }
};
