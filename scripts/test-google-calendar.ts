#!/usr/bin/env tsx
/**
 * Test Google Calendar Configuration
 * Verifies that Google Calendar OAuth credentials are correctly configured
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

function testGoogleCalendarConfig() {
  console.log('🧪 Testing Google Calendar Configuration\n');
  console.log('='.repeat(60));

  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3002';
  const redirectUri = `${appUrl}/api/auth/google-calendar/callback`;

  console.log('\n📋 Environment Variables:');
  console.log('─'.repeat(60));
  
  // Check Client ID
  if (clientId) {
    console.log('✅ GOOGLE_CALENDAR_CLIENT_ID:', clientId.substring(0, 20) + '...');
  } else {
    console.log('❌ GOOGLE_CALENDAR_CLIENT_ID: NOT SET');
  }

  // Check Client Secret
  if (clientSecret) {
    console.log('✅ GOOGLE_CALENDAR_CLIENT_SECRET:', clientSecret.substring(0, 10) + '...');
  } else {
    console.log('❌ GOOGLE_CALENDAR_CLIENT_SECRET: NOT SET');
  }

  // Check App URL
  console.log('ℹ️  NEXT_PUBLIC_APP_URL:', appUrl);

  // Show redirect URI
  console.log('\n🔗 Redirect URI:');
  console.log('─'.repeat(60));
  console.log(redirectUri);

  // Validation
  console.log('\n✅ Validation:');
  console.log('─'.repeat(60));

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!clientId) {
    errors.push('GOOGLE_CALENDAR_CLIENT_ID is required');
  } else if (!clientId.includes('.apps.googleusercontent.com')) {
    errors.push('GOOGLE_CALENDAR_CLIENT_ID format is invalid (should end with .apps.googleusercontent.com)');
  }

  if (!clientSecret) {
    errors.push('GOOGLE_CALENDAR_CLIENT_SECRET is required');
  } else if (!clientSecret.startsWith('GOCSPX-')) {
    warnings.push('GOOGLE_CALENDAR_CLIENT_SECRET format might be invalid (should start with GOCSPX-)');
  }

  if (redirectUri.includes('localhost') && !appUrl.includes('localhost')) {
    warnings.push('Using localhost redirect URI but app URL is not localhost');
  }

  if (redirectUri.includes(' ')) {
    errors.push('Redirect URI contains whitespace - this will cause OAuth errors!');
  }

  if (appUrl && !appUrl.match(/^https?:\/\//)) {
    errors.push('App URL must start with http:// or https://');
  }

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('✅ All checks passed!');
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  // Google Cloud Console checklist
  console.log('\n📝 Google Cloud Console Checklist:');
  console.log('─'.repeat(60));
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('2. Select your OAuth 2.0 Client ID');
  console.log('3. Under "Authorized redirect URIs", add:');
  console.log(`   - ${redirectUri}`);
  if (redirectUri.includes('localhost')) {
    console.log('   - https://www.mentark.in/api/auth/google-calendar/callback (for production)');
  } else {
    console.log('   - http://localhost:3002/api/auth/google-calendar/callback (for development)');
  }
  console.log('4. Make sure there are NO spaces before or after the URI');
  console.log('5. Click Save');

  console.log('\n' + '='.repeat(60));
  
  if (errors.length === 0) {
    console.log('\n✅ Configuration looks good! Ready to test OAuth flow.');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure redirect URI is added to Google Cloud Console');
    console.log('   2. Start dev server: npm run dev');
    console.log('   3. Navigate to: /dashboard/student/daily-assistant');
    console.log('   4. Click "Connect Calendar"');
  } else {
    console.log('\n❌ Configuration has errors. Please fix them before testing.');
    process.exit(1);
  }
}

testGoogleCalendarConfig();

