# CodeSentinel - AI-Powered Code Review Platform

<div align="center">
  <img src="https://img.shields.io/badge/AI-Code%20Review-0ea5e9?style=for-the-badge" alt="AI Code Review">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178c6?style=for-the-badge" alt="TypeScript">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome">
  <a href="https://twitter.com/codesentinelai">
    <img src="https://img.shields.io/badge/Twitter-Follow-blue?style=for-the-badge" alt="Follow @codesentinelai">
  </a>
</div>

## Overview

**CodeSentinel** is an AI-powered code review platform that leverages GPT-4 and Claude AI to automatically analyze code, detect bugs, security vulnerabilities, and provide actionable improvement suggestions.

> 🚀 **Live at [codesentinel.ai](https://codesentinel.ai)** - Start free with 100 reviews/month!

## Why CodeSentinel?

- ⚡ **10x Faster Reviews** - Get detailed feedback in seconds, not hours
- 🔒 **Catch Security Issues** - Find SQL injection, XSS, auth bypasses before production
- 📊 **Quality Metrics** - Track code quality trends over time
- 🔄 **GitHub Integration** - Automatic PR reviews with inline comments
- 👥 **Team Collaboration** - Invite members, track team metrics
- 💰 **Freemium Model** - Start free, scale as you grow

## Features

- **AI-Powered Analysis**: Utilizes GPT-4 and Claude AI for comprehensive code review
- **Multi-Language Support**: JavaScript, TypeScript, Python, Go, Rust, Java, C++, and more
- **Security Scanning**: Automatic detection of security vulnerabilities
- **GitHub Integration**: Webhook support for automated PR reviews + GitHub Actions
- **Quality Scoring**: 1-10 code quality scores with detailed breakdowns
- **Issue Tracking**: Categorized issues (Critical, High, Medium, Low)
- **Team Collaboration**: Invite team members and track team metrics
- **Slack Notifications**: Get review results delivered to your Slack channels
- **Billing**: Subscription tiers (Free/Pro $15/Team $49) with Stripe integration
- **RESTful API**: Easy integration with CI/CD pipelines
- **Dark Mode**: Built-in dark mode support

## Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Database**: PostgreSQL (production) / In-memory (development)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (optional)
- Anthropic API key (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/processcrash/project1.git
cd project1
```

2. Install server dependencies
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your API keys
```

3. Install client dependencies
```bash
cd ../client
npm install
```

### Running Development

1. Start the server
```bash
cd server
npm run dev
```

2. Start the client (in another terminal)
```bash
cd client
npm run dev
```

3. Open http://localhost:5173

## Environment Variables

### Server (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/codesentinel
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
CLIENT_URL=http://localhost:5173

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Slack (optional)
SLACK_BOT_TOKEN=xoxb-xxx
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/regenerate-key` - Regenerate API key

### Reviews
- `POST /api/reviews` - Submit code for review
- `GET /api/reviews/:id` - Get review result
- `GET /api/reviews/project/:projectId` - Get project reviews
- `GET /api/reviews/recent` - Get recent reviews

### Webhooks
- `POST /api/webhooks/github` - GitHub webhook endpoint

## Usage Example

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create Project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Project","description":"Test project"}'

# Submit Code Review
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"projectId":"PROJECT_ID","code":"const x = 1;","language":"javascript"}'
```

## Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

### Quick Deploy

**Backend (Railway)**

1. Connect your GitHub repository
2. Set environment variables (see .env.production)
3. Deploy

### Frontend (Vercel)

1. Import project from GitHub
2. Set environment variables
3. Deploy

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.