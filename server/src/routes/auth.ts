import { Router } from 'express';
import { authService } from '../services/authService';
import { registerSchema, loginSchema } from '../models/schemas';
import { validateBody } from '../middleware/validate';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const payload = authService.verifyToken(token);
    const user = authService.getUserById(payload.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});