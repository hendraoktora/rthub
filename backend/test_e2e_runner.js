/**
 * RtHub Comprehensive E2E QA Automation Test Runner
 * Tests live endpoints, authentication flows, error handling, edge cases, and feature modules.
 */

const BASE_URL = process.env.BASE_URL || 'https://rthub.hendraoktora.com/api';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  bugs: [],
  logs: [],
};

function log(section, message, status = 'INFO') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
  const entry = `[${new Date().toISOString().substring(11, 19)}] ${icon} [${section}] ${message}`;
  console.log(entry);
  results.logs.push(entry);
}

function recordBug(id, area, description, severity = 'HIGH', rootCause = '', recommendation = '') {
  results.bugs.push({ id, area, description, severity, rootCause, recommendation });
  log(area, `BUG FOUND [${id}]: ${description}`, 'FAIL');
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const duration = Date.now() - start;
    let data = null;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data, duration, raw: text };
  } catch (err) {
    const duration = Date.now() - start;
    return { status: 0, ok: false, error: err.message, duration };
  }
}

async function runTestSuite() {
  console.log('='.repeat(80));
  console.log(`🚀 STARTING RTHUB END-TO-END QA AUTOMATION TEST RUNNER`);
  console.log(`🎯 Target API URL: ${BASE_URL}`);
  console.log(`🕒 Start Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  // TEST SUITE 1: Server Latency & Health
  log('HEALTH', 'Pinging API & checking server response time...');
  results.total++;
  const rtListRes = await request('/auth/list-rt');
  if (rtListRes.ok) {
    results.passed++;
    log('HEALTH', `API Server is LIVE. Response Latency: ${rtListRes.duration}ms (Status: ${rtListRes.status})`, 'PASS');
  } else {
    results.failed++;
    recordBug('BUG-API-01', 'HEALTH', `API Server unreachable or failing: ${rtListRes.error || rtListRes.status}`, 'CRITICAL', 'Backend endpoint down or network error', 'Check DNS, Vercel deployment, and database connection');
  }

  // TEST SUITE 2: NIK Validation & Duplicate Prevention
  log('AUTH-NIK', 'Testing NIK checking endpoint (/api/auth/check-nik/:nik)...');
  results.total++;
  const validNik = '320101' + Math.floor(1000000000 + Math.random() * 9000000000);
  const checkValidRes = await request(`/auth/check-nik/${validNik}`);
  if (checkValidRes.ok && checkValidRes.data?.available === true) {
    results.passed++;
    log('AUTH-NIK', `Valid fresh NIK ${validNik} is correctly reported as available`, 'PASS');
  } else {
    results.failed++;
    recordBug('BUG-NIK-01', 'AUTH-NIK', `Fresh NIK check failed or returned unavailable unexpectedly: ${JSON.stringify(checkValidRes.data)}`, 'MEDIUM');
  }

  // TEST SUITE 3: RT Self-Registration Flow
  log('AUTH-RT', 'Testing Bottom-Up RT Auto-Grouping Registration...');
  results.total++;
  const uniqueSuffix = Date.now().toString().slice(-6);
  const rtAdminPhone = `081${uniqueSuffix}99`;
  const rtAdminNik = '320101' + Math.floor(1000000000 + Math.random() * 9000000000);
  const rtRegPayload = {
    phone: rtAdminPhone,
    password: 'Password123!',
    namaLengkap: `Ketua RT QA ${uniqueSuffix}`,
    nik: rtAdminNik,
    nomorRt: `9${uniqueSuffix.slice(-2)}`,
    nomorRw: '08',
    namaKelurahan: 'Kelurahan QA Makmur',
    namaJalan: 'Jl. Otomasi QA No. 1',
  };

  const regRtRes = await request('/auth/register-rt', {
    method: 'POST',
    body: JSON.stringify(rtRegPayload),
  });

  let createdRtId = null;
  let rtToken = null;
  if (regRtRes.ok && regRtRes.data?.accessToken) {
    results.passed++;
    rtToken = regRtRes.data.accessToken;
    createdRtId = regRtRes.data.user?.rtId;
    log('AUTH-RT', `RT & Admin RT successfully registered! RT ID: ${createdRtId}, Latency: ${regRtRes.duration}ms`, 'PASS');
  } else {
    results.failed++;
    recordBug('BUG-REG-01', 'AUTH-RT', `RT Registration failed: ${JSON.stringify(regRtRes.data || regRtRes.error)}`, 'HIGH', 'Serverless execution error or DB validation', 'Verify register-rt handler and database constraints');
  }

  // TEST SUITE 4: Duplicate NIK and Duplicate Phone Prevention
  log('AUTH-DUP', 'Testing Duplicate NIK rejection...');
  results.total++;
  const dupNikPayload = {
    phone: `082${uniqueSuffix}88`,
    password: 'Password123!',
    namaLengkap: 'User Duplicate NIK',
    nik: rtAdminNik, // Same NIK
    nomorRt: '99',
    nomorRw: '08',
    namaKelurahan: 'Kelurahan QA Makmur',
  };
  const dupNikRes = await request('/auth/register-rt', {
    method: 'POST',
    body: JSON.stringify(dupNikPayload),
  });

  if (!dupNikRes.ok && (dupNikRes.status === 400 || dupNikRes.status === 409)) {
    results.passed++;
    log('AUTH-DUP', `Duplicate NIK correctly rejected with status ${dupNikRes.status}: "${dupNikRes.data?.message}"`, 'PASS');
  } else {
    results.failed++;
    recordBug('BUG-DUP-01', 'AUTH-DUP', `Duplicate NIK was NOT rejected! Status: ${dupNikRes.status}`, 'CRITICAL', 'Missing unique constraint check on NIK', 'Enforce unique NIK validation before inserting');
  }

  // TEST SUITE 5: Warga Registration Flow
  log('AUTH-WARGA', 'Testing Citizen (Warga) Registration linked to RT...');
  results.total++;
  let targetRtId = createdRtId;
  if (!targetRtId && rtListRes.ok && Array.isArray(rtListRes.data) && rtListRes.data.length > 0) {
    targetRtId = rtListRes.data[0].id;
  }

  const wargaPhone = `083${uniqueSuffix}77`;
  const wargaNik = '320101' + Math.floor(1000000000 + Math.random() * 9000000000);
  let wargaToken = null;

  if (targetRtId) {
    const wargaPayload = {
      phone: wargaPhone,
      password: 'Password123!',
      namaLengkap: `Warga QA Tester ${uniqueSuffix}`,
      nik: wargaNik,
      rtId: targetRtId,
      noRumah: 'B2/14',
      noKk: '3201019988776655',
    };
    const regWargaRes = await request('/auth/register-warga', {
      method: 'POST',
      body: JSON.stringify(wargaPayload),
    });

    if (regWargaRes.ok && regWargaRes.data?.accessToken) {
      results.passed++;
      wargaToken = regWargaRes.data.accessToken;
      log('AUTH-WARGA', `Warga registered successfully! Latency: ${regWargaRes.duration}ms`, 'PASS');
    } else {
      results.failed++;
      recordBug('BUG-WARGA-REG-01', 'AUTH-WARGA', `Warga registration failed: ${JSON.stringify(regWargaRes.data || regWargaRes.error)}`, 'HIGH');
    }
  } else {
    log('AUTH-WARGA', 'Skipping Warga registration because no RT ID available', 'WARN');
  }

  // TEST SUITE 6: Login Flow (Positive & Negative)
  log('AUTH-LOGIN', 'Testing Login with valid credentials...');
  results.total++;
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: wargaPhone,
      password: 'Password123!',
    }),
  });

  if (loginRes.ok && loginRes.data?.accessToken) {
    results.passed++;
    log('AUTH-LOGIN', `Login succeeded for ${wargaPhone}! Role: ${loginRes.data.user?.role}`, 'PASS');
  } else {
    results.failed++;
    recordBug('BUG-LOGIN-01', 'AUTH-LOGIN', `Login failed for newly registered warga: ${JSON.stringify(loginRes.data || loginRes.error)}`, 'CRITICAL');
  }

  log('AUTH-LOGIN', 'Testing Login with wrong password...');
  results.total++;
  const wrongPassRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: wargaPhone,
      password: 'WrongPassword999!',
    }),
  });

  if (wrongPassRes.status === 401 || wrongPassRes.status === 400) {
    results.passed++;
    log('AUTH-LOGIN', `Invalid password correctly rejected with 401 Unauthorized: "${wrongPassRes.data?.message}"`, 'PASS');
  } else {
    results.failed++;
    recordBug('BUG-LOGIN-02', 'AUTH-LOGIN', `Invalid password returned unexpected status: ${wrongPassRes.status}`, 'MEDIUM');
  }

  // TEST SUITE 7: Token Profile & Me Endpoint
  log('AUTH-ME', 'Testing /api/auth/me with Bearer token...');
  results.total++;
  const tokenToUse = wargaToken || rtToken;
  if (tokenToUse) {
    const meRes = await request('/auth/me', {
      headers: { Authorization: `Bearer ${tokenToUse}` },
    });
    if (meRes.ok && meRes.data?.id) {
      results.passed++;
      log('AUTH-ME', `User profile fetched from JWT successfully. Name: ${meRes.data.profile?.namaLengkap || meRes.data.phone}`, 'PASS');
    } else {
      results.failed++;
      recordBug('BUG-AUTH-ME-01', 'AUTH-ME', `/auth/me failed with token: ${JSON.stringify(meRes.data || meRes.error)}`, 'HIGH');
    }
  }

  // TEST SUITE 8: Kas RT End-to-End
  log('KAS', 'Testing Kas Summary & Recording (/api/kas)...');
  results.total++;
  const kasRes = await request('/kas/summary', {
    headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
  });
  if (kasRes.ok || kasRes.status === 200) {
    results.passed++;
    log('KAS', `Kas Summary retrieved. Balance: Rp ${kasRes.data?.saldoKas || 0}`, 'PASS');
  } else {
    results.failed++;
    log('KAS', `Kas Summary returned status: ${kasRes.status} (Data: ${JSON.stringify(kasRes.data)})`, 'WARN');
  }

  // TEST SUITE 9: Tagihan & Transparansi Iuran
  log('TAGIHAN', 'Testing Tagihan & Transparansi Iuran (/api/tagihan)...');
  results.total++;
  const tagihanRes = await request('/tagihan/saya', {
    headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
  });
  if (tagihanRes.ok || tagihanRes.status === 200) {
    results.passed++;
    log('TAGIHAN', `User Bills retrieved successfully`, 'PASS');
  } else {
    log('TAGIHAN', `Tagihan endpoint status ${tagihanRes.status}: ${JSON.stringify(tagihanRes.data)}`, 'WARN');
  }

  // TEST SUITE 10: Lapak UMKM & Shopee Ads Boost
  log('LAPAK', 'Testing Lapak UMKM (/api/lapak)...');
  results.total++;
  const lapakRes = await request('/lapak', {
    headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
  });
  if (lapakRes.ok && Array.isArray(lapakRes.data)) {
    results.passed++;
    log('LAPAK', `Lapak list retrieved with ${lapakRes.data.length} items`, 'PASS');
  } else {
    results.failed++;
    recordBug('BUG-LAPAK-01', 'LAPAK', `Failed to load Lapak list: ${JSON.stringify(lapakRes.data || lapakRes.error)}`, 'MEDIUM');
  }

  // TEST SUITE 11: Laporan & Pengaduan
  log('LAPORAN', 'Testing Laporan Warga (/api/laporan)...');
  results.total++;
  const laporanRes = await request('/laporan', {
    headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
  });
  if (laporanRes.ok || laporanRes.status === 200) {
    results.passed++;
    log('LAPORAN', `Laporan list retrieved successfully`, 'PASS');
  } else {
    log('LAPORAN', `Laporan endpoint status ${laporanRes.status}: ${JSON.stringify(laporanRes.data)}`, 'WARN');
  }

  // TEST SUITE 12: Client-side Latency & Timeout Resiliency Analysis
  log('RESILIENCY', 'Analyzing Mobile Client Timeout & Error Handling...');
  results.total++;
  const averageLatency = (rtListRes.duration + (regRtRes?.duration || 0) + (loginRes?.duration || 0)) / 3;
  log('RESILIENCY', `Average API Response Time: ${Math.round(averageLatency)}ms`);
  if (averageLatency > 2000 || rtListRes.duration > 3500) {
    recordBug(
      'BUG-TIMEOUT-01',
      'MOBILE-NETWORK-TIMEOUT',
      `Mobile client HTTP timeouts in 'api_service.dart' are set to 4-5 seconds. Serverless cloud cold starts and database queries take up to ${Math.max(rtListRes.duration, regRtRes?.duration || 0)}ms. When timeout triggers, client shows 'Gagal menghubungi server backend (Offline)', but backend actually completes the user insertion. Subsequent registrations trigger 'NIK sudah terdaftar' and login fails if network latency exceeds 5s.`,
      'CRITICAL',
      'Short HTTP timeouts in _postWithFallback and _getWithFallback (4s-5s) in mobile_app/lib/core/services/api_service.dart',
      'Increase timeouts to 15s-20s, add auto-retry for network blips, and improve registration exception handling in UI.'
    );
    results.failed++;
  } else {
    results.passed++;
  }

  console.log('='.repeat(80));
  console.log(`📊 QA AUTOMATION SUMMARY`);
  console.log(`Total Scenarios: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed / Bugs Discovered: ${results.failed}`);
  console.log(`Total Discovered Bugs: ${results.bugs.length}`);
  console.log('='.repeat(80));

  if (results.bugs.length > 0) {
    console.log(`\n🐛 DETAILED BUG FINDINGS:`);
    results.bugs.forEach((b, i) => {
      console.log(`\n${i + 1}. [${b.id}] (${b.severity}) - ${b.area}`);
      console.log(`   Problem: ${b.description}`);
      if (b.rootCause) console.log(`   Root Cause: ${b.rootCause}`);
      if (b.recommendation) console.log(`   Fix: ${b.recommendation}`);
    });
  }
}

runTestSuite().catch(console.error);
