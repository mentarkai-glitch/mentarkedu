'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BadgeCollection } from '@/components/gamification/BadgeCollection';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { CareerDNAChart } from '@/components/career-dna/CareerDNAChart';
import { PeerMatches } from '@/components/peer-matching/PeerMatches';
import { RiskPredictorCard } from '@/components/ml/RiskPredictorCard';
import { SentimentTimeline } from '@/components/ml/SentimentTimeline';
import { 
  Brain,
  Target,
  TrendingUp,
  Calendar,
  MessageCircle,
  Award,
  Zap,
  Heart,
  BookOpen,
  Clock,
  Star,
  ArrowRight,
  Plus,
  CheckCircle,
  Flame,
  Trophy,
  Users,
  BarChart3,
  Sparkles,
  Coffee,
  Moon,
  Sun
} from 'lucide-react';

interface StudentStats {
  xp: number;
  level: number;
  streak: number;
  arksCompleted: number;
  arksActive: number;
  lastCheckIn: string;
  weeklyProgress: number;
}

interface ARK {
  id: string;
  title: string;
  category: string;
  progress: number;
  nextMilestone: string;
  dueDate: string;
  status: 'active' | 'completed' | 'paused';
}

interface RecentChat {
  id: string;
  persona: string;
  lastMessage: string;
  timestamp: string;
}

const mockStats: StudentStats = {
  xp: 1250,
  level: 5,
  streak: 7,
  arksCompleted: 3,
  arksActive: 2,
  lastCheckIn: '2024-01-15',
  weeklyProgress: 75
};

const mockARKs: ARK[] = [
  {
    id: '1',
    title: 'Master Python Programming',
    category: 'Academic',
    progress: 65,
    nextMilestone: 'Complete data structures module',
    dueDate: '2024-02-15',
    status: 'active'
  },
  {
    id: '2',
    title: 'Build Public Speaking Confidence',
    category: 'Personal',
    progress: 40,
    nextMilestone: 'Practice presentation skills',
    dueDate: '2024-03-01',
    status: 'active'
  },
  {
    id: '3',
    title: 'JEE Preparation Strategy',
    category: 'Academic',
    progress: 100,
    nextMilestone: 'Completed!',
    dueDate: '2024-01-10',
    status: 'completed'
  }
];

const mockRecentChats: RecentChat[] = [
  {
    id: '1',
    persona: 'Friendly Guide',
    lastMessage: 'Great job on your Python progress! Ready for the next challenge?',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    persona: 'Analytical Advisor',
    lastMessage: 'Your study schedule needs optimization. Let me help you...',
    timestamp: 'Yesterday'
  }
];

