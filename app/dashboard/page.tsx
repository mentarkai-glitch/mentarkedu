'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User,
  BookOpen,
  Brain,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Sparkles,
  Rocket,
  GraduationCap,
  ArrowRight,
  Search
} from 'lucide-react';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { AnimatedText } from '@/components/ui/AnimatedText';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error getting user:', error);
        router.push('/auth/login');
        return;
      }

      if (user) {
        setUser(user);
        // Check if email is verified
        if (user.email_confirmed_at) {
          setOtpVerified(true);
        }
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('profile_data, full_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigateToRole = (role: string) => {
    if (role === 'student') {
      router.push('/dashboard/student');
    } else if (role === 'teacher') {
      router.push('/dashboard/teacher');
    } else if (role === 'admin') {
      router.push('/dashboard/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-x-hidden w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = userProfile?.profile_data?.first_name || userProfile?.full_name?.split(' ')[0] || 'Explorer';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden w-full">
      {/* Header */}
      <header className="border-b border-yellow-500/20 glass backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4 w-full max-w-full">
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <img src="/logo.png" alt="Mentark" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
            </motion.div>
            <span className="font-display text-lg sm:text-xl font-bold text-white">Mentark Quantum</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-white text-xs sm:text-sm">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 p-2 sm:px-3 text-xs sm:text-sm">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 w-full max-w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="text-center mb-8 sm:mb-12 px-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="mb-4 sm:mb-6"
            >
              <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full neon-glow mb-3 sm:mb-4">
                <Rocket className="h-8 w-8 sm:h-12 sm:w-12 text-black" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4"
            >
              <AnimatedText className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                {`Welcome to your Quantum Journey, ${displayName}!`}
              </AnimatedText>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-base sm:text-lg lg:text-xl text-slate-400 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              <span>Your AI-powered learning companion is ready to help you succeed</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
            </motion.p>
            
            {/* Email Verification Status */}
            {!otpVerified && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="mb-8"
              >
                <OTPVerification 
                  email={user?.email || ''} 
                  onVerified={() => setOtpVerified(true)}
                />
              </motion.div>
            )}
          </div>

          {/* Primary actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-6">
              Where do you want to start today?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Smart Search',
                  description: 'Find papers, scholarships, and curated resources instantly.',
                  href: '/search',
                  icon: Search,
                  gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
                  border: 'border-cyan-400/40',
                },
                {
                  title: 'Student Dashboard',
                  description: 'See your ARKs, momentum stats, and latest mentor nudges.',
                  href: '/dashboard/student',
                  icon: GraduationCap,
                  gradient: 'from-yellow-500/20 via-orange-500/10 to-transparent',
                  border: 'border-yellow-400/40',
                },
                {
                  title: 'Train Mentark AI',
                  description: 'Share your goals so recommendations stay Indian-context aware.',
                  href: '/dashboard/student/train-ai',
                  icon: Brain,
                  gradient: 'from-emerald-500/20 via-lime-500/10 to-transparent',
                  border: 'border-emerald-400/40',
                },
              ].map((action, index) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.02, y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <Card className={`glass border ${action.border} bg-gradient-to-br ${action.gradient} backdrop-blur-sm h-full`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-black/40">
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-white text-lg">{action.title}</CardTitle>
                      </div>
                      <CardDescription className="text-slate-300 text-sm">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full bg-gradient-cyan-blue text-black hover:opacity-90 font-semibold"
                        onClick={() => router.push(action.href)}
                      >
                        Launch
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Dashboard Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {/* Student Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Card className="glass border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/50 transition-all cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg group-hover:from-yellow-500/40 group-hover:to-yellow-600/40 transition-all">
                      <GraduationCap className="h-6 w-6 text-yellow-400" />
                    </div>
                    <CardTitle className="flex items-center gap-2 text-white text-xl">
                      Student Dashboard
                    </CardTitle>
                  </div>
                  <CardDescription className="text-slate-400">
                    Access your learning materials, ARKs, and progress tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigateToRole('student')} 
                    className="w-full bg-gradient-cyan-blue text-black hover:opacity-90 neon-glow font-semibold"
                  >
                    Enter as Student
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Teacher Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <Card className="glass border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/50 transition-all cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg group-hover:from-yellow-500/40 group-hover:to-yellow-600/40 transition-all">
                      <User className="h-6 w-6 text-yellow-400" />
                    </div>
                    <CardTitle className="flex items-center gap-2 text-white text-xl">
                      Teacher Dashboard
                    </CardTitle>
                  </div>
                  <CardDescription className="text-slate-400">
                    Manage your students, view analytics, and track progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigateToRole('teacher')} 
                    className="w-full bg-gradient-cyan-blue text-black hover:opacity-90 neon-glow font-semibold"
                  >
                    Enter as Teacher
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Admin Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              <Card className="glass border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/50 transition-all cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg group-hover:from-yellow-500/40 group-hover:to-yellow-600/40 transition-all">
                      <Shield className="h-6 w-6 text-yellow-400" />
                    </div>
                    <CardTitle className="flex items-center gap-2 text-white text-xl">
                      Admin Dashboard
                    </CardTitle>
                  </div>
                  <CardDescription className="text-slate-400">
                    System administration, AI orchestration, and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigateToRole('admin')} 
                    className="w-full bg-gradient-cyan-blue text-black hover:opacity-90 neon-glow font-semibold"
                  >
                    Enter as Admin
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mt-16 max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="text-3xl font-bold mb-8 text-center"
            >
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Quick Actions
              </span>
            </motion.h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.8 }}
              >
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 glass border-yellow-500/20 hover:border-yellow-500/50 group"
                  onClick={() => router.push('/train-ai-model')}
                >
                  <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg group-hover:from-yellow-500/40 group-hover:to-yellow-600/40 transition-all">
                    <Settings className="h-6 w-6 text-yellow-400" />
                  </div>
                  <span className="text-sm text-white font-medium">Train AI</span>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 2 }}
              >
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 glass border-yellow-500/20 hover:border-yellow-500/50 group"
                  onClick={() => router.push('/chat')}
                >
                  <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg group-hover:from-yellow-500/40 group-hover:to-yellow-600/40 transition-all">
                    <MessageSquare className="h-6 w-6 text-yellow-400" />
                  </div>
                  <span className="text-sm text-white font-medium">AI Chat</span>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 2.2 }}
              >
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 glass border-yellow-500/20 hover:border-yellow-500/50 group"
                  onClick={() => router.push('/journal')}
                >
                  <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg group-hover:from-yellow-500/40 group-hover:to-yellow-600/40 transition-all">
                    <Brain className="h-6 w-6 text-yellow-400" />
                  </div>
                  <span className="text-sm text-white font-medium">Journal</span>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 2.4 }}
              >
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 glass border-yellow-500/20 hover:border-yellow-500/50 group"
                  onClick={() => router.push('/ark/create')}
                >
                  <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg group-hover:from-yellow-500/40 group-hover:to-yellow-600/40 transition-all">
                    <BookOpen className="h-6 w-6 text-yellow-400" />
                  </div>
                  <span className="text-sm text-white font-medium">Create ARK</span>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 2.6 }}
              >
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 glass border-yellow-500/20 hover:border-yellow-500/50 group"
                  onClick={() => router.push('/emotion-check')}
                >
                  <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg group-hover:from-yellow-500/40 group-hover:to-yellow-600/40 transition-all">
                    <BarChart3 className="h-6 w-6 text-yellow-400" />
                  </div>
                  <span className="text-sm text-white font-medium">Emotion Check</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
