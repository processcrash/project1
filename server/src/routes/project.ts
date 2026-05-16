import { Router } from 'express';
import { projectService } from '../services/projectService';
import { projectSchema } from '../models/schemas';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

export const projectRouter = Router();

// All routes require authentication
projectRouter.use(authenticate);

projectRouter.post('/', validateBody(projectSchema), (req, res, next) => {
  try {
    const { name, description, repoUrl, language } = req.body;
    const project = projectService.create(req.user!.userId, name, description, repoUrl, language);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

projectRouter.get('/', (req, res, next) => {
  try {
    const projects = projectService.getByUserId(req.user!.userId);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

projectRouter.get('/:id', (req, res, next) => {
  try {
    const project = projectService.getById(req.params.id, req.user!.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

projectRouter.patch('/:id', validateBody(projectSchema.partial()), (req, res, next) => {
  try {
    const project = projectService.update(req.params.id, req.user!.userId, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

projectRouter.delete('/:id', (req, res, next) => {
  try {
    const deleted = projectService.delete(req.params.id, req.user!.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

projectRouter.post('/:id/regenerate-key', (req, res, next) => {
  try {
    const project = projectService.regenerateApiKey(req.params.id, req.user!.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ apiKey: project.apiKey });
  } catch (error) {
    next(error);
  }
});