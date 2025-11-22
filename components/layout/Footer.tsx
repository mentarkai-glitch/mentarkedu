"use client";

import Link from "next/link";
import { Rocket, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-black/80 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Mentark" className="h-10 w-10 rounded-lg" />
              <span className="font-display text-xl font-bold text-gradient-cyan">Mentark</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              India&apos;s first AI-powered personal mentorship engine. Guiding students and institutes with hyper-personalized learning, career, and psychology-driven recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/product" className="text-slate-400 hover:text-yellow-300 transition-colors">
                  Product
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-slate-400 hover:text-yellow-300 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-slate-400 hover:text-yellow-300 transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-yellow-300 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-slate-400 hover:text-yellow-300 transition-colors">
                  Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-slate-400 hover:text-yellow-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-yellow-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="mailto:connect@mentark.com"
                  className="flex items-center gap-2 text-slate-400 hover:text-yellow-300 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  connect@mentark.com
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:partnerships@mentark.com"
                  className="flex items-center gap-2 text-slate-400 hover:text-yellow-300 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  partnerships@mentark.com
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.linkedin.com/company/mentark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-yellow-300 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Rocket className="h-4 w-4" />
            <span>© {currentYear} Mentark. All Rights Reserved.</span>
          </div>
          <p className="text-xs text-slate-500">
            Pune, Maharashtra, India
          </p>
        </div>
      </div>
    </footer>
  );
}





