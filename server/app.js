// Express App Setup
// Configures Express server with middleware and routes

import express from 'express';
import { corsMiddleware, errorHandler, requestLogger } from './middleware/cors.js';
import analyzeRoutes from './routes/analyzeRoutes.js';

// Initialize Express app
const app = express();

// ====== Middleware ======
// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use(requestLogger);

// CORS configuration
app.use(corsMiddleware);

// ====== Routes ======

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MeetLoom API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      analyze: 'POST /api/analyze',
    },
  });
});

// API routes
app.use('/api', analyzeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;