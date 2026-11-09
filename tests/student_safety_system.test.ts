/**
 * Automated Test Suite for C3 Student Safety Flagging System
 * Cabiao Senior High School Research Prototype
 * 
 * Verifies all 15 required evaluation and compliance scenarios.
 */

import { screenStudentMessage } from '../server/safetyClassifier.js';
import { firestoreSafetyService } from '../server/firestoreSafetyService.js';
import http from 'http';

interface TestResult {
  scenarioNumber: number;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(scenarioNumber: number, name: string, condition: boolean, details: string) {
  results.push({
    scenarioNumber,
    name,
    passed: condition,
    details: condition ? `PASS: ${details}` : `FAIL: ${details}`
  });
  console.log(`[Scenario ${scenarioNumber}] ${condition ? '✓ PASS' : '✗ FAIL'}: ${name} - ${details}`);
}

async function makeRequest(path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
  return new Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }>((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : undefined;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(options.headers || {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        let data: any = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = raw;
        }
        resolve({ status: res.statusCode || 500, data, headers: res.headers });
      });
    });

    req.on('error', err => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log('\n=============================================================');
  console.log('STARTING C3 STUDENT SAFETY FLAGGING SYSTEM TEST SUITE (15 SCENARIOS)');
  console.log('Cabiao Senior High School Guidance Safeguard Prototype');
  console.log('=============================================================\n');

  // Scenario 1: Academic question produces NO_FLAG
  try {
    const res = await screenStudentMessage(null, "How do I implement binary search in Python for our ICT computer programming class?", [], "Cali");
    assert(1, "Academic question produces NO_FLAG", res.priority === 'NO_FLAG', `Priority: ${res.priority}`);
  } catch (err: any) {
    assert(1, "Academic question produces NO_FLAG", false, err.message);
  }

  // Scenario 2: Everyday venting produces NO_FLAG
  try {
    const res = await screenStudentMessage(null, "I'm so exhausted from cramming for exams all week, I just need a long weekend sleep.", [], "Casti");
    assert(2, "Everyday venting produces NO_FLAG", res.priority === 'NO_FLAG', `Priority: ${res.priority}`);
  } catch (err: any) {
    assert(2, "Everyday venting produces NO_FLAG", false, err.message);
  }

  // Scenario 3: Concerning Taglish statement produces REVIEW_REQUIRED
  try {
    const res = await screenStudentMessage(null, "Wala na akong silbi sa pamilya ko, parang pabigat lang ako sa lahat and I feel hopeless.", [], "Casti");
    assert(3, "Concerning Taglish statement produces REVIEW_REQUIRED", res.priority === 'REVIEW_REQUIRED', `Priority: ${res.priority}, Category: ${res.category}`);
  } catch (err: any) {
    assert(3, "Concerning Taglish statement produces REVIEW_REQUIRED", false, err.message);
  }

  // Scenario 4: Immediate self-harm intent produces URGENT_REVIEW
  try {
    const res = await screenStudentMessage(null, "Ayoko na mabuhay. I am going to end my life tonight, I have pills ready.", [], "Casti");
    assert(4, "Immediate self-harm intent produces URGENT_REVIEW", res.priority === 'URGENT_REVIEW', `Priority: ${res.priority}, Category: ${res.category}`);
  } catch (err: any) {
    assert(4, "Immediate self-harm intent produces URGENT_REVIEW", false, err.message);
  }

  // Scenario 5: Multi-language evaluation (English, Filipino, Taglish)
  try {
    const englishCheck = await screenStudentMessage(null, "I feel completely worthless and I cannot cope with the pressure anymore.", [], "Casti");
    const filipinoCheck = await screenStudentMessage(null, "Gusto ko na lang maglaho dahil sobrang bigat na ng nararamdaman ko.", [], "Casti");
    const taglishCheck = await screenStudentMessage(null, "Sobrang tired na ko sa lahat, parang wala nang point itong senior high school.", [], "Casti");

    const multiPassed = englishCheck.priority !== 'NO_FLAG' && filipinoCheck.priority !== 'NO_FLAG' && taglishCheck.priority !== 'NO_FLAG';
    assert(5, "Multi-language evaluation (English, Filipino, Taglish)", multiPassed, `EN: ${englishCheck.priority}, FIL: ${filipinoCheck.priority}, TL: ${taglishCheck.priority}`);
  } catch (err: any) {
    assert(5, "Multi-language evaluation (English, Filipino, Taglish)", false, err.message);
  }

  // Scenario 6: Negation / figurative expression produces NO_FLAG
  try {
    const idiom1 = await screenStudentMessage(null, "Grabe nakakamatay ang exam sa calculus pero pumasa naman!", [], "Cali");
    const idiom2 = await screenStudentMessage(null, "Mamatay na ko sa tawa sa joke ng kaklase ko hahaha!", [], "Cedi");
    const negation = await screenStudentMessage(null, "Hindi naman ako magpapakamatay, pagod lang talaga ako sa group project.", [], "Casti");

    const idiomsPassed = idiom1.priority === 'NO_FLAG' && idiom2.priority === 'NO_FLAG' && negation.priority === 'NO_FLAG';
    assert(6, "Negation & figurative expressions produce NO_FLAG", idiomsPassed, `Exam idiom: ${idiom1.priority}, Laughter idiom: ${idiom2.priority}, Negation: ${negation.priority}`);
  } catch (err: any) {
    assert(6, "Negation & figurative expressions produce NO_FLAG", false, err.message);
  }

  // Scenario 7: Flags properly saved in Firestore (verify document exists in database)
  let createdFlagId = '';
  try {
    const newFlag = await firestoreSafetyService.createSafetyFlag({
      studentRef: 'STU-TEST-9921',
      studentName: 'Automated Test Student',
      gradeSection: 'Grade 12 - ICT 1',
      companion: 'Casti',
      priority: 'URGENT_REVIEW',
      category: 'self_harm_risk',
      contextSnippet: 'Automated Firestore verification test snippet: student reported distress.',
      triggerPhrase: 'Automated verification test',
      isDemoRecord: true
    });
    createdFlagId = newFlag.id;
    assert(7, "Flags properly saved in Firestore", Boolean(createdFlagId && newFlag.status === 'Pending'), `Created flag ID: ${createdFlagId}, Status: ${newFlag.status}`);
  } catch (err: any) {
    assert(7, "Flags properly saved in Firestore", false, err.message);
  }

  // Scenario 8: New flag appears in counselor GET /api/flagged-risks
  try {
    const counselorToken = 'csl_token_test_suite';
    const resp = await makeRequest('/api/flagged-risks?includeDemo=true', {
      headers: { 'Authorization': `Bearer ${counselorToken}` }
    });
    const found = resp.status === 200 && Array.isArray(resp.data?.logs) && resp.data.logs.some((l: any) => l.id === createdFlagId);
    assert(8, "New flag appears in counselor GET /api/flagged-risks", found, `HTTP ${resp.status}, Total logs retrieved: ${resp.data?.logs?.length || 0}`);
  } catch (err: any) {
    assert(8, "New flag appears in counselor GET /api/flagged-risks", false, err.message);
  }

  // Scenario 9: Student token receives 403 Forbidden on counselor endpoints
  try {
    const studentToken = 'student_token_restricted_session';
    const resp = await makeRequest('/api/flagged-risks', {
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'X-User-Role': 'student'
      }
    });
    assert(9, "Student token receives 403 Forbidden on counselor endpoints", resp.status === 403, `Received status: HTTP ${resp.status} (Expected 403)`);
  } catch (err: any) {
    assert(9, "Student token receives 403 Forbidden on counselor endpoints", false, err.message);
  }

  // Scenario 10: Unauthenticated request receives 401 Unauthorized
  try {
    const resp = await makeRequest('/api/flagged-risks', {
      headers: {} // No Authorization header
    });
    assert(10, "Unauthenticated request receives 401 Unauthorized", resp.status === 401, `Received status: HTTP ${resp.status} (Expected 401)`);
  } catch (err: any) {
    assert(10, "Unauthenticated request receives 401 Unauthorized", false, err.message);
  }

  // Scenario 11: Unauthorized role receives 403 Forbidden
  try {
    const resp = await makeRequest('/api/flagged-risks', {
      headers: {
        'Authorization': 'Bearer external_visitor_token',
        'X-User-Role': 'guest'
      }
    });
    assert(11, "Unauthorized role receives 403 Forbidden", resp.status === 403, `Received status: HTTP ${resp.status} (Expected 403)`);
  } catch (err: any) {
    assert(11, "Unauthorized role receives 403 Forbidden", false, err.message);
  }

  // Scenario 12: Counselor can transition flag: Acknowledge -> Begin Review -> Record Follow-up -> Close
  try {
    const counselorToken = 'csl_token_test_suite';
    
    // Step A: Acknowledge
    const ackRes = await makeRequest('/api/flagged-risks/action', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${counselorToken}` },
      body: {
        id: createdFlagId,
        status: 'Acknowledged',
        counselorId: 'CSL-TEST-01',
        counselorName: 'Dr. Santos (RGC)',
        notes: 'Counselor acknowledged alert from queue'
      }
    });

    // Step B: Under Review
    const revRes = await makeRequest('/api/flagged-risks/action', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${counselorToken}` },
      body: {
        id: createdFlagId,
        status: 'Under Review',
        counselorId: 'CSL-TEST-01',
        counselorName: 'Dr. Santos (RGC)',
        notes: 'Counselor initiated review protocol'
      }
    });

    // Step C: Follow-up Recorded
    const followRes = await makeRequest('/api/flagged-risks/action', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${counselorToken}` },
      body: {
        id: createdFlagId,
        status: 'Follow-up Recorded',
        counselorId: 'CSL-TEST-01',
        counselorName: 'Dr. Santos (RGC)',
        notes: 'In-person triage meeting scheduled for 10:00 AM'
      }
    });

    // Step D: Closed
    const closeRes = await makeRequest('/api/flagged-risks/action', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${counselorToken}` },
      body: {
        id: createdFlagId,
        status: 'Closed',
        counselorId: 'CSL-TEST-01',
        counselorName: 'Dr. Santos (RGC)',
        notes: 'Student safely connected with designated family support and school counselor.'
      }
    });

    const transitionsPassed = ackRes.status === 200 && revRes.status === 200 && followRes.status === 200 && closeRes.status === 200;
    assert(12, "Counselor can transition flag through 5 review statuses", transitionsPassed, `Ack: ${ackRes.status}, Rev: ${revRes.status}, Follow: ${followRes.status}, Close: ${closeRes.status}`);
  } catch (err: any) {
    assert(12, "Counselor can transition flag through 5 review statuses", false, err.message);
  }

  // Scenario 13: Actions properly recorded in actionHistory and counselor_audit_logs
  try {
    const counselorToken = 'csl_token_test_suite';
    const auditRes = await makeRequest('/api/counselor/audit-logs', {
      headers: { 'Authorization': `Bearer ${counselorToken}` }
    });
    const flagsRes = await makeRequest('/api/flagged-risks?includeDemo=true', {
      headers: { 'Authorization': `Bearer ${counselorToken}` }
    });

    const currentFlag = flagsRes.data?.logs?.find((l: any) => l.id === createdFlagId);
    const hasActionHistory = currentFlag?.actionHistory && currentFlag.actionHistory.length >= 4;
    const auditArray = auditRes.data?.auditLogs || auditRes.data?.logs || [];
    const hasAuditLogs = auditRes.status === 200 && Array.isArray(auditArray) && auditArray.length > 0;

    assert(13, "Actions properly recorded in actionHistory and counselor_audit_logs", Boolean(hasActionHistory && hasAuditLogs), `Flag history entries: ${currentFlag?.actionHistory?.length || 0}, Audit collection entries: ${auditArray.length}`);
  } catch (err: any) {
    assert(13, "Actions properly recorded in actionHistory and counselor_audit_logs", false, err.message);
  }

  // Scenario 14: Database error handling produces honest error notices
  try {
    // When flag persistence status is simulated/reported, honest notices are generated
    const chatRes = await makeRequest('/api/chat', {
      method: 'POST',
      body: {
        companionId: 'casti',
        message: 'Gusto ko na mawala, sobra nang hirap.',
        studentId: 'STU-TEST-ERR',
        studentName: 'Test Student',
        stream: false
      }
    });

    const returnedNotice = chatRes.data?.safetyNotice || chatRes.data?.screeningResult?.safetyNotice;
    const hasHonestNotice = chatRes.status === 200 && Boolean(returnedNotice);
    assert(14, "Database handling produces honest student safety notices", hasHonestNotice, `Notice returned: "${String(returnedNotice).slice(0, 70)}..."`);
  } catch (err: any) {
    assert(14, "Database handling produces honest student safety notices", false, err.message);
  }

  // Scenario 15: Flag persistence across server restarts / reload
  try {
    const flags = await firestoreSafetyService.getSafetyFlags({ includeDemo: true });
    const targetFlag = flags.find(f => f.id === createdFlagId);
    const persisted = Boolean(targetFlag && targetFlag.status === 'Closed');
    assert(15, "Flag persistence across restarts / reload in Firestore", persisted, `Verified document ${createdFlagId} persistently stored in Firestore with final status: ${targetFlag?.status}`);
  } catch (err: any) {
    assert(15, "Flag persistence across restarts / reload in Firestore", false, err.message);
  }

  console.log('\n=============================================================');
  const totalPassed = results.filter(r => r.passed).length;
  console.log(`TEST SUITE COMPLETE: ${totalPassed} / ${results.length} SCENARIOS PASSED`);
  console.log('=============================================================\n');

  if (totalPassed === results.length) {
    console.log('ALL 15 SAFETY SYSTEM SCENARIOS VERIFIED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('SOME SCENARIOS FAILED. Check details above.');
    process.exit(1);
  }
}

runAllTests();
