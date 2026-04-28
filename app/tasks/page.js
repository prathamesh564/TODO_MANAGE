"use client";
import { useEffect, useState, useCallback } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_BASE = "http://localhost:5000";

  // Helper to style priority badges
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

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:block bg-slate-900/50">
        <h2 className="text-xl font-bold text-indigo-500 mb-8 tracking-tight italic">TASKFLOW</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Dashboard</Link>
          <Link href="/tasks" className="block px-4 py-2.5 rounded-xl bg-indigo-600 text-white">Active Tasks</Link>
          <Link href="/history" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">History</Link>
            <Link href="/profile" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Profile</Link>
           </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Active Missions</h1>
            <p className="text-slate-500 mt-1">Review your prioritized objectives.</p>
          </div>
          <input 
            type="text" 
            placeholder="Search missions..."
            className="bg-slate-900 border border-slate-800 text-sm rounded-xl px-4 py-2.5 w-full md:w-64 focus:outline-none focus:border-indigo-500"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </header>
        
        <div className="space-y-4">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <div 
              key={task._id} 
              className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col gap-3 transition-all hover:border-slate-700 hover:bg-slate-900/80"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => toggleTaskStatus(task._id)}
                    className="mt-1 w-6 h-6 border-2 border-slate-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-500 flex items-center justify-center text-transparent hover:text-white shrink-0"
                  >✓</button>
                  
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-100 text-lg group-hover:text-indigo-400 transition-colors">
                        {task.title}
                      </h3>
                      {/* PRIORITY TAG */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-widest ${getPriorityStyle(task.priority)}`}>
                        {task.priority || "Low"}
                      </span>
                      {/* CATEGORY TAG */}
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-bold uppercase tracking-widest">
                        {task.category || "General"}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-400 leading-relaxed mb-3">{task.description}</p>
                    )}

                    {/* DATE DISPLAY */}
                    <div className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-wider">
                      <div className="flex items-center gap-1.5 text-indigo-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Deadline"}
                      </div>
                      <div className="text-slate-600">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => deleteTask(task._id)}
                  className="p-2 text-slate-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  🗑️
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500">No matching missions found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}