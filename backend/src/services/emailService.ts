import nodemailer from 'nodemailer';
import axios from 'axios';

// -----------------------------------------------------------------
// Email Service
//
// MODE 1 — PRODUCTION (Mailtrap HTTP API):
//   Uses HTTPS (port 443) — works on ALL cloud servers including Railway
//   Set SMTP_PASS = your Mailtrap API token
//   Set SMTP_FROM = sender email (e.g. hello@demomailtrap.com)
//
// MODE 2 — DEV/TEST fallback (Ethereal Email):
//   Zero config. Prints preview link in terminal.
// -----------------------------------------------------------------

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
// Send via Mailtrap HTTP API (no SMTP — works on Railway/Render/etc)
// -----------------------------------------------------------------
async function sendViaMailtrapAPI(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const from = parseFrom(FROM_ADDRESS);

  // Use Mailtrap Sandbox API (testing inbox — captured at mailtrap.io/inboxes)
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
// Send via Ethereal (free dev fallback — prints preview URL)
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
// Unified send — uses Mailtrap API if token set, else Ethereal
// -----------------------------------------------------------------
async function sendEmail(options: { to: string; subject: string; html: string }) {
  if (MAILTRAP_API_TOKEN) {
    console.log(`[EmailService] Sending via Mailtrap API → ${options.to}`);
    return sendViaMailtrapAPI(options);
  } else {
    console.log('[EmailService] No SMTP_PASS set — using Ethereal preview');
    return sendViaEthereal(options);
  }
}

// -----------------------------------------------------------------
// 1. Team Invite Email
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

  const result = await sendEmail({
    to: toEmail,
    subject: `You've been invited to ${workspaceName} on Ricoz`,
    html,
  });

  if (result.success) {
    console.log(`[EmailService] ✅ Invite sent to ${toEmail}`);
  } else {
    console.error(`[EmailService] ❌ Failed to send invite to ${toEmail}:`, result.error);
  }
  return result;
}

// -----------------------------------------------------------------
// 2. Password Reset Email
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

  const result = await sendEmail({
    to: toEmail,
    subject: 'Reset your Ricoz password',
    html,
  });

  if (result.success) {
    console.log(`[EmailService] ✅ Reset email sent to ${toEmail}`);
  } else {
    console.error(`[EmailService] ❌ Failed to send reset email:`, result.error);
  }
  return result;
}

// -----------------------------------------------------------------
// 3. Connection Test
// -----------------------------------------------------------------
export async function testSmtpConnection(): Promise<{ success: boolean; message: string; mode?: string }> {
  if (MAILTRAP_API_TOKEN) {
    // Test Mailtrap API with a lightweight auth check
    try {
      await axios.get('https://mailtrap.io/api/accounts', {
        headers: { Authorization: `Bearer ${MAILTRAP_API_TOKEN}` },
        timeout: 10000,
      });
      return { success: true, message: 'Mailtrap API connection verified ✅', mode: 'mailtrap-api' };
    } catch (err: any) {
      const status = err.response?.status;
      // 200 = ok, 403 = wrong scope but API reachable, 401 = bad token
      if (status === 403 || status === 200) {
        return { success: true, message: 'Mailtrap API reachable ✅ (token may need Send permission)', mode: 'mailtrap-api' };
      }
      return { success: false, message: `Mailtrap API error: ${err.response?.data?.message || err.message}` };
    }
  } else {
    return { success: true, message: 'No API token set — will use Ethereal preview mode for dev ✅', mode: 'ethereal' };
  }
}
