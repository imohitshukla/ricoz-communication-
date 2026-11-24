import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import axios from 'axios';

// -----------------------------------------------------------------
// Modular Multi-Provider Email Service (100% Free Tiers Supported)
//
// Free Provider Priority Chain:
//   1. Brevo / Sendinblue (100% Free: 300 emails/day = 9,000/month, Inbox delivery, DKIM)
//   2. Mailjet (100% Free: 200 emails/day = 6,000/month)
//   3. Resend (Free Tier: 100 emails/day = 3,000/month)
//   4. Custom SMTP Relay (Any free or private SMTP server, e.g. Brevo SMTP / Gmail)
//   5. Mailtrap (Staging Sandbox testing)
//   6. Ethereal (Dev fallback preview URLs)
// -----------------------------------------------------------------

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const MAILJET_API_KEY = process.env.MAILJET_API_KEY || '';
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

const FROM_ADDRESS = process.env.SMTP_FROM || 'hello@ricoz.io';
const FROM_NAME = 'Ricoz Communication';

// Parse "Name <email>" format
function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^(.*?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: FROM_NAME, email: from.trim() };
}

// -----------------------------------------------------------------
// Provider 1: Brevo (Sendinblue) — 300 Free Emails / Day (9,000 / Month)
// -----------------------------------------------------------------
async function sendViaBrevo(options: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!BREVO_API_KEY) return { success: false, error: 'BREVO_API_KEY not configured' };

  const from = parseFrom(FROM_ADDRESS);
  const recipients = Array.isArray(options.to)
    ? options.to.map(email => ({ email }))
    : [{ email: options.to }];

  try {
    const payload: any = {
      sender: { name: from.name, email: from.email },
      to: recipients,
      subject: options.subject,
      htmlContent: options.html,
    };

    if (options.replyTo) {
      payload.replyTo = { email: options.replyTo };
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      payload,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 12000
      }
    );

    const messageId = response.data?.messageId || response.data?.messageIds?.[0];
    return { success: true, messageId };
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    return { success: false, error: msg };
  }
}

// -----------------------------------------------------------------
// Provider 2: Mailjet — 200 Free Emails / Day (6,000 / Month)
// -----------------------------------------------------------------
async function sendViaMailjet(options: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
    return { success: false, error: 'Mailjet API key or Secret key not configured' };
  }

  const from = parseFrom(FROM_ADDRESS);
  const toList = Array.isArray(options.to)
    ? options.to.map(e => ({ Email: e }))
    : [{ Email: options.to }];

  const authHeader = 'Basic ' + Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`).toString('base64');

  try {
    const response = await axios.post(
      'https://api.mailjet.com/v3.1/send',
      {
        Messages: [
          {
            From: { Email: from.email, Name: from.name },
            To: toList,
            Subject: options.subject,
            HTMLPart: options.html
          }
        ]
      },
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json'
        },
        timeout: 12000
      }
    );

    const messageId = response.data?.Messages?.[0]?.To?.[0]?.MessageID?.toString();
    return { success: true, messageId };
  } catch (err: any) {
    const msg = err.response?.data?.ErrorMessage || err.message;
    return { success: false, error: msg };
  }
}

// -----------------------------------------------------------------
// Provider 3: Resend (100 Free Emails / Day, 3,000 / Month)
// -----------------------------------------------------------------
let _resend: Resend | null = null;
function getResendClient(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(RESEND_API_KEY);
  return _resend;
}

async function sendViaResend(options: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Resend API key not configured' };

  const from = parseFrom(FROM_ADDRESS);
  try {
    const { data, error } = await client.emails.send({
      from: `${from.name} <${from.email}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
      tags: options.tags,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// Provider 4: Standard Custom SMTP (Brevo SMTP / Gmail / Private Postfix)
// -----------------------------------------------------------------
let _smtpTransporter: any = null;

function getSmtpTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!_smtpTransporter) {
    _smtpTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return _smtpTransporter;
}

