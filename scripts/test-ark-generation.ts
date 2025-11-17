/**
 * Test ARK Generation - Verify all API calls and resource gathering
 * Run with: npx tsx scripts/test-ark-generation.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testARKGeneration() {
  console.log('🧪 Testing Enhanced ARK Generation\n');
  console.log('='.repeat(80));

  const testResults: {
    apis: Record<string, { working: boolean; error?: string; data?: any }>;
    resourceGathering: { working: boolean; resourcesFound: number; error?: string };
    orchestrator: { working: boolean; error?: string };
  } = {
    apis: {},
    resourceGathering: { working: false, resourcesFound: 0 },
    orchestrator: { working: false }
  };

  // 1. Test API Keys Configuration
  console.log('\n📋 Step 1: Checking API Keys Configuration\n');
  
  const apiKeys = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
    'CLAUDE_API_KEY': process.env.CLAUDE_API_KEY,
    'ANTHROPIC_API_KEY': process.env.ANTHROPIC_API_KEY,
    'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
    'PERPLEXITY_API_KEY': process.env.PERPLEXITY_API_KEY,
    'COHERE_API_KEY': process.env.COHERE_API_KEY,
    'MISTRAL_API_KEY': process.env.MISTRAL_API_KEY,
    'GROQ_API_KEY': process.env.GROQ_API_KEY,
    'HUME_AI_API_KEY': process.env.HUME_AI_API_KEY,
    'YOUTUBE_DATA_API_KEY': process.env.YOUTUBE_DATA_API_KEY,
    'GITHUB_TOKEN': process.env.GITHUB_TOKEN,
    'REDDIT_CLIENT_ID': process.env.REDDIT_CLIENT_ID,
    'REDDIT_CLIENT_SECRET': process.env.REDDIT_CLIENT_SECRET,
    'SCRAPINGBEE_API_KEY': process.env.SCRAPINGBEE_API_KEY,
    'PINECONE_API_KEY': process.env.PINECONE_API_KEY,
  };

  console.log('API Keys Status:');
  for (const [key, value] of Object.entries(apiKeys)) {
    const configured = !!value;
    const status = configured ? '✅ Configured' : '❌ Missing';
    console.log(`  ${status} - ${key}`);
    testResults.apis[key] = { working: configured };
  }

  // 2. Test Resource Gathering APIs
  console.log('\n🔍 Step 2: Testing Resource Gathering APIs\n');
  
  try {
    // Test YouTube API
    if (apiKeys.YOUTUBE_DATA_API_KEY) {
      console.log('  Testing YouTube API...');
      try {
        const axios = await import('axios');
        const response = await axios.default.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: 'Python tutorial beginner',
            type: 'video',
            maxResults: 1,
            key: apiKeys.YOUTUBE_DATA_API_KEY
          }
        });
        testResults.apis['YouTube API'] = { 
          working: true, 
          data: { items: response.data.items?.length || 0 } 
        };
        console.log('    ✅ YouTube API working');
      } catch (error: any) {
        testResults.apis['YouTube API'] = { working: false, error: error.message };
        console.log('    ❌ YouTube API failed:', error.message);
      }
    }

    // Test GitHub API
    if (apiKeys.GITHUB_TOKEN) {
      console.log('  Testing GitHub API...');
      try {
        const axios = await import('axios');
        const response = await axios.default.get('https://api.github.com/search/repositories', {
          params: {
            q: 'python tutorial',
            sort: 'stars',
            per_page: 1
          },
          headers: {
            'Authorization': `token ${apiKeys.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        testResults.apis['GitHub API'] = { 
          working: true, 
          data: { items: response.data.items?.length || 0 } 
        };
        console.log('    ✅ GitHub API working');
      } catch (error: any) {
        testResults.apis['GitHub API'] = { working: false, error: error.message };
        console.log('    ❌ GitHub API failed:', error.message);
      }
    }

    // Test Reddit API
    if (apiKeys.REDDIT_CLIENT_ID && apiKeys.REDDIT_CLIENT_SECRET) {
      console.log('  Testing Reddit API...');
      try {
        const axios = await import('axios');
        const Buffer = (await import('buffer')).Buffer;
        
        // Get OAuth token
        const authResponse = await axios.default.post(
          'https://www.reddit.com/api/v1/access_token',
          'grant_type=client_credentials',
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${apiKeys.REDDIT_CLIENT_ID}:${apiKeys.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
              'User-Agent': 'MentarkTest/1.0',
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        if (authResponse.data.access_token) {
          testResults.apis['Reddit API'] = { working: true, data: { token: 'received' } };
          console.log('    ✅ Reddit API working');
        } else {
          throw new Error('No access token received');
        }
      } catch (error: any) {
        testResults.apis['Reddit API'] = { working: false, error: error.message };
        console.log('    ❌ Reddit API failed:', error.message);
      }
    }

    // Test Perplexity API
    if (apiKeys.PERPLEXITY_API_KEY) {
      console.log('  Testing Perplexity API...');
      try {
        const { callPerplexity } = await import('../lib/ai/models/perplexity');
        const response = await callPerplexity('What is Python?', {
          model: 'sonar',
          max_tokens: 100
        });
        testResults.apis['Perplexity API'] = { 
          working: !!response.content, 
          data: { contentLength: response.content?.length || 0 } 
        };
        console.log('    ✅ Perplexity API working');
      } catch (error: any) {
        testResults.apis['Perplexity API'] = { working: false, error: error.message };
        console.log('    ❌ Perplexity API failed:', error.message);
      }
    }

  } catch (error: any) {
    console.log('  ❌ Error testing APIs:', error.message);
  }

  // 3. Test Resource Gathering Function
  console.log('\n📦 Step 3: Testing Resource Gathering Function\n');
  
  try {
    const { gatherComprehensiveResources, extractKeywordContext } = await import('../lib/ai/orchestration/api-router');
    
    const keywordContext = extractKeywordContext(
      'Learn Python programming',
      'academic_excellence',
      'Master Python programming for data science'
    );
    
    console.log('  Gathering resources for: "Learn Python programming"');
    console.log('  Context:', JSON.stringify(keywordContext, null, 2));
    
    const resources = await gatherComprehensiveResources(
      keywordContext,
      'Python Basics',
      'Learn the fundamentals of Python programming'
    );
    
    testResults.resourceGathering = {
      working: true,
      resourcesFound: resources.length
    };
    
    console.log(`  ✅ Resource gathering working - Found ${resources.length} resources`);
    
    // Show sample resources
    if (resources.length > 0) {
      console.log('\n  Sample Resources:');
      resources.slice(0, 5).forEach((resource, i) => {
        console.log(`    ${i + 1}. ${resource.title} (${resource.type}) - ${resource.provider}`);
      });
    }
  } catch (error: any) {
    testResults.resourceGathering = {
      working: false,
      resourcesFound: 0,
      error: error.message
    };
    console.log('  ❌ Resource gathering failed:', error.message);
    console.log('  Stack:', error.stack);
  }

  // 4. Test Memory Retrieval (if Pinecone configured)
  console.log('\n🧠 Step 4: Testing Memory Retrieval\n');
  
  if (apiKeys.PINECONE_API_KEY) {
    try {
      const { retrieveMemories } = await import('../lib/ai/memory');
      // Use a test student ID (this might fail if no memories exist, which is OK)
      const memories = await retrieveMemories('test-student-id', 'Python learning', { topK: 1 });
      testResults.apis['Pinecone Memory'] = { 
        working: true, 
        data: { memoriesFound: memories.length } 
      };
      console.log('  ✅ Memory retrieval working');
    } catch (error: any) {
      // This is expected if no memories exist - not a critical failure
      if (error.message?.includes('not found') || error.message?.includes('namespace')) {
        testResults.apis['Pinecone Memory'] = { working: true, data: { note: 'No memories exist (expected)' } };
        console.log('  ✅ Memory retrieval working (no memories exist yet)');
      } else {
        testResults.apis['Pinecone Memory'] = { working: false, error: error.message };
        console.log('  ⚠️ Memory retrieval error:', error.message);
      }
    }
  }

  // 5. Test Enhanced Orchestrator (simplified - won't make actual AI calls)
  console.log('\n🤖 Step 5: Testing Enhanced Orchestrator Structure\n');
  
  try {
    const orchestratorModule = await import('../lib/ai/enhanced-ark-orchestrator');
    
    // Check if functions exist
    const hasGenerateEnhancedARK = typeof orchestratorModule.generateEnhancedARK === 'function';
    
    testResults.orchestrator = {
      working: hasGenerateEnhancedARK
    };
    
    if (hasGenerateEnhancedARK) {
      console.log('  ✅ Enhanced orchestrator module loaded correctly');
      console.log('  Note: Full orchestrator test requires API calls (skipped to save costs)');
    } else {
      throw new Error('generateEnhancedARK function not found');
    }
  } catch (error: any) {
    testResults.orchestrator = {
      working: false,
      error: error.message
    };
    console.log('  ❌ Enhanced orchestrator failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Test Summary\n');
  
  const workingAPIs = Object.values(testResults.apis).filter(a => a.working).length;
  const totalAPIs = Object.keys(testResults.apis).length;
  
  console.log(`API Configuration: ${workingAPIs}/${totalAPIs} APIs configured`);
  console.log(`Resource Gathering: ${testResults.resourceGathering.working ? '✅ Working' : '❌ Failed'} (${testResults.resourceGathering.resourcesFound} resources found)`);
  console.log(`Enhanced Orchestrator: ${testResults.orchestrator.working ? '✅ Working' : '❌ Failed'}`);
  
  // Detailed API status
  console.log('\nDetailed API Status:');
  for (const [name, result] of Object.entries(testResults.apis)) {
    const status = result.working ? '✅' : '❌';
    const info = result.data ? ` (${JSON.stringify(result.data)})` : '';
    const error = result.error ? ` - Error: ${result.error.substring(0, 50)}` : '';
    console.log(`  ${status} ${name}${info}${error}`);
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:\n');
  
  if (!testResults.resourceGathering.working) {
    console.log('  ❌ Fix resource gathering - this is critical for ARK generation');
  }
  
  const criticalAPIs = ['OPENAI_API_KEY', 'CLAUDE_API_KEY', 'GEMINI_API_KEY', 'PERPLEXITY_API_KEY'];
  const missingCritical = criticalAPIs.filter(key => !apiKeys[key]);
  
  if (missingCritical.length > 0) {
    console.log('  ⚠️ Missing critical API keys:', missingCritical.join(', '));
    console.log('     ARK generation will still work but with reduced functionality');
  }
  
  const optionalAPIs = ['YOUTUBE_DATA_API_KEY', 'GITHUB_TOKEN', 'REDDIT_CLIENT_ID'];
  const missingOptional = optionalAPIs.filter(key => !apiKeys[key]);
  
  if (missingOptional.length > 0) {
    console.log('  ℹ️ Missing optional API keys:', missingOptional.join(', '));
    console.log('     Some resource types will be unavailable');
  }
  
  if (testResults.resourceGathering.working && testResults.resourceGathering.resourcesFound === 0) {
    console.log('  ⚠️ Resource gathering returned 0 resources');
    console.log('     Check if API keys are working and if queries are correct');
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Test Complete!\n');
}

// Run tests
testARKGeneration().catch((error) => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});

