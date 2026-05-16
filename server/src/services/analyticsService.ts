import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  event: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

interface PageView {
  path: string;
  count: number;
  lastView: Date;
}

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalReviews: number;
  totalApiCalls: number;
  pageViews: Map<string, PageView>;
  events: AnalyticsEvent[];
}

// In-memory analytics (replace with real DB in production)
const stats: Stats = {
  totalUsers: 0,
  totalProjects: 0,
  totalReviews: 0,
  totalApiCalls: 0,
  pageViews: new Map(),
  events: []
};

export const analyticsService = {
  trackPageView(path: string): void {
    const existing = stats.pageViews.get(path);
    if (existing) {
      existing.count++;
      existing.lastView = new Date();
    } else {
      stats.pageViews.set(path, { path, count: 1, lastView: new Date() });
    }
  },

  trackEvent(event: string, userId?: string, properties?: Record<string, unknown>): void {
    const analyticsEvent: AnalyticsEvent = {
      id: uuidv4(),
      userId,
      event,
      properties,
      timestamp: new Date()
    };
    stats.events.push(analyticsEvent);
    // Keep only last 1000 events
    if (stats.events.length > 1000) {
      stats.events = stats.events.slice(-1000);
    }
  },

  trackUserSignup(userId: string): void {
    stats.totalUsers++;
    this.trackEvent('user_signup', userId);
  },

  trackProjectCreated(userId: string): void {
    stats.totalProjects++;
    this.trackEvent('project_created', userId);
  },

  trackReviewCreated(userId: string): void {
    stats.totalReviews++;
    this.trackEvent('review_created', userId);
  },

  trackApiCall(): void {
    stats.totalApiCalls++;
  },

  getStats() {
    return {
      totalUsers: stats.totalUsers,
      totalProjects: stats.totalProjects,
      totalReviews: stats.totalReviews,
      totalApiCalls: stats.totalApiCalls,
      topPages: Array.from(stats.pageViews.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      recentEvents: stats.events.slice(-50).reverse()
    };
  },

  getUserStats(userId: string) {
    const userEvents = stats.events.filter(e => e.userId === userId);
    return {
      totalReviews: userEvents.filter(e => e.event === 'review_created').length,
      totalProjects: userEvents.filter(e => e.event === 'project_created').length,
      lastActive: userEvents.length > 0 ? userEvents[userEvents.length - 1].timestamp : null
    };
  }
};