#!/usr/bin/env tsx
/**
 * Test Practice Questions API Endpoints
 * Verifies that all practice questions endpoints are working correctly
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

async function testEndpoint(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: any
): Promise<TestResult> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return {
      endpoint,
      method,
      status: response.ok ? 'success' : 'error',
      message: response.ok
        ? `✅ ${method} ${endpoint} - Status ${response.status}`
        : `❌ ${method} ${endpoint} - Status ${response.status}: ${data.error || data.message || 'Unknown error'}`,
      data: response.ok ? data : undefined,
    };
  } catch (error: any) {
    return {
      endpoint,
      method,
      status: 'error',
      message: `❌ ${method} ${endpoint} - Error: ${error.message}`,
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Practice Questions API Endpoints\n');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}\n`);

  // Note: These tests require authentication
  // In a real scenario, you would need to authenticate first
  console.log('⚠️  Note: These endpoints require authentication.');
  console.log('⚠️  Run these tests with an authenticated session.\n');

  // Test endpoints
  console.log('📋 Test Results:\n');
  console.log('─'.repeat(60));

  // GET /api/practice/sessions
  const getSessions = await testEndpoint('/api/practice/sessions', 'GET');
  results.push(getSessions);
  console.log(getSessions.message);

  // POST /api/practice/sessions
  const createSession = await testEndpoint('/api/practice/sessions', 'POST', {
    topic: 'Test Topic',
    subject: 'Test Subject',
    count: 3,
    mistakes: [
      {
        topic: 'Test Topic',
        question: 'Test question?',
        attemptedAnswer: 'Wrong answer',
        correctAnswer: 'Correct answer',
      },
    ],
  });
  results.push(createSession);
  console.log(createSession.message);

  // GET /api/practice/analytics
  const getAnalytics = await testEndpoint('/api/practice/analytics?days=30', 'GET');
  results.push(getAnalytics);
  console.log(getAnalytics.message);

  // GET /api/practice/mistake-patterns
  const getPatterns = await testEndpoint('/api/practice/mistake-patterns?analyze=true', 'GET');
  results.push(getPatterns);
  console.log(getPatterns.message);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:\n');

  const successful = results.filter((r) => r.status === 'success').length;
  const failed = results.filter((r) => r.status === 'error').length;

  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Common issues:');
    console.log('   1. Not authenticated - endpoints require login');
    console.log('   2. Database migration not applied');
    console.log('   3. Server not running');
    console.log('   4. Environment variables not configured');
  } else {
    console.log('\n🎉 All tests passed!');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

runTests().catch((error) => {
  console.error('\n💥 Test runner error:', error);
  process.exit(1);
});

