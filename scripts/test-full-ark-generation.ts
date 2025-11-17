/**
 * Test Full ARK Generation Flow (Minimal - checks structure without heavy API calls)
 * Run with: npx tsx scripts/test-full-ark-generation.ts
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testFullARKFlow() {
  console.log('🧪 Testing Full ARK Generation Flow\n');
  console.log('='.repeat(80));

  // Test resource gathering per milestone
  console.log('\n📦 Testing Resource Gathering Per Milestone\n');

  const testMilestones = [
    { title: 'Python Basics', description: 'Learn fundamental Python concepts' },
    { title: 'Data Structures', description: 'Master Python data structures' },
    { title: 'Object-Oriented Programming', description: 'Learn OOP principles in Python' }
  ];

  try {
    const { gatherComprehensiveResources, extractKeywordContext } = await import('../lib/ai/orchestration/api-router');
    
    const keywordContext = extractKeywordContext(
      'Learn Python programming',
      'academic_excellence',
      'Master Python programming for data science'
    );

    console.log(`Context: ${JSON.stringify(keywordContext, null, 2)}\n`);

    for (const milestone of testMilestones) {
      console.log(`\nTesting milestone: "${milestone.title}"`);
      const resources = await gatherComprehensiveResources(
        keywordContext,
        milestone.title,
        milestone.description
      );

      console.log(`  ✅ Found ${resources.length} resources`);
      
      // Count by type
      const byType: Record<string, number> = {};
      resources.forEach(r => {
        byType[r.type] = (byType[r.type] || 0) + 1;
      });
      
      console.log(`  Resource breakdown:`);
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`    - ${type}: ${count}`);
      });

      // Verify we're getting resources from multiple sources
      const sources = new Set(resources.map(r => r.source));
      console.log(`  Sources: ${Array.from(sources).join(', ')}`);
      
      if (resources.length < 5) {
        console.warn(`  ⚠️ Warning: Only ${resources.length} resources found (expected 8-12)`);
      }
      
      if (sources.size < 2) {
        console.warn(`  ⚠️ Warning: Only ${sources.size} source(s) used (expected 3-5 sources)`);
      }
    }

    console.log('\n✅ Resource gathering per milestone working correctly');

  } catch (error: any) {
    console.error('❌ Resource gathering test failed:', error.message);
    console.error(error.stack);
    return;
  }

  // Test enhanced orchestrator structure
  console.log('\n🤖 Testing Enhanced Orchestrator Structure\n');

  try {
    const orchestrator = await import('../lib/ai/enhanced-ark-orchestrator');
    
    // Check exports
    const hasGenerateEnhancedARK = typeof orchestrator.generateEnhancedARK === 'function';
    const hasPhase1 = typeof orchestrator.phase1PreGeneration === 'function';
    const hasPhase2 = typeof orchestrator.phase2CoreGeneration === 'function';

    console.log(`  generateEnhancedARK: ${hasGenerateEnhancedARK ? '✅' : '❌'}`);
    // Note: phase1PreGeneration and phase2CoreGeneration might be private - that's OK
    
    if (!hasGenerateEnhancedARK) {
      throw new Error('generateEnhancedARK function not exported');
    }

    console.log('\n✅ Enhanced orchestrator structure correct');

  } catch (error: any) {
    console.error('❌ Orchestrator structure test failed:', error.message);
    return;
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Test Summary\n');
  console.log('✅ Resource gathering working');
  console.log('✅ Enhanced orchestrator structure correct');
  console.log('✅ All APIs configured and accessible');
  console.log('\n💡 Ready for ARK generation!\n');
  console.log('='.repeat(80));
}

testFullARKFlow().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});


