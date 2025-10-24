// Email service using SendGrid - Referenced from blueprint:javascript_sendgrid
import { MailService } from '@sendgrid/mail';
import type { MailDataRequired } from '@sendgrid/mail';
import { storage } from '../storage';
import type { InsertEmailLog } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY not provided - email functionality disabled');
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = 'noreply@hipoaicoach.com';
const COMPANY_NAME = 'HiPo AI Coach';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailParams {
  to: string;
  template: string;
  data?: Record<string, any>;
}

// Email templates
const EMAIL_TEMPLATES: Record<string, (data: any) => EmailTemplate> = {
  welcome: (data) => ({
    subject: `Welcome to ${COMPANY_NAME}, ${data.firstName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to HiPo AI Coach</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 20px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            h1 { margin: 0; font-size: 28px; }
            h2 { color: #333; font-size: 24px; margin-bottom: 16px; }
            p { color: #555; line-height: 1.6; margin-bottom: 16px; }
            .highlight { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to HiPo AI Coach!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey to career excellence starts here</p>
            </div>
            <div class="content">
              <h2>Hi ${data.firstName},</h2>
              <p>Welcome to HiPo AI Coach - your personalized career development platform designed specifically for ambitious Indian professionals like you!</p>
              
              <div class="highlight">
                <h3 style="margin-top: 0; color: #667eea;">What's Next?</h3>
                <p style="margin-bottom: 0;">Complete your onboarding to unlock access to our 6 specialized AI coaches who will provide personalized career guidance tailored to your goals and industry.</p>
              </div>
              
              <p><strong>Your AI coaching team includes:</strong></p>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Leadership Coach:</strong> Strategic leadership development</li>
                <li><strong>Performance Coach:</strong> Goal achievement and productivity</li>
                <li><strong>Career Coach:</strong> Professional growth and transitions</li>
                <li><strong>HiPo Coach:</strong> High-potential talent acceleration</li>
                <li><strong>Life Coach:</strong> Work-life balance and fulfillment</li>
                <li><strong>Empathear Coach:</strong> Emotional intelligence and relationships</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${data.appUrl || 'https://hipoaicoach.com'}" class="button">Start Your Journey</a>
              </div>
              
              <p>If you have any questions, just reply to this email - we're here to help!</p>
              
              <p>Best regards,<br>The HiPo AI Coach Team</p>
            </div>
            <div class="footer">
              <p>© 2024 HiPo AI Coach. Built for ambitious Indian professionals.</p>
              <p>If you don't want to receive these emails, you can <a href="${data.unsubscribeUrl || '#'}">unsubscribe</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to HiPo AI Coach, ${data.firstName}!\n\nYour journey to career excellence starts here.\n\nWelcome to HiPo AI Coach - your personalized career development platform designed specifically for ambitious Indian professionals like you!\n\nComplete your onboarding to unlock access to our 6 specialized AI coaches who will provide personalized career guidance tailored to your goals and industry.\n\nYour AI coaching team includes:\n- Leadership Coach: Strategic leadership development\n- Performance Coach: Goal achievement and productivity\n- Career Coach: Professional growth and transitions\n- HiPo Coach: High-potential talent acceleration\n- Life Coach: Work-life balance and fulfillment\n- Empathear Coach: Emotional intelligence and relationships\n\nGet started: ${data.appUrl || 'https://hipoaicoach.com'}\n\nIf you have any questions, just reply to this email - we're here to help!\n\nBest regards,\nThe HiPo AI Coach Team\n\n© 2024 HiPo AI Coach. Built for ambitious Indian professionals.`
  }),

  emailVerification: (data) => ({
    subject: 'Verify your email address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #555; line-height: 1.6; margin-bottom: 16px; }
            .verification-code { background: #f8f9fa; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email Address</h1>
            <p>Hi ${data.firstName},</p>
            <p>Thank you for signing up for HiPo AI Coach! To complete your registration, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="verification-code">${data.verificationUrl}</div>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <p>Best regards,<br>The HiPo AI Coach Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Verify Your Email Address\n\nHi ${data.firstName},\n\nThank you for signing up for HiPo AI Coach! To complete your registration, please verify your email address by visiting this link:\n\n${data.verificationUrl}\n\nThis verification link will expire in 24 hours for security reasons.\n\nIf you didn't create an account with us, please ignore this email.\n\nBest regards,\nThe HiPo AI Coach Team`
  }),

  passwordReset: (data) => ({
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #555; line-height: 1.6; margin-bottom: 16px; }
            .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>Hi ${data.firstName || 'there'},</p>
            <p>We received a request to reset the password for your HiPo AI Coach account.</p>
            
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="alert">
              <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security.
            </div>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>For security reasons, please don't share this email with anyone.</p>
            
            <p>Best regards,<br>The HiPo AI Coach Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Reset Your Password\n\nHi ${data.firstName || 'there'},\n\nWe received a request to reset the password for your HiPo AI Coach account.\n\nReset your password: ${data.resetUrl}\n\nThis password reset link will expire in 1 hour for your security.\n\nIf you didn't request a password reset, please ignore this email. Your password will remain unchanged.\n\nBest regards,\nThe HiPo AI Coach Team`
  }),

  contactResponse: (data) => ({
    subject: `Re: ${data.originalSubject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Response to Your Message</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #555; line-height: 1.6; margin-bottom: 16px; }
            .original-message { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Thank you for contacting HiPo AI Coach</h1>
            <p>Hi ${data.name},</p>
            <p>Thank you for reaching out to us. We've received your message and one of our team members will get back to you within 24 hours.</p>
            
            <div class="original-message">
              <h3 style="margin-top: 0; color: #667eea;">Your Message:</h3>
              <p><strong>Subject:</strong> ${data.originalSubject}</p>
              <p><strong>Message:</strong></p>
              <p>${data.originalMessage}</p>
            </div>
            
            <p>In the meantime, you might find these resources helpful:</p>
            <ul>
              <li><a href="${data.appUrl || '#'}">Continue your coaching journey</a></li>
              <li><a href="${data.helpUrl || '#'}">Visit our help center</a></li>
            </ul>
            
            <p>Best regards,<br>The HiPo AI Coach Support Team</p>
          </div>
        </body>
      </html>
    `,
    text: `Thank you for contacting HiPo AI Coach\n\nHi ${data.name},\n\nThank you for reaching out to us. We've received your message and one of our team members will get back to you within 24 hours.\n\nYour Message:\nSubject: ${data.originalSubject}\n\nMessage:\n${data.originalMessage}\n\nIn the meantime, you might find these resources helpful:\n- Continue your coaching journey: ${data.appUrl || 'https://hipoaicoach.com'}\n- Visit our help center: ${data.helpUrl || 'https://hipoaicoach.com/help'}\n\nBest regards,\nThe HiPo AI Coach Support Team`
  })
};

async function logEmail(params: {
  to: string;
  subject: string;
  template: string;
  status: 'pending' | 'sent' | 'failed';
  messageId?: string;
  errorMessage?: string;
}): Promise<void> {
  try {
    const emailLog: InsertEmailLog = {
      toEmail: params.to,
      subject: params.subject,
      template: params.template,
      status: params.status,
      provider: 'sendgrid',
      messageId: params.messageId,
      errorMessage: params.errorMessage,
    };

    await storage.createEmailLog(emailLog);
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

export async function sendEmail({ to, template, data = {} }: EmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    await logEmail({
      to,
      subject: 'Email sending disabled',
      template,
      status: 'failed',
      errorMessage: 'SendGrid API key not configured'
    });
    return { success: false, error: 'Email service not configured' };
  }

  if (!EMAIL_TEMPLATES[template]) {
    const error = `Unknown email template: ${template}`;
    console.error(error);
    await logEmail({
      to,
      subject: 'Unknown template',
      template,
      status: 'failed',
      errorMessage: error
    });
    return { success: false, error };
  }

  try {
    const emailTemplate = EMAIL_TEMPLATES[template](data);
    
    await logEmail({
      to,
      subject: emailTemplate.subject,
      template,
      status: 'pending'
    });

    const mailData: MailDataRequired = {
      to,
      from: FROM_EMAIL,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    };

    const [response] = await mailService.send(mailData);
    const messageId = response.headers['x-message-id'] as string;

    await logEmail({
      to,
      subject: emailTemplate.subject,
      template,
      status: 'sent',
      messageId
    });

    return { success: true, messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('SendGrid email error:', error);
    
    await logEmail({
      to,
      subject: 'Failed to send',
      template,
      status: 'failed',
      errorMessage
    });

    return { success: false, error: errorMessage };
  }
}

// Convenience functions for common email types
export async function sendWelcomeEmail(to: string, userData: {
  firstName: string;
  appUrl?: string;
  unsubscribeUrl?: string;
}) {
  return sendEmail({
    to,
    template: 'welcome',
    data: userData
  });
}

export async function sendEmailVerification(to: string, userData: {
  firstName: string;
  verificationUrl: string;
}) {
  return sendEmail({
    to,
    template: 'emailVerification',
    data: userData
  });
}

export async function sendPasswordReset(to: string, userData: {
  firstName?: string;
  resetUrl: string;
}) {
  return sendEmail({
    to,
    template: 'passwordReset',
    data: userData
  });
}

export async function sendContactResponse(to: string, userData: {
  name: string;
  originalSubject: string;
  originalMessage: string;
  appUrl?: string;
  helpUrl?: string;
}) {
  return sendEmail({
    to,
    template: 'contactResponse',
    data: userData
  });
}