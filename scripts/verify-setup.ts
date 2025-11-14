#!/usr/bin/env tsx
/**
 * Supabase & Pinecone Setup Verification Script
 * 
 * This script verifies that your Mentark Quantum setup is production-ready:
 * - Checks environment variables
 * - Tests Supabase connection
 * - Verifies Pinecone index
 * - Validates OAuth configuration
 * - Checks RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const RESULTS = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  };
  console.log(`${icons[type]} ${message}`);
}

async function checkEnvironmentVariables() {
  console.log('\n📋 Checking Environment Variables...\n');

  const required = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
    'CLAUDE_API_KEY': process.env.CLAUDE_API_KEY,
    'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
    'PERPLEXITY_API_KEY': process.env.PERPLEXITY_API_KEY,
    'PINECONE_API_KEY': process.env.PINECONE_API_KEY,
  };

  const optional = {
    'GOOGLE_CLOUD_VISION_API_KEY': process.env.GOOGLE_CLOUD_VISION_API_KEY,
    'RESEND_API_KEY': process.env.RESEND_API_KEY,
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_POSTHOG_KEY': process.env.NEXT_PUBLIC_POSTHOG_KEY,
    'NEXT_PUBLIC_SENTRY_DSN': process.env.NEXT_PUBLIC_SENTRY_DSN,
    'YOUTUBE_DATA_API_KEY': process.env.YOUTUBE_DATA_API_KEY || process.env.YOUTUBE_API_KEY,
    'GOOGLE_API_KEY': process.env.GOOGLE_API_KEY,
    'GOOGLE_CALENDAR_CLIENT_ID': process.env.GOOGLE_CALENDAR_CLIENT_ID,
    'GOOGLE_CALENDAR_CLIENT_SECRET': process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    'SCRAPINGBEE_API_KEY': process.env.SCRAPINGBEE_API_KEY,
    'RAPIDAPI_KEY': process.env.RAPIDAPI_KEY,
    'HF_API_KEY': process.env.HF_API_KEY,
    'UPSTASH_REDIS_REST_URL': process.env.UPSTASH_REDIS_REST_URL,
    'COHERE_API_KEY': process.env.COHERE_API_KEY,
    'MISTRAL_API_KEY': process.env.MISTRAL_API_KEY,
    'HUME_AI_API_KEY': process.env.HUME_AI_API_KEY,
    'DEEPL_API_KEY': process.env.DEEPL_API_KEY,
    'SEMANTIC_SCHOLAR_API_KEY': process.env.SEMANTIC_SCHOLAR_API_KEY,
    'GOOGLE_CLOUD_TTS_API_KEY': process.env.GOOGLE_CLOUD_TTS_API_KEY,
    'GOOGLE_CLOUD_STT_API_KEY': process.env.GOOGLE_CLOUD_STT_API_KEY,
  };

  // Check required variables
  for (const [key, value] of Object.entries(required)) {
    if (!value || value.includes('your-') || value.includes('sk-your')) {
      log(`${key}: NOT SET or placeholder value`, 'error');
      RESULTS.failed++;
    } else {
      log(`${key}: OK`, 'success');
      RESULTS.passed++;
    }
  }

  // Check optional variables
  for (const [key, value] of Object.entries(optional)) {
    if (!value || value.includes('your-')) {
      log(`${key}: Not set (optional)`, 'warning');
      RESULTS.warnings++;
    } else {
      log(`${key}: OK`, 'success');
    }
  }
}

async function checkSupabaseConnection() {
  console.log('\n🔌 Testing Supabase Connection...\n');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      log('Supabase URL or API key not set', 'error');
      RESULTS.failed++;
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection by querying auth.users (always accessible)
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      const benignErrors = [
        'Invalid Refresh Token: Refresh Token Not Found',
        'Auth session missing!',
      ];

      if (!benignErrors.includes(error.message)) {
        log(`Connection failed: ${error.message}`, 'error');
        RESULTS.failed++;
        return;
      }
    }

    log('Supabase connection: OK', 'success');
    RESULTS.passed++;

    // Check if key tables exist
    const tables = ['users', 'students', 'teachers', 'admins', 'institutes', 'arks'];
    let tablesFound = 0;

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
        
        if (!tableError) {
          tablesFound++;
          log(`Table "${table}": exists`, 'success');
        } else {
          log(`Table "${table}": not found or inaccessible`, 'warning');
        }
      } catch (err) {
        log(`Table "${table}": error checking`, 'warning');
      }
    }

    if (tablesFound === tables.length) {
      RESULTS.passed++;
    } else {
      log(`Only ${tablesFound}/${tables.length} core tables accessible`, 'warning');
      RESULTS.warnings++;
    }

  } catch (error: any) {
    log(`Connection error: ${error.message}`, 'error');
    RESULTS.failed++;
  }
}

async function checkPineconeIndex() {
  console.log('\n🌲 Testing Pinecone Connection...\n');

  try {
    const apiKey = process.env.PINECONE_API_KEY;

    if (!apiKey) {
      log('Pinecone API key not set', 'error');
      RESULTS.failed++;
      return;
    }

    const pinecone = new Pinecone({ apiKey });
    const indexName = 'mentark-memory';

    // List indexes to verify connectivity
    const indexes = await pinecone.listIndexes();

    if (!indexes.indexes || indexes.indexes.length === 0) {
      log('No Pinecone indexes found', 'warning');
      RESULTS.warnings++;
      return;
    }

    const indexExists = indexes.indexes.some(idx => idx.name === indexName);

    if (!indexExists) {
      log(`Index "${indexName}" not found. Available indexes: ${indexes.indexes.map(i => i.name).join(', ')}`, 'error');
      RESULTS.failed++;
      return;
    }

    log(`Index "${indexName}": exists`, 'success');
    RESULTS.passed++;

    // Get index details
    const index = pinecone.index(indexName);
    const stats = await index.describeIndexStats();

    log(`Total vectors: ${stats.totalRecordCount || 0}`, 'info');
    log(`Namespaces: ${Object.keys(stats.namespaces || {}).length}`, 'info');

  } catch (error: any) {
    log(`Pinecone error: ${error.message}`, 'error');
    RESULTS.failed++;
  }
}

async function checkOAuthConfiguration() {
  console.log('\n🔐 Checking OAuth Configuration...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('Cannot check OAuth: Supabase not configured', 'error');
    RESULTS.failed++;
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Attempt to get OAuth providers (this might fail with anon key, which is expected)
    const { data: settings, error } = await supabase.auth.getSession();

    if (error) {
      log('Using anon key - OAuth check needs service role key', 'warning');
      RESULTS.warnings++;
      log('💡 Manual check needed: Go to Supabase Dashboard → Authentication → Providers', 'info');
      return;
    }

    // If we can check, verify Google OAuth
    log('OAuth check requires Supabase dashboard verification', 'info');
    log('💡 Verify in Dashboard: Authentication → Providers → Google is enabled', 'warning');
    RESULTS.warnings++;

  } catch (error: any) {
    log(`OAuth check error: ${error.message}`, 'warning');
    RESULTS.warnings++;
  }
}

async function checkRLSPolicies() {
  console.log('\n🔒 Checking RLS Policies...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('Cannot check RLS: Supabase not configured', 'error');
    RESULTS.failed++;
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Without a user session, we can't fully test RLS
    log('RLS verification requires authenticated user', 'warning');
    log('💡 Manual check needed: Run migrations with RLS policies enabled', 'info');
    log('💡 Verify in Dashboard: Table Editor → Settings → Enable Row Level Security', 'info');
    RESULTS.warnings++;

  } catch (error: any) {
    log(`RLS check error: ${error.message}`, 'warning');
    RESULTS.warnings++;
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  const total = RESULTS.passed + RESULTS.failed;

  console.log(`\n✅ Passed: ${RESULTS.passed}`);
  console.log(`❌ Failed: ${RESULTS.failed}`);
  console.log(`⚠️  Warnings: ${RESULTS.warnings}`);
  console.log(`\nOverall: ${RESULTS.failed === 0 ? '✅ Ready for production' : '❌ Issues found'}`);

  if (RESULTS.failed > 0) {
    console.log('\n🚨 Action Required:');
    console.log('   1. Fix failed checks above');
    console.log('   2. Review PRODUCTION_SETUP_GUIDE.md for detailed instructions');
    console.log('   3. Re-run this script to verify');
  }

  if (RESULTS.warnings > 0 && RESULTS.failed === 0) {
    console.log('\n⚠️  Warnings:');
    console.log('   Optional features may not work without the missing keys');
    console.log('   Review warnings above and configure if needed');
  }

  if (RESULTS.failed === 0 && RESULTS.warnings === 0) {
    console.log('\n🎉 All checks passed! Your setup looks production-ready.');
    console.log('\n📝 Next Steps:');
    console.log('   1. Generate demo data: npm run demo:generate');
    console.log('   2. Test authentication flow');
    console.log('   3. Deploy to production when ready');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

async function main() {
  console.log('🧠 Mentark Quantum - Setup Verification');
  console.log('='.repeat(60));

  await checkEnvironmentVariables();
  await checkSupabaseConnection();
  await checkPineconeIndex();
  await checkOAuthConfiguration();
  await checkRLSPolicies();
  await printSummary();

  // Exit with error code if any checks failed
  process.exit(RESULTS.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

