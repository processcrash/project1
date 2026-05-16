import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Simulated database - replace with real DB
const users: Map<string, { id: string; email: string; password: string; name: string; createdAt: Date }> = new Map();

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export const authService = {
  async register(email: string, password: string, name: string) {
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date()
    };
    users.set(user.id, user);

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  async login(email: string, password: string) {
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  generateToken(user: { id: string; email: string }): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      throw new AppError('Invalid token', 401);
    }
  },

  getUserById(userId: string): User | undefined {
    const user = users.get(userId);
    if (!user) return undefined;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
};