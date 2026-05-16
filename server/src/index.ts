import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { projectRouter } from './routes/project';
import { reviewRouter } from './routes/review';
import { userRouter } from './routes/user';
import { webhookRouter } from './routes/webhook';
import { billingRouter } from './routes/billing';
import { notificationRouter } from './routes/notification';
import { analyticsRouter } from './routes/analytics';
import { docsRouter } from './routes/docs';
import { teamRouter } from './routes/team';
import { errorHandler } from './middleware/errorHandler';
import { sentryMiddleware } from './config/sentry';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Documentation
app.use('/docs', docsRouter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/users', userRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/billing', billingRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/teams', teamRouter);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(sentryMiddleware);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 CodeSentinel API running on port ${PORT}`);
});

export default app;