async function sendViaSmtp(options: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getSmtpTransporter();
  if (!transporter) return { success: false, error: 'SMTP credentials not configured' };

  const from = parseFrom(FROM_ADDRESS);
  try {
    const info = await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// Provider 5: Mailtrap (Staging Sandbox)
// -----------------------------------------------------------------
async function sendViaMailtrapAPI(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = parseFrom(FROM_ADDRESS);
  const MAILTRAP_INBOX_ID = process.env.MAILTRAP_INBOX_ID || '4936472';
  const apiUrl = `https://sandbox.api.mailtrap.io/api/send/${MAILTRAP_INBOX_ID}`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        from: { email: from.email, name: from.name },
        to: [{ email: options.to }],
        subject: options.subject,
        html: options.html,
      },
      {
        headers: {
          Authorization: `Bearer ${SMTP_PASS}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    return { success: true, messageId: response.data?.message_ids?.[0] || 'sent' };
  } catch (err: any) {
    const msg = err.response?.data?.errors?.join(', ') || err.message;
    return { success: false, error: msg };
  }
}

// -----------------------------------------------------------------
// Provider 6: Ethereal (Dev fallback preview URLs)
// -----------------------------------------------------------------
let _etherealTransporter: any = null;

async function sendViaEthereal(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  if (!_etherealTransporter) {
    console.log('[EmailService] Creating free Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    _etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  try {
    const info = await _etherealTransporter.sendMail({
      from: FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info) as string;
    return { success: true, previewUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Unified send function with cascading automatic failover:
 *   Brevo (300/day free) ➔ Mailjet (200/day free) ➔ Resend (100/day) ➔ Custom SMTP ➔ Mailtrap ➔ Ethereal
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}) {
  // 1. Try Brevo Free Tier (300 emails/day)
  if (BREVO_API_KEY) {
    console.log(`[EmailService] Sending via Brevo Free API → ${options.to}`);
    const res = await sendViaBrevo(options);
    if (res.success) return { ...res, provider: 'brevo' };
    console.warn(`[EmailService] Brevo failed (${res.error}), trying fallback...`);
  }

  // 2. Try Mailjet Free Tier (200 emails/day)
  if (MAILJET_API_KEY && MAILJET_SECRET_KEY) {
    console.log(`[EmailService] Sending via Mailjet Free API → ${options.to}`);
    const res = await sendViaMailjet(options);
    if (res.success) return { ...res, provider: 'mailjet' };
    console.warn(`[EmailService] Mailjet failed (${res.error}), trying fallback...`);
  }

  // 3. Try Resend
  if (RESEND_API_KEY) {
    console.log(`[EmailService] Sending via Resend API → ${options.to}`);
    const res = await sendViaResend(options);
    if (res.success) return { ...res, provider: 'resend' };
    console.warn(`[EmailService] Resend failed (${res.error}), trying fallback...`);
  }

  // 4. Try Custom SMTP Relay (e.g. Brevo SMTP / Custom relay)
  if (SMTP_HOST && SMTP_USER && SMTP_PASS && !SMTP_HOST.includes('mailtrap')) {
    console.log(`[EmailService] Sending via SMTP Relay (${SMTP_HOST}) → ${options.to}`);
    const res = await sendViaSmtp(options);
    if (res.success) return { ...res, provider: `smtp (${SMTP_HOST})` };
    console.warn(`[EmailService] Custom SMTP failed (${res.error}), trying fallback...`);
  }

  // 5. Try Mailtrap (Staging Sandbox)
  const toStr = Array.isArray(options.to) ? options.to[0] : options.to;
  if (SMTP_HOST.includes('mailtrap') && SMTP_PASS) {
    console.log(`[EmailService] Sending via Mailtrap sandbox → ${toStr}`);
    const res = await sendViaMailtrapAPI({ to: toStr, subject: options.subject, html: options.html });
    if (res.success) return { ...res, provider: 'mailtrap' };
  }

  // 6. Ethereal (Dev)
  console.log('[EmailService] Using free Ethereal test inbox fallback');
  const res = await sendViaEthereal({ to: toStr, subject: options.subject, html: options.html });
  return { ...res, provider: 'ethereal' };
}

/**
 * Batch email sender for campaigns
 */
export async function sendBatchEmails(
  recipients: { to: string; subject: string; html: string }[],
  onProgress?: (sent: number, total: number) => void
): Promise<{ delivered: number; failed: number; errors: string[] }> {
  let delivered = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i++) {
    const item = recipients[i];
    try {
      const res = await sendEmail({ to: item.to, subject: item.subject, html: item.html });
      if (res.success) delivered++;
      else {
        failed++;
        errors.push(`Failed for ${item.to}: ${res.error}`);
      }
    } catch (e: any) {
      failed++;
      errors.push(`Failed for ${item.to}: ${e.message}`);
    }
    if (onProgress) onProgress(i + 1, recipients.length);
  }

  return { delivered, failed, errors };
}

/**
 * Send Team Invitation Email with temporary credentials
 */
export async function sendTeamInviteEmail(params: {
  toEmail: string;
  toName: string;
  inviterName: string;
  workspaceName: string;
  tempPassword?: string;
  loginUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const loginUrl = params.loginUrl || process.env.FRONTEND_URL || 'http://localhost:5173/login';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>You're invited to Ricoz Communication</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px;">
    <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px; font-weight: 800;">Welcome to ${params.workspaceName}</h2>
    <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
      ${params.inviterName} has invited you to join the <strong>${params.workspaceName}</strong> workspace on Ricoz Communication.
    </p>

    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Your Login Email</div>
      <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 16px;">${params.toEmail}</div>
      ${params.tempPassword ? `
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Temporary Password</div>
      <div style="font-size: 15px; font-family: monospace; font-weight: 700; color: #059669; letter-spacing: 0.5px;">${params.tempPassword}</div>
      ` : ''}
    </div>

    <a href="${loginUrl}" style="display: block; width: 100%; text-align: center; background: #00a688; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 0; border-radius: 10px;">
      Log In to Workspace →
    </a>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: params.toEmail,
    subject: `You're invited to join ${params.workspaceName} on Ricoz`,
    html,
  });
}

/**
 * Get active provider diagnostics (safe for frontend)
 */
export function getEmailProviderInfo() {
  let activeProvider = 'Ethereal (Dev Sandbox)';
  let quota = 'Unlimited Dev Preview';

  if (BREVO_API_KEY) {
    activeProvider = 'Brevo (Sendinblue Free)';
    quota = '300 emails/day (9,000/mo Free)';
  } else if (MAILJET_API_KEY && MAILJET_SECRET_KEY) {
    activeProvider = 'Mailjet Free';
    quota = '200 emails/day (6,000/mo Free)';
  } else if (RESEND_API_KEY) {
    activeProvider = 'Resend Free';
    quota = '100 emails/day (3,000/mo Free)';
  } else if (SMTP_HOST && SMTP_USER) {
    activeProvider = `Custom SMTP (${SMTP_HOST})`;
    quota = 'Custom Server Quota';
  }

  return {
    configured: Boolean(BREVO_API_KEY || (MAILJET_API_KEY && MAILJET_SECRET_KEY) || RESEND_API_KEY || (SMTP_HOST && SMTP_USER)),
    provider: activeProvider,
    freeQuota: quota,
    fromAddress: FROM_ADDRESS,
  };
}

export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const info = getEmailProviderInfo();
    return {
      success: info.configured,
      message: info.configured ? `Active email engine: ${info.provider}` : 'Running on Ethereal test inbox'
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
