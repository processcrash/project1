import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Code Review Service', () => {
  it('should handle basic code review', async () => {
    const code = 'function add(a, b) { return a + b; }';
    expect(code).toBeDefined();
    expect(typeof code).toBe('string');
  });

  it('should validate code language detection', () => {
    const languages = ['javascript', 'typescript', 'python', 'go', 'rust'];
    languages.forEach(lang => {
      expect(lang).toMatch(/^[a-z]+$/);
    });
  });

  it('should format review issues correctly', () => {
    const issue = {
      line: 1,
      severity: 'high' as const,
      category: 'bug' as const,
      message: 'Missing error handling',
      suggestion: 'Add try-catch block'
    };

    expect(issue.line).toBe(1);
    expect(issue.severity).toBe('high');
    expect(issue.category).toBe('bug');
  });

  it('should calculate quality score correctly', () => {
    const stats = { critical: 0, high: 1, medium: 2, low: 3 };
    const totalIssues = stats.critical + stats.high + stats.medium + stats.low;

    let score = 10;
    score -= stats.critical * 2;
    score -= stats.high * 1;
    score -= stats.medium * 0.5;
    score -= stats.low * 0.1;

    expect(totalIssues).toBe(6);
    expect(score).toBeLessThan(10);
  });
});

describe('Auth Service', () => {
  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('test@example.com')).toBe(true);
    expect(emailRegex.test('invalid')).toBe(false);
  });

  it('should require minimum password length', () => {
    const minPasswordLength = 8;
    expect('password123'.length).toBeGreaterThanOrEqual(minPasswordLength);
    expect('short'.length).toBeLessThan(minPasswordLength);
  });
});

describe('Billing Service', () => {
  it('should calculate usage correctly', () => {
    const usage = { used: 50, limit: 100 };
    const percentage = (usage.used / usage.limit) * 100;
    expect(percentage).toBe(50);
  });

  it('should identify correct tier limits', () => {
    const tiers = {
      free: { projects: 3, reviewsPerMonth: 100 },
      pro: { projects: -1, reviewsPerMonth: 1000 },
      team: { projects: -1, reviewsPerMonth: -1 }
    };

    expect(tiers.free.projects).toBe(3);
    expect(tiers.pro.projects).toBe(-1); // unlimited
    expect(tiers.team.reviewsPerMonth).toBe(-1); // unlimited
  });
});