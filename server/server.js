import dotenv from 'dotenv';

// Load environment variables BEFORE importing app (which initializes services)
dotenv.config();

const { default: app } = await import('./app.js');


// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const HOST = '0.0.0.0'; // Listen on all interfaces for Azure

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║       🎯 MeetLoom Server Started       ║
╠════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(25)} ║
║ Port: ${String(PORT).padEnd(31)} ║
║ API: http://localhost:${String(PORT).padEnd(18)} ║
╚════════════════════════════════════════╝
  `);

  // Log available endpoints
  console.log('📍 Available Endpoints:');
  console.log(`   GET  /              - Health check`);
  console.log(`   GET  /api/health    - API health check`);
  console.log(`   POST /api/analyze   - Analyze meeting transcript`);
  console.log('');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error.message);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📛 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📛 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;