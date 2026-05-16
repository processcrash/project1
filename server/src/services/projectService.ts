import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  repoUrl?: string;
  language?: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simulated database
const projects: Map<string, Project> = new Map();

export const projectService = {
  create(userId: string, name: string, description?: string, repoUrl?: string, language?: string): Project {
    const project: Project = {
      id: uuidv4(),
      userId,
      name,
      description,
      repoUrl,
      language,
      apiKey: this.generateApiKey(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    projects.set(project.id, project);
    return project;
  },

  getById(id: string, userId: string): Project | undefined {
    const project = projects.get(id);
    if (!project || project.userId !== userId) {
      return undefined;
    }
    return project;
  },

  getByUserId(userId: string): Project[] {
    return Array.from(projects.values()).filter(p => p.userId === userId);
  },

  update(id: string, userId: string, updates: Partial<Pick<Project, 'name' | 'description' | 'repoUrl' | 'language'>>): Project | undefined {
    const project = this.getById(id, userId);
    if (!project) return undefined;

    const updated = {
      ...project,
      ...updates,
      updatedAt: new Date()
    };
    projects.set(id, updated);
    return updated;
  },

  delete(id: string, userId: string): boolean {
    const project = this.getById(id, userId);
    if (!project) return false;
    projects.delete(id);
    return true;
  },

  regenerateApiKey(id: string, userId: string): Project | undefined {
    const project = this.getById(id, userId);
    if (!project) return undefined;

    const updated = {
      ...project,
      apiKey: this.generateApiKey(),
      updatedAt: new Date()
    };
    projects.set(id, updated);
    return updated;
  },

  validateApiKey(apiKey: string): Project | undefined {
    return Array.from(projects.values()).find(p => p.apiKey === apiKey);
  },

  generateApiKey(): string {
    return `cs_${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '')}`;
  }
};