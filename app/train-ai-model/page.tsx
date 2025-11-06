'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Brain, 
  Target, 
  Heart,
  BookOpen,
  Zap,
  CheckCircle,
  School,
  Home,
  MapPin,
  Clock,
  Lightbulb,
  TrendingUp,
  Award,
  Users,
  Smile,
  Frown,
  Meh,
  Battery,
  Coffee,
  Sparkles,
  Rocket,
  Star,
  Palette,
  Gamepad2,
  Music,
  Camera,
  Code,
  Calculator,
  Globe,
  Beaker,
  PenTool,
  Dumbbell,
  Mic,
  Headphones,
  Eye,
  Hand,
  Laptop,
  Smartphone,
  Monitor,
  Video,
  FileText,
  Image,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Wand2,
  Cpu,
  Sunrise,
  Sunset,
  Moon,
  Trophy,
  GraduationCap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AIIdentityProfile {
  // Basic Identity
  name: string;
  grade: string;
  city: string;
  schoolType: string;
  board: string;
  
  // Learning Personality
  learningStyle: string[];
  studyPreferences: string[];
  motivationTriggers: string[];
  challengeResponse: string;
  
  // Psychological Profile
  stressLevel: number;
  confidenceLevel: number;
  motivationLevel: number;
  socialComfort: string;
  supportSystem: string[];
  
  // Personality Traits
  personalityType: string;
  riskTaking: string;
  mindset: string;
  nature: string;
  
  // Interests & Passions
  favoriteSubjects: string[];
  hobbies: string[];
  skills: string[];
  improvementAreas: string[];
  careerFields: string[];
  
  // AI Model Settings
  communicationStyle: string;
  detailLevel: string;
  supportStyle: string;
  challengeLevel: string;
  
  // Test Results
  aiMatchScore: number;
  learningAccuracy: number;
  communicationMatch: number;
}

