import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getModelPerformanceStats, getCostAnalytics, getUserUsageStats } from '@/lib/ai/orchestration/usage-tracker';
import { getAllModelHealthStatus, getHealthSummary } from '@/lib/ai/orchestration/health-monitor';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get recent orchestration decisions (last 100)
    const { data: recentDecisions, error: decisionsError } = await supabase
      .from('orchestration_decisions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (decisionsError) {
      console.error('Error fetching orchestration decisions:', decisionsError);
    }
    
    // Get model health status
    const modelHealth = await getAllModelHealthStatus();
    
    // Get health summary
    const healthSummary = await getHealthSummary();
    
    // Get cost analytics for today
    const costAnalytics = await getCostAnalytics('day');
    
    // Get model performance stats for all models
    const modelStats = {};
    const models = ['gpt-4o', 'o1-preview', 'claude-opus', 'gemini-pro', 'claude-sonnet', 'gpt-4o-mini', 'mistral-large', 'llama-3.1'];
    
    for (const model of models) {
      const stats = await getModelPerformanceStats({ type: model } as any);
      if (stats) {
        modelStats[model] = stats;
      }
    }
    
    // Calculate overall metrics
    const totalRequests = recentDecisions?.length || 0;
    const successfulRequests = recentDecisions?.filter(d => d.selection_score > 50).length || 0;
    const avgResponseTime = Object.values(modelStats).reduce((sum: number, stats: any) => sum + (stats.avgResponseTime || 0), 0) / Object.keys(modelStats).length || 0;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    
    // Calculate cost savings (compare with using most expensive model for all requests)
    const mostExpensiveModel = 'o1-preview'; // $0.000015 per token
    const avgTokensPerRequest = 1000; // Rough estimate
    const potentialCost = totalRequests * avgTokensPerRequest * 0.000015;
    const actualCost = costAnalytics?.dailyCost || 0;
    const costSavings = Math.max(0, potentialCost - actualCost);
    const costSavingsPercentage = potentialCost > 0 ? (costSavings / potentialCost) * 100 : 0;
    
    // Get top performing models by task
    const taskPerformance = {};
    const tasks = ['mentor_chat', 'roadmap', 'emotion', 'insights', 'research', 'prediction', 'resource_recommendation'];
    
    for (const task of tasks) {
      const { data: taskDecisions } = await supabase
        .from('orchestration_decisions')
        .select('selected_model, selection_score')
        .eq('task', task)
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (taskDecisions && taskDecisions.length > 0) {
        const modelScores = {};
        taskDecisions.forEach(decision => {
          if (!modelScores[decision.selected_model]) {
            modelScores[decision.selected_model] = { total: 0, count: 0 };
          }
          modelScores[decision.selected_model].total += decision.selection_score;
          modelScores[decision.selected_model].count += 1;
        });
        
        const avgScores = Object.entries(modelScores).map(([model, data]: [string, any]) => ({
          model,
          avgScore: data.total / data.count,
          requests: data.count
        }));
        
        taskPerformance[task] = avgScores.sort((a, b) => b.avgScore - a.avgScore);
      }
    }
    
    // Get recent usage trends (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: usageTrends, error: trendsError } = await supabase
      .from('ai_usage_logs')
      .select('timestamp, cost, success, model')
      .gte('timestamp', sevenDaysAgo.toISOString())
      .order('timestamp', { ascending: true });
    
    // Process trends data
    const dailyTrends = {};
    if (usageTrends) {
      usageTrends.forEach(log => {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        if (!dailyTrends[date]) {
          dailyTrends[date] = { cost: 0, requests: 0, success: 0 };
        }
        dailyTrends[date].cost += parseFloat(log.cost);
        dailyTrends[date].requests += 1;
        if (log.success) dailyTrends[date].success += 1;
      });
    }
    
    const response = {
      success: true,
      data: {
        // Live metrics
        totalRequests,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        costSavings,
        costSavingsPercentage: Math.round(costSavingsPercentage * 100) / 100,
        
        // Recent decisions
        recentDecisions: recentDecisions?.slice(0, 20) || [],
        
        // Model performance
        modelStats,
        modelHealth,
        healthSummary,
        
        // Task performance
        taskPerformance,
        
        // Cost analytics
        costAnalytics,
        
        // Usage trends
        dailyTrends,
        
        // Timestamps
        lastUpdated: new Date().toISOString(),
        generatedAt: Date.now()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching AI stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch AI orchestration stats'
    }, { status: 500 });
  }
}
