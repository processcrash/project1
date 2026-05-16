import { EMAIL_TEMPLATES } from './emailTemplates';

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export const emailService = {
  async send(options: EmailOptions): Promise<boolean> {
    // In production, integrate with SendGrid, AWS SES, or similar
    // For now, log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email sent:', {
        to: options.to,
        subject: options.subject
      });
    }

    // Example SendGrid integration:
    // if (process.env.SENDGRID_API_KEY) {
    //   const sgMail = require('@sendgrid/mail');
    //   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    //   await sgMail.send(options);
    // }

    return true;
  },

  async sendTemplatedEmail(
    template: keyof typeof EMAIL_TEMPLATES,
    to: string,
    variables: Record<string, string | number>
  ): Promise<boolean> {
    const templateData = EMAIL_TEMPLATES[template];

    let subject = templateData.subject;
    let body = templateData.body;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    });

    return this.send({ to, subject, body });
  },

  // Convenience methods
  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    return this.sendTemplatedEmail('welcome', to, { name });
  },

  async sendReviewCompleteEmail(
    to: string,
    data: {
      name: string;
      projectName: string;
      summary: string;
      score: number;
      stats: { critical: number; high: number; medium: number; low: number };
      actionRequired: boolean;
      reviewUrl: string;
    }
  ): Promise<boolean> {
    return this.sendTemplatedEmail('reviewCompleted', to, {
      name: data.name,
      projectName: data.projectName,
      summary: data.summary,
      score: data.score,
      critical: data.stats.critical,
      high: data.stats.high,
      medium: data.stats.medium,
      low: data.stats.low,
      actionRequired: data.actionRequired ? 'Yes' : 'No',
      reviewUrl: data.reviewUrl
    });
  },

  async sendCriticalIssueEmail(
    to: string,
    data: {
      name: string;
      projectName: string;
      file: string;
      line: number;
      issueDescription: string;
      recommendation: string;
      reviewUrl: string;
    }
  ): Promise<boolean> {
    return this.sendTemplatedEmail('criticalIssueFound', to, data);
  },

  async sendTeamInvitationEmail(
    to: string,
    data: {
      name: string;
      teamName: string;
      role: string;
      invitationLink: string;
    }
  ): Promise<boolean> {
    return this.sendTemplatedEmail('teamInvitation', to, data);
  },

  async sendUpgradeEmail(
    to: string,
    data: {
      name: string;
      tier: string;
      projectLimit: number;
      reviewLimit: number;
      teamFeatures: boolean;
      billingPortalUrl: string;
    }
  ): Promise<boolean> {
    return this.sendTemplatedEmail('subscriptionUpgrade', to, data);
  }
};