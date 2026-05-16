export const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to CodeSentinel - Your AI Code Review Platform',
    body: `
Dear {{name}},

Welcome to CodeSentinel! We're excited to have you on board.

With CodeSentinel, you can:
✓ Catch bugs before they reach production
✓ Detect security vulnerabilities automatically
✓ Get actionable code improvement suggestions
✓ Integrate seamlessly with GitHub

Quick Start:
1. Create your first project
2. Add your code or connect GitHub
3. Get AI-powered reviews in seconds

If you have any questions, our support team is here to help.

Best regards,
The CodeSentinel Team

---
To unsubscribe, update your notification preferences in your account settings.
`
  },

  reviewCompleted: {
    subject: 'Code Review Complete - Score: {{score}}/10',
    body: `
Hi {{name}},

Your code review for "{{projectName}}" is complete!

Summary: {{summary}}

Issues Found:
{{#if critical}}
- {{critical}} Critical issues
{{/if}}
{{#if high}}
- {{high}} High priority issues
{{/if}}
{{#if medium}}
- {{medium}} Medium priority issues
{{/if}}
{{#if low}}
- {{low}} Low priority issues
{{/if}}

{{#if actionRequired}}
Action Required: Please review the {{critical}} critical issues before merging.

View full report: {{reviewUrl}}
{{else}}
Great job! Your code looks good.

View report: {{reviewUrl}}
{{/if}}

---
CodeSentinel - AI-Powered Code Review
`
  },

  criticalIssueFound: {
    subject: '⚠️ Critical Issue Detected in {{projectName}}',
    body: `
Hi {{name}},

We found a critical issue in your code that requires immediate attention.

Project: {{projectName}}
File: {{file}}
Line: {{line}}

Issue: {{issueDescription}}

Recommendation: {{recommendation}}

Please review and fix this issue before proceeding.

View details: {{reviewUrl}}

---
This is an automated notification from CodeSentinel.
`
  },

  weeklyReport: {
    subject: 'Your Weekly Code Quality Report',
    body: `
Hi {{name}},

Here's your weekly code quality summary:

📊 Activity
- Reviews completed: {{reviewCount}}
- Total issues found: {{totalIssues}}
- Average code quality score: {{avgScore}}/10

🎯 Top Issues This Week
{{topIssues}}

💡 Suggestions
{{suggestions}}

Keep up the great work!

---
CodeSentinel - Ship Better Code Faster
`
  },

  teamInvitation: {
    subject: 'You\'re Invited to Join {{teamName}} on CodeSentinel',
    body: `
Hi {{name}},

You've been invited to join {{teamName}} on CodeSentinel as a {{role}}.

Click below to accept the invitation:
{{invitationLink}}

This invitation expires in 72 hours.

Best regards,
The CodeSentinel Team
`
  },

  subscriptionUpgrade: {
    subject: 'Welcome to CodeSentinel {{tier}}!',
    body: `
Hi {{name}},

Congratulations! You've successfully upgraded to CodeSentinel {{tier}}.

Your new features include:
{{#if unlimitedProjects}}
✓ Unlimited projects
{{else}}
✓ {{projectLimit}} projects
{{/if}}
{{#if unlimitedReviews}}
✓ Unlimited reviews
{{else}}
✓ {{reviewLimit}} reviews per month
{{/if}}
{{#if teamFeatures}}
✓ Team collaboration features
✓ Slack notifications
{{/if}}

Manage your subscription: {{billingPortalUrl}}

Need help? Reply to this email or visit our support center.

Best regards,
The CodeSentinel Team
`
  }
};

export const getEmailVariables = (template: keyof typeof EMAIL_TEMPLATES) => {
  switch (template) {
    case 'welcome':
      return ['name'];
    case 'reviewCompleted':
      return ['name', 'projectName', 'summary', 'score', 'critical', 'high', 'medium', 'low', 'actionRequired', 'reviewUrl'];
    case 'criticalIssueFound':
      return ['name', 'projectName', 'file', 'line', 'issueDescription', 'recommendation', 'reviewUrl'];
    case 'weeklyReport':
      return ['name', 'reviewCount', 'totalIssues', 'avgScore', 'topIssues', 'suggestions'];
    case 'teamInvitation':
      return ['name', 'teamName', 'role', 'invitationLink'];
    case 'subscriptionUpgrade':
      return ['name', 'tier', 'projectLimit', 'reviewLimit', 'teamFeatures', 'billingPortalUrl'];
    default:
      return [];
  }
};