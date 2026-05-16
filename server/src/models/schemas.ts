import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  repoUrl: z.string().url().optional(),
  language: z.string().optional()
});

export const reviewRequestSchema = z.object({
  projectId: z.string().uuid(),
  code: z.string().optional(),
  diff: z.string().optional(),
  language: z.string().optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>;