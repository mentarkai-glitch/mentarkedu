'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Video, 
  Search, 
  ChevronRight,
  GraduationCap,
  UserCog,
  Shield,
  Zap,
  Brain,
  Target,
  Award,
  Users,
  BarChart3,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Rocket,
  Heart,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    question: 'What is an ARK and how do I create one?',
    answer: 'ARK stands for Adaptive Roadmap of Knowledge. It\'s a personalized learning path created by our AI to help you achieve your goals. To create an ARK, go to "Create ARK" in the sidebar, choose your goal category, set your timeframe, and the AI will generate a custom roadmap with milestones and resources.',
    category: 'arks'
  },
  {
    question: 'How do I earn XP and level up?',
    answer: 'You earn XP by completing daily check-ins, finishing ARK milestones, chatting with your AI mentor, and maintaining streaks. Each level unlocks new badges and features. Check your XP progress in the Gamification tab.',
    category: 'gamification'
  },
  {
    question: 'Can I change my AI mentor persona?',
    answer: 'Yes! In the chat interface, you can switch between different personas - Friendly, Strict, Calm, Logical, or Spiritual. Each has a unique communication style to match your preferences.',
    category: 'chat'
  },
  {
    question: 'What is Career DNA and how does it work?',
    answer: 'Career DNA analyzes your interests, strengths, emotional patterns, and learning style to suggest career paths that align with who you are. It uses AI to map your profile against successful professionals in various fields.',
    category: 'career'
  },
  {
    question: 'How do risk predictions help me?',
    answer: 'Our ML model analyzes your check-ins, ARK progress, and emotional patterns to identify if you\'re at risk of burnout or disengagement. Early warnings help teachers provide timely support before issues escalate.',
    category: 'analytics'
  },
  {
    question: 'What are peer matches?',
    answer: 'Peer matching connects you with students who have complementary skills and similar learning goals. You can form study groups, collaborate on ARKs, and support each other on your journey.',
    category: 'social'
  },
  {
    question: 'How does the daily check-in work?',
    answer: 'Daily check-ins are quick 3-question emotional assessments that track your wellbeing over time. They only take 30 seconds and help your teachers understand how you\'re feeling.',
    category: 'check-in'
  },
  {
    question: 'Can I upload images to my journal?',
    answer: 'Yes! You can upload images of your handwritten notes or journal entries. Our AI uses vision technology to extract and analyze the text, providing insights about your learning journey.',
    category: 'journal'
  }
];

const categories = [
  { id: 'all', label: 'All Topics', icon: HelpCircle },
  { id: 'arks', label: 'ARKs', icon: Target },
  { id: 'gamification', label: 'Gamification', icon: Award },
  { id: 'chat', label: 'AI Mentor', icon: Brain },
  { id: 'career', label: 'Career DNA', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'check-in', label: 'Daily Check-in', icon: Heart },
  { id: 'journal', label: 'Journal', icon: Book }
];

const resources = [
  {
    title: 'Getting Started Guide',
    description: 'Step-by-step introduction to Mentark Quantum',
    icon: Rocket,
    href: '/help/getting-started'
  },
  {
    title: 'ARK Creation Tutorial',
    description: 'Learn how to create and manage your ARKs effectively',
    icon: Target,
    href: '/help/arks'
  },
  {
    title: 'Career DNA Explained',
    description: 'Understanding your career recommendations',
    icon: TrendingUp,
    href: '/help/career-dna'
  },
  {
    title: 'Gamification Guide',
    description: 'Master XP, badges, and leaderboards',
    icon: Award,
    href: '/help/gamification'
  },
  {
    title: 'AI Mentor Tips',
    description: 'Get the most out of your AI mentor conversations',
    icon: Brain,
    href: '/help/ai-mentor'
  },
  {
    title: 'Privacy & Security',
    description: 'Learn about data protection and privacy',
    icon: Shield,
    href: '/help/privacy'
  }
];

