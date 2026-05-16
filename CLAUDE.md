# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CodeSentinel** is an AI-powered code review SaaS platform using React + Express + TypeScript. It analyzes code via GPT-4/Claude to detect bugs, security vulnerabilities, and provide improvement suggestions.

## Commands

### Development
```bash
# Server (port 3001)
cd server && npm run dev

# Client (port 5173)
cd client && npm run dev

# Build client for production
cd client && npm run build
```

### Testing
```bash
cd server && npm test
```

## Architecture

### Backend (`server/`)
- Express + TypeScript API server
- **Routes**: `/api/auth`, `/api/projects`, `/api/reviews`, `/api/users`, `/api/webhooks`, `/api/billing`, `/api/notifications`, `/api/analytics`, `/api/teams`
- **Services**: AI integration (OpenAI/Anthropic), auth, project management, review processing, billing (Stripe), Slack notifications, analytics
- **Middleware**: JWT authentication, validation (Zod), rate limiting, error handling, Sentry monitoring
- **In-memory storage** for development; PostgreSQL (pg) for production

### Frontend (`client/`)
- React 18 + TypeScript + Vite + TailwindCSS
- **Pages**: Landing, Login, Register, Dashboard, ProjectDetail, ProjectSettings, Billing, Status
- **Components**: Layout, NotificationBell
- **API**: Axios calls to `/api/*` endpoints with JWT auth

### Key Files
- `server/src/index.ts` - Express app entry point
- `server/src/services/codeReviewService.ts` - AI code analysis logic
- `server/src/services/authService.ts` - JWT authentication
- `client/src/App.tsx` - React router setup
- `client/src/contexts/AuthContext.tsx` - Authentication state

## Environment Variables

Create `server/.env` from `server/.env.example`:
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` - AI services
- `JWT_SECRET` - Token signing
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` - Billing
- `SLACK_BOT_TOKEN` - Notifications

## Git Workflow

Push code directly with `git push` - GitHub credentials are configured.