const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🧠  KnowledgeDB v1.0.0                            ║
║                                                      ║
║   Server running on http://localhost:${PORT}            ║
║   Health check:    http://localhost:${PORT}/health      ║
║   Admin login:     POST /admin/login                 ║
║                                                      ║
║   Ready to accept connections.                       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  server.close(() => process.exit(0));
});
