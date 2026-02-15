/**
 * Test script to diagnose Brevo API connection issues
 * Run with: npx tsx scripts/test-brevo.ts
 */
import dotenv from 'dotenv';
import path from 'node:path';

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;

console.log('🔍 Brevo Configuration Diagnostics\n');
console.log('Environment Variables:');
console.log('--------------------');
console.log('BREVO_API_KEY:', BREVO_API_KEY ? `${BREVO_API_KEY.slice(0, 20)}...` : '❌ NOT SET');
console.log('BREVO_SENDER_NAME:', BREVO_SENDER_NAME || '❌ NOT SET');
console.log('BREVO_SENDER_EMAIL:', BREVO_SENDER_EMAIL || '❌ NOT SET');
console.log();

if (!BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY is not set in .env file');
  process.exit(1);
}

async function testBrevoConnection() {
  try {
    console.log('🧪 Testing Brevo API Connection...\n');

    // Test 1: Get Account Info (verify credentials)
    console.log('Test 1: Verifying API credentials...');
    try {
      const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY!,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Key validation failed');
        console.error('   Status:', response.status, response.statusText);
        console.error('   Details:', JSON.stringify(errorData, null, 2));
        console.log();
        throw new Error(`HTTP ${response.status}`);
      }

      const account = await response.json();
      console.log('✅ API Key is valid');
      console.log('   Account email:', account.email);
      console.log('   Company name:', account.companyName);
      console.log();
    } catch (error: any) {
      if (!error.message.includes('HTTP')) {
        console.error('❌ API Key validation failed');
        console.error('   Error:', error.message);
        console.log();
      }
      throw error;
    }

    // Test 2: Verify sender
    console.log('Test 2: Verifying sender email...');
    try {
      const response = await fetch('https://api.brevo.com/v3/senders', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY!,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const senderExists = data.senders?.some(
        (s: any) => s.email.toLowerCase() === BREVO_SENDER_EMAIL?.toLowerCase()
      );

      if (senderExists) {
        console.log(`✅ Sender "${BREVO_SENDER_EMAIL}" is configured`);
      } else {
        console.warn(`⚠️  Sender "${BREVO_SENDER_EMAIL}" not found in your account`);
        console.log('   Available senders:');
        data.senders?.forEach((s: any) => {
          console.log(`   - ${s.email} (${s.name})`);
        });
      }
      console.log();
    } catch (error: any) {
      console.error('❌ Failed to verify sender');
      console.error('   Error:', error.message);
      console.log();
    }

    // Test 3: Send test email (optional)
    const shouldSendTest = process.argv.includes('--send-test');
    if (shouldSendTest) {
      console.log('Test 3: Sending test email...');
      const testEmail = process.argv[process.argv.indexOf('--send-test') + 1];

      if (!testEmail || !testEmail.includes('@')) {
        console.error('❌ Please provide a valid test email: --send-test your@email.com');
        return;
      }

      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY!,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: BREVO_SENDER_NAME!,
              email: BREVO_SENDER_EMAIL!,
            },
            to: [{ email: testEmail, name: 'Test User' }],
            subject: 'Brevo API Test',
            htmlContent: '<h1>Success!</h1><p>Your Brevo integration is working correctly.</p>',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Failed to send test email');
          console.error('   Status:', response.status, response.statusText);
          console.error('   Details:', JSON.stringify(errorData, null, 2));
          console.log();
        } else {
          const result = await response.json();
          console.log(`✅ Test email sent to ${testEmail}`);
          console.log('   Message ID:', result.messageId);
          console.log();
        }
      } catch (error: any) {
        console.error('❌ Failed to send test email');
        console.error('   Error:', error.message);
        console.log();
      }
    }

    console.log('✅ All tests completed');
    console.log();
    console.log('💡 Tips:');
    console.log('   - If API key is invalid, generate a new one at: https://app.brevo.com/settings/keys/api');
    console.log('   - Make sure your sender email is verified at: https://app.brevo.com/settings/senders');
    console.log('   - Run with --send-test your@email.com to send a test email');

  } catch (error: any) {
    console.error('\n❌ Diagnosis failed');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testBrevoConnection();
