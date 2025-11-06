"use client";

import { SidebarNav } from "@/components/navigation/SidebarNav";
import { MobileNav } from "@/components/navigation/MobileNav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar Navigation */}
      <SidebarNav />
      
      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Mobile Top Bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 border-b border-yellow-500/30">
          <div className="flex items-center justify-between p-4">
            <MobileNav />
            <img src="/logo.png" alt="Mentark" className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        
        {/* Page Content */}
        <div className="lg:pt-0 pt-16">
          {children}
        </div>
      </div>
    </div>
  );
}

