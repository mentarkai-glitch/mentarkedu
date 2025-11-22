"use client";

import { SidebarNav } from "@/components/navigation/SidebarNav";
import { MobileNav } from "@/components/navigation/MobileNav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Sidebar Navigation */}
      <SidebarNav />
      
      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Mobile Top Bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border transition-colors duration-200">
          <div className="flex items-center justify-between p-3 sm:p-4 gap-2 min-h-[56px]">
            <MobileNav />
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle size="sm" variant="ghost" />
              <img src="/logo.png" alt="Mentark" className="h-8 w-8 rounded-lg flex-shrink-0" />
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="lg:pt-0 pt-14 sm:pt-16 pb-6 sm:pb-10 px-2 sm:px-4 transition-all">
          {children}
        </div>
      </div>
    </div>
  );
}

