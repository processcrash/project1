# Deployment Guide - CodeSentinel

## Prerequisites
- GitHub account
- Vercel account (frontend)
- Railway account (backend) or Render
- Stripe account (billing)
- OpenAI API key
- Anthropic API key (optional)

## Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `processcrash/project1`
4. Select the `server` folder as the root
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://user:pass@host:5432/db
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   OPENAI_API_KEY=sk-xxx
   ANTHROPIC_API_KEY=sk-ant-xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   CLIENT_URL=https://codesentinel.ai
   ```
6. Railway will auto-detect Node.js and run `npm run build && npm start`
7. Note the deployed URL (e.g., `https://codesentinel-api.up.railway.app`)

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Import `processcrash/project1`
3. Set root directory to `client`
4. Add Environment Variables:
   ```
   CLIENT_URL=https://codesentinel.ai
   VITE_API_URL=https://codesentinel-api.up.railway.app
   ```
5. Click Deploy

## Step 3: Configure Custom Domain (Optional)

### Vercel (Frontend)
1. Go to project settings → Domains
2. Add `codesentinel.ai` and `www.codesentinel.ai`
3. Update DNS records as instructed

### Railway (Backend)
1. Go to project settings → Networking
2. Add custom domain `api.codesentinel.ai`
3. Update DNS records

## Step 4: Set Up Stripe Products

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create two products:
   - **Pro**: $15/month, 1000 reviews, unlimited projects
   - **Team**: $49/month, unlimited reviews, team features
3. Copy Price IDs and add to Railway env:
   ```
   STRIPE_PRO_PRICE_ID=price_xxx
   STRIPE_TEAM_PRICE_ID=price_xxx
   ```

## Step 5: Configure GitHub OAuth (Optional)

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App:
   - Homepage URL: `https://codesentinel.ai`
   - Callback URL: `https://codesentinel.ai/api/auth/callback/github`
3. Add to Railway env:
   ```
   GITHUB_CLIENT_ID=ivxxx
   GITHUB_CLIENT_SECRET=xxx
   ```

## Step 6: Set Up Sentry (Error Tracking)

1. Go to [sentry.io](https://sentry.io) and create account
2. Create new project for Node.js
3. Copy DSN and add to Railway env:
   ```
   SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

## Step 7: DNS Configuration

Add the following DNS records:
```
Type    Name    Value
A       @       [Vercel IP]
CNAME   api     [Railway URL]
CNAME   www     cname.vercel-dns.com
TXT     @       v=spf1 include:sendgrid.net ~all
```

## Verification

After deployment, verify:
1. `https://codesentinel.ai/health` - should return `{"status":"ok"}`
2. `https://codesentinel.ai/docs` - Swagger docs should load
3. `https://codesentinel.ai/status` - Status page should work
4. Create test account and run a code review
5. Check Stripe dashboard for webhook events

## Troubleshooting

### CORS Errors
- Verify `CLIENT_URL` matches exactly (no trailing slash)
- Check Railway logs for request details

### API Not Working
- Check Railway environment variables
- Verify DATABASE_URL is correct
- Check Sentry for errors

### Stripe Webhooks Not Working
- Use Stripe CLI to test webhooks locally:
  ```bash
  stripe listen --forward-to localhost:3001/api/billing/webhook
  ```

## Cost Estimation

- Railway: ~$5/month (512MB RAM, 1 CPU)
- Vercel: Free (hobby tier)
- PostgreSQL: ~$5/month (if using managed DB)
- Domain: ~$10/year
- Total: ~$10-15/month to run