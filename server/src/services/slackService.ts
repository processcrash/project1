import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export interface SlackNotification {
  channel: string;
  projectName: string;
  reviewId: string;
  score: number;
  issuesCount: number;
  summary: string;
}

export const slackService = {
  async sendReviewNotification(notification: SlackNotification): Promise<void> {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log('Slack not configured, skipping notification');
      return;
    }

    const emoji = notification.score >= 7 ? ':white_check_mark:' : ':warning:';
    const severityEmoji = ['critical', 'high', 'medium', 'low'].map(s => {
      const count = notification.summary.toLowerCase().includes(s) ? 1 : 0;
      return count;
    });

    try {
      await slack.chat.postMessage({
        channel: notification.channel,
        text: `${emoji} Code Review Complete for ${notification.projectName}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji} Code Review: ${notification.projectName}`
            }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Score:*\n${notification.score}/10` },
              { type: 'mrkdwn', text: `*Issues:*\n${notification.issuesCount}` }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Summary:*\n${notification.summary.substring(0, 200)}${notification.summary.length > 200 ? '...' : ''}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: 'View Review' },
                url: `${process.env.CLIENT_URL}/reviews/${notification.reviewId}`
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  },

  async sendWeeklyReport(channel: string, stats: {
    totalReviews: number;
    avgScore: number;
    projectsCreated: number;
    topIssues: string[];
  }): Promise<void> {
    if (!process.env.SLACK_BOT_TOKEN) return;

    try {
      await slack.chat.postMessage({
        channel,
        text: ':chart_with_upwards_trend: Weekly CodeSentinel Report',
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: ':chart_with_upwards_trend: Weekly CodeSentinel Report' }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Total Reviews:*\n${stats.totalReviews}` },
              { type: 'mrkdwn', text: `*Avg Score:*\n${stats.avgScore}/10` },
              { type: 'mrkdwn', text: `*New Projects:*\n${stats.projectsCreated}` }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Top Issues Found:*\n${stats.topIssues.map(i => `• ${i}`).join('\n')}`
            }
          }
        ]
      });
    } catch (error) {
      console.error('Failed to send weekly report:', error);
    }
  }
};