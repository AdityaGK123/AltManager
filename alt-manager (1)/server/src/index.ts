import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { runStartupChecks } from './startup-check.js';
import { startRouteMonitoring } from './utils/routeMonitor.js';
import { requestLogger } from './utils/logger.js';
import { dbHealthCheckMiddleware } from './middleware/dbHealthCheck.js';
import { startPerformanceMonitoring } from './cron/performanceMonitor.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import skillsRoutes from './routes/skills.js';
import goalsRoutes from './routes/goals.js';
import momentsRoutes from './routes/moments.js';
import achievementsRoutes from './routes/achievements.js';
import habitsRoutes from './routes/habits.js';
import analysisRoutes from './routes/analysis.js';
import healthRoutes from './routes/health.js';
import adminRoutes from './routes/admin.js';
import diagnosticsRoutes from './routes/diagnostics.js';
import coachingRoutes from './routes/coaching.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Performance Monitoring Middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.log(`⚠️ Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
    return originalSend.call(this, data);
  };
  
  next();
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Compression middleware - reduces response size by 70-90%
app.use(compression({
  filter: (req: express.Request, res: express.Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balance between speed and compression
  threshold: 1024, // Only compress responses > 1KB
}));

app.use(express.json());

// Centralized request logging
app.use(requestLogger);

// Database health check middleware (auto-recovery)
app.use(dbHealthCheckMiddleware);

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/moments', momentsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api', coachingRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Run startup checks and start server
async function startServer() {
  const checksPass = await runStartupChecks();
  
  if (!checksPass) {
    console.error('❌ Server startup aborted due to failed checks');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    
    // Start route monitoring (checks every 60 seconds)
    if (process.env.ENABLE_ROUTE_MONITORING !== 'false') {
      startRouteMonitoring(60000);
    }
    
    // Start performance monitoring (analyzes every 60 seconds)
    if (process.env.ENABLE_PERFORMANCE_MONITORING !== 'false') {
      startPerformanceMonitoring(60000);
    }
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
