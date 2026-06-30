"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Zap, Target, Activity, AlertCircle } from "lucide-react";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden relative">
      <NavBar />
      
      {/* Background gradients and animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-fast shadow-[0_0_10px_#ef4444]"></span>
          <span className="text-sm font-medium text-muted-foreground">The AI Deadline Pressure Coach</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white mb-6 drop-shadow-2xl"
        >
          Stop being reminded.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            Start being pressured.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12"
        >
          Every other app tells you what to do. Ours tells you what happens if you don&apos;t and makes it impossible not to start.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 relative z-20"
        >
          <a href="/dashboard" className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-red-500 text-white rounded-full font-bold text-lg transition-all hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(239,68,68,0.6)] hover:shadow-[0_0_60px_rgba(239,68,68,0.8)]">
            Try Deadline Mode <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </a>
          <a href="#how-it-works" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-semibold text-lg transition-all hover:scale-105 border border-white/10 backdrop-blur-md">
            See how it works
          </a>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="features" className="py-20 px-6 relative z-10 scroll-mt-28 min-h-[60vh] flex flex-col justify-center">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { value: "77%", label: "of people miss deadlines weekly" },
            { value: "2.3h", label: "lost daily to task paralysis" },
            { value: "0", label: "existing apps use pressure psychology" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-3xl text-center"
            >
              <h3 className="text-5xl font-bold text-primary mb-2">{stat.value}</h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-32 px-6 relative z-10 scroll-mt-28 min-h-screen flex flex-col justify-center border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Consequence-first. Action-immediately.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We don't just organize your tasks. We simulate the exact psychological pressure you need to start them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Deadline Mode</h3>
              <p className="text-muted-foreground">
                Enter a focused sprint where time is visually running out. If you leave the screen, you fail the sprint.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI Triage</h3>
              <p className="text-muted-foreground">
                Dump your chaotic thoughts. AI instantly categorizes them and calculates exactly when you must start.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Micro-Sprint Engine</h3>
              <p className="text-muted-foreground">
                AI breaks the task into the smallest possible first action. Removes paralysis entirely.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Drift Detection</h3>
              <p className="text-muted-foreground">
                Idle 8 min during a session? AI fires the exact consequence: 'Miss the 5% late penalty.'
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-muted-foreground mt-20 relative z-10">
        <p>Built at the hackathon · Next.js · Node.js · PostgreSQL · Gemini AI</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-8 rounded-3xl group hover:border-white/20 transition-all cursor-default"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}
