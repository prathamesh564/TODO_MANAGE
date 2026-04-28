"use client";
import { useEffect, useState, useCallback } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TodoDashboard() {
  const [profile, setProfile] = useState({ name: "Coder", tasks: [] });
  const [loading, setLoading] = useState(true);
  const [taskInput, setTaskInput] = useState("");
  const [theme, setTheme] = useState("dark");
  const router = useRouter();

  const API_BASE = "http://localhost:5000";

  const fetchTasks = useCallback(async (uid) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${uid}`);
      const data = await res.json();
      setProfile(prev => ({ ...prev, tasks: data }));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setProfile(prev => ({ ...prev, name: user.displayName || "User" }));
        fetchTasks(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [router, fetchTasks]);

  const addTask = async () => {
    if (!taskInput.trim() || !auth.currentUser) return;
    
    const taskData = {
      title: taskInput.trim(),
      userId: auth.currentUser.uid,
      status: "Pending"
    };

    try {
      await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      setTaskInput("");
      fetchTasks(auth.currentUser.uid);
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    try {
      await fetch(`${API_BASE}/tasks/${taskId}`, { method: "PUT" });
      fetchTasks(auth.currentUser.uid);
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const themeClasses = {
    bg: theme === "dark" ? "bg-[#020617] text-slate-200" : "bg-gray-50 text-slate-900",
    card: theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-gray-200 shadow-sm",
    sidebar: theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200",
    input: theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-gray-300 text-slate-900",
    headerText: theme === "dark" ? "text-white" : "text-gray-900",
    mutedText: theme === "dark" ? "text-slate-400" : "text-gray-500",
  };

  const activeTasks = profile.tasks.filter(t => t.status === "Pending");
  const completedTasks = profile.tasks.filter(t => t.status === "Completed");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeClasses.bg}`}>
      <div className="flex flex-1">
        <aside className={`w-64 border-r p-6 hidden md:block ${themeClasses.sidebar}`}>
          <div className="mb-8 px-4"><h2 className="text-xl font-bold text-indigo-500">TaskFlow</h2></div>
          <nav className="space-y-2">
            <NavLink href="/dashboard" active theme={theme}>Dashboard</NavLink>
            <NavLink href="/tasks" theme={theme}>Task List</NavLink>
            <NavLink href="/history" theme={theme}>History</NavLink>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
          <header className="flex justify-between items-start mb-10">
            <div>
              <h1 className={`text-4xl font-extrabold tracking-tight ${themeClasses.headerText}`}>
                Focus, {profile.name.split(" ")[0]}! 🎯
              </h1>
              <p className={`mt-2 ${themeClasses.mutedText}`}>{activeTasks.length} missions remaining.</p>
            </div>
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
              className={`p-3 rounded-xl border transition-all hover:scale-110 ${themeClasses.card}`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className={`lg:col-span-2 border p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-transparent ${themeClasses.card} border-indigo-500/30`}>
              <h3 className={`text-lg font-bold mb-4 ${themeClasses.headerText}`}>Quick Add</h3>
              <div className="flex gap-3">
                <input 
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Deploy new task..."
                  className={`flex-1 rounded-xl px-4 py-3 outline-none border transition-all ${themeClasses.input}`}
                />
                <button onClick={addTask} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                  Add
                </button>
              </div>
            </div>
            <StatCard title="Efficiency" value={`${calculateRate(profile.tasks)}%`} icon="📈" color="indigo" themeClasses={themeClasses} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 border rounded-2xl p-6 ${themeClasses.card}`}>
              <h3 className={`text-xl font-bold mb-6 ${themeClasses.headerText}`}>Current Tasks</h3>
              <div className="space-y-3">
                {activeTasks.length > 0 ? activeTasks.map(task => (
                  <TaskItem key={task._id} task={task} onToggle={() => toggleTaskStatus(task._id)} themeClasses={themeClasses} />
                )) : (
                  <p className={`text-center py-10 ${themeClasses.mutedText}`}>No pending missions. Great job!</p>
                )}
              </div>
            </div>
            
            <div className={`border rounded-2xl p-6 h-fit ${themeClasses.card}`}>
              <h3 className={`text-xl font-bold mb-6 ${themeClasses.headerText}`}>Summary</h3>
              <div className="space-y-4">
                <SummaryRow label="Total" val={profile.tasks.length} color={themeClasses.headerText} />
                <SummaryRow label="Completed" val={completedTasks.length} color="text-emerald-500" />
                <hr className={theme === "dark" ? "border-slate-800" : "border-gray-100"} />
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Recent Logs</h4>
                <div className="space-y-2">
                  {completedTasks.slice(-3).reverse().map(t => (
                    <div key={t._id} className="text-sm text-slate-400 flex items-center gap-2">
                      <span className="text-emerald-500">✓</span> 
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS (Place these outside the main function) ---

function TaskItem({ task, onToggle, themeClasses }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:translate-x-1 border-transparent hover:border-indigo-500/30 ${themeClasses.sidebar}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggle}
          className={`w-6 h-6 border-2 border-indigo-500 rounded-lg transition-all flex items-center justify-center ${task.status === 'Completed' ? 'bg-indigo-500' : 'hover:bg-indigo-500/20'}`}
        >
            {task.status === 'Completed' && <span className="text-white text-xs">✓</span>}
        </button>
        <span className={`font-medium ${themeClasses.headerText}`}>
          {task.title}
        </span>
      </div>
    </div>
  );
}

function NavLink({ href, children, active = false, theme }) {
  const activeClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20";
  const inactiveClass = theme === "dark" 
    ? "text-slate-400 hover:bg-slate-800/50 hover:text-white" 
    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900";

  return (
    <Link href={href} className={`block px-4 py-2.5 rounded-xl transition-all font-semibold ${active ? activeClass : inactiveClass}`}>
      {children}
    </Link>
  );
}

function StatCard({ title, value, icon, color, themeClasses }) {
  const colors = {
    indigo: "text-indigo-500 bg-indigo-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
  };
  return (
    <div className={`border p-6 rounded-2xl flex items-center gap-5 ${themeClasses.card}`}>
      <div className={`text-3xl p-4 rounded-2xl ${colors[color] || colors.indigo}`}>{icon}</div>
      <div>
        <p className={`text-xs font-bold uppercase tracking-widest ${themeClasses.mutedText}`}>{title}</p>
        <p className={`text-3xl font-black mt-1 ${themeClasses.headerText}`}>{value}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, val, color }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold ${color}`}>{val}</span>
    </div>
  );
}

function calculateRate(tasks) {
  if (!tasks || !tasks.length) return 0;
  return Math.round((tasks.filter(t => t.status === "Completed").length / tasks.length) * 100);
}