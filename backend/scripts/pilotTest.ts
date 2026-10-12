// backend/scripts/pilotTest.ts
import { sendTestEmail } from '../src/utils/emailSender';

async function run() {
  console.log('🚀 Starting pilot email test...');
  const result = await sendTestEmail(
    process.env.TEST_EMAIL_TO || 'test@example.com',
    '🚀 Pilot Test Email from Ricoz',
    `<h1>Ricoz Pilot Email</h1><p>This is a test email to verify the EmailLog integration.</p>`
  );
  console.log('Result:', result);
  process.exit(0);
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
