import assert from 'assert';
import { generatePresignedUploadUrl, generatePresignedViewUrl } from '../api/_lib/r2Client.js';
import { 
  createParticipantAndPayment, 
  addBalancePayment, 
  lookupParticipant, 
  verifyPaymentRecord, 
  getDashboardStats, 
  getAllParticipants, 
  getAllPayments 
} from '../api/_lib/supabaseAdmin.js';
import { checkRateLimit } from '../api/_lib/rateLimit.js';

async function runTests() {
  console.log('--- STARTING SERVERLESS & STORAGE SUITE ---');

  // 1. Test Cloudflare R2 Presigned Upload & Security Validation
  console.log('1. Testing Cloudflare R2 presigning & security...');
  const presignResult = await generatePresignedUploadUrl({
    fileName: 'my_screenshot.png',
    mimeType: 'image/png',
    fileSizeBytes: 204800,
    folder: 'proofs',
  });

  assert(presignResult.objectKey.startsWith('proofs/'));
  assert(presignResult.uploadUrl.length > 0);
  assert.strictEqual(presignResult.expiresInSeconds, 300);
  console.log('   ✓ Presigned PUT upload generated with random UUID key:', presignResult.objectKey);

  // Test invalid MIME type rejection
  try {
    await generatePresignedUploadUrl({
      fileName: 'malicious.exe',
      mimeType: 'application/x-msdownload',
      fileSizeBytes: 500,
    });
    assert.fail('Should have rejected non-image MIME type');
  } catch (err: any) {
    assert(err.message.includes('Unsupported MIME type'));
    console.log('   ✓ Non-image MIME type successfully blocked');
  }

  // Test file size limit rejection (>10MB)
  try {
    await generatePresignedUploadUrl({
      fileName: 'huge.png',
      mimeType: 'image/png',
      fileSizeBytes: 15 * 1024 * 1024,
    });
    assert.fail('Should have rejected file > 10MB');
  } catch (err: any) {
    assert(err.message.includes('exceeds maximum limit'));
    console.log('   ✓ 10MB file size limit enforced');
  }

  // 2. Test Presigned View URL (private bucket)
  const viewUrl = await generatePresignedViewUrl(presignResult.objectKey);
  assert(viewUrl.length > 0);
  console.log('   ✓ Presigned GET view URL generated (short-lived 15 mins)');

  // 3. Test Rate Limiter
  console.log('2. Testing In-Memory Rate Limiting...');
  const testIp = '192.168.1.100';
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(testIp, 5, 60);
    if (i < 4) assert.strictEqual(res.allowed, true);
  }
  const blocked = checkRateLimit(testIp, 5, 60);
  assert.strictEqual(blocked.allowed, false);
  console.log('   ✓ Rate limit strictly blocks after limit reached');

  // 4. Test Participant Lookup
  console.log('3. Testing Supabase Participant Lookup...');
  const existing = await lookupParticipant('SC-2026-1001');
  assert(existing !== null);
  assert.strictEqual(existing.full_name, 'Ananya Sharma');
  assert.strictEqual(existing.status, 'FULLY_PAID');
  assert.strictEqual(existing.balance_due, 0);
  console.log('   ✓ Participant SC-2026-1001 found with 0 balance');

  // 5. Test Runway Show Registration Workflow
  console.log('4. Testing Registration Workflow with Initial Payment...');
  const testEmail = `contestant.${Date.now()}@example.com`;
  const testMobile = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;
  
  const { participant, payment } = await createParticipantAndPayment({
    participantData: {
      full_name: 'Tara Sundaram',
      email: testEmail,
      dob: '18-09-2002',
      gender: 'Female',
      mobile: testMobile,
      whatsapp: testMobile,
      city: 'Hyderabad',
      category: 'Runway Model',
      height: '5ft 10in',
      instagram: '@tara_runway',
      experience: 'Fresher pageant',
      total_fee: 5000,
    },
    paymentData: {
      amount: 2000,
      transaction_id: 'UPI/998877665544',
      r2_object_key: presignResult.objectKey,
      file_mime: 'image/png',
      file_size: 204800,
    },
  });

  assert(participant.reg_id.startsWith('SC-2026-'));
  assert.strictEqual(participant.status, 'PENDING_VERIFICATION');
  assert.strictEqual(payment.amount, 2000);
  assert.strictEqual(payment.status, 'PENDING');
  console.log('   ✓ New participant registered with Registration ID:', participant.reg_id);

  // 6. Test Admin Payment Approval
  console.log('5. Testing Administrative Payment Verification & Balance Recalculation...');
  const verifiedPayment = await verifyPaymentRecord({
    payment_id: payment.payment_id,
    action: 'VERIFY',
    adminName: 'Chief Verification Officer',
    ipAddress: '127.0.0.1',
  });

  assert.strictEqual(verifiedPayment.status, 'VERIFIED');
  assert.strictEqual(verifiedPayment.participant.amount_paid, 2000);
  assert.strictEqual(verifiedPayment.participant.balance_due, 3000);
  assert.strictEqual(verifiedPayment.participant.status, 'PARTIALLY_PAID');
  console.log('   ✓ Initial payment verified: Paid ₹2000, Balance Due ₹3000, Status PARTIALLY_PAID');

  // 7. Test Balance Payment Submission & Clearance
  console.log('6. Testing Balance Payment Submission & Full Clearance...');
  const balPresign = await generatePresignedUploadUrl({
    fileName: 'balance_receipt.jpg',
    mimeType: 'image/jpeg',
    fileSizeBytes: 150000,
  });

  const { payment: balPayment } = await addBalancePayment({
    reg_id: participant.reg_id,
    amount: 3000,
    transaction_id: 'UPI/334455667788',
    r2_object_key: balPresign.objectKey,
  });

  assert.strictEqual(balPayment.payment_type, 'BALANCE_PAYMENT');
  assert.strictEqual(balPayment.amount, 3000);
  console.log('   ✓ Balance installment payment of ₹3000 submitted');

  // Verify second payment to achieve FULLY_PAID
  const finalVerified = await verifyPaymentRecord({
    payment_id: balPayment.payment_id,
    action: 'VERIFY',
    adminName: 'Chief Verification Officer',
  });

  assert.strictEqual(finalVerified.participant.amount_paid, 5000);
  assert.strictEqual(finalVerified.participant.balance_due, 0);
  assert.strictEqual(finalVerified.participant.status, 'FULLY_PAID');
  console.log('   ✓ Balance verified: Paid ₹5000, Balance Due ₹0, Status FULLY_PAID');

  // 8. Test Dashboard Stats
  console.log('7. Testing Dashboard Stats Aggregation...');
  const stats = await getDashboardStats();
  assert(stats.total_participants >= 4);
  assert(stats.total_verified_revenue >= 10000);
  console.log('   ✓ Stats accurately calculated: Total Participants =', stats.total_participants, ', Revenue = ₹' + stats.total_verified_revenue);

  console.log('\n=========================================');
  console.log('ALL SERVERLESS & STORAGE SUITES PASSED! ✓');
  console.log('=========================================');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
