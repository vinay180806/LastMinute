"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Mic, MicOff, Send, Zap, AlertCircle, Activity, User, LogOut, Plus, Trash2, Clock, Play, X, CheckCircle2, Calendar, Flame, Award } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [triageInput, setTriageInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [idleTime, setIdleTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Manual Task States
  const [showManual, setShowManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");

  // Live Execution Mode States
  const [executionTask, setExecutionTask] = useState<any>(null);
  const [currentSprintIndex, setCurrentSprintIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  // Debrief States
  const [debriefTask, setDebriefTask] = useState<any>(null);
  const [debriefStatus, setDebriefStatus] = useState<"completed" | "missed" | null>(null);
  const [debriefReason, setDebriefReason] = useState("");
  const [isSubmittingDebrief, setIsSubmittingDebrief] = useState(false);

  // Podium Features States
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [quitInput, setQuitInput] = useState("");

  // Success toast
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tasks");
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();
    fetchTasks();

    // Voice Setup
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && !recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setTriageInput(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    // Drift Detection Idle Timer
    const idleTimer = setInterval(() => {
      setIdleTime(prev => prev + 1);
    }, 1000);

    const resetTimer = () => setIdleTime(0);
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    return () => {
      clearInterval(idleTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [fetchTasks]);

  // ============ Audio Synth (Web Audio API) ============
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AC();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTick = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }, []);

  const playBuzzer = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  }, []);

  const playSuccess = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  }, []);

  // ============ Fullscreen ============
  const requestFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);
  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  // ============ Execution Timer ============
  useEffect(() => {
    if (!executionTask) return;
    if (timeLeft <= 0) {
      playBuzzer();
      exitFullscreen();
      setDebriefTask(executionTask);
      setDebriefStatus("missed");
      setExecutionTask(null);
      setShowQuitConfirm(false);
      setQuitInput("");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 10 && next > 0) playTick();
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [executionTask, timeLeft, playTick, playBuzzer, exitFullscreen]);

  // ============ Voice Toggle ============
  const toggleVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
    } else {
      setTriageInput("");
      try { recognitionRef.current?.start(); } catch {}
      setIsListening(true);
    }
  };

  // ============ Triage Submit ============
  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageInput.trim()) return;

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
    }
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: triageInput })
      });
      if (res.ok) {
        await fetchTasks();
        setTriageInput("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to process task.");
      }
    } catch {
      setError("Network error. Is the backend server running at localhost:5000?");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============ Manual Task ============
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    try {
      const { error } = await supabase.from("tasks").insert([
        { title: manualTitle, category: "Urgent", deadline: "ASAP", time_to_start: "Now", is_active: true }
      ]);
      if (error) throw error;
      setManualTitle("");
      setShowManual(false);
      await fetchTasks();
    } catch (err: any) {
      setError("Failed to create manual task: " + err.message);
    }
  };

  // ============ Delete Task ============
  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.from('sprints').delete().eq('task_id', taskId);
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      await fetchTasks();
    } catch (err: any) {
      setError("Failed to delete task: " + err.message);
    }
  };

  // ============ Execution Mode ============
  const startExecution = (task: any) => {
    setExecutionTask(task);
    setCurrentSprintIndex(0);
    setShowQuitConfirm(false);
    setQuitInput("");

    let startingTime = 25 * 60;
    if (task.time_to_start) {
      const match = task.time_to_start.match(/(\d+):(\d+)/);
      if (match) {
        startingTime = (parseInt(match[1]) * 60) + parseInt(match[2]);
      }
    }
    setTimeLeft(startingTime);
    initAudio();
    requestFullscreen();
  };

  const getSprints = (task: any): string[] => {
    if (!task?.sprints) return [];
    return task.sprints.map((s: any) => (typeof s === "string" ? s : s.text || s.step || JSON.stringify(s)));
  };

  const advanceSprint = () => {
    const sprints = getSprints(executionTask);
    if (currentSprintIndex < sprints.length - 1) {
      setCurrentSprintIndex(prev => prev + 1);
    } else {
      handleExecutionEnd("completed");
    }
  };

  const handleExecutionEnd = (status: "completed" | "missed") => {
    if (status === "completed") playSuccess();
    if (status === "missed") playBuzzer();
    exitFullscreen();
    setDebriefTask(executionTask);
    setDebriefStatus(status);
    setExecutionTask(null);
    setShowQuitConfirm(false);
    setQuitInput("");
  };

  // ============ Debrief Submit ============
  const submitDebrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debriefTask) return;
    setIsSubmittingDebrief(true);
    try {
      await supabase.from('tasks').update({ is_active: false }).eq('id', debriefTask.id);
      if (user) {
        await supabase.from('debriefs').insert([{
          task_id: debriefTask.id,
          user_id: user.id,
          reason: debriefReason,
          status: debriefStatus
        }]);
      }
      setDebriefTask(null);
      setDebriefReason("");
      await fetchTasks();
    } catch {
      console.error("Failed to save debrief");
    } finally {
      setIsSubmittingDebrief(false);
    }
  };

  const downloadICS = (task: any) => {
    const title = task.title;
    const desc = `Category: ${task.category}\nDeadline: ${task.deadline}`;
    
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LastMinute//AI Deadline Mode//EN",
      "BEGIN:VEVENT",
      `UID:${task.id || Math.random()}@lastminute.ai`,
      `DTSTAMP:${formatDate(now)}`,
      `DTSTART:${formatDate(now)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============ Helpers ============
  const formatClock = (seconds: number) => {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.max(0, seconds) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatIdleTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const activeTask = tasks.find(t => t.is_active);
  const urgentTasks = tasks.filter(t => t.category === "Urgent" && t.is_active);
  const otherTasks = tasks.filter(t => t.category !== "Urgent" || !t.is_active);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <NavBar />

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 flex-1 w-full">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col space-y-6">
          <div className="space-y-2">
            <button className="flex items-center space-x-3 w-full p-3 rounded-lg bg-white/10 text-white font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-fast shadow-[0_0_8px_#ef4444]"></span>
              <span>Deadline Mode</span>
            </button>
            <button className="flex items-center space-x-3 w-full p-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
              <span>All Tasks</span>
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            {user ? (
              <div className="glass-card p-4 rounded-xl space-y-3">
                <div className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-white/10 rounded-full">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="truncate text-sm font-medium">{user.email}</div>
                </div>
                <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="w-full flex items-center justify-center space-x-2 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-medium">
                  <LogOut className="w-4 h-4" /> <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Not logged in</div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 max-w-3xl flex flex-col">

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">All Tasks</span>
              <span className="text-3xl font-bold text-white mt-1">{tasks.length}</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
              <span className="text-3xl font-bold text-yellow-500 mt-1">{tasks.filter(t => t.is_active).length}</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
              <span className="text-3xl font-bold text-green-500 mt-1">{tasks.filter(t => !t.is_active).length}</span>
            </div>
          </div>

          {/* Success Toast */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>Task triaged successfully! AI categorized and created micro-sprints.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Triage Input */}
          <div className={`glass-card rounded-2xl p-4 mb-4 border transition-colors ${isListening ? 'border-primary shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-white/10 focus-within:border-primary/50'}`}>
            <form onSubmit={handleTriageSubmit} className="relative flex items-center">
              <button
                type="button"
                onClick={toggleVoice}
                className={`p-3 mr-2 rounded-xl transition-all ${isListening ? 'bg-primary text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}`}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={triageInput}
                onChange={(e) => setTriageInput(e.target.value)}
                placeholder={isListening ? "Listening... speak now" : "Dump what's on your mind via Voice or Text..."}
                className="w-full bg-transparent border-none text-white placeholder-muted-foreground focus:outline-none focus:ring-0 text-lg py-2"
              />
              <div className="absolute right-2 flex space-x-2">
                <button
                  type="submit"
                  disabled={isProcessing || !triageInput.trim()}
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {isProcessing ? <Zap className="w-5 h-5 animate-pulse text-yellow-400" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p>{error}</p>
                <button onClick={() => setShowManual(true)} className="mt-2 text-xs bg-red-500/20 px-3 py-1 rounded hover:bg-red-500/30 transition-colors">
                  Add Task Manually
                </button>
              </div>
            </motion.div>
          )}

          {showManual && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 glass-card rounded-xl border border-white/20">
              <h3 className="text-sm font-medium text-white mb-3">Add Task Manually</h3>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input type="text" value={manualTitle} onChange={e => setManualTitle(e.target.value)} placeholder="Task title..." className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none" />
                <button type="submit" className="bg-primary hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save</button>
                <button type="button" onClick={() => setShowManual(false)} className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
              </form>
            </motion.div>
          )}

          {/* Task Queue */}
          <div className="space-y-6 mt-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Queue</h3>
                <button onClick={() => setShowManual(!showManual)} className="text-xs flex items-center space-x-1 text-muted-foreground hover:text-white transition-colors">
                  <Plus className="w-3 h-3" /> <span>Manual Entry</span>
                </button>
              </div>

              <div className="space-y-4">
                {tasks.length === 0 && !error && <p className="text-muted-foreground">No tasks yet. Triage something above.</p>}

                {/* Urgent Tasks First */}
                {urgentTasks.map(task => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/50 bg-primary/5 overflow-hidden">
                    <div className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-white">{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">🔥 {task.category}</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {task.deadline}</span>
                          {task.time_to_start && <span className="text-xs text-yellow-400 font-mono">Start: {task.time_to_start}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => downloadICS(task)}
                          title="Add to Calendar"
                          className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => startExecution(task)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95"
                        >
                          <Play className="w-4 h-4" /> Start Now
                        </button>
                        <button onClick={(e) => handleDeleteTask(task.id, e)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Other Tasks */}
                {otherTasks.map(task => (
                  <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border ${task.is_active ? 'border-white/20 bg-white/5' : 'border-white/10 glass-card opacity-60'} overflow-hidden`}>
                    <div className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="flex-1">
                        <h4 className={`text-lg font-medium ${task.is_active ? 'text-white' : 'text-white/50 line-through'}`}>{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${task.category === 'Today' ? 'bg-blue-500/20 text-blue-400' : task.category === 'This Week' ? 'bg-purple-500/20 text-purple-400' : task.category === 'Delegate' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                            {task.category}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {task.deadline}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {task.is_active && (
                          <>
                            <button
                              onClick={() => downloadICS(task)}
                              title="Add to Calendar"
                              className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            >
                              <Calendar className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => startExecution(task)}
                              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                            >
                              <Play className="w-4 h-4" /> Start
                            </button>
                          </>
                        )}
                        {!task.is_active && <span className="text-xs text-green-400 font-medium">✓ Done</span>}
                        <button onClick={(e) => handleDeleteTask(task.id, e)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 flex flex-col gap-6">
          {/* Drift Detection */}
          <div className={`glass-card rounded-2xl p-5 border transition-colors ${idleTime > 30 ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/10'}`}>
            <h3 className={`text-sm font-bold mb-2 uppercase tracking-wider flex items-center gap-2 ${idleTime > 30 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
              <Activity className="w-4 h-4" /> Drift Detection
            </h3>
            <p className="text-sm text-white/80 mb-4">Idle for <span className="font-bold text-white font-mono">{formatIdleTime(idleTime)}</span>.</p>

            {idleTime > 30 && activeTask && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-black/50 rounded-lg p-3 border border-yellow-500/30">
                <span className="text-xs text-yellow-500 uppercase font-semibold">⚠ Consequence</span>
                <p className="text-sm text-white mt-1">If you don&apos;t act now, you will miss the window to complete &quot;{activeTask.title}&quot;.</p>
              </motion.div>
            )}
          </div>

          {/* Goal & Habit Tracker */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2 text-primary">
              <Award className="w-4 h-4" /> Habits & Goals
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                  <span className="text-sm font-semibold text-white">Urgency Streak</span>
                </div>
                <span className="text-lg font-black text-orange-500 font-mono">
                  {tasks.filter(t => !t.is_active).length} Days
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Daily Compliance</span>
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Start within deadline</span>
                  <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">100%</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>No drift detected</span>
                  <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">Pass</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Complete session debrief</span>
                  <span className="text-xs text-yellow-500 font-semibold bg-yellow-500/10 px-2 py-0.5 rounded-full">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Productivity Recommendations */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h3 className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center gap-2 text-blue-400">
              <Zap className="w-4 h-4 animate-pulse" /> AI Recommendation
            </h3>
            <p className="text-sm text-white/70 leading-relaxed font-medium">
              {tasks.filter(t => t.category === "Urgent" && t.is_active).length > 0 
                ? "You have urgent tasks active. Start immediately to prevent stress building up. Avoid multitasking during the live execution."
                : "Queue is healthy! Continue using voice triage to capture thoughts as soon as they occur to maintain empty-mind flow."
              }
            </p>
          </div>
        </aside>
      </main>

      {/* ========== LIVE EXECUTION MODAL ========== */}
      <AnimatePresence>
        {executionTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 transition-colors duration-500 ${timeLeft < 60 ? 'bg-red-950/95' : 'bg-background/95'} backdrop-blur-xl`}
          >
            {/* Heartbeat pulse overlay */}
            {timeLeft < 60 && (
              <motion.div
                animate={{ opacity: [0, 0.25, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 bg-red-600 pointer-events-none"
              />
            )}

            {/* Quit Button */}
            <div className="absolute top-8 right-8 z-50">
              <button onClick={() => setShowQuitConfirm(true)} className="flex items-center gap-2 text-muted-foreground hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" /> Quit
              </button>
            </div>

            {/* Anti-Excuse Quit Confirm */}
            <AnimatePresence>
              {showQuitConfirm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
                >
                  <div className="max-w-md w-full text-center">
                    <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Are you seriously quitting?</h3>
                    <p className="text-xl text-muted-foreground mb-8">The pain of discipline is less than the pain of regret. Type <strong className="text-red-500 font-mono">I GIVE UP</strong> below to confirm.</p>
                    <input
                      type="text"
                      value={quitInput}
                      onChange={e => setQuitInput(e.target.value)}
                      placeholder="Type here..."
                      autoFocus
                      className="w-full bg-transparent border-b-2 border-white/20 text-center text-3xl font-black font-mono text-white placeholder-white/10 focus:outline-none focus:border-red-500 transition-colors mb-10 pb-2"
                    />
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => { if (quitInput === "I GIVE UP") handleExecutionEnd("missed"); }}
                        className={`w-full py-4 rounded-full font-bold text-lg transition-all ${quitInput === "I GIVE UP" ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                      >
                        Confirm Failure
                      </button>
                      <button onClick={() => { setShowQuitConfirm(false); setQuitInput(""); }} className="text-muted-foreground hover:text-white font-medium py-2">
                        Nevermind, take me back.
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Execution Content */}
            <div className="max-w-2xl w-full flex flex-col items-center text-center relative z-10">
              {/* Pressure Clock */}
              <motion.div
                animate={{
                  scale: timeLeft < 60 ? [1, 1.08, 1] : timeLeft < 300 ? [1, 1.03, 1] : 1,
                  x: timeLeft < 15 ? [-3, 3, -3, 3, 0] : 0
                }}
                transition={{
                  scale: { repeat: Infinity, duration: timeLeft < 60 ? 0.8 : 1.2 },
                  x: { repeat: Infinity, duration: 0.15 }
                }}
                className={`text-8xl md:text-[10rem] font-black font-mono tracking-tighter mb-8 ${timeLeft < 60 ? 'text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.8)]' : timeLeft < 300 ? 'text-primary drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'text-white'}`}
              >
                {formatClock(timeLeft)}
              </motion.div>

              <h2 className="text-2xl text-muted-foreground mb-12 uppercase tracking-widest">{executionTask.title}</h2>

              {/* Micro Sprint Engine */}
              {(() => {
                const sprints = getSprints(executionTask);
                if (sprints.length > 0) {
                  return (
                    <div className="w-full glass-card p-8 rounded-3xl border border-primary/30 bg-primary/5">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-primary font-bold uppercase tracking-widest">Current Micro-Action</div>
                        <div className="text-sm text-muted-foreground font-mono">{currentSprintIndex + 1}/{sprints.length}</div>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-10 leading-tight">
                        {sprints[currentSprintIndex]}
                      </h3>
                      <button
                        onClick={advanceSprint}
                        className="w-full md:w-auto px-12 py-5 bg-white text-black hover:bg-gray-200 rounded-full text-xl font-bold transition-transform hover:scale-105 active:scale-95"
                      >
                        {currentSprintIndex < sprints.length - 1 ? "Done. Next." : "Finish Sprint!"}
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="w-full glass-card p-8 rounded-3xl border border-primary/30 bg-primary/5">
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-10 leading-tight">
                        Execute immediately. No excuses.
                      </h3>
                      <button
                        onClick={() => handleExecutionEnd("completed")}
                        className="w-full md:w-auto px-12 py-5 bg-white text-black hover:bg-gray-200 rounded-full text-xl font-bold transition-transform hover:scale-105 active:scale-95"
                      >
                        Mark Task Complete
                      </button>
                    </div>
                  );
                }
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== DEBRIEF MODAL ========== */}
      <AnimatePresence>
        {debriefTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full glass-card p-8 rounded-3xl border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                {debriefStatus === "completed"
                  ? <CheckCircle2 className="w-8 h-8 text-green-400" />
                  : <AlertCircle className="w-8 h-8 text-red-400" />
                }
                <h2 className="text-3xl font-bold text-white">Post-Session Debrief</h2>
              </div>
              <p className="text-muted-foreground mb-8">
                {debriefStatus === "completed"
                  ? "Great job! What helped you succeed, or what was harder than expected?"
                  : "You missed the window or quit early. No judgment. What happened?"}
              </p>

              <form onSubmit={submitDebrief}>
                <textarea
                  required
                  value={debriefReason}
                  onChange={e => setDebriefReason(e.target.value)}
                  placeholder="e.g., The scope was unclear, I got distracted, I underestimated the time..."
                  className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 mb-6 resize-none"
                />
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmittingDebrief}
                    className="flex-1 bg-primary hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {isSubmittingDebrief ? "Saving..." : "Save Pattern & Close"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDebriefTask(null); fetchTasks(); }}
                    className="px-6 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