export default function StudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StudentStats>(mockStats);
  const [arks, setARKs] = useState<ARK[]>(mockARKs);
  const [recentChats, setRecentChats] = useState<RecentChat[]>(mockRecentChats);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAIProfile, setHasAIProfile] = useState(false);

  // Get current user and fetch data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Fetch student data
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (studentData && !studentError) {
            // Check if AI identity profile exists
            setHasAIProfile(!!studentData.ai_identity_profile && studentData.onboarding_completed);
            
            // Update stats with real data
            setStats({
              xp: studentData.total_xp || 0,
              level: studentData.current_level || 1,
              streak: studentData.current_streak || 0,
              arksCompleted: studentData.completed_arks || 0,
              arksActive: studentData.active_arks || 0,
              lastCheckIn: studentData.last_check_in || new Date().toISOString(),
              weeklyProgress: studentData.weekly_progress || 0
            });

            // Fetch ARKs
            const { data: arksData, error: arksError } = await supabase
              .from('arks')
              .select('*')
              .eq('student_id', user.id)
              .order('created_at', { ascending: false });

            if (arksData && !arksError) {
              const formattedARKs = arksData.map((ark: any) => ({
                id: ark.id,
                title: ark.title,
                category: ark.category,
                progress: ark.progress || 0,
                nextMilestone: ark.next_milestone || 'Continue learning',
                dueDate: ark.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: ark.status || 'active'
              }));
              setARKs(formattedARKs);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // No more forced redirect to train-ai-model
  // User can access dashboard and complete profile later
  // useEffect(() => {
  //   if (!loading && user && !hasAIProfile) {
  //     router.push('/train-ai-model');
  //   }
  // }, [loading, user, hasAIProfile, router]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 6 || hour >= 18) return Moon;
    if (hour < 12) return Sun;
    return Coffee;
  };

  const TimeIcon = getTimeIcon();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Header Bar */}
      <header className="border-b-2 border-yellow-500/30 bg-black backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="font-display text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              <span className="hidden sm:inline">{getGreeting()}, </span>
              {user?.user_metadata?.first_name || 'Student'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-yellow-200">
              <TimeIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{currentTime.toLocaleTimeString()}</span>
            </div>
            <Link href="/chat">
              <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold text-xs sm:text-sm">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Quick Chat</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/emotion-check">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:border-pink-500/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <Heart className="w-8 h-8 text-pink-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">Daily Check-in</h3>
                    <p className="text-sm text-slate-400">Track your emotions</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
            <Link href="/chat">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:border-blue-500/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <MessageCircle className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">Ask Mentor</h3>
                    <p className="text-sm text-slate-400">Get guidance</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
            <Link href="/search">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:border-yellow-500/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <Sparkles className="w-8 h-8 text-yellow-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">Smart Search</h3>
                    <p className="text-sm text-slate-400">Find anything</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
            <Link href="/dashboard/student/doubt-solver">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:border-green-500/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <Brain className="w-8 h-8 text-green-400 mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">Doubt Solver</h3>
                    <p className="text-sm text-slate-400">Get verified answers</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Stats & Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto">
                  <div className="flex items-center gap-3 sm:gap-4 mb-2">
                    <div className="text-3xl sm:text-4xl font-bold text-yellow-400">{stats.level}</div>
                    <div>
                      <div className="text-base sm:text-lg font-semibold text-white">Level {stats.level}</div>
                      <div className="text-xs sm:text-sm text-slate-400">{stats.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                  <div className="w-full sm:w-64">
                    <div className="flex justify-between text-xs sm:text-sm text-slate-400 mb-2">
                      <span>Level {stats.level}</span>
                      <span>{Math.round((stats.xp % 1000) / 10)}% to next level</span>
                    </div>
                    <Progress value={(stats.xp % 1000) / 10} className="h-2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center w-full sm:w-auto">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-cyan-400">{stats.streak}</div>
                    <div className="text-xs text-slate-400">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-400">{stats.arksActive}</div>
                    <div className="text-xs text-slate-400">Active ARKs</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.weeklyProgress}%</div>
                    <div className="text-xs text-slate-400">Weekly Progress</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 glass border border-yellow-500/30 bg-slate-900/50 text-xs sm:text-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gamification">Gamification</TabsTrigger>
            <TabsTrigger value="career-dna">Career DNA</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="peer-matching">Peer Matching</TabsTrigger>
            <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Active ARKs */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <Card className="glass border-yellow-500/20 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-yellow-400" />
                        Your Active ARKs
                      </CardTitle>
                      <Link href="/ark/create">
                        <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
                          <Plus className="w-4 h-4 mr-2" />
                          New ARK
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {arks.filter(ark => ark.status === 'active').map((ark, index) => (
                    <motion.div
                      key={ark.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Card className="glass border-yellow-500/20 hover:border-yellow-500/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {ark.title}
                              </h3>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                {ark.category}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-slate-400">Due</div>
                              <div className="text-sm text-white">{new Date(ark.dueDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-400">Progress</span>
                              <span className="text-white">{ark.progress}%</span>
                            </div>
                            <Progress value={ark.progress} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-300">
                              Next: {ark.nextMilestone}
                            </p>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700/50">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Daily Check-in */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Daily Check-in
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">😊</div>
                  <div className="text-sm text-slate-400">Last check-in: {stats.lastCheckIn}</div>
                </div>
                
                <Link href="/daily-checkin">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600 font-semibold">
                    <Heart className="w-4 h-4 mr-2" />
                    Check-in Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Chats */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  Recent Chats
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {recentChats.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                            {chat.persona}
                          </Badge>
                          <span className="text-xs text-slate-400">{chat.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-300 truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <Link href="/chat">
                  <Button variant="outline" className="w-full mt-4 border-slate-600 text-slate-200 hover:bg-slate-700/50">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start New Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {[
                    { icon: '🔥', title: '7-Day Streak', desc: 'Checked in for 7 days straight!' },
                    { icon: '🎯', title: 'ARK Master', desc: 'Completed your first ARK' },
                    { icon: '💬', title: 'Chat Champion', desc: 'Had 10 conversations with AI' }
                  ].map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <div className="text-sm font-semibold text-white">{achievement.title}</div>
                        <div className="text-xs text-slate-400">{achievement.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-6">
            <XPProgressBar 
              totalXp={stats.xp} 
              level={stats.level} 
              xpToNextLevel={Math.pow(stats.level, 2) * 100 - stats.xp}
            />
            <BadgeCollection
              earned={[]}
              available={[]}
              totalEarned={3}
              totalAvailable={8}
            />
          </TabsContent>

          {/* Career DNA Tab */}
          <TabsContent value="career-dna" className="space-y-6">
            <CareerDNAChart />
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <Button 
                    onClick={() => window.location.href = '/career-dna/analyze'}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Career DNA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          {/* Peer Matching Tab */}
          <TabsContent value="peer-matching">
            <PeerMatches />
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risk-analysis">
            <RiskPredictorCard studentId="current-user-id" />
          </TabsContent>

          {/* Sentiment Timeline Tab */}
          <TabsContent value="sentiment">
            <SentimentTimeline studentId="current-user-id" />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    title: 'Create ARK', 
                    desc: 'Start a new learning journey',
                    icon: Target,
                    href: '/ark/create',
                    gradient: 'from-blue-500 to-cyan-500'
                  },
                  { 
                    title: 'AI Chat', 
                    desc: 'Talk to your mentor',
                    icon: MessageCircle,
                    href: '/chat',
                    gradient: 'from-purple-500 to-pink-500'
                  },
                  { 
                    title: 'Check-in', 
                    desc: 'Reflect on your day',
                    icon: Heart,
                    href: '/daily-checkin',
                    gradient: 'from-pink-500 to-red-500'
                  },
                  { 
                    title: 'View Progress', 
                    desc: 'See detailed analytics',
                    icon: BarChart3,
                    href: '/dashboard/analytics',
                    gradient: 'from-green-500 to-emerald-500'
                  }
                ].map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="cursor-pointer"
                  >
                    <Link href={action.href}>
                      <Card className="h-full bg-slate-700/30 border-slate-600 hover:border-slate-500 transition-all">
                        <CardContent className="p-4 text-center">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                          <p className="text-sm text-slate-400">{action.desc}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
