#!/usr/bin/env tsx
/**
 * Test Google Document AI Configuration
 * Verifies that Document AI service account is configured correctly
 */

import dotenv from 'dotenv';
import { processDocument } from '../lib/services/document-ai';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testDocumentAI() {
  console.log('🧪 Testing Google Document AI Configuration\n');
  console.log('='.repeat(60));

  // Check service account file
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-service-account.json';
  const serviceAccountExists = fs.existsSync(serviceAccountPath);

  console.log('\n📋 Configuration Check:');
  console.log('─'.repeat(60));

  // Check service account
  if (serviceAccountExists) {
    console.log('✅ Service Account File:', serviceAccountPath);
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      console.log('   Project ID:', serviceAccount.project_id);
      console.log('   Client Email:', serviceAccount.client_email);
    } catch (error) {
      console.log('   ⚠️  Error reading service account:', error);
    }
  } else {
    console.log('❌ Service Account File:', serviceAccountPath, '(NOT FOUND)');
  }

  // Check environment variables
  const envVars = {
    'GOOGLE_APPLICATION_CREDENTIALS': process.env.GOOGLE_APPLICATION_CREDENTIALS,
    'GOOGLE_DOCUMENT_AI_PROJECT_ID': process.env.GOOGLE_DOCUMENT_AI_PROJECT_ID,
    'GOOGLE_DOCUMENT_AI_LOCATION': process.env.GOOGLE_DOCUMENT_AI_LOCATION,
    'GOOGLE_DOCUMENT_AI_FORM_PARSER_ID': process.env.GOOGLE_DOCUMENT_AI_FORM_PARSER_ID,
    'GOOGLE_DOCUMENT_AI_OCR_ID': process.env.GOOGLE_DOCUMENT_AI_OCR_ID,
    'GOOGLE_DOCUMENT_AI_API_KEY': process.env.GOOGLE_DOCUMENT_AI_API_KEY ? 'Set' : undefined,
  };

  console.log('\n📝 Environment Variables:');
  console.log('─'.repeat(60));
  
  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      console.log(`✅ ${key}: ${key.includes('SECRET') || key.includes('KEY') ? 'Set' : value}`);
    } else {
      console.log(`⚠️  ${key}: Not set`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  
  if (serviceAccountExists) {
    console.log('\n✅ Service Account Found!');
    console.log('✅ Document AI should work with service account authentication');
    console.log('\n💡 Next Steps:');
    console.log('   1. Make sure GOOGLE_APPLICATION_CREDENTIALS is set in .env.local');
    console.log('   2. Restart dev server: npm run dev');
    console.log('   3. Test document upload in Form Filler');
  } else {
    console.log('\n⚠️  Service Account Not Found');
    console.log('⚠️  Document AI may not work without service account');
    console.log('\n💡 Solution:');
    console.log('   1. Create service account in Google Cloud Console');
    console.log('   2. Download JSON key file');
    console.log('   3. Save as google-service-account.json in project root');
    console.log('   4. Add GOOGLE_APPLICATION_CREDENTIALS to .env.local');
    console.log('   5. See docs/DOCUMENT_AI_SERVICE_ACCOUNT_SETUP.md for details');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

testDocumentAI().catch((error) => {
  console.error('\n💥 Test error:', error);
  process.exit(1);
});

