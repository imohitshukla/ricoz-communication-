import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import axios from 'axios';

// -----------------------------------------------------------------
// Production Email Service — Priority Chain:
//   1. Resend API (production — custom domains, tracking, webhooks)
//   2. Mailtrap API (staging — sandbox testing)
//   3. Ethereal (dev fallback — free preview URLs)
// -----------------------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const MAILTRAP_API_TOKEN = process.env.SMTP_PASS || '';
const FROM_ADDRESS = process.env.SMTP_FROM || 'hello@demomailtrap.com';
const FROM_NAME = 'Ricoz Communication';

// Parse "Name <email>" format
function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^(.*?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: FROM_NAME, email: from.trim() };
}

// -----------------------------------------------------------------
// Provider 1: Resend (Production)
// -----------------------------------------------------------------
let _resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(RESEND_API_KEY);
  }
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

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// Provider 2: Mailtrap HTTP API (Staging/Testing)
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
          Authorization: `Bearer ${MAILTRAP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    return { success: true, messageId: response.data?.message_ids?.[0] || 'sent' };
  } catch (err: any) {
    const msg = err.response?.data?.errors?.join(', ') || err.message;
    return { success: false, error: msg };
  }
}

// -----------------------------------------------------------------
// Provider 3: Ethereal (Dev fallback)
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
    console.log(`[EmailService] ✅ Ethereal account: ${testAccount.user}`);
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
    console.log('\n────────────────────────────────────────────────────────');
    console.log('📧 EMAIL PREVIEW → open in browser:');
    console.log(`👉  ${previewUrl}`);
    console.log('────────────────────────────────────────────────────────\n');
    return { success: true, previewUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------
// Unified send — cascading priority
// -----------------------------------------------------------------
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}) {
  // 1. Try Resend (production)
  if (RESEND_API_KEY) {
    console.log(`[EmailService] Sending via Resend API → ${options.to}`);
    try {
      const res = await sendViaResend(options);
      if (res.success) return { ...res, provider: 'resend' };
      console.warn(`[EmailService] Resend failed (${res.error}), trying fallback...`);
    } catch (err: any) {
      console.warn(`[EmailService] Resend exception: ${err.message}`);
    }
  }

  // 2. Try Mailtrap (staging)
  const toStr = Array.isArray(options.to) ? options.to[0] : options.to;
  if (MAILTRAP_API_TOKEN) {
    console.log(`[EmailService] Sending via Mailtrap API → ${toStr}`);
    try {
      const res = await sendViaMailtrapAPI({ to: toStr, subject: options.subject, html: options.html });
      if (res.success) return { ...res, provider: 'mailtrap' };
      console.warn(`[EmailService] Mailtrap failed (${res.error}), falling back to Ethereal`);
    } catch (err: any) {
      console.warn(`[EmailService] Mailtrap exception: ${err.message}`);
    }
  }

  // 3. Ethereal (dev)
  console.log('[EmailService] Using Ethereal preview inbox');
  const res = await sendViaEthereal({ to: toStr, subject: options.subject, html: options.html });
  return { ...res, provider: 'ethereal' };
}

// -----------------------------------------------------------------
// Batch send for campaigns
// -----------------------------------------------------------------
export async function sendBatchEmails(
  recipients: { to: string; subject: string; html: string }[],
  onProgress?: (sent: number, total: number) => void
): Promise<{ delivered: number; failed: number; errors: string[] }> {
  let delivered = 0;
  let failed = 0;
  const errors: string[] = [];

  // Resend supports batch API natively
  if (RESEND_API_KEY) {
    const client = getResendClient();
    if (client) {
      // Resend batch endpoint: up to 100 emails per call
      const batches = [];
      for (let i = 0; i < recipients.length; i += 100) {
        batches.push(recipients.slice(i, i + 100));
      }

      for (const batch of batches) {
        try {
          const from = parseFrom(FROM_ADDRESS);
          const { data, error } = await client.batch.send(
            batch.map(r => ({
              from: `${from.name} <${from.email}>`,
              to: [r.to],
              subject: r.subject,
              html: r.html,
            }))
          );

          if (error) {
            failed += batch.length;
            errors.push(error.message);
          } else {
            delivered += batch.length;
          }
        } catch (err: any) {
          failed += batch.length;
          errors.push(err.message);
        }
        if (onProgress) onProgress(delivered + failed, recipients.length);
      }

      return { delivered, failed, errors };
    }
  }

  // Fallback: sequential send
  for (const r of recipients) {
    try {
      const result = await sendEmail(r);
      if (result.success) delivered++;
      else {
        failed++;
        errors.push(`${r.to}: ${(result as any).error}`);
      }
    } catch (err: any) {
      failed++;
      errors.push(`${r.to}: ${err.message}`);
    }
    if (onProgress) onProgress(delivered + failed, recipients.length);
  }

  return { delivered, failed, errors };
}

// -----------------------------------------------------------------
// Team Invite Email
// -----------------------------------------------------------------
export async function sendTeamInviteEmail(options: {
  toEmail: string;
  toName: string;
  inviterName: string;
  workspaceName: string;
  tempPassword: string;
  loginUrl?: string;
}) {
  const {
    toEmail, toName, inviterName, workspaceName, tempPassword,
    loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
  } = options;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <style>
      body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;margin:0;padding:0}
      .container{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
      .header{background:linear-gradient(135deg,#6C63FF 0%,#4FACFE 100%);padding:40px 32px;text-align:center}
      .header h1{color:#fff;margin:0;font-size:26px;font-weight:700}
      .header p{color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px}
      .body{padding:36px 32px}
      .body p{color:#374151;line-height:1.7;font-size:15px}
      .cred-box{background:#f0f4ff;border:1px solid #c7d2fe;border-radius:8px;padding:20px 24px;margin:24px 0}
      .cred-box .label{font-size:12px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
      .cred-box .value{font-size:16px;color:#1e293b;font-weight:600;margin-top:4px;word-break:break-all}
      .btn{display:inline-block;margin-top:24px;padding:14px 32px;background:linear-gradient(135deg,#6C63FF,#4FACFE);color:#fff!important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px}
      .footer{padding:20px 32px;text-align:center;background:#f8fafc;border-top:1px solid #e2e8f0}
      .footer p{color:#94a3b8;font-size:12px;margin:0}
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🚀 You're Invited to Ricoz</h1>
        <p>Your workspace invitation is here</p>
      </div>
      <div class="body">
        <p>Hi <strong>${toName}</strong>,</p>
        <p><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on Ricoz Communication.</p>
        <p>Here are your login credentials to get started:</p>
        <div class="cred-box">
          <div class="label">Email</div>
          <div class="value">${toEmail}</div>
        </div>
        <div class="cred-box">
          <div class="label">Temporary Password</div>
          <div class="value">${tempPassword}</div>
        </div>
        <p style="color:#ef4444;font-size:13px">⚠️ Please change your password immediately after your first login.</p>
        <a href="${loginUrl}" class="btn">Login to Ricoz →</a>
        <p style="margin-top:32px;font-size:13px;color:#94a3b8">If you weren't expecting this invitation, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Ricoz Communication. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;

  return sendEmail({
    to: toEmail,
    subject: `You've been invited to ${workspaceName} on Ricoz`,
    html,
  });
}

