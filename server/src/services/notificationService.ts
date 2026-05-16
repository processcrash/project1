export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const notifications: Map<string, Notification[]> = new Map();

export const notificationService = {
  getForUser(userId: string): Notification[] {
    return notifications.get(userId) || [];
  },

  add(userId: string, notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const userNotifications = this.getForUser(userId);
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date()
    };
    userNotifications.unshift(newNotification);
    notifications.set(userId, userNotifications);
    return newNotification;
  },

  markAsRead(userId: string, notificationId: string): void {
    const userNotifications = this.getForUser(userId);
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  },

  markAllAsRead(userId: string): void {
    const userNotifications = this.getForUser(userId);
    userNotifications.forEach(n => n.read = true);
  },

  delete(userId: string, notificationId: string): void {
    const userNotifications = this.getForUser(userId);
    const index = userNotifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      userNotifications.splice(index, 1);
    }
  },

  getUnreadCount(userId: string): number {
    return this.getForUser(userId).filter(n => !n.read).length;
  },

  // Create notification for review events
  notifyReviewComplete(userId: string, projectName: string, reviewId: string, score: number): void {
    const type = score >= 7 ? 'success' : score >= 5 ? 'warning' : 'error';
    this.add(userId, {
      type,
      title: 'Review Complete',
      message: `Your code in "${projectName}" scored ${score}/10`,
      link: `/reviews/${reviewId}`
    });
  },

  notifyNewIssue(userId: string, projectName: string, severity: string, count: number): void {
    this.add(userId, {
      type: severity === 'critical' || severity === 'high' ? 'error' : 'warning',
      title: `${count} ${severity} issue${count > 1 ? 's' : ''} found`,
      message: `${projectName} has new issues that need attention`,
      link: `/projects/${projectName}`
    });
  }
};