'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database,
  Activity,
  Zap,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  Timer,
  Stopwatch,
  Calendar,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Lock,
  Unlock,
  Shield,
  Key,
  Fingerprint,
  Scan,
  QrCode,
  BarCode,
  CreditCard,
  Wallet,
  Coins,
  Banknote,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Gauge as GaugeIcon,
  Timer as TimerIcon,
  Stopwatch as StopwatchIcon,
  Calendar as CalendarIcon,
  Server as ServerIcon,
  HardDrive as HardDriveIcon,
  Cpu as CpuIcon,
  MemoryStick as MemoryStickIcon,
  Network as NetworkIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Shield as ShieldIcon,
  Key as KeyIcon,
  Fingerprint as FingerprintIcon,
  Scan as ScanIcon,
  QrCode as QrCodeIcon,
  BarCode as BarCodeIcon,
  CreditCard as CreditCardIcon,
  Wallet as WalletIcon,
  Coins as CoinsIcon,
  Banknote as BanknoteIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface RedisAnalytics {
  model: string;
  data: {
    requests: number;
    tokensUsed: number;
    cost: number;
    avgResponseTime: number;
    successRate: number;
    timestamp: number;
  } | null;
}

interface CacheStats {
  cacheHitRate: number;
  totalCachedResponses: number;
  cacheSize: string;
}

interface RateLimitStats {
  totalRateLimitedUsers: number;
  activeRateLimits: number;
  rateLimitBreakdown: Record<string, number>;
}

interface SessionStats {
  totalActiveSessions: number;
  totalUsersWithSessions: number;
  averageSessionsPerUser: number;
}

interface HealthStatus {
  healthy: boolean;
  timestamp: number;
}

export default function RedisAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<RedisAnalytics[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [rateLimitStats, setRateLimitStats] = useState<RateLimitStats | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch analytics
      const analyticsResponse = await fetch('/api/admin/redis-analytics?endpoint=analytics');
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }

      // Fetch cache stats
      const cacheResponse = await fetch('/api/admin/redis-analytics?endpoint=cache-stats');
      const cacheData = await cacheResponse.json();
      if (cacheData.success) {
        setCacheStats(cacheData.data);
      }

      // Fetch rate limit stats
      const rateLimitResponse = await fetch('/api/admin/redis-analytics?endpoint=rate-limits');
      const rateLimitData = await rateLimitResponse.json();
      if (rateLimitData.success) {
        setRateLimitStats(rateLimitData.data);
      }

      // Fetch session stats
      const sessionResponse = await fetch('/api/admin/redis-analytics?endpoint=sessions');
      const sessionData = await sessionResponse.json();
      if (sessionData.success) {
        setSessionStats(sessionData.data);
      }

      // Fetch health status
      const healthResponse = await fetch('/api/admin/redis-analytics?endpoint=health');
      const healthData = await healthResponse.json();
      if (healthData.success) {
        setHealthStatus(healthData.data);
      }

    } catch (error) {
      console.error('Error fetching Redis analytics:', error);
      toast.error('Failed to fetch Redis analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const clearCache = async (type: string) => {
    try {
      const response = await fetch('/api/admin/redis-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `clear-${type}-cache`,
          data: {}
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`${type} cache cleared successfully`);
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to clear cache');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading Redis Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Redis Analytics Dashboard</h1>
            <p className="text-slate-400">Monitor Redis performance, caching, and analytics</p>
          </div>
          <Button
            onClick={fetchData}
            disabled={refreshing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Health Status */}
        {healthStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${healthStatus.healthy ? 'bg-green-500' : 'bg-red-500'}`}>
                      {healthStatus.healthy ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Redis Health Status</h3>
                      <p className={`text-sm ${healthStatus.healthy ? 'text-green-400' : 'text-red-400'}`}>
                        {healthStatus.healthy ? 'Healthy' : 'Unhealthy'}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${healthStatus.healthy ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {healthStatus.healthy ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {analytics.map((item, index) => (
                <motion.div
                  key={item.model}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Database className="w-5 h-5" />
                        <span>{item.model}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {item.data ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-slate-400 text-sm">Requests</p>
                              <p className="text-white text-2xl font-bold">{item.data.requests}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm">Tokens Used</p>
                              <p className="text-white text-2xl font-bold">{item.data.tokensUsed.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm">Cost</p>
                              <p className="text-white text-2xl font-bold">${item.data.cost.toFixed(4)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm">Avg Response Time</p>
                              <p className="text-white text-2xl font-bold">{item.data.avgResponseTime}ms</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Success Rate</span>
                            <Badge className={`${item.data.successRate > 0.9 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                              {(item.data.successRate * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-400 text-center py-4">No data available</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Cache Tab */}
          <TabsContent value="cache">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {cacheStats && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <Zap className="w-5 h-5" />
                          <span>Cache Hit Rate</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-400 mb-2">
                            {(cacheStats.cacheHitRate * 100).toFixed(1)}%
                          </div>
                          <p className="text-slate-400 text-sm">Overall cache efficiency</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <Database className="w-5 h-5" />
                          <span>Cached Responses</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-400 mb-2">
                            {cacheStats.totalCachedResponses.toLocaleString()}
                          </div>
                          <p className="text-slate-400 text-sm">Total cached items</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center space-x-2">
                          <HardDrive className="w-5 h-5" />
                          <span>Cache Size</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-purple-400 mb-2">
                            {cacheStats.cacheSize}
                          </div>
                          <p className="text-slate-400 text-sm">Memory usage</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Rate Limits Tab */}
          <TabsContent value="rate-limits">
            {rateLimitStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Lock className="w-5 h-5" />
                        <span>Rate Limit Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-400 text-sm">Total Users</p>
                          <p className="text-white text-2xl font-bold">{rateLimitStats.totalRateLimitedUsers}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Active Limits</p>
                          <p className="text-white text-2xl font-bold">{rateLimitStats.activeRateLimits}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5" />
                        <span>Rate Limit Breakdown</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(rateLimitStats.rateLimitBreakdown).map(([endpoint, count]) => (
                          <div key={endpoint} className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">{endpoint}</span>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            {sessionStats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Active Sessions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-400 mb-2">
                          {sessionStats.totalActiveSessions}
                        </div>
                        <p className="text-slate-400 text-sm">Currently active</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Users with Sessions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-400 mb-2">
                          {sessionStats.totalUsersWithSessions}
                        </div>
                        <p className="text-slate-400 text-sm">Total users</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Avg Sessions per User</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-400 mb-2">
                          {sessionStats.averageSessionsPerUser}
                        </div>
                        <p className="text-slate-400 text-sm">Average count</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Trash2 className="w-5 h-5" />
                      <span>Cache Management</span>
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Clear cache to free up memory and force fresh data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => clearCache('all')}
                      variant="outline"
                      className="w-full border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      Clear All Cache
                    </Button>
                    <Button
                      onClick={() => clearCache('user')}
                      variant="outline"
                      className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                    >
                      Clear User Cache
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>System Information</span>
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Redis system status and configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Redis Status</span>
                      <Badge className={`${healthStatus?.healthy ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {healthStatus?.healthy ? 'Healthy' : 'Unhealthy'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Last Updated</span>
                      <span className="text-slate-400 text-sm">
                        {healthStatus ? new Date(healthStatus.timestamp).toLocaleTimeString() : 'Unknown'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


