import { Router } from 'express';
import { reviewService } from '../services/reviewService';
import { reviewRequestSchema } from '../models/schemas';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

export const reviewRouter = Router();

// All routes require authentication
reviewRouter.use(authenticate);

// Create a new review
reviewRouter.post('/', validateBody(reviewRequestSchema), async (req, res, next) => {
  try {
    const { projectId, code, diff, language } = req.body;
    const review = await reviewService.create(projectId, req.user!.userId, code, diff, language);
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

// Get reviews for a project
reviewRouter.get('/project/:projectId', (req, res, next) => {
  try {
    const reviews = reviewService.getByProjectId(req.params.projectId, req.user!.userId);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

// Get recent reviews for current user
reviewRouter.get('/recent', (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const reviews = reviewService.getRecentByUserId(req.user!.userId, limit);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

// Get a specific review
reviewRouter.get('/:id', (req, res, next) => {
  try {
    const review = reviewService.getById(req.params.id, req.user!.userId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    next(error);
  }
});