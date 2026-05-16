import { Router } from 'express';
import { authService, User } from '../services/authService';

export const userRouter = Router();

userRouter.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = authService.verifyToken(token);
    const user = authService.getUserById(payload.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});