const quickLinks = [
  { text: 'Create Your First ARK', href: '/ark/create', icon: Target },
  { text: 'Start Daily Check-in', href: '/daily-checkin', icon: Heart },
  { text: 'Chat with AI Mentor', href: '/chat', icon: MessageCircle },
  { text: 'Analyze Career DNA', href: '/career-dna/analyze', icon: TrendingUp }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 mb-6 neon-glow">
              <HelpCircle className="w-10 h-10 text-black" />
            </div>
          </motion.div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about Mentark Quantum
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 glass border-yellow-500/20 text-white placeholder:text-slate-400 text-lg"
            />
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {quickLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass border-yellow-500/20 rounded-lg p-4 hover:border-yellow-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <link.icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-white font-medium">{link.text}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="glass border-yellow-500/20 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? 'bg-yellow-500/20 border border-yellow-500/40'
                          : 'hover:bg-yellow-500/5'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="faqs" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 glass border border-yellow-500/20">
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="guides">Guides</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              {/* FAQs Tab */}
              <TabsContent value="faqs" className="space-y-4">
                <AnimatePresence>
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq, index) => (
                      <FAQCard key={index} faq={faq} index={index} />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <HelpCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">No FAQs match your search</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <Link key={index} href={resource.href}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="glass border-yellow-500/20 hover:border-yellow-500/50 transition-all cursor-pointer h-full">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-yellow-500/20">
                                <Icon className="w-6 h-6 text-yellow-400" />
                              </div>
                              <CardTitle className="text-white">{resource.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-slate-400">
                              {resource.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Link>
                  );
                })}
              </TabsContent>

              {/* Guides Tab */}
              <TabsContent value="guides" className="space-y-4">
                <GuideSection />
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-4">
                <ContactSection />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQCard({ faq, index }: { faq: FAQ; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="glass border-yellow-500/20">
        <CardHeader
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer hover:bg-yellow-500/5 transition-all"
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center gap-3">
              <QuestionIcon category={faq.category} />
              {faq.question}
            </CardTitle>
            <ChevronRight
              className={`w-5 h-5 text-yellow-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            />
          </div>
        </CardHeader>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <CardContent className="pt-0 text-slate-300 leading-relaxed">
                {faq.answer}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function QuestionIcon({ category }: { category: string }) {
  const icons = {
    arks: Target,
    gamification: Award,
    chat: Brain,
    career: TrendingUp,
    analytics: BarChart3,
    social: Users,
    'check-in': Heart,
    journal: Book
  };

  const Icon = icons[category as keyof typeof icons] || HelpCircle;
  return <Icon className="w-5 h-5 text-yellow-400" />;
}

function GuideSection() {
  const guides = [
    {
      icon: Rocket,
      title: 'Getting Started',
      steps: [
        'Complete your onboarding profile',
        'Create your first ARK',
        'Set up daily check-ins',
        'Start chatting with your AI mentor'
      ]
    },
    {
      icon: Target,
      title: 'Creating Effective ARKs',
      steps: [
        'Choose specific, measurable goals',
        'Set realistic timeframes',
        'Be honest about your current level',
        'Review and adjust milestones regularly'
      ]
    },
    {
      icon: Zap,
      title: 'Maximizing Your XP',
      steps: [
        'Check in daily for bonus XP',
        'Complete ARK milestones',
        'Maintain your streak',
        'Engage with your AI mentor'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {guides.map((guide, index) => {
        const Icon = guide.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass border-yellow-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <CardTitle className="text-white">{guide.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <span className="text-yellow-400 font-semibold text-sm">{stepIndex + 1}</span>
                      </div>
                      <span className="text-slate-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function ContactSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="glass border-yellow-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Mail className="w-6 h-6 text-yellow-400" />
            </div>
            <CardTitle className="text-white">Email Support</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 mb-4">Get help via email</p>
          <a
            href="mailto:support@mentark.ai"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            support@mentark.ai
            <ExternalLink className="w-4 h-4" />
          </a>
        </CardContent>
      </Card>

      <Card className="glass border-yellow-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <MessageCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <CardTitle className="text-white">Chat Support</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 mb-4">Live chat with our team</p>
          <Button className="bg-gradient-cyan-blue hover:opacity-90 text-black neon-glow">
            Start Chat
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-yellow-500/20 md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
            </div>
            <CardTitle className="text-white">Feedback & Feature Requests</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 mb-4">
            Have suggestions or ideas? We&apos;d love to hear from you!
          </p>
          <Button variant="outline" className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10">
            Share Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

