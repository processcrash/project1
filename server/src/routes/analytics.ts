import { Router } from 'express';
import { analyticsService } from '../services/analyticsService';
import { authenticate } from '../middleware/authenticate';

export const analyticsRouter = Router();

// Public stats (no auth required)
analyticsRouter.get('/stats', (_req, res) => {
  const stats = analyticsService.getStats();
  res.json(stats);
});

// Authenticated user stats
analyticsRouter.get('/me', authenticate, (req, res) => {
  const userStats = analyticsService.getUserStats(req.user!.userId);
  res.json(userStats);
});