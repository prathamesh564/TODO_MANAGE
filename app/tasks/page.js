"use client";
import { useEffect, useState, useCallback } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_BASE = "http://localhost:5000";

  const fetchTasks = useCallback(async (uid) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${uid}`);
      const data = await res.json();
      // Filter for Pending only
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

  // 1. Delete Task (Optimistic Update)
  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this mission?")) return;

    // Save current state in case we need to undo
    const originalTasks = [...tasks];
    // Immediately update UI
    setTasks(tasks.filter(t => t._id !== taskId));

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete from server. Restoring task.");
      setTasks(originalTasks); // Rollback
    }
  };

  // 2. Complete Task (Optimistic Update)
  const toggleTaskStatus = async (taskId) => {
    const originalTasks = [...tasks];
    // Immediately remove from 'Pending' list
    setTasks(tasks.filter(t => t._id !== taskId));

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "PUT" });
      if (!res.ok) throw new Error("Status update failed");
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Could not update task. Restoring...");
      setTasks(originalTasks); // Rollback
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200">
      {/* Sidebar - Locked to Dark */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:block bg-slate-900/50">
        <h2 className="text-xl font-bold text-indigo-500 mb-8 tracking-tight">TaskFlow</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">
            Dashboard
          </Link>
          <Link href="/tasks" className="block px-4 py-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            Task List
          </Link>
          <Link href="/history" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">
            History
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white">Active Missions</h1>
          <p className="text-slate-500 mt-1">Tasks requiring your immediate attention.</p>
        </header>
        
        <div className="space-y-4">
          {tasks.length > 0 ? tasks.map(task => (
            <div 
              key={task._id} 
              className="group p-5 rounded-2xl border border-slate-800 bg-slate-900/40 flex justify-between items-center transition-all hover:border-indigo-500/30 hover:bg-slate-900/60"
            >
              <div className="flex items-center gap-5">
                {/* Complete Action */}
                <button 
                  onClick={() => toggleTaskStatus(task._id)}
                  className="w-6 h-6 border-2 border-indigo-500 rounded-lg hover:bg-indigo-500 transition-all flex items-center justify-center text-transparent hover:text-white"
                  title="Mark as Completed"
                >
                  ✓
                </button>
                
                <div>
                  <h3 className="font-bold text-slate-100 group-hover:text-white transition-colors">{task.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Deploy Date: {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Delete Action */}
              <button 
                onClick={() => deleteTask(task._id)}
                className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Delete Permanent"
              >
                🗑️
              </button>
            </div>
          )) : (
            <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-3xl">
              <span className="text-4xl mb-4 block">☕</span>
              <p className="text-slate-500 font-medium">All missions accomplished. Check your history for logs.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}