#!/usr/bin/env tsx

/**
 * Clean Demo Data Script for Mentark Quantum
 * 
 * Removes all demo institutes and cascades deletion to all related data
 * Preserves real production data
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Demo institute names to clean
const demoInstituteNames = ['Aakash Institute', 'Allen Career Institute'];

async function confirmCleanup(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('⚠️  This will delete ALL demo data. Are you sure? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function getDemoInstitutes() {
  const { data: institutes, error } = await supabase
    .from('institutes')
    .select('id, name')
    .in('name', demoInstituteNames);

  if (error) {
    console.error('❌ Error fetching institutes:', error);
    return [];
  }

  return institutes || [];
}

async function cleanDemoData() {
  console.log('🧹 Starting demo data cleanup...\n');

  const confirmed = await confirmCleanup();
  if (!confirmed) {
    console.log('❌ Cleanup cancelled by user');
    return;
  }

  try {
    // Get demo institutes
    const demoInstitutes = await getDemoInstitutes();
    
    if (demoInstitutes.length === 0) {
      console.log('ℹ️  No demo institutes found to clean');
      return;
    }

    console.log(`🔍 Found ${demoInstitutes.length} demo institutes to clean:`);
    demoInstitutes.forEach(inst => console.log(`  - ${inst.name}`));

    let totalDeleted = 0;

    // Delete each demo institute (cascade will handle related data)
    for (const institute of demoInstitutes) {
      console.log(`\n🗑️  Deleting ${institute.name} and all related data...`);

      // Get users count before deletion
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('institute_id', institute.id);

      if (!usersError && users) {
        console.log(`  - ${users.length} users will be deleted`);
        totalDeleted += users.length;
      }

      // Delete the institute (this will cascade delete all related data)
      const { error: deleteError } = await supabase
        .from('institutes')
        .delete()
        .eq('id', institute.id);

      if (deleteError) {
        console.error(`❌ Error deleting ${institute.name}:`, deleteError);
        continue;
      }

      console.log(`✅ Successfully deleted ${institute.name}`);
    }

    console.log(`\n🎉 Demo data cleanup completed!`);
    console.log(`📊 Total records deleted: ${totalDeleted + demoInstitutes.length}`);
    console.log(`   - Institutes: ${demoInstitutes.length}`);
    console.log(`   - Users: ${totalDeleted}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

async function main() {
  await cleanDemoData();
}

// Run the script
if (require.main === module) {
  main();
}

export { cleanDemoData };

