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
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TabNav } from '@/components/ui/tab-nav';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { BadgeCollection } from '@/components/gamification/BadgeCollection';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { CareerDNAChart } from '@/components/career-dna/CareerDNAChart';
import { PeerMatches } from '@/components/peer-matching/PeerMatches';
import { RiskPredictorCard } from '@/components/ml/RiskPredictorCard';
import { SentimentTimeline } from '@/components/ml/SentimentTimeline';
import { UnifiedAnalytics } from '@/components/student/UnifiedAnalytics';
import { PracticeQuestionsWidget } from '@/components/student/PracticeQuestionsWidget';
import { listDocuments } from '@/lib/services/document-generation';
import { FighterPilotDashboard } from '@/components/dashboard/student/FighterPilotDashboard';
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
  Sun,
  GraduationCap,
  IndianRupee,
  FileText,
  Download,
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
  interface RecentDocument {
    id: string;
    document_type: string;
    format: string;
    generated_at: string;
  }
  
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  useEffect(() => {
    loadRecentDocuments();
  }, []);

  const loadRecentDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const result = await listDocuments({ limit: 5 });
      setRecentDocuments(result.documents || []);
    } catch (error) {
      console.error('Failed to load recent documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

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

  const handleLaunchDashboard = () => {
    const anchor = document.getElementById("student-dashboard-main");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="border-b-2 border-border bg-card backdrop-blur-xl w-full transition-colors duration-200">
        <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 w-full max-w-full">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <h1 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent truncate">
              <span className="hidden sm:inline">{getGreeting()}, </span>
              {user?.user_metadata?.first_name || 'Student'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <TimeIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm hidden md:inline">{currentTime.toLocaleTimeString()}</span>
            </div>
            <Link href="/chat">
              <Button size="sm" className="bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs sm:text-sm">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1 md:mr-2" />
                <span className="hidden sm:inline">Quick Chat</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full max-w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-border rounded-xl bg-card/50 p-5 sm:p-6"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full text-xs text-primary">
                <Sparkles className="h-3 w-3" />
                Fresh for Indian learners
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Train Mentark AI before you dive in
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Share your graduation plan, course year, and competitive exam prep (JEE, NEET, AIIMS, CUET or others).
                Mentark will shape ARKs, reminders, scholarships and costs around the Indian education landscape and your
                personal budget in Indian rupees.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge className="bg-muted border border-border text-foreground">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Degree aware
                </Badge>
                <Badge className="bg-muted border border-border text-foreground">
                  <Target className="h-3 w-3 mr-1" />
                  Exam timelines (JEE/NEET/AIIMS)
                </Badge>
                <Badge className="bg-muted border border-border text-foreground">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  Guidance priced for India
                </Badge>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 transition-all min-h-[44px] px-6"
              >
                <Link href="/dashboard/student/train-ai">Train Mentark AI</Link>
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
                onClick={handleLaunchDashboard}
              >
                Launch dashboard
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Fighter Pilot Dashboard - New UX */}
        {hasAIProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <FighterPilotDashboard studentId={user?.id} />
          </motion.div>
        )}

        <div id="student-dashboard-main" />

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
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-1">Daily Check-in</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Track your emotions</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
            <Link href="/chat">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:border-blue-500/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <MessageCircle className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-1">Ask Mentor</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Get guidance</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
            <Link href="/search">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:border-yellow-500/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <Sparkles className="w-8 h-8 text-yellow-400 mb-3" />
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-1">Smart Search</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Find anything</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
            <Link href="/dashboard/student/doubt-solver">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:border-green-500/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <Brain className="w-8 h-8 text-green-400 mb-3" />
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-1">Doubt Solver</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Get verified answers</p>
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
          <Card className="bg-card/50 border-border overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Level Section */}
                <div className="w-full">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3">
                    <div className="text-3xl sm:text-4xl font-bold text-primary flex-shrink-0">{stats.level}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base sm:text-lg font-semibold text-card-foreground truncate">Level {stats.level}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">{stats.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2">
                      <span className="truncate">Level {stats.level}</span>
                      <span className="ml-2 flex-shrink-0">{Math.round((stats.xp % 1000) / 10)}% to next</span>
                    </div>
                    <Progress value={(stats.xp % 1000) / 10} className="h-2 w-full" />
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 text-center w-full border-t border-border pt-4">
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-400 truncate">{stats.streak}</div>
                    <div className="text-xs text-muted-foreground mt-1 break-words">Day Streak</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400 truncate">{stats.arksActive}</div>
                    <div className="text-xs text-muted-foreground mt-1 break-words">Active ARKs</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-400 truncate">{stats.weeklyProgress}%</div>
                    <div className="text-xs text-muted-foreground mt-1 break-words">Weekly Progress</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Unified Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <UnifiedAnalytics period="week" />
        </motion.div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8 w-full">
          <TabNav
            items={[
              { value: 'overview', label: 'Overview' },
              { value: 'gamification', label: 'Gamification' },
              { value: 'career-dna', label: 'Career DNA' },
              { value: 'leaderboard', label: 'Leaderboard' },
              { value: 'peer-matching', label: 'Peers' },
              { value: 'risk-analysis', label: 'Risk' },
              { value: 'sentiment', label: 'Sentiment' }
            ]}
            value={activeTab}
            onValueChange={setActiveTab}
            fullWidth
            variant="default"
            size="md"
          />

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
                <Card className="glass border-border backdrop-blur-sm bg-card/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg sm:text-xl text-card-foreground flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span className="truncate">Your Active ARKs</span>
                      </CardTitle>
                      <Link href="/ark/create">
                        <Button size="sm" className="bg-primary hover:opacity-90 text-primary-foreground font-semibold">
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
                      <Card className="glass border-primary/20 hover:border-primary/50 transition-all bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-1 truncate">
                                {ark.title}
                              </h3>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                {ark.category}
                              </Badge>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <div className="text-xs sm:text-sm text-muted-foreground">Due</div>
                              <div className="text-xs sm:text-sm text-card-foreground whitespace-nowrap">{new Date(ark.dueDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="text-card-foreground">{ark.progress}%</span>
                            </div>
                            <Progress value={ark.progress} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs sm:text-sm text-muted-foreground truncate min-w-0">
                              Next: {ark.nextMilestone}
                            </p>
                            <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted flex-shrink-0">
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
            {/* Practice Questions Widget */}
            <PracticeQuestionsWidget />

            {/* Recent Documents */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg text-card-foreground flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="truncate">Recent Documents</span>
                  </CardTitle>
                  <Link href="/dashboard/student/documents">
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              
              <CardContent>
                {loadingDocuments ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : recentDocuments.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm mb-3">No documents yet</p>
                    <Link href="/dashboard/student/documents/generate">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Document
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDocuments.map((doc) => (
                      <Link key={doc.id} href={`/dashboard/student/documents`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer min-h-[44px]"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-card-foreground truncate">
                                {doc.document_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(doc.generated_at).toLocaleDateString()} • {doc.format.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </motion.div>
                      </Link>
                    ))}
                    <Link href="/dashboard/student/documents">
                      <Button variant="outline" className="w-full mt-3 border-border text-foreground hover:bg-muted min-h-[44px]">
                        <FileText className="w-4 h-4 mr-2" />
                        View All Documents
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Check-in */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-card-foreground flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Daily Check-in
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">😊</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Last check-in: {stats.lastCheckIn}</div>
                </div>
                
                <Link href="/daily-checkin">
                  <Button className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold min-h-[44px]">
                    <Heart className="w-4 h-4 mr-2" />
                    Check-in Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Chats */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-card-foreground flex items-center gap-2">
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
                      <div className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-all cursor-pointer min-h-[44px]">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                            {chat.persona}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-card-foreground truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <Link href="/chat">
                  <Button variant="outline" className="w-full mt-4 border-border text-foreground hover:bg-muted min-h-[44px]">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start New Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-card-foreground flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
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
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted min-h-[44px]"
                    >
                      <div className="text-2xl flex-shrink-0">{achievement.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-card-foreground truncate">{achievement.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{achievement.desc}</div>
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
            <Card className="bg-card/50 border-border backdrop-blur-sm">
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
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-card-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                      <Card className="h-full bg-muted border-border hover:border-primary/50 transition-all min-h-[140px]">
                        <CardContent className="p-4 text-center">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                            <action.icon className="w-6 h-6 text-foreground flex-shrink-0" />
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold text-card-foreground mb-1 truncate">{action.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{action.desc}</p>
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
