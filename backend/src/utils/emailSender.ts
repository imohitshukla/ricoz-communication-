// backend/src/utils/emailSender.ts
import nodemailer from 'nodemailer';
import { prisma } from '../db';

// Simple transporter using SMTP env vars (placeholders for real credentials)
const transporter = nodemailer.createTransport({
  jsonTransport: true,
});

/**
 * Sends a test email and logs the result in the EmailLog table.
 * @param to Recipient email address
 * @param subject Subject line
 * @param htmlBody HTML body of the email
 */
export async function sendTestEmail(to: string, subject: string, htmlBody: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@ricoz.io',
    to,
    subject,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // Record successful send
    await prisma.emailLog.create({
      data: {
        toEmail: to,
        subject,
        templateId: null,
        status: 'sent',
        sentAt: new Date(),
      },
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    // Record failure
    await prisma.emailLog.create({
      data: {
        toEmail: to,
        subject,
        templateId: null,
        status: 'failed',
        errorMessage: error.message,
      },
    });
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}
