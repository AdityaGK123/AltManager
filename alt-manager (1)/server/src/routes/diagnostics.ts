import express from 'express';
import {
  getDiagnosticsSummary,
  getMomentDiagnostics,
  analyzeMomentPerformance,
  getHealthMetrics,
  cleanOldDiagnostics,
} from '../services/diagnostics.service.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get diagnostics summary for all moments
 * GET /api/diagnostics/moments
 */
router.get('/moments', async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const summary = await getDiagnosticsSummary(limit);
    
    res.json({
      status: 'ok',
      summary,
      count: summary.length,
    });
  } catch (error: any) {
    console.error('[Diagnostics] Get moments summary error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch diagnostics summary',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Get diagnostics for a specific moment
 * GET /api/diagnostics/moments/:slug
 */
router.get('/moments/:slug', async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const diagnostics = await getMomentDiagnostics(slug, limit);
    
    res.json({
      status: 'ok',
      slug,
      diagnostics,
      count: diagnostics.length,
    });
  } catch (error: any) {
    console.error('[Diagnostics] Get moment diagnostics error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch moment diagnostics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Get performance analysis and recommendations
 * GET /api/diagnostics/analysis
 */
router.get('/analysis', async (req: AuthRequest, res) => {
  try {
    const analysis = await analyzeMomentPerformance();
    
    res.json({
      status: 'ok',
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Diagnostics] Get analysis error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to analyze performance',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Get real-time health metrics
 * GET /api/diagnostics/health
 */
router.get('/health', async (req: AuthRequest, res) => {
  try {
    const metrics = await getHealthMetrics();
    
    res.json({
      status: 'ok',
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Diagnostics] Get health metrics error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch health metrics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Clean old diagnostic logs
 * DELETE /api/diagnostics/clean
 */
router.delete('/clean', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Only allow admins to clean logs
    const deleted = await cleanOldDiagnostics();
    
    res.json({
      status: 'ok',
      message: `Cleaned ${deleted} old diagnostic entries`,
      deleted,
    });
  } catch (error: any) {
    console.error('[Diagnostics] Clean diagnostics error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to clean diagnostics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
