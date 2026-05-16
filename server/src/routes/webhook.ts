import { Router } from 'express';
import { reviewService } from '../services/reviewService';
import { authenticateApiKey } from '../middleware/authenticate';

export const webhookRouter = Router();

// GitHub webhook endpoint (authenticates via API key)
webhookRouter.post('/github', authenticateApiKey, async (req, res, next) => {
  try {
    const project = req.project!;

    // Handle GitHub webhook payload
    const payload = req.body;
    const action = payload.action;
    const pullRequest = payload.pull_request;

    if (action === 'opened' || action === 'synchronize' || action === 'reopened') {
      if (pullRequest && pullRequest.diff_url) {
        // Create review from PR diff
        const diffResponse = await fetch(pullRequest.diff_url);
        const diff = await diffResponse.text();

        await reviewService.create(
          project.id,
          project.userId,
          undefined,
          diff,
          detectLanguageFromPath(pullRequest.head?.ref || '')
        );

        res.json({ message: 'Review started', status: 'pending' });
      } else {
        res.json({ message: 'No diff available' });
      }
    } else {
      res.json({ message: 'Action not relevant for review' });
    }
  } catch (error) {
    next(error);
  }
});

function detectLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    cpp: 'cpp',
    rb: 'ruby',
    php: 'php'
  };
  return languageMap[ext] || 'javascript';
}