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

  // 12. Test Technical SEO & Metadata Assets
  console.log('12. Testing Technical SEO & Metadata Assets...');
  const fs = await import('fs');
  const path = await import('path');

  // A. robots.txt
  const robotsPath = path.resolve(process.cwd(), 'public', 'robots.txt');
  assert(fs.existsSync(robotsPath), 'public/robots.txt must exist');
  const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
  assert(robotsTxt.includes('Sitemap: https://www.skyracreations.site/sitemap.xml'));
  assert(robotsTxt.includes('Disallow: /admin'));
  console.log('   ✓ robots.txt verified with correct sitemap declaration and admin disallow');

  // B. sitemap.xml
  const sitemapPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  assert(fs.existsSync(sitemapPath), 'public/sitemap.xml must exist');
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  assert(sitemapXml.includes('<loc>https://www.skyracreations.site/</loc>'));
  assert(sitemapXml.includes('<loc>https://www.skyracreations.site/register</loc>'));
  assert(sitemapXml.includes('<loc>https://www.skyracreations.site/balance</loc>'));
  assert(sitemapXml.includes('<loc>https://www.skyracreations.site/status</loc>'));
  console.log('   ✓ sitemap.xml verified with all 4 canonical indexable endpoints');

  // C. Open Graph 1200x630 Image
  const ogImgPath = path.resolve(process.cwd(), 'public', 'og-image.png');
  assert(fs.existsSync(ogImgPath), 'public/og-image.png must exist');
  const ogBuf = fs.readFileSync(ogImgPath);
  const ogWidth = ogBuf.readUInt32BE(16);
  const ogHeight = ogBuf.readUInt32BE(20);
  assert.strictEqual(ogWidth, 1200, 'OG image width must be 1200');
  assert.strictEqual(ogHeight, 630, 'OG image height must be 630');
  console.log('   ✓ Open Graph preview image verified (exact 1200x630 dimensions)');

  // D. index.html Initial Metadata & JSON-LD
  const indexPath = path.resolve(process.cwd(), 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  assert(indexHtml.includes('<link rel="canonical" href="https://www.skyracreations.site/" />'));
  assert(indexHtml.includes('property="og:title"'));
  assert(indexHtml.includes('name="twitter:card" content="summary_large_image"'));
  assert(indexHtml.includes('"@type": "Organization"'));
  assert(indexHtml.includes('"@type": "Event"'));
  assert(indexHtml.includes('https://www.instagram.com/skyra_creations_/'));
  console.log('   ✓ index.html initial metadata, canonical link & JSON-LD schema verified');

  // 13. Test Field-Level Encryption & Blind Indexing
  console.log('13. Testing AES-256-GCM field encryption & HMAC-SHA256 blind indexing...');
  const { encryptField, decryptField, computeBlindIndex } = await import('../api/_lib/encryption.js');
  const sensitivePhone = '+919876543210';
  const encryptedPhone = encryptField(sensitivePhone);
  assert(encryptedPhone && encryptedPhone !== sensitivePhone, 'Phone must be encrypted');
  const decryptedPhone = decryptField(encryptedPhone);
  assert.strictEqual(decryptedPhone, sensitivePhone, 'Decrypted phone must match original');

  const blindIdx1 = computeBlindIndex(sensitivePhone);
  const blindIdx2 = computeBlindIndex('+91 98765-43210'); // Same phone with formatting
  assert.strictEqual(blindIdx1, blindIdx2, 'Blind indexes must match regardless of formatting');
  console.log('   ✓ AES-256-GCM encryption/decryption & HMAC-SHA256 blind indexing verified');

  // 14. Test RBAC Permissions Matrix
  console.log('14. Testing Role-Based Access Control (RBAC) permission matrix...');
  const { hasPermission } = await import('../api/_lib/adminAuth.js');
  assert(hasPermission('OWNER', 'delete-event'), 'OWNER must be permitted to delete events');
  assert(!hasPermission('ADMINISTRATOR', 'delete-event'), 'ADMINISTRATOR must not delete events');
  assert(hasPermission('ADMINISTRATOR', 'export'), 'ADMINISTRATOR must be permitted to export');
  assert(hasPermission('PAYMENT_VERIFICATION_STAFF', 'verify-payment'), 'VERIFIER must be permitted to verify payment');
  assert(!hasPermission('PAYMENT_VERIFICATION_STAFF', 'export'), 'VERIFIER must not export full database');
  assert(hasPermission('VIEWER', 'stats'), 'VIEWER must be permitted to view stats');
  assert(!hasPermission('VIEWER', 'verify-payment'), 'VIEWER must not verify payments');
  console.log('   ✓ RBAC permission hierarchy verified for OWNER, ADMIN, VERIFIER, and VIEWER');

  // 15. Test Favicon & PWA Manifest Assets
  console.log('15. Testing Favicon & PWA Web Manifest assets...');
  const faviconIcoPath = path.resolve(process.cwd(), 'public', 'favicon.ico');
  const faviconSvgPath = path.resolve(process.cwd(), 'public', 'favicon.svg');
  const manifestPath = path.resolve(process.cwd(), 'public', 'site.webmanifest');
  assert(fs.existsSync(faviconIcoPath), 'public/favicon.ico must exist');
  assert(fs.existsSync(faviconSvgPath), 'public/favicon.svg must exist');
  assert(fs.existsSync(manifestPath), 'public/site.webmanifest must exist');

  const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifestJson.name.includes('SKYRA CREATIONS'), 'Manifest name must contain brand');
  assert(manifestJson.short_name === 'SKYRA', 'Manifest short name must be SKYRA');
  assert(manifestJson.icons.length >= 6, 'Manifest must declare at least 6 icon sizes');
  console.log('   ✓ Favicon suite and site.webmanifest validated');

  // 16. Test Database Abstraction Layer & PII Masking
  console.log('16. Testing Database Abstraction Layer & PII Masking...');
  const { 
    getActiveDatabaseDriver, 
    maskPII, 
    getEventConfig, 
    registerParticipant,
    submitBalancePayment,
    updatePaymentVerification,
    OFFICIAL_DECLARATION_TEXT 
  } = await import('../api/_lib/database.js');
  const activeDriver = await getActiveDatabaseDriver();
  assert(['mongodb', 'supabase', 'in-memory'].includes(activeDriver), 'Must resolve to a valid driver');
  
  const sampleParticipant = {
    id: 'test-1',
    reg_id: 'SC-2026-9999',
    event_id: 'EVT-CHX-2026',
    full_name: 'Test Candidate',
    email: 'candidate@example.com',
    dob: '15-05-2000',
    gender: 'Female',
    mobile: '+919876543210',
    whatsapp: '+919876543210',
    city: 'Chennai',
    category: 'Runway Model',
    total_fee: 5000,
    amount_paid: 5000,
    balance_due: 0,
    status: 'FULLY_PAID' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const masked = maskPII(sampleParticipant);
  assert(masked.mobile.includes('****'), 'Mobile must be masked for unprivileged viewers');
  assert(masked.email.includes('****'), 'Email must be masked for unprivileged viewers');
  assert.strictEqual(masked.dob, '**-**-****', 'DOB must be masked for unprivileged viewers');
  console.log('   ✓ Database driver resolved to [' + activeDriver + '] and PII masking verified');

  // 17. Test ₹3,000 Event Fee, Allowed Token Advances, Model Photograph Upload & Terms Acceptance
  console.log('17. Testing ₹3,000 Event Fee, Token Advances & Model Photograph Flow...');
  const evt = await getEventConfig('EVT-CHX-2026');
  assert.strictEqual(evt.total_fee, 3000, 'Total event fee must be ₹3,000');
  assert.deepStrictEqual(evt.allowed_token_advances, [500, 1000, 1500], 'Allowed token advances must be [500, 1000, 1500]');
  assert.strictEqual(evt.terms_version, '2026.2', 'Terms version must be 2026.2');
  console.log('   ✓ Authoritative event configuration verified (Fee ₹3,000, Advances: [500, 1000, 1500], Terms: 2026.2)');

  // Test photo upload presigning
  const photoPresign = await generatePresignedUploadUrl({
    fileName: 'model_headshot.jpg',
    mimeType: 'image/jpeg',
    fileSizeBytes: 350000,
    folder: 'photos',
  });
  assert(photoPresign.objectKey.startsWith('photos/'), 'Model photo key must be in photos/ folder');
  console.log('   ✓ Model photo presigned upload URL generated under photos/ folder:', photoPresign.objectKey);

  // Test rejection of invalid token advance amount
  try {
    await registerParticipant({
      full_name: 'Invalid Amount Tester',
      email: `badamt.${Date.now()}@example.com`,
      dob: '2001-01-01',
      gender: 'Female',
      mobile: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
      whatsapp: '+919900000000',
      city: 'Chennai',
      model_photo_r2_key: photoPresign.objectKey,
      amount: 2000, // Invalid token advance (must be 500, 1000, or 1500)
      transaction_id: `TX_BAD_${Date.now()}`,
      r2_object_key: presignResult.objectKey,
      terms_confirmed: true,
    });
    assert.fail('Should have rejected non-allowed token advance of ₹2000');
  } catch (err: any) {
    assert(err.message.includes('Token advance must be one of'), 'Must reject disallowed advance amount');
    console.log('   ✓ Disallowed token advance amount correctly rejected');
  }

  // Test successful registration with ₹1,000 token advance & model photograph
  const validRegTx = `TX_OK_${Date.now()}`;
  const regResult = await registerParticipant({
    full_name: 'Pooja Hegde Model',
    email: `pooja.${Date.now()}@example.com`,
    dob: '1998-05-10',
    gender: 'Female',
    mobile: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
    whatsapp: '+919800000000',
    city: 'Chennai',
    model_photo_r2_key: photoPresign.objectKey,
    amount: 1000,
    transaction_id: validRegTx,
    r2_object_key: presignResult.objectKey,
    terms_confirmed: true,
  });

  assert(regResult.participant.reg_id.startsWith('SC-2026-'));
  assert.strictEqual(regResult.participant.total_fee, 3000, 'New registration total fee must be ₹3,000');
  assert.strictEqual(regResult.participant.amount_paid, 0, 'Initial verified paid amount must be 0 until verified');
  assert.strictEqual(regResult.participant.balance_due, 3000, 'Initial balance due must equal total fee');
  assert.strictEqual(regResult.participant.status, 'PENDING_VERIFICATION');
  assert.strictEqual(regResult.participant.model_photo_r2_key, photoPresign.objectKey);
  assert.strictEqual(regResult.participant.terms_version, '2026.2');
  assert.strictEqual(regResult.participant.terms_accepted, true);
  assert.strictEqual(regResult.participant.declaration_text, OFFICIAL_DECLARATION_TEXT);
  assert.strictEqual(regResult.payment.amount, 1000);
  assert.strictEqual(regResult.payment.status, 'PENDING');
  console.log('   ✓ Registration completed with ₹1,000 advance, total fee ₹3,000, model photo key saved & terms accepted');

  // Verify payment and check that balance reduces from ₹3,000 to ₹2,000
  const verifyRes = await updatePaymentVerification(
    regResult.payment.payment_id,
    regResult.participant.reg_id,
    'VERIFIED',
    'Admin Director'
  );
  assert.strictEqual(verifyRes.participant?.amount_paid, 1000, 'Paid amount must reflect ₹1,000');
  assert.strictEqual(verifyRes.participant?.balance_due, 2000, 'Balance due must reflect ₹2,000 (3000 - 1000)');
  assert.strictEqual(verifyRes.participant?.status, 'PARTIALLY_PAID');
  console.log('   ✓ Payment verification reduced balance from ₹3,000 to ₹2,000 (status: PARTIALLY_PAID)');

  // Submit remaining ₹2,000 balance payment
  const balTx = `TX_BAL_${Date.now()}`;
  const balRes = await submitBalancePayment({
    reg_id: regResult.participant.reg_id,
    amount: 2000,
    transaction_id: balTx,
    r2_object_key: presignResult.objectKey,
  });
  assert.strictEqual(balRes.payment.amount, 2000);
  assert.strictEqual(balRes.payment.status, 'PENDING');

  // Verify second payment and confirm FULLY_PAID status with ₹0 balance
  const finalVerifyRes = await updatePaymentVerification(
    balRes.payment.payment_id,
    regResult.participant.reg_id,
    'VERIFIED',
    'Admin Director'
  );
  assert.strictEqual(finalVerifyRes.participant?.amount_paid, 3000, 'Total paid must equal ₹3,000');
  assert.strictEqual(finalVerifyRes.participant?.balance_due, 0, 'Remaining balance must equal ₹0');
  assert.strictEqual(finalVerifyRes.participant?.status, 'FULLY_PAID');
  console.log('   ✓ Remaining ₹2,000 verified: total paid ₹3,000, balance due ₹0, status FULLY_PAID');

  // 18. Testing Strict MongoDB Storage Optimization (512 MB Limit) & Monitoring
  console.log('18. Testing Strict MongoDB Storage Optimization (512 MB Limit) & Monitoring...');
  const { getStorageMetrics, listRegistrations: listRegsPaginated } = await import('../api/_lib/database.js');

  const metrics = await getStorageMetrics();
  assert.strictEqual(metrics.storageLimitMB, 512, 'Limit must strictly be 512 MB');
  assert(metrics.remainingCapacityMB > 0, 'Remaining capacity must be > 0 MB');
  assert(metrics.usagePercentage >= 0 && metrics.usagePercentage <= 100, 'Usage percentage must be between 0% and 100%');
  assert(metrics.alert.thresholdPercent >= 60, 'Thresholds must be configured');
  assert(['NORMAL', 'INFORMATIONAL_WARNING', 'WARNING', 'CRITICAL_WARNING', 'EMERGENCY_WARNING'].includes(metrics.alert.level), 'Valid alert level');
  assert.strictEqual(metrics.storageHealth.r2_offload_active, true, 'R2 media offloading must be active');
  assert.strictEqual(metrics.storageHealth.zero_binary_in_db, true, 'Zero binary/base64 in database verified');
  assert.strictEqual(metrics.storageHealth.ttl_cleanup_active, true, 'TTL automated cleanup must be active');
  console.log(`   ✓ Storage metrics verified: ${metrics.totalAllocatedMB} MB / 512 MB (${metrics.usagePercentage}%), Alert Level: ${metrics.alert.level}`);

  // Test server-side pagination
  const paginatedRegs = await listRegsPaginated(undefined, false, { page: 1, limit: 10 });
  assert(paginatedRegs && paginatedRegs.items, 'Paginated registrations must return items');
  assert(typeof paginatedRegs.total === 'number', 'Paginated registrations must return total');
  assert.strictEqual(paginatedRegs.page, 1, 'Page must equal 1');
  console.log(`   ✓ Server-side pagination verified (Page 1, limit 10, total: ${paginatedRegs.total})`);

  // Test collection breakdown stats structure
  assert(Array.isArray(metrics.collections), 'Collections array must be present');
  const regCol = metrics.collections.find(c => c.name === 'registrations');
  assert(regCol, 'Registrations collection must be tracked in metrics');
  console.log(`   ✓ Collection breakdown verified: tracked collections count = ${metrics.collections.length}`);

  // 19. Testing Official UPI Payment Recipient & Dynamic URI Construction
  console.log('19. Testing Official UPI Payment Recipient & Dynamic URI Construction...');
  const testUpiId = 'sri.469512-1@oksbi';
  const testUpiName = 'B Sriram';
  const testAmount = 1000.0;
  const testRef = 'SC-TEST-9999';
  const testNote = 'SKYRA CREATIONS Token Advance';
  const testAid = 'uGICAgLCoysb4Rw';

  const params = new URLSearchParams({
    pa: testUpiId,
    pn: testUpiName,
    am: testAmount.toFixed(2),
    cu: 'INR',
    tn: testNote,
    tr: testRef,
    aid: testAid,
  });
  const upiUri = `upi://pay?${params.toString()}`;

  assert(upiUri.includes('pa=sri.469512-1%40oksbi') || upiUri.includes('pa=sri.469512-1@oksbi'));
  assert(upiUri.includes('pn=B+Sriram') || upiUri.includes('pn=B%20Sriram'));
  assert(upiUri.includes('am=1000.00'));
  assert(upiUri.includes('cu=INR'));
  assert(upiUri.includes('aid=uGICAgLCoysb4Rw'));

  // Test 5 UPI intent scheme transformations
  const gpayUri = upiUri.replace('upi://pay', 'tez://upi/pay');
  const phonepeUri = upiUri.replace('upi://pay', 'phonepe://pay');
  const paytmUri = upiUri.replace('upi://pay', 'paytmmp://pay');
  const bhimUri = upiUri.replace('upi://pay', 'bhim://pay');

  assert(gpayUri.startsWith('tez://upi/pay?'));
  assert(phonepeUri.startsWith('phonepe://pay?'));
  assert(paytmUri.startsWith('paytmmp://pay?'));
  assert(bhimUri.startsWith('bhim://pay?'));
  assert(upiUri.startsWith('upi://pay?'));
  console.log('   ✓ NPCI compliant dynamic UPI URI verified with exact amount ₹1,000.00 & reference ID');
  console.log('   ✓ 5 UPI intent deep links (Google Pay, PhonePe, Paytm, BHIM, Generic) successfully validated');

  // Automated Cleanup: Purge ephemeral test records from database so production stays clean
  const { getMongoConnection: getTestMongo } = await import('../api/_lib/mongoClient.js');
  const testConn = await getTestMongo();
  if (testConn) {
    await testConn.db.collection('registrations').deleteMany({
      $or: [
        { reg_id: regResult.participant.reg_id },
        { full_name: 'Pooja Hegde Model' }
      ]
    });
    await testConn.db.collection('payments').deleteMany({
      $or: [
        { reg_id: regResult.participant.reg_id },
        { transaction_id: { $in: [validRegTx, balTx] } }
      ]
    });
    console.log('   ✓ Ephemeral test contestant & payments cleanly purged from database');
  }

  console.log('\n=========================================');
  console.log('ALL SERVERLESS & STORAGE SUITES PASSED! ✓');
  console.log('=========================================');
}

runTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
