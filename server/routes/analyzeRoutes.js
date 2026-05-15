// API Routes
// Defines endpoints for meeting analysis

import express from 'express';
import { analyzeTranscript, healthCheck } from '../controllers/analyzeController.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Analyzes a meeting transcript
 * Body: { transcript: string }
 */
router.post('/analyze', analyzeTranscript);

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', healthCheck);

export default router;