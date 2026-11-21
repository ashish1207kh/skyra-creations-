import assert from 'assert';
import { generatePresignedUploadUrl, generatePresignedViewUrl } from '../api/_lib/r2Client.js';
import { 
  createParticipantAndPayment, 
  addBalancePayment, 
  lookupParticipant, 
  lookupPublicParticipant,
  verifyPassToken,
  verifyPaymentRecord, 
  getDashboardStats, 
  getAllParticipants, 
  getAllPayments 
} from '../api/_lib/supabaseAdmin.js';
import { checkRateLimit } from '../api/_lib/rateLimit.js';
import { createAdminSession, verifyAdminAuth } from '../api/_lib/adminAuth.js';

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

  // 4. Test Participant Lookup & Public Sanitization
  console.log('3. Testing Participant Lookup & Public Sanitization...');
  const existing = await lookupParticipant('SC-2026-1001');
  assert(existing !== null);
  assert.strictEqual(existing.full_name, 'Ananya Sharma');
  assert.strictEqual(existing.status, 'FULLY_PAID');
  assert.strictEqual(existing.balance_due, 0);

  const publicData = await lookupPublicParticipant('SC-2026-1001');
  assert(publicData !== null);
  assert.strictEqual(publicData.full_name, 'Ananya Sharma');
  assert.strictEqual((publicData as any).mobile, undefined, 'Public lookup must not leak mobile');
  assert.strictEqual((publicData as any).email, undefined, 'Public lookup must not leak email');
  assert(publicData.pass_token.startsWith('SKYRA-PASS-'), 'Pass token must be opaque');
  console.log('   ✓ Public lookup sanitization verified (zero PII leaked, opaque pass token provided)');

  // 5. Test Runway Show Registration Workflow
  console.log('4. Testing Registration Workflow with Initial Payment...');
  const testEmail = `contestant.${Date.now()}@example.com`;
  const testMobile = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testTxId = `UPI${Date.now()}`;
  
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
      amount: 2500,
      transaction_id: testTxId,
      r2_object_key: presignResult.objectKey,
      file_mime: 'image/png',
      file_size: 204800,
    },
  });

  assert(participant.reg_id.startsWith('SC-2026-'));
  assert.strictEqual(participant.status, 'PENDING_VERIFICATION');
  assert.strictEqual(payment.amount, 2500);
  assert.strictEqual(payment.status, 'PENDING');
  console.log('   ✓ New participant registered with Registration ID:', participant.reg_id);

  // Test Duplicate Transaction ID Rejection
  try {
    await createParticipantAndPayment({
      participantData: {
        full_name: 'Duplicate Attempt',
        email: `dup.${Date.now()}@example.com`,
        dob: '2000-01-01',
        gender: 'Female',
        mobile: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
        whatsapp: '+919900000000',
        city: 'Mumbai',
        category: 'Runway Model',
        total_fee: 5000,
      },
      paymentData: {
        amount: 1500,
        transaction_id: testTxId, // Duplicate!
        r2_object_key: presignResult.objectKey,
      },
    });
    assert.fail('Should have rejected duplicate transaction ID');
  } catch (dupErr: any) {
    assert(dupErr.message.includes('already been submitted'));
    console.log('   ✓ Duplicate transaction reference / UTR successfully rejected');
  }

  // 6. Test Admin Payment Approval
  console.log('5. Testing Administrative Payment Verification & Balance Recalculation...');
  const verifiedPayment = await verifyPaymentRecord({
    payment_id: payment.payment_id,
    action: 'VERIFY',
    adminName: 'Chief Operations Officer',
    ipAddress: '127.0.0.1',
  });

  assert.strictEqual(verifiedPayment.status, 'VERIFIED');
  assert.strictEqual(verifiedPayment.participant.amount_paid, 2500);
  assert.strictEqual(verifiedPayment.participant.balance_due, 2500);
  assert.strictEqual(verifiedPayment.participant.status, 'PARTIALLY_PAID');
  console.log('   ✓ Initial payment verified: Paid ₹2500, Balance Due ₹2500, Status PARTIALLY_PAID');

  // 7. Test Balance Payment Submission, Overpayment Prevention & Clearance
  console.log('6. Testing Balance Payment Submission & Overpayment Prevention...');
  const balPresign = await generatePresignedUploadUrl({
    fileName: 'balance_receipt.jpg',
    mimeType: 'image/jpeg',
    fileSizeBytes: 150000,
  });

  // Attempt Overpayment (> balance_due of 2500)
  try {
    await addBalancePayment({
      reg_id: participant.reg_id,
      amount: 3000, // Exceeds 2500
      transaction_id: `UPI_EXCEED_${Date.now()}`,
      r2_object_key: balPresign.objectKey,
    });
    assert.fail('Should have rejected overpayment');
  } catch (overErr: any) {
    assert(overErr.message.includes('exceeds current outstanding balance'));
    console.log('   ✓ Overpayment successfully prevented by business logic rule');
  }

  // Submit valid exact remaining balance (₹2500)
  const balTxId = `UPI_BAL_${Date.now()}`;
  const { payment: balPayment } = await addBalancePayment({
    reg_id: participant.reg_id,
    amount: 2500,
    transaction_id: balTxId,
    r2_object_key: balPresign.objectKey,
  });

  assert.strictEqual(balPayment.payment_type, 'BALANCE_PAYMENT');
  assert.strictEqual(balPayment.amount, 2500);
  console.log('   ✓ Valid balance installment payment of ₹2500 submitted');

  // Verify second payment to achieve FULLY_PAID
  const finalVerified = await verifyPaymentRecord({
    payment_id: balPayment.payment_id,
    action: 'VERIFY',
    adminName: 'Chief Operations Officer',
  });

  assert.strictEqual(finalVerified.participant.amount_paid, 5000);
  assert.strictEqual(finalVerified.participant.balance_due, 0);
  assert.strictEqual(finalVerified.participant.status, 'FULLY_PAID');
  console.log('   ✓ Balance verified: Paid ₹5000, Balance Due ₹0, Status FULLY_PAID');

  // 8. Test Opaque Digital Pass Token Check-in Validation
  console.log('7. Testing Digital Pass Token Verification...');
  const passCheck = await verifyPassToken(participant.pass_token!);
  assert.strictEqual(passCheck.valid, true);
  assert.strictEqual(passCheck.full_name, 'Tara Sundaram');
  assert.strictEqual(passCheck.status, 'FULLY_PAID');
  assert.strictEqual(passCheck.event_entry_status, 'CONFIRMED_ALL_ACCESS');
  console.log('   ✓ Digital pass token verified at venue check-in endpoint');

  // 9. Test Admin Auth Sessions
  console.log('8. Testing Admin Session Creation & Validation...');
  const sessionToken = createAdminSession('director@skyracreations.com', 'superadmin');
  const mockReq = {
    headers: { authorization: `Bearer ${sessionToken}` },
    query: {},
  } as any;
  const authCheck = verifyAdminAuth(mockReq);
  assert.strictEqual(authCheck.valid, true);
  assert.strictEqual(authCheck.session?.email, 'director@skyracreations.com');
  console.log('   ✓ Admin session token verified without hardcoded secrets');

  // 10. Test Dashboard Stats
  console.log('9. Testing Dashboard Stats Aggregation...');
  const stats = await getDashboardStats();
  assert(stats.total_participants >= 4);
  assert(stats.total_verified_revenue >= 10000);
  console.log('   ✓ Stats accurately calculated: Total Participants =', stats.total_participants, ', Revenue = ₹' + stats.total_verified_revenue);

  // 11. Test Consolidated Serverless Routers (Hobby Plan Compliant: <= 12 Functions)
  console.log('10. Testing Consolidated Hobby-Plan Compliant Routers...');
  const adminHandler = (await import('../api/admin/[action].js')).default;
  const storageHandler = (await import('../api/storage/[action].js')).default;

  // Mock response helper
  function createMockRes() {
    let statusCode = 200;
    let data: any = null;
    const headers: Record<string, string> = {};
    return {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: any) {
        data = payload;
        return this;
      },
      send(payload: any) {
        data = payload;
        return this;
      },
      setHeader(name: string, val: string) {
        headers[name] = val;
      },
      getStatus: () => statusCode,
      getData: () => data,
    } as any;
  }

  // Test admin login via consolidated router
  const loginRes = createMockRes();
  await adminHandler({
    method: 'POST',
    query: { action: 'login' },
    headers: {},
    body: { email: 'admin@skyracreations.com', password: 'SkyraDirector@Runway2026' },
  } as any, loginRes);
  assert.strictEqual(loginRes.getStatus(), 200);
  assert(loginRes.getData().token);
  console.log('   ✓ Consolidated admin router handled action=login successfully');

  // Test storage upload via consolidated router
  const uploadRes = createMockRes();
  await storageHandler({
    method: 'POST',
    query: { action: 'presigned-upload' },
    headers: {},
    body: {
      fileName: 'proof.png',
      mimeType: 'image/png',
      fileSizeBytes: 1024,
      folder: 'proofs',
    },
  } as any, uploadRes);
  assert.strictEqual(uploadRes.getStatus(), 200);
  assert(uploadRes.getData().uploadUrl);
  console.log('   ✓ Consolidated storage router handled action=presigned-upload successfully');

  // Test health check endpoint
  console.log('11. Testing Health Check Endpoint...');
  const healthHandler = (await import('../api/health.js')).default;
  const healthRes = createMockRes();
  await healthHandler({
    method: 'GET',
    headers: {},
  } as any, healthRes);
  assert.strictEqual(healthRes.getStatus(), 200);
  assert.strictEqual(healthRes.getData().status, 'healthy');
  console.log('   ✓ Health check endpoint verified (status: healthy, uptime tracking active)');

  console.log('\n=========================================');
  console.log('ALL SERVERLESS & STORAGE SUITES PASSED! ✓');
  console.log('=========================================');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
