"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../core/firebase.js";
import { Play, Pause, RotateCcw, AlertTriangle, Target, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function FlowChamber() {
  const [profile, setProfile] = useState({ name: "User", tasks: [] });
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const timerRef = useRef(null);
  const API_BASE = "http://localhost:5000";

  const fetchTasks = useCallback(async (uid) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${uid}`);
      const data = await res.json();
      setProfile(prev => ({ ...prev, tasks: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setProfile(prev => ({ ...prev, name: user.displayName || "User" }));
        fetchTasks(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router, fetchTasks]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedTasks = profile.tasks.filter(t => t.status === "Completed");
  const activeTasks = profile.tasks.filter(t => t.status === "Pending");
  const efficiency = profile.tasks.length ? Math.round((completedTasks.length / profile.tasks.length) * 100) : 0;

  // Locked Dark Theme Classes
  const themeClasses = {
    bg: "bg-[#020617] text-slate-200",
    card: "bg-slate-900/40 border-slate-800",
    sidebar: "bg-slate-900/50 border-slate-800",
    headerText: "text-white",
    mutedText: "text-slate-400",
  };

  if (loading) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeClasses.bg}`}>
      <div className="flex flex-1">
        
        {/* SIDEBAR */}
        <aside className={`w-64 border-r p-6 hidden md:block ${themeClasses.sidebar}`}>
          <div className="mb-8 px-4"><h2 className="text-xl font-bold text-indigo-500">TaskFlow</h2></div>
          <nav className="space-y-2">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/tasks">Task List</NavLink>
            <NavLink href="/history">History</NavLink>
            <NavLink href="/reviews">Reviews</NavLink>
            <NavLink href="/ProductivityDashboard">Productivity Dashboard</NavLink>
            <NavLink href="/flow" active>Flow</NavLink>
            <NavLink href="/profile">Profile</NavLink>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className={`p-3 rounded-xl border transition-all hover:scale-110 ${themeClasses.card}`}>
                <ChevronLeft size={20} />
              </Link>
              <h1 className={`text-4xl font-extrabold tracking-tight ${themeClasses.headerText}`}>Flow State 🎯</h1>
            </div>
            {/* Theme Toggle Removed */}
            <div className={`p-3 rounded-xl border opacity-50 ${themeClasses.card}`}>
              🌙
            </div>
          </header>

          {/* PERFORMANCE MATRIX SECTION */}
          <section className={`p-6 rounded-[2rem] border ${themeClasses.card}`}>
            <div className="flex justify-between items-end mb-4">
               <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Performance Matrix</p>
                  <h3 className={`text-2xl font-black ${themeClasses.headerText}`}>Efficiency: {efficiency}%</h3>
               </div>
               <div className="text-right">
                  <p className={`text-xs font-medium ${themeClasses.mutedText}`}>
                    Focusing on: <span className="text-indigo-500 font-bold">{selectedTask ? selectedTask.title : "None"}</span>
                  </p>
               </div>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
               <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${efficiency}%` }} />
               <div className="h-full bg-amber-500/50 transition-all duration-1000 ease-out" style={{ width: `${profile.tasks.length ? (activeTasks.length / profile.tasks.length) * 100 : 0}%` }} />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {!selectedTask ? (
                <div className={`border p-8 rounded-[2.5rem] ${themeClasses.card} border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-transparent`}>
                  <h3 className={`text-xs font-bold text-indigo-500 uppercase tracking-widest mb-6`}>Current Sprint Tasks</h3>
                  <div className="grid gap-3">
                    {activeTasks.length > 0 ? activeTasks.map(task => (
                      <button 
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className={`p-5 rounded-2xl border text-left transition-all flex justify-between items-center group bg-slate-900/50 border-transparent hover:border-indigo-500/30`}
                      >
                        <div>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">{task.category || "General"}</p>
                          <p className={`font-bold ${themeClasses.headerText}`}>{task.title}</p>
                        </div>
                        <Target size={18} className="text-slate-600 group-hover:text-indigo-500 transition-colors" />
                      </button>
                    )) : (
                      <p className={`text-center py-10 ${themeClasses.mutedText}`}>No pending tasks to focus on.</p>
                    )}
                  </div>
                </div>
              ) : (
                /* ACTIVE FOCUS VIEW */
                <div className={`border p-12 rounded-[3rem] ${themeClasses.card} flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden`}>
                  <div className="z-10">
                    <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Active Session</p>
                    <h2 className={`text-4xl font-black ${themeClasses.headerText}`}>{selectedTask.title}</h2>
                  </div>

                  <div className="relative z-10">
                    <div className={`text-9xl font-black tracking-tighter tabular-nums ${isActive ? 'text-indigo-500' : 'text-white'}`}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  <div className="flex gap-4 z-10">
                    <button 
                      onClick={() => setIsActive(!isActive)}
                      className={`px-10 py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all active:scale-95 ${
                        isActive ? "bg-slate-800 text-slate-300" : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      }`}
                    >
                      {isActive ? "Pause Session" : "Start Focus"}
                    </button>
                    <button 
                      onClick={() => {setIsActive(false); setTimeLeft(25 * 60);}}
                      className={`p-4 rounded-xl border ${themeClasses.card} hover:border-indigo-500 transition-all`}
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                  
                  <button onClick={() => setSelectedTask(null)} className={`text-xs font-bold uppercase tracking-widest ${themeClasses.mutedText} hover:text-indigo-500 transition-colors`}>
                    Switch Objective
                  </button>
                </div>
              )}
            </div>

            {/* SIDE SUMMARY PANEL */}
            <div className={`border rounded-[2.5rem] p-8 h-fit ${themeClasses.card}`}>
              <h3 className={`text-xl font-bold mb-6 ${themeClasses.headerText}`}>Session Summary</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className={themeClasses.mutedText}>Focus Integrity</span>
                    <span className="text-indigo-500">{Math.max(0, 100 - (interruptions * 10))}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-500" 
                      style={{width: `${Math.max(0, 100 - (interruptions * 10))}%`}}
                    />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-800/50 flex flex-col items-center gap-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Distractions Logged</p>
                  <p className={`text-5xl font-black ${themeClasses.headerText}`}>{interruptions}</p>
                  <button 
                    onClick={() => setInterruptions(prev => prev + 1)}
                    className="w-full py-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all"
                  >
                    Log Distraction
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, children, active = false }) {
  const activeClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20";
  const inactiveClass = "text-slate-400 hover:bg-slate-800/50 hover:text-white";
  return (
    <Link href={href} className={`block px-4 py-2.5 rounded-xl transition-all font-semibold ${active ? activeClass : inactiveClass}`}>{children}</Link>
  );
}