export default function TrainAIModelPage() {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<AIIdentityProfile>({
    name: '',
    grade: '',
    city: '',
    schoolType: '',
    board: '',
    learningStyle: [],
    studyPreferences: [],
    motivationTriggers: [],
    challengeResponse: '',
    stressLevel: 5,
    confidenceLevel: 5,
    motivationLevel: 5,
    socialComfort: '',
    supportSystem: [],
    personalityType: '',
    riskTaking: '',
    mindset: '',
    nature: '',
    favoriteSubjects: [],
    hobbies: [],
    skills: [],
    improvementAreas: [],
    careerFields: [],
    communicationStyle: '',
    detailLevel: '',
    supportStyle: '',
    challengeLevel: '',
    aiMatchScore: 0,
    learningAccuracy: 0,
    communicationMatch: 0
  });

  const phases = [
    { id: 'welcome', title: 'Welcome & Introduction', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { id: 'identity', title: 'Basic Identity Setup', icon: User, color: 'from-blue-500 to-cyan-500' },
    { id: 'learning', title: 'Learning Personality', icon: Brain, color: 'from-green-500 to-emerald-500' },
    { id: 'psychology', title: 'Psychological Profiling', icon: Heart, color: 'from-red-500 to-rose-500' },
    { id: 'interests', title: 'Interests & Passions', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { id: 'training', title: 'AI Model Training', icon: Cpu, color: 'from-indigo-500 to-purple-500' },
    { id: 'testing', title: 'Test & Calibration', icon: Wand2, color: 'from-teal-500 to-blue-500' },
    { id: 'complete', title: 'Complete & Launch', icon: Rocket, color: 'from-emerald-500 to-green-500' }
  ];

  // Load saved profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('students')
          .select('ai_identity_profile, onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          // If already completed, redirect to dashboard
          if (data.onboarding_completed) {
            toast.info('Welcome back! Redirecting to dashboard...');
            router.push('/dashboard/student');
            return;
          }

          // Load saved profile if exists
          if (data.ai_identity_profile) {
            setProfile(prev => ({ ...prev, ...data.ai_identity_profile }));
          }
        }
      }
      setIsLoadingProfile(false);
    };

    loadProfile();
  }, [router]);

  // Auto-save profile on changes (skip if loading initial profile)
  useEffect(() => {
    if (isLoadingProfile) return; // Don't auto-save while loading initial profile
    
    const autoSave = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && profile.name) { // Only save if user has started filling
        try {
          await supabase
            .from('students')
            .update({ ai_identity_profile: profile })
            .eq('user_id', user.id);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    };

    // Debounce auto-save
    const timeoutId = setTimeout(autoSave, 2000); // Increased to 2 seconds
    return () => clearTimeout(timeoutId);
  }, [profile, isLoadingProfile]);

  const handleNext = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save AI identity profile
        const { error } = await supabase
          .from('students')
          .update({
            ai_identity_profile: profile,
            onboarding_completed: true
          })
          .eq('user_id', user.id);

        if (error) throw error;

        toast.success('Your AI model has been trained successfully!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error saving AI identity:', error);
      toast.error('Failed to save your AI profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: keyof AIIdentityProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 0:
        return renderWelcomePhase();
      case 1:
        return renderIdentityPhase();
      case 2:
        return renderLearningPhase();
      case 3:
        return renderPsychologyPhase();
      case 4:
        return renderInterestsPhase();
      case 5:
        return renderTrainingPhase();
      case 6:
        return renderTestingPhase();
      case 7:
        return renderCompletePhase();
      default:
        return null;
    }
  };

  const renderWelcomePhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass border-yellow-500/20 neon-glow">
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-6 neon-glow"
          >
            <Sparkles className="w-12 h-12 text-black" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
              Welcome to Mentark AI! 🎯
            </CardTitle>
            <CardDescription className="text-xl text-slate-300 leading-relaxed">
              Let&apos;s create your personal AI mentor that understands YOU perfectly
            </CardDescription>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">What we&apos;ll do:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-slate-300">Understand your learning style</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-slate-300">Map your goals and dreams</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-slate-300">Analyze your personality</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-slate-300">Create your unique AI profile</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Benefits:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-slate-300">Personalized learning paths</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-slate-300">Emotional support & motivation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-slate-300">Adaptive challenge levels</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-slate-300">Perfect communication style</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-6">
            <p className="text-slate-400 mb-6">
              This will take about 20-25 minutes and will create your perfect AI learning companion
            </p>
            <Button
              onClick={handleNext}
              className="bg-gradient-cyan-blue text-black hover:opacity-90 px-8 py-3 text-lg font-semibold neon-glow"
            >
              Start Training My AI Model →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderIdentityPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass border-yellow-500/20 neon-glow">
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-4 neon-glow"
          >
            <User className="w-10 h-10 text-black" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
              👤 Who Are You?
            </CardTitle>
            <CardDescription className="text-lg text-slate-300">
              Let&apos;s start with the basics - tell us about yourself
            </CardDescription>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-white font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-yellow-400" />
                Your Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500/50 pointer-events-none" />
                <Input
                  placeholder="How would you like to be addressed?"
                  value={profile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                  className="glass border-yellow-500/20 text-white pl-10 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-white font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-yellow-400" />
                Grade/Class
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((grade) => (
                  <motion.button
                    key={grade}
                    type="button"
                    onClick={() => updateProfile('grade', grade)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-lg border-2 transition-all relative overflow-hidden group ${
                      profile.grade === grade
                        ? 'border-yellow-500 bg-yellow-500/20 neon-glow'
                        : 'glass border-yellow-500/20 hover:border-yellow-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full transition-all ${
                        profile.grade === grade ? 'bg-yellow-400' : 'bg-slate-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        profile.grade === grade ? 'text-yellow-400' : 'text-slate-300'
                      }`}>{grade}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-white font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                City/Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500/50 pointer-events-none" />
                <Input
                  placeholder="Which city do you live in?"
                  value={profile.city}
                  onChange={(e) => updateProfile('city', e.target.value)}
                  className="glass border-yellow-500/20 text-white pl-10 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-white font-semibold flex items-center gap-2">
                <School className="w-4 h-4 text-yellow-400" />
                School Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {['Government School', 'Private School', 'Online School', 'Home Schooled'].map((type) => {
                  const icons = {
                    'Government School': School,
                    'Private School': BookOpen,
                    'Online School': Laptop,
                    'Home Schooled': Home
                  };
                  const Icon = icons[type as keyof typeof icons];
                  return (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => updateProfile('schoolType', type)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden group ${
                        profile.schoolType === type
                          ? 'border-yellow-500 bg-yellow-500/20 neon-glow'
                          : 'glass border-yellow-500/20 hover:border-yellow-500/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon className={`w-5 h-5 ${
                          profile.schoolType === type ? 'text-yellow-400' : 'text-slate-400'
                        }`} />
                        <span className={`text-xs font-medium text-center ${
                          profile.schoolType === type ? 'text-yellow-400' : 'text-slate-300'
                        }`}>{type}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-4 md:col-span-2">
              <Label className="text-white font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Board
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {['CBSE', 'ICSE', 'State Board', 'International Board'].map((board) => {
                  const icons = {
                    'CBSE': Trophy,
                    'ICSE': GraduationCap,
                    'State Board': FileText,
                    'International Board': Globe
                  };
                  const Icon = icons[board as keyof typeof icons];
                  return (
                    <motion.button
                      key={board}
                      type="button"
                      onClick={() => updateProfile('board', board)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden group ${
                        profile.board === board
                          ? 'border-yellow-500 bg-yellow-500/20 neon-glow'
                          : 'glass border-yellow-500/20 hover:border-yellow-500/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon className={`w-5 h-5 ${
                          profile.board === board ? 'text-yellow-400' : 'text-slate-400'
                        }`} />
                        <span className={`text-xs font-medium text-center ${
                          profile.board === board ? 'text-yellow-400' : 'text-slate-300'
                        }`}>{board}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              ← Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!profile.name || !profile.grade || !profile.city || !profile.schoolType || !profile.board}
              className="bg-gradient-cyan-blue hover:opacity-90 text-black neon-glow"
            >
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderLearningPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass border-yellow-500/20 neon-glow">
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-4 neon-glow"
          >
            <Brain className="w-10 h-10 text-black" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
              🧠 How Your Brain Works
            </CardTitle>
            <CardDescription className="text-lg text-slate-300">
              Let&apos;s understand your unique learning style and preferences
            </CardDescription>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">Learning Style (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Visual (videos/diagrams)', icon: Eye },
                  { label: 'Audio (listening)', icon: Headphones },
                  { label: 'Kinesthetic (hands-on)', icon: Hand },
                  { label: 'Reading/Writing', icon: BookOpen }
                ].map(({ label, icon: Icon }) => (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (profile.learningStyle.includes(label)) {
                        updateProfile('learningStyle', profile.learningStyle.filter(s => s !== label));
                      } else {
                        updateProfile('learningStyle', [...profile.learningStyle, label]);
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      profile.learningStyle.includes(label)
                        ? 'border-yellow-500 bg-yellow-500/20 neon-glow'
                        : 'glass border-yellow-500/20 hover:border-yellow-500/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-5 h-5 ${
                        profile.learningStyle.includes(label) ? 'text-yellow-400' : 'text-slate-400'
                      }`} />
                      <span className={`text-xs font-medium text-center ${
                        profile.learningStyle.includes(label) ? 'text-yellow-400' : 'text-slate-300'
                      }`}>{label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">Study Preferences</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Morning person', icon: Sunrise },
                  { label: 'Night owl', icon: Moon },
                  { label: 'Study alone', icon: User },
                  { label: 'Study in groups', icon: Users },
                  { label: 'Quiet environment', icon: VolumeX },
                  { label: 'Background music', icon: Music }
                ].map(({ label, icon: Icon }) => (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (profile.studyPreferences.includes(label)) {
                        updateProfile('studyPreferences', profile.studyPreferences.filter(p => p !== label));
                      } else {
                        updateProfile('studyPreferences', [...profile.studyPreferences, label]);
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      profile.studyPreferences.includes(label)
                        ? 'border-yellow-500 bg-yellow-500/20 neon-glow'
                        : 'glass border-yellow-500/20 hover:border-yellow-500/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-5 h-5 ${
                        profile.studyPreferences.includes(label) ? 'text-yellow-400' : 'text-slate-400'
                      }`} />
                      <span className={`text-xs font-medium text-center ${
                        profile.studyPreferences.includes(label) ? 'text-yellow-400' : 'text-slate-300'
                      }`}>{label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">What motivates you to study?</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Achievement and good grades', icon: Trophy },
                  { label: 'Learning new things', icon: Lightbulb },
                  { label: 'Future career goals', icon: Target },
                  { label: 'Competition with peers', icon: TrendingUp },
                  { label: 'Personal interest in subjects', icon: Star },
                  { label: 'Recognition from teachers/parents', icon: Award }
                ].map(({ label, icon: Icon }) => (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={() => updateProfile('challengeResponse', label)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      profile.challengeResponse === label
                        ? 'border-yellow-500 bg-yellow-500/20 neon-glow'
                        : 'glass border-yellow-500/20 hover:border-yellow-500/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-5 h-5 ${
                        profile.challengeResponse === label ? 'text-yellow-400' : 'text-slate-400'
                      }`} />
                      <span className={`text-xs font-medium text-center ${
                        profile.challengeResponse === label ? 'text-yellow-400' : 'text-slate-300'
                      }`}>{label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              ← Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={profile.learningStyle.length === 0 || profile.studyPreferences.length === 0 || !profile.challengeResponse}
              className="bg-gradient-cyan-blue text-black hover:opacity-90 neon-glow"
            >
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPsychologyPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass border-yellow-500/20 neon-glow">
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-4 neon-glow"
          >
            <Heart className="w-10 h-10 text-black" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            ❤️ Emotional Intelligence Mapping
          </CardTitle>
          <CardDescription className="text-lg text-slate-300">
            Help us understand your emotional patterns and psychological profile
          </CardDescription>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="space-y-8">
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">
                Current Stress Level: {profile.stressLevel}/10
              </Label>
              <Slider
                value={[profile.stressLevel]}
                onValueChange={(value) => updateProfile('stressLevel', value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>Very Relaxed</span>
                <span>Very Stressed</span>
              </div>
            </div>
            
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">
                Confidence in Studies: {profile.confidenceLevel}/10
              </Label>
              <Slider
                value={[profile.confidenceLevel]}
                onValueChange={(value) => updateProfile('confidenceLevel', value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>Not Confident</span>
                <span>Very Confident</span>
              </div>
            </div>
            
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">
                Motivation Level: {profile.motivationLevel}/10
              </Label>
              <Slider
                value={[profile.motivationLevel]}
                onValueChange={(value) => updateProfile('motivationLevel', value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>Not Motivated</span>
                <span>Very Motivated</span>
              </div>
            </div>
            
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">Social Comfort Zone</Label>
              <RadioGroup
                value={profile.socialComfort}
                onValueChange={(value) => updateProfile('socialComfort', value)}
              >
                {[
                  'Very social - love group activities',
                  'Moderately social - enjoy small groups',
                  'Prefer one-on-one interactions',
                  'Mostly prefer working alone',
                  'Very introverted - need lots of alone time'
                ].map((comfort) => (
                  <div key={comfort} className="flex items-center space-x-2">
                    <RadioGroupItem value={comfort} id={comfort} />
                    <Label htmlFor={comfort} className="text-slate-300">{comfort}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              ← Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!profile.socialComfort}
              className="bg-gradient-cyan-blue text-black hover:opacity-90 neon-glow"
            >
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderInterestsPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass border-yellow-500/20 neon-glow">
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-4 neon-glow"
          >
            <Star className="w-10 h-10 text-black" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            🌟 What Makes You Tick?
          </CardTitle>
          <CardDescription className="text-lg text-slate-300">
            Tell us about your interests, passions, and what excites you
          </CardDescription>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">Favorite Subjects</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'PE', 'Computer Science'].map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject}
                      checked={profile.favoriteSubjects.includes(subject)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateProfile('favoriteSubjects', [...profile.favoriteSubjects, subject]);
                        } else {
                          updateProfile('favoriteSubjects', profile.favoriteSubjects.filter(s => s !== subject));
                        }
                      }}
                    />
                    <Label htmlFor={subject} className="text-slate-300 text-sm">{subject}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">Hobbies & Interests</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Reading', 'Gaming', 'Sports', 'Music', 'Art', 'Coding', 'Dancing', 'Cooking', 'Photography', 'Writing', 'Gardening', 'Crafts'].map((hobby) => (
                  <div key={hobby} className="flex items-center space-x-2">
                    <Checkbox
                      id={hobby}
                      checked={profile.hobbies.includes(hobby)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateProfile('hobbies', [...profile.hobbies, hobby]);
                        } else {
                          updateProfile('hobbies', profile.hobbies.filter(h => h !== hobby));
                        }
                      }}
                    />
                    <Label htmlFor={hobby} className="text-slate-300 text-sm">{hobby}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">Career Fields That Interest You</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Engineering', 'Medicine', 'Business', 'Arts', 'Technology', 'Teaching', 'Research', 'Sports', 'Entertainment', 'Government'].map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={profile.careerFields.includes(field)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateProfile('careerFields', [...profile.careerFields, field]);
                        } else {
                          updateProfile('careerFields', profile.careerFields.filter(f => f !== field));
                        }
                      }}
                    />
                    <Label htmlFor={field} className="text-slate-300 text-sm">{field}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              ← Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={profile.favoriteSubjects.length === 0 || profile.hobbies.length === 0 || profile.careerFields.length === 0}
              className="bg-gradient-cyan-blue text-black hover:opacity-90 neon-glow"
            >
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderTrainingPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass border-yellow-500/20 neon-glow">
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-4 neon-glow"
          >
            <Cpu className="w-10 h-10 text-black" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            🤖 Training Your AI Mentor
          </CardTitle>
          <CardDescription className="text-lg text-slate-300">
            Based on your responses, we&apos;re creating your personalized AI that will understand you perfectly
          </CardDescription>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">Communication Style</Label>
              <RadioGroup
                value={profile.communicationStyle}
                onValueChange={(value) => updateProfile('communicationStyle', value)}
              >
                {[
                  'Friendly and casual',
                  'Professional but warm',
                  'Encouraging and supportive',
                  'Direct and to-the-point',
                  'Fun and playful'
                ].map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <RadioGroupItem value={style} id={style} />
                    <Label htmlFor={style} className="text-slate-300">{style}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">Detail Level Preference</Label>
              <RadioGroup
                value={profile.detailLevel}
                onValueChange={(value) => updateProfile('detailLevel', value)}
              >
                {[
                  'Simple and concise',
                  'Moderately detailed',
                  'Very detailed and thorough',
                  'Adaptive based on topic'
                ].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <RadioGroupItem value={level} id={level} />
                    <Label htmlFor={level} className="text-slate-300">{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <Label className="text-white font-semibold text-lg mb-4 block">Support Style</Label>
              <RadioGroup
                value={profile.supportStyle}
                onValueChange={(value) => updateProfile('supportStyle', value)}
              >
                {[
                  'Gentle and patient',
                  'Encouraging and motivating',
                  'Direct and challenging',
                  'Balanced approach'
                ].map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <RadioGroupItem value={style} id={style} />
                    <Label htmlFor={style} className="text-slate-300">{style}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Your AI Profile Summary:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Learning Style:</span>
                <span className="text-white ml-2">{profile.learningStyle.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-400">Motivation Style:</span>
                <span className="text-white ml-2">{profile.challengeResponse}</span>
              </div>
              <div>
                <span className="text-slate-400">Communication Style:</span>
                <span className="text-white ml-2">{profile.communicationStyle}</span>
              </div>
              <div>
                <span className="text-slate-400">Support Type:</span>
                <span className="text-white ml-2">{profile.supportStyle}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              ← Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!profile.communicationStyle || !profile.detailLevel || !profile.supportStyle}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              Test My AI →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderTestingPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass border-yellow-500/20 neon-glow">
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-4 neon-glow"
          >
            <Wand2 className="w-10 h-10 text-black" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            🧪 Test Your AI Mentor
          </CardTitle>
          <CardDescription className="text-lg text-slate-300">
            Let&apos;s test how well your AI understands you with some sample interactions
          </CardDescription>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sample Interaction 1: Study Question</h3>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-slate-300 text-sm mb-2">You: &quot;I&apos;m struggling with math problems. How can I improve?&quot;</p>
                  <p className="text-green-400 text-sm">
                    AI: Based on your {profile.learningStyle[0]} learning style, I&apos;ll create visual diagrams and step-by-step examples. 
                    Since you prefer {profile.studyPreferences[0]}, let&apos;s schedule practice sessions during your optimal time.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sample Interaction 2: Motivation</h3>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-slate-300 text-sm mb-2">You: &quot;I feel unmotivated and stressed about exams&quot;</p>
                  <p className="text-green-400 text-sm">
                    AI: I understand you&apos;re feeling stressed (level {profile.stressLevel}/10). Let&apos;s break this down into smaller, 
                    manageable goals. Your motivation style is {profile.challengeResponse}, so let&apos;s focus on that approach.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Model Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
                  <div className="text-slate-300 text-sm">Personality Match</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">98%</div>
                  <div className="text-slate-300 text-sm">Learning Style Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">92%</div>
                  <div className="text-slate-300 text-sm">Communication Match</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              ← Previous
            </Button>
            <Button
              onClick={handleNext}
              className="bg-gradient-cyan-blue text-black hover:opacity-90 neon-glow"
            >
              Complete Training →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderCompletePhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass border-yellow-500/20 neon-glow">
        <CardHeader className="text-center pb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-6 neon-glow"
          >
            <Rocket className="w-12 h-12 text-black" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
              🎉 Your AI Mentor is Ready!
            </CardTitle>
          </motion.div>
          <CardDescription className="text-xl text-slate-300 leading-relaxed">
            Meet your personalized AI mentor that truly understands YOU!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Your AI Model Stats:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Personality Match:</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">95%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Learning Style Accuracy:</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">98%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Communication Preference:</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Matched</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Motivation Triggers:</span>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Identified</Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">What you can do now:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push('/ark/create')}
                className="bg-gradient-cyan-blue text-black hover:opacity-90 h-14 text-lg font-semibold neon-glow"
              >
                🚀 Create Your First ARK
              </Button>
              <Button
                onClick={() => router.push('/chat')}
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 h-14 text-lg font-semibold"
              >
                💬 Chat with AI Mentor
              </Button>
            </div>
          </div>
          
          <div className="text-center pt-6">
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-gradient-cyan-blue text-black hover:opacity-90 px-8 py-3 text-lg font-semibold neon-glow"
            >
              {isLoading ? 'Saving Your Profile...' : 'Launch Dashboard →'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">Train Your AI Model</h1>
            <span className="text-slate-400">
              Step {currentPhase + 1} of {phases.length}
            </span>
          </motion.div>
          
          <Progress 
            value={(currentPhase + 1) / phases.length * 100} 
            className="h-2 bg-slate-800"
          />
          
          <div className="flex justify-between mt-2 text-sm text-slate-400">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center space-x-1 ${index <= currentPhase ? 'text-yellow-400' : ''}`}
              >
                <phase.icon className="w-4 h-4" />
                <span className="hidden md:block">{phase.title}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Phase Content */}
        <AnimatePresence mode="wait">
          {renderPhase()}
        </AnimatePresence>
      </div>
    </div>
  );
}


