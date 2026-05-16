import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { codeReviewService, ReviewResult } from './codeReviewService';

export interface Review {
  id: string;
  projectId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  language?: string;
  result?: ReviewResult;
  code?: string;
  diff?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Simulated database
const reviews: Map<string, Review> = new Map();

export const reviewService = {
  async create(projectId: string, userId: string, code?: string, diff?: string, language?: string): Promise<Review> {
    const review: Review = {
      id: uuidv4(),
      projectId,
      userId,
      status: 'pending',
      language,
      code,
      diff,
      createdAt: new Date()
    };
    reviews.set(review.id, review);

    // Process review asynchronously
    this.processReview(review.id).catch(err => {
      console.error('Review processing failed:', err);
      this.updateStatus(review.id, 'failed');
    });

    return review;
  },

  async processReview(reviewId: string): Promise<void> {
    const review = reviews.get(reviewId);
    if (!review) return;

    this.updateStatus(reviewId, 'processing');

    try {
      let result: ReviewResult;

      if (review.diff) {
        result = await codeReviewService.reviewDiff(review.diff, review.language || 'javascript');
      } else if (review.code) {
        result = await codeReviewService.reviewCode(review.code, review.language || 'javascript');
      } else {
        throw new Error('No code or diff provided');
      }

      review.result = result;
      review.status = 'completed';
      review.completedAt = new Date();
      reviews.set(reviewId, review);
    } catch (error) {
      console.error('Review processing error:', error);
      this.updateStatus(reviewId, 'failed');
    }
  },

  updateStatus(reviewId: string, status: Review['status']): void {
    const review = reviews.get(reviewId);
    if (review) {
      review.status = status;
      reviews.set(reviewId, review);
    }
  },

  getById(id: string, userId: string): Review | undefined {
    const review = reviews.get(id);
    if (!review || review.userId !== userId) {
      return undefined;
    }
    return review;
  },

  getByProjectId(projectId: string, userId: string): Review[] {
    return Array.from(reviews.values())
      .filter(r => r.projectId === projectId && r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getByUserId(userId: string): Review[] {
    return Array.from(reviews.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getRecentByUserId(userId: string, limit: number = 10): Review[] {
    return this.getByUserId(userId).slice(0, limit);
  }
};