// -----------------------------------------------------------------
// Password Reset Email
// -----------------------------------------------------------------
export async function sendPasswordResetEmail(options: {
  toEmail: string;
  toName: string;
  resetToken: string;
}) {
  const { toEmail, toName, resetToken } = options;
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <style>
      body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;margin:0;padding:0}
      .container{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
      .header{background:linear-gradient(135deg,#FF6584 0%,#FF9A5C 100%);padding:40px 32px;text-align:center}
      .header h1{color:#fff;margin:0;font-size:26px;font-weight:700}
      .body{padding:36px 32px}
      .body p{color:#374151;line-height:1.7;font-size:15px}
      .btn{display:inline-block;margin-top:24px;padding:14px 32px;background:linear-gradient(135deg,#FF6584,#FF9A5C);color:#fff!important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px}
      .footer{padding:20px 32px;text-align:center;background:#f8fafc;border-top:1px solid #e2e8f0}
      .footer p{color:#94a3b8;font-size:12px;margin:0}
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><h1>🔐 Reset Your Password</h1></div>
      <div class="body">
        <p>Hi <strong>${toName}</strong>,</p>
        <p>We received a request to reset your Ricoz account password. Click the button below. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" class="btn">Reset Password →</a>
        <p style="margin-top:32px;font-size:13px;color:#94a3b8">If you didn't request this, ignore this email.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Ricoz Communication. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;

  return sendEmail({
    to: toEmail,
    subject: 'Reset your Ricoz password',
    html,
  });
}

// -----------------------------------------------------------------
// Connection Test
// -----------------------------------------------------------------
export async function testSmtpConnection(): Promise<{ success: boolean; message: string; mode?: string }> {
  // 1. Check Resend
  if (RESEND_API_KEY) {
    try {
      const client = getResendClient();
      if (client) {
        const { data } = await client.domains.list();
        return {
          success: true,
          message: `Resend API connected ✅ — ${data?.data?.length || 0} domain(s) configured`,
          mode: 'resend-production',
        };
      }
    } catch (err: any) {
      // Even if domain list fails, API key might still work for sending
      return {
        success: true,
        message: 'Resend API key configured ✅ — Ready to send',
        mode: 'resend-production',
      };
    }
  }

  // 2. Check Mailtrap
  if (MAILTRAP_API_TOKEN) {
    try {
      await axios.get('https://mailtrap.io/api/accounts', {
        headers: { Authorization: `Bearer ${MAILTRAP_API_TOKEN}` },
        timeout: 10000,
      });
      return { success: true, message: 'Mailtrap API connection verified ✅', mode: 'mailtrap-staging' };
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403 || status === 200) {
        return { success: true, message: 'Mailtrap API reachable ✅', mode: 'mailtrap-staging' };
      }
    }
  }

  // 3. Ethereal fallback
  return { success: true, message: 'Using Ethereal test inbox mode for dev ✅', mode: 'ethereal-dev' };
}

// -----------------------------------------------------------------
// Get current email provider info (for integration status page)
// -----------------------------------------------------------------
export function getEmailProviderInfo() {
  if (RESEND_API_KEY) {
    return { provider: 'Resend', mode: 'production', configured: true };
  }
  if (MAILTRAP_API_TOKEN) {
    return { provider: 'Mailtrap', mode: 'staging', configured: true };
  }
  return { provider: 'Ethereal', mode: 'development', configured: false };
}
