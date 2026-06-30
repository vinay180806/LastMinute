"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase";
import { User, LayoutDashboard, UserCircle, LogOut } from "lucide-react";

export default function NavBar() {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse-fast"></div>
          <Link href="/" className="text-2xl font-bold tracking-tight text-white">
            LastMinute
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-base font-medium">
          <Link href="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
            Tasks
          </Link>
          <Link href="/#features" className="text-muted-foreground hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-white transition-colors">
            How it works
          </Link>
        </div>

        <div className="flex items-center space-x-6 text-base font-medium">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
              >
                <User className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 glass-card rounded-xl border border-white/10 shadow-xl overflow-hidden z-50"
                    >
                      <div className="py-2">
                        <Link 
                          href="/profile" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-white hover:bg-white/10 transition-colors gap-3"
                        >
                          <UserCircle className="w-4 h-4 text-muted-foreground" /> Profile
                        </Link>
                        <Link 
                          href="/dashboard" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-white hover:bg-white/10 transition-colors gap-3"
                        >
                          <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
                        </Link>
                        <div className="border-t border-white/10 my-1"></div>
                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors gap-3 text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10">
                Log in
              </Link>
              <Link href="/dashboard" className="px-5 py-2 rounded-full bg-primary hover:bg-red-500 text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                Try it live
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
