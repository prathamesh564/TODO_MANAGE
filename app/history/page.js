"use client";
import { useEffect, useState, useCallback } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HistoryPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("completed"); // 'completed' or 'pending'
  const router = useRouter();
  const API_BASE = "http://localhost:5000";

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

  const toggleTaskStatus = async (taskId) => {
    const originalTasks = [...tasks];
    // Optimistically update the status in local state
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: t.status === "Pending" ? "Completed" : "Pending" } : t));

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "PUT" });
      if (!res.ok) throw new Error();
    } catch (err) {
      setTasks(originalTasks);
      alert("Failed to update status.");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Permanently delete this task record?")) return;
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== taskId));

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch (err) {
      setTasks(originalTasks);
      alert("Failed to delete record.");
    }
  };

  const filteredTasks = tasks.filter(t => 
    activeTab === "completed" ? t.status === "Completed" : t.status === "Pending"
  );

  if (loading) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:block bg-slate-900/50">
        <h2 className="text-xl font-bold text-indigo-500 mb-8">TaskFlow</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white">Dashboard</Link>
          <Link href="/tasks" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white">Task List</Link>
          <Link href="/history" className="block px-4 py-2.5 rounded-xl bg-indigo-600 text-white">History</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Mission Archive</h1>
          <p className="text-slate-500 mt-1">Full breakdown of all your tasks.</p>
        </header>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl mb-8 w-fit border border-slate-800">
          <button 
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'completed' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Completed ({tasks.filter(t => t.status === "Completed").length})
          </button>
          <button 
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Pending ({tasks.filter(t => t.status === "Pending").length})
          </button>
        </div>

        <div className="space-y-3">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <div key={task._id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleTaskStatus(task._id)}
                  className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}
                >
                  {task.status === 'Completed' && <span className="text-white text-[10px]">✓</span>}
                </button>
                <div>
                  <h3 className={`font-medium ${task.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                  </h3>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    Logged: {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => deleteTask(task._id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-all"
              >
                🗑️
              </button>
            </div>
          )) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
              No {activeTab} tasks found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}