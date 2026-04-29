"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_BASE = "http://localhost:5000";

  // --- NEW: CATEGORIES LIST ---
  const categories = ["All", "Coding", "Meeting", "Design", "Research", "Health"];

  // --- NEW: TOP-LEVEL STATS ---
  const missionStats = useMemo(() => ({
    total: tasks.length,
    highPriority: tasks.filter(t => t.priority?.toLowerCase() === "high").length,
    dueToday: tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length
  }), [tasks]);

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "low": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const fetchTasks = useCallback(async (uid) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${uid}`);
      const data = await res.json();
      setTasks(data.filter(t => t.status === "Pending"));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchTasks(user.uid);
      else router.push("/login");
    });
    return () => unsubscribe();
  }, [router, fetchTasks]);

  const toggleTaskStatus = async (taskId) => {
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== taskId));
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "PUT" });
      if (!res.ok) throw new Error("Status update failed");
    } catch (err) {
      setTasks(originalTasks);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete mission permanently?")) return;
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== taskId));
    try {
      await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
    } catch (err) {
      setTasks(originalTasks);
    }
  };

  // --- UPDATED FILTER LOGIC ---
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || task.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200">
      {/* Sidebar - Same as before */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:block bg-slate-900/50">
        <h2 className="text-xl font-bold text-indigo-500 mb-8 tracking-tight italic">TASKFLOW</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Dashboard</Link>
          <Link href="/tasks" className="block px-4 py-2.5 rounded-xl bg-indigo-600 text-white">Active Tasks</Link>
          <Link href="/history" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">History</Link>
         <Link href="/ProductivityDashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Performance</Link>
          <Link href="/flow" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Flow</Link>
          <Link href="/reviews" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Reviews</Link> 
           <Link href="/profile" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Profile</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        {/* NEW: STATS RIBBON */}
        <div className="flex gap-6 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <QuickStat label="Active" value={missionStats.total} color="text-indigo-400" />
          <QuickStat label="Critical" value={missionStats.highPriority} color="text-red-400" />
          <QuickStat label="Due Today" value={missionStats.dueToday} color="text-amber-400" />
        </div>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Active Missions</h1>
            <p className="text-slate-500 mt-1 uppercase text-[10px] font-bold tracking-widest">Operation Protocol 04-2026</p>
          </div>
          <div className="flex flex-col gap-3">
             <input 
                type="text" 
                placeholder="Search mission title..."
                className="bg-slate-900 border border-slate-800 text-sm rounded-xl px-4 py-2.5 w-full md:w-72 focus:outline-none focus:border-indigo-500 transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        </header>

        {/* NEW: CATEGORY FILTER CHIPS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border transition-all ${
                activeCategory === cat 
                ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="space-y-4">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <div 
              key={task._id} 
              className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col gap-3 transition-all hover:border-indigo-500/30 hover:bg-slate-900/80 hover:translate-x-1"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => toggleTaskStatus(task._id)}
                    className="mt-1 w-6 h-6 border-2 border-slate-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-500 flex items-center justify-center text-transparent hover:text-white shrink-0 transition-all"
                  >✓</button>
                  
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-100 text-lg group-hover:text-indigo-400 transition-colors capitalize">
                        {task.title}
                      </h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-widest ${getPriorityStyle(task.priority)}`}>
                        {task.priority || "Low"}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-500 border border-slate-800 font-black uppercase tracking-widest">
                        {task.category || "General"}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-400 leading-relaxed mb-4 max-w-2xl">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded-md border border-indigo-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        Deadline: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Open"}
                      </div>
                      <div className="text-slate-600">
                        Log: {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => deleteTask(task._id)}
                  className="p-2 text-slate-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  🗑️
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/10">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-white font-bold text-xl">All Missions Cleared</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">Systems are green. No pending objectives in the current sector.</p>
              <Link href="/dashboard" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all">
                Add New Mission
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper component for small stats
function QuickStat({ label, value, color }) {
  return (
    <div className="flex flex-col min-w-[100px]">
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{label}</span>
      <span className={`text-2xl font-black ${color}`}>{value}</span>
    </div>
  );
}