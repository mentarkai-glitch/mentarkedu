"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  MessageCircle,
  Search,
  HelpCircle,
  FileText,
  Target,
  GraduationCap,
  Briefcase,
  Heart,
  TrendingUp,
  Trophy,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  Lightbulb,
  FileQuestion,
  Library,
  Building2,
  Calculator,
  ClipboardCheck,
  Activity,
  Sparkles,
  Calendar,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  color?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setCollapsed(mobile ? true : false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Logout failed: " + error.message);
      } else {
        toast.success("Logged out successfully");
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const navSections: NavSection[] = [
    {
      title: "Main",
      items: [
        { title: "Home", href: "/dashboard/student", icon: Home },
        { title: "Daily Assistant", href: "/dashboard/student/daily-assistant", icon: Calendar },
        { title: "My ARKs", href: "/dashboard/student/arks", icon: BookOpen },
        { title: "AI Mentor", href: "/chat", icon: MessageCircle },
        { title: "Smart Search", href: "/search", icon: Sparkles },
        { title: "Doubt Solver", href: "/dashboard/student/doubt-solver", icon: HelpCircle },
      ],
    },
    {
      title: "Study",
      items: [
        { title: "Study Analyzer", href: "/dashboard/student/study", icon: Target },
        { title: "Practice Questions", href: "/dashboard/student/practice", icon: FileQuestion },
        { title: "Visual Explainer", href: "/dashboard/student/visual", icon: Lightbulb },
        { title: "Project Helper", href: "/dashboard/student/projects", icon: FileText },
        { title: "Academic Papers", href: "/dashboard/student/papers", icon: Library },
      ],
    },
    {
      title: "Career & College",
      items: [
        { title: "College Matcher", href: "/dashboard/student/colleges", icon: Building2 },
        { title: "Cutoff Predictor", href: "/dashboard/student/cutoffs", icon: Calculator },
        { title: "Form Filler", href: "/dashboard/student/forms", icon: ClipboardCheck },
        { title: "Job Matcher", href: "/dashboard/student/jobs", icon: Briefcase },
        { title: "Resume Builder", href: "/dashboard/student/resume-builder", icon: FileText, badge: "New" },
        { title: "Document Generator", href: "/dashboard/student/documents/generate", icon: FileText },
        { title: "Career DNA", href: "/career-dna/analyze", icon: Brain },
      ],
    },
    {
      title: "Tracking",
      items: [
        { title: "Emotion Check", href: "/dashboard/student/emotion", icon: Heart },
        { title: "Progress", href: "/dashboard/student/progress", icon: TrendingUp },
        { title: "Achievements", href: "/dashboard/student/achievements", icon: Trophy },
        { title: "Peer Matches", href: "/dashboard/student/peers", icon: Users },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/student") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {collapsed && isMobile && (
        <Button
          size="icon"
          variant="outline"
          className="fixed bottom-4 left-4 z-30 h-12 w-12 rounded-full border-yellow-500/40 text-yellow-200 bg-slate-900/80 backdrop-blur"
          onClick={() => setCollapsed(false)}
          aria-label="Open dashboard navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-700 transition-all duration-300",
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-72"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            {!collapsed && (
              <Link href="/dashboard/student" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-display text-xl font-bold text-white">Mentark</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="lg:block hidden text-slate-400 hover:text-white"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                {!collapsed && (
                  <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                            active
                              ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-white border border-yellow-500/30"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          )}
                          title={collapsed ? item.title : undefined}
                        >
                          <item.icon className={cn("w-5 h-5 flex-shrink-0", active && "text-yellow-400")} />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-sm font-medium">{item.title}</span>
                              {item.badge && (
                                <span className="px-2 py-0.5 text-xs bg-yellow-500 text-black rounded-full font-semibold">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-700 p-4 space-y-2">
            {!collapsed && (
              <Link
                href="/dashboard/student/agents"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="flex-1 text-sm font-semibold">AI Agents Hub</span>
                <span className="px-2 py-0.5 text-xs bg-purple-500 text-white rounded-full font-semibold">
                  7 Live
                </span>
              </Link>
            )}
            {collapsed && (
              <Link
                href="/dashboard/student/agents"
                className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30"
                title="AI Agents"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
              </Link>
            )}
            <Link href="/dashboard/student/settings">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  pathname?.startsWith("/dashboard/student/settings")
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
                title={collapsed ? "Settings" : undefined}
              >
                <Settings className="w-5 h-5" />
                {!collapsed && <span className="text-sm">Settings</span>}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle Button for Mobile */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed bottom-4 left-4 z-40 lg:hidden w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Brain className="w-6 h-6 text-white" />
        </button>
      )}
    </>
  );
}

