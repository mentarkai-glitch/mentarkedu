"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./MobileNav";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/product", label: "Product" },
  { href: "/features", label: "Features" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-800 bg-black/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Mentark" className="h-9 w-9 rounded-lg" />
          <span className="font-display text-lg sm:text-xl font-bold text-gradient-cyan">Mentark</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={`${
                pathname === item.href
                  ? "text-yellow-300 bg-slate-900/50"
                  : "text-slate-300 hover:text-yellow-300"
              }`}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <Button asChild variant="ghost" className="text-slate-300 hover:text-yellow-300">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold text-black hover:opacity-90">
            <Link href="/demo">Request Demo</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Link href="/auth/login">Login</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
}

