"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  MessageCircle,
  Search,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { title: "Home", href: "/dashboard/student", icon: Home },
    { title: "My ARKs", href: "/dashboard/student/arks", icon: BookOpen },
    { title: "AI Mentor", href: "/chat", icon: MessageCircle },
    { title: "Search", href: "/search", icon: Sparkles },
    { title: "Agents", href: "/dashboard/student/agents", icon: Search },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px]">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-card border-border">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/dashboard/student" className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-foreground truncate">Mentark</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="flex-shrink-0 min-h-[44px] min-w-[44px]">
              <X className="w-6 h-6" />
            </Button>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="min-h-[44px] flex items-center"
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors w-full min-h-[44px]",
                      active
                        ? "bg-gradient-to-r from-primary/20 to-orange-500/20 text-foreground border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 flex-shrink-0", active && "text-primary")} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

