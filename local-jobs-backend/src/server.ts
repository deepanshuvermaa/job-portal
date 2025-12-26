import app from './app';
import { config } from './config/env';

const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   🚀 Job Platform API Server Running                 ║
    ║                                                       ║
    ║   Environment: ${config.NODE_ENV.padEnd(37)}║
    ║   Port:        ${String(PORT).padEnd(37)}║
    ║   URL:         http://localhost:${PORT.toString().padEnd(24)}║
    ║                                                       ║
    ║   API Docs:    http://localhost:${PORT}/health${' '.repeat(16)}║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
