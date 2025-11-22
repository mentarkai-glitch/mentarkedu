"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-900 border-l border-slate-800 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Menu Items */}
                <nav className="space-y-4">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/product", label: "Product" },
                    { href: "/features", label: "Features" },
                    { href: "/team", label: "Team" },
                    { href: "/about", label: "About" },
                    { href: "/contact", label: "Contact" },
                    { href: "/demo", label: "Demo" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      <span className="text-white">{item.label}</span>
                    </Link>
                  ))}

                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-slate-700 text-white hover:bg-slate-800"
                      >
                        Login
                      </Button>
                    </Link>

                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold text-black hover:opacity-90">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

