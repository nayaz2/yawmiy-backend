require('dotenv').config();
const crypto = require('crypto');

console.log('=== PhonePe Configuration Verification ===\n');

const merchantId = process.env.PHONEPE_MERCHANT_ID;
const saltKey = process.env.PHONEPE_SALT_KEY;
const saltIndex = process.env.PHONEPE_SALT_INDEX;
const baseUrl = process.env.PHONEPE_BASE_URL;

console.log('Merchant ID:', merchantId || '❌ NOT SET');
console.log('Salt Key:', saltKey ? `${saltKey.substring(0, 20)}...` : '❌ NOT SET');
console.log('Salt Index:', saltIndex || '❌ NOT SET');
console.log('Base URL:', baseUrl || '❌ NOT SET');
console.log('');

// Check for common issues
const issues = [];

if (!merchantId || merchantId === 'MERCHANTUAT') {
  issues.push('⚠️  Merchant ID is not set or using default value');
}

if (!saltKey || saltKey === 'YOUR_SALT_KEY' || saltKey === 'YOUR_SALT_KEY_HERE') {
  issues.push('⚠️  Salt Key is not set or using placeholder value');
}

if (saltKey && saltKey.includes(' ')) {
  issues.push('⚠️  Salt Key contains spaces - remove any leading/trailing spaces');
}

if (merchantId && merchantId.includes(' ')) {
  issues.push('⚠️  Merchant ID contains spaces - remove any leading/trailing spaces');
}

if (baseUrl && !baseUrl.includes('preprod') && !baseUrl.includes('sandbox')) {
  issues.push('⚠️  Base URL might be production URL - use sandbox URL for testing');
}

if (issues.length > 0) {
  console.log('Issues found:');
  issues.forEach(issue => console.log(issue));
} else {
  console.log('✅ Configuration looks good!');
}

console.log('\n=== Test Signature Generation ===\n');

// Test signature generation
if (merchantId && saltKey && saltIndex) {
  const testPayload = {
    merchantId: merchantId,
    merchantTransactionId: 'TEST_ORDER_123',
    amount: 10000,
    merchantUserId: '1',
    redirectUrl: 'http://localhost:3000/callback',
    redirectMode: 'REDIRECT',
    callbackUrl: 'http://localhost:3000/webhook',
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(testPayload)).toString('base64');
  const stringToHash = `${base64Payload}/pg/v1/pay${saltKey}`;
  const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const xVerify = `${sha256Hash}###${saltIndex}`;

  console.log('Test Payload:', JSON.stringify(testPayload, null, 2));
  console.log('Base64 Payload:', base64Payload);
  console.log('String to Hash (first 100 chars):', stringToHash.substring(0, 100) + '...');
  console.log('SHA256 Hash:', sha256Hash);
  console.log('X-VERIFY Header:', xVerify);
  console.log('\n✅ Signature generation test completed');
} else {
  console.log('❌ Cannot test signature - missing credentials');
}

console.log('\n=== Recommendations ===\n');
console.log('1. Verify Merchant ID and Salt Key in PhonePe Dashboard');
console.log('2. Make sure you are using SANDBOX credentials for testing');
console.log('3. Check that Merchant ID format matches exactly (with or without suffix)');
console.log('4. Ensure Salt Key has no extra spaces or quotes');
console.log('5. Restart server after updating .env file');

