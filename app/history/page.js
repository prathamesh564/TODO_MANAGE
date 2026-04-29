"use client";
import { useEffect, useState, useCallback } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HistoryPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("completed");
  const router = useRouter();
  const API_BASE = "http://localhost:5000";

  // Helper for priority styling
  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "text-red-400 border-red-500/20 bg-red-500/5";
      case "medium": return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case "low": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      default: return "text-slate-400 border-slate-500/20 bg-slate-500/5";
    }
  };

  const fetchHistory = useCallback(async (uid) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${uid}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchHistory(user.uid);
      else router.push("/login");
    });
    return () => unsubscribe();
  }, [router, fetchHistory]);

  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const totalTasks = tasks.length;
  const efficiency = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const filteredTasks = tasks.filter(t => 
    activeTab === "completed" ? t.status === "Completed" : t.status === "Pending"
  );

  if (loading) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:block bg-slate-900/50">
        <h2 className="text-xl font-bold text-indigo-500 mb-8 italic">TASKFLOW</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Dashboard</Link>
          <Link href="/tasks" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Task List</Link>
          <Link href="/history" className="block px-4 py-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">History</Link>
          <Link href="/reviews" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Reviews</Link>
          <Link href="/ProductivityDashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Productivity Dashboard</Link>
          <Link href="/flow" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Flow</Link>
          <Link href="/profile" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Profile</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Mission Archive</h1>
          <p className="text-slate-500 mt-1">Analytical breakdown of past operations.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Completed</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{completedCount}</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency Rating</p>
            <p className="text-3xl font-bold text-indigo-400 mt-1">{efficiency}%</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-center">
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-1000" 
                  style={{ width: `${efficiency}%` }}
                ></div>
             </div>
             <p className="text-[10px] text-slate-500 mt-2 italic">
               {efficiency >= 80 ? "Elite Performance" : efficiency >= 50 ? "Stable Output" : "Operational Lag"}
             </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl mb-6 w-fit border border-slate-800">
          <button 
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            COMPLETED
          </button>
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            PENDING
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <div key={task._id} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className={`font-bold text-lg ${task.status === 'Completed' ? 'text-slate-400' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-tighter ${getPriorityStyle(task.priority)}`}>
                      {task.priority || "Low"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono">
                    ID: {task._id.slice(-6)}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-6 pt-2 border-t border-slate-800/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Logged On</span>
                    <span className="text-xs text-slate-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Deadline</span>
                    <span className="text-xs text-slate-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}</span>
                  </div>
                  <div className="flex flex-col ml-auto">
                    <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest text-right">Status</span>
                    <span className={`text-xs font-bold ${task.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 italic">
              No history found for this category.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}