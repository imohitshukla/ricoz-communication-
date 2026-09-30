import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

// -----------------------------------------------------------------
// Transporter Factory
//
// MODE 1 — DEV/TESTING (default, zero config needed):
//   Uses Ethereal Email — nodemailer creates a free fake inbox
//   automatically. Every sent email prints a PREVIEW LINK in the
//   terminal. No signup, no password, no setup at all.
//
// MODE 2 — PRODUCTION:
//   Set SMTP_HOST + SMTP_USER + SMTP_PASS in .env to use a real
//   provider (Gmail, SendGrid, Resend, etc.)
// -----------------------------------------------------------------

let _transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  // If already created, reuse it
  if (_transporter) return _transporter;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;

  if (smtpHost && smtpUser && smtpPass) {
    // ── PRODUCTION MODE ── Real SMTP credentials provided
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    console.log(`[EmailService] Using real SMTP: ${smtpHost}:${port}`);
    _transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
  } else {
    // ── TEST MODE ── Auto-create a free Ethereal inbox (zero setup)
    console.log('[EmailService] No SMTP credentials found — using Ethereal (free test email)');
    console.log('[EmailService] Creating free Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log(`[EmailService] ✅ Ethereal account ready: ${testAccount.user}`);

    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return _transporter;
}

const FROM_ADDRESS =
  process.env.SMTP_FROM || '"Ricoz Communication" <no-reply@ricoz.io>';

// -----------------------------------------------------------------
// Helper — send mail and log preview URL for Ethereal emails
// -----------------------------------------------------------------
async function sendMail(options: SendMailOptions) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail(options);

  // nodemailer.getTestMessageUrl() returns a URL only for Ethereal
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('\n────────────────────────────────────────────────────────');
    console.log('📧 EMAIL PREVIEW (click to view in browser):');
    console.log(`👉  ${previewUrl}`);
    console.log('────────────────────────────────────────────────────────\n');
  }

  return info;
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
    toEmail,
    toName,
    inviterName,
    workspaceName,
    tempPassword,
    loginUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/login`
      : 'http://localhost:5173/login',
  } = options;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #6C63FF 0%, #4FACFE 100%); padding: 40px 32px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; }
      .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
      .body { padding: 36px 32px; }
      .body p { color: #374151; line-height: 1.7; font-size: 15px; }
      .cred-box { background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
      .cred-box .label { font-size: 12px; color: #6366f1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      .cred-box .value { font-size: 16px; color: #1e293b; font-weight: 600; margin-top: 4px; word-break: break-all; }
      .btn { display: inline-block; margin-top: 24px; padding: 14px 32px; background: linear-gradient(135deg, #6C63FF, #4FACFE); color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
      .footer { padding: 20px 32px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0; }
      .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
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
        <p style="color: #ef4444; font-size: 13px;">⚠️ Please change your password immediately after your first login.</p>
        <a href="${loginUrl}" class="btn">Login to Ricoz →</a>
        <p style="margin-top: 32px; font-size: 13px; color: #94a3b8;">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Ricoz Communication. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;

  try {
    const info = await sendMail({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: `You've been invited to ${workspaceName} on Ricoz`,
      html,
    });
    console.log(`[EmailService] Invite email sent → ${toEmail} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || null };
  } catch (err) {
    console.error(`[EmailService] Failed to send invite email to ${toEmail}:`, err);
    return { success: false, error: String(err) };
  }
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
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #FF6584 0%, #FF9A5C 100%); padding: 40px 32px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; }
      .body { padding: 36px 32px; }
      .body p { color: #374151; line-height: 1.7; font-size: 15px; }
      .btn { display: inline-block; margin-top: 24px; padding: 14px 32px; background: linear-gradient(135deg, #FF6584, #FF9A5C); color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
      .footer { padding: 20px 32px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0; }
      .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔐 Reset Your Password</h1>
      </div>
      <div class="body">
        <p>Hi <strong>${toName}</strong>,</p>
        <p>We received a request to reset your Ricoz account password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" class="btn">Reset Password →</a>
        <p style="margin-top: 32px; font-size: 13px; color: #94a3b8;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Ricoz Communication. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;

  try {
    const info = await sendMail({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: 'Reset your Ricoz password',
      html,
    });
    console.log(`[EmailService] Password reset email sent → ${toEmail} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || null };
  } catch (err) {
    console.error(`[EmailService] Failed to send reset email to ${toEmail}:`, err);
    return { success: false, error: String(err) };
  }
}

// -----------------------------------------------------------------
// 3. SMTP Connection Test
// -----------------------------------------------------------------
export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = await getTransporter();
    await transporter.verify();
    return { success: true, message: 'SMTP connection verified successfully ✅' };
  } catch (err: any) {
    return { success: false, message: `SMTP connection failed: ${err.message}` };
  }
}
