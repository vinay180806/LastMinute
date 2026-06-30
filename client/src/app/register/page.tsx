"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSuccess("Successfully registered! You can now log in.");
      // Optional auto-redirect: router.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center relative overflow-hidden">
      
      <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 rounded-3xl z-10 relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse-fast"></div>
            <span className="text-xl font-bold tracking-tight text-white">
              LastMinute
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create an account</h1>
          <p className="text-muted-foreground">Start using Deadline Mode today.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-500 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <div className="pt-4">
            <button 
              disabled={loading || !!success}
              className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-4 py-3 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-white hover:text-blue-500 transition-colors">Log in</Link>
        </div>
      </motion.div>
    </div>
  );
}
