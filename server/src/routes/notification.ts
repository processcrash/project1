import { Router } from 'express';
import { notificationService } from '../services/notificationService';
import { authenticate } from '../middleware/authenticate';

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/', (req, res) => {
  const notifications = notificationService.getForUser(req.user!.userId);
  res.json(notifications);
});

notificationRouter.get('/unread-count', (req, res) => {
  const count = notificationService.getUnreadCount(req.user!.userId);
  res.json({ count });
});

notificationRouter.patch('/:id/read', (req, res) => {
  notificationService.markAsRead(req.user!.userId, req.params.id);
  res.json({ success: true });
});

notificationRouter.patch('/read-all', (req, res) => {
  notificationService.markAllAsRead(req.user!.userId);
  res.json({ success: true });
});

notificationRouter.delete('/:id', (req, res) => {
  notificationService.delete(req.user!.userId, req.params.id);
  res.json({ success: true });
});