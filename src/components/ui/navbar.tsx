"use client";

import { motion } from "framer-motion";
import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              GrantFinder
            </span>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">
              Browse Grants
            </a>
            <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">
              Categories
            </a>
            <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">
              Resources
            </a>
            <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">
              About
            </a>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden md:inline-flex text-slate-300 hover:text-white">
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white">
              Get Started
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden text-slate-300">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}