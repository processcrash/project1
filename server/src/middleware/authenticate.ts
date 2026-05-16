import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/authService';
import { projectService } from '../services/projectService';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      project?: ReturnType<typeof projectService.getById>;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new Error('Authentication required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
};

export const authenticateApiKey = (req: Request, _res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return next(new Error('API key required'));
  }

  const project = projectService.validateApiKey(apiKey);
  if (!project) {
    return next(new Error('Invalid API key'));
  }

  req.project = project;
  next();
};