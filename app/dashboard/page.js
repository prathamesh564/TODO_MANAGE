"use client";
import { useEffect, useState, useCallback } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TodoDashboard() {
  const [profile, setProfile] = useState({ name: "Coder", tasks: [] });
  const [loading, setLoading] = useState(true);
  const [taskInput, setTaskInput] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Coding");
  const [priority, setPriority] = useState("Medium"); 
  const [dueDate, setDueDate] = useState("");
  const [theme, setTheme] = useState("dark");
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const router = useRouter();

  const API_BASE = "http://localhost:5000";

  const categories = ["Coding", "Meeting", "Design", "Research", "Health", "Finances"];

  const suggestions = [
    { title: "Review Project Docs", cat: "Research", desc: "Analyze project requirements and documentation." },
    { title: "Database Cleanup", cat: "Coding", desc: "Optimize queries and remove redundant entries." },
    { title: "Team Sync", cat: "Meeting", desc: "Align with the team on blockers and progress." },
    { title: "Design UI", cat: "Design", desc: "Wireframe new dashboard components." },
    { title: "Budgeting", cat: "Finances", desc: "Review project costs and allocations." },
    { title: "Yoga", cat: "Health", desc: "15-minute session for physical wellness." }
  ];

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

  const addTask = async (manualTitle = null, manualDesc = null, manualCat = null, manualPriority = null) => {
    if (!auth.currentUser) return;
    
    const finalTitle = manualTitle || taskInput.trim();
    const finalDesc = manualDesc || taskDesc.trim();
    const finalCat = manualCat || selectedCategory;
    const finalPriority = manualPriority || priority;

    if (!finalTitle) return;

    const taskData = {
      title: finalTitle,
      description: finalDesc,
      userId: auth.currentUser.uid,
      category: finalCat,
      priority: finalPriority, 
      dueDate: dueDate,
      status: "Pending",
      createdAt: new Date().toISOString() 
    };

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        setTaskInput("");
        setTaskDesc("");
        setDueDate(""); 
        setPriority("Medium"); 
        fetchTasks(auth.currentUser.uid);
      }
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  const handleSuggestionClick = (sug) => {
    if (expandedSuggestion === sug.title) {
      addTask(sug.title, sug.desc, sug.cat, "High"); 
      setExpandedSuggestion(null);
    } else {
      setExpandedSuggestion(sug.title);
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

  const activeTasks = profile.tasks.filter(t => t.status === "Pending");
  const completedTasks = profile.tasks.filter(t => t.status === "Completed");
  const totalTasksCount = profile.tasks.length;
  const efficiency = totalTasksCount ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

  const themeClasses = {
    bg: theme === "dark" ? "bg-[#020617] text-slate-200" : "bg-gray-50 text-slate-900",
    card: theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-gray-200 shadow-sm",
    sidebar: theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200",
    input: theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-gray-300 text-slate-900",
    headerText: theme === "dark" ? "text-white" : "text-gray-900",
    mutedText: theme === "dark" ? "text-slate-400" : "text-gray-500",
  };

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
            <NavLink href="/profile" theme={theme}>Profile</NavLink>
            <NavLink href="/reviews" theme={theme}>Reviews</NavLink>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          <header className="flex justify-between items-center">
            <div>
              <h1 className={`text-4xl font-extrabold tracking-tight ${themeClasses.headerText}`}>
                Focus, {profile.name.split(" ")[0]}! 🎯
              </h1>
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={`p-3 rounded-xl border transition-all hover:scale-110 ${themeClasses.card}`}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </header>

          {/* NEW: TOP PROGRESS BAR SECTION */}
          <section className={`p-6 rounded-[2rem] border ${themeClasses.card}`}>
            <div className="flex justify-between items-end mb-4">
               <div>
                  <p className={`text-xs font-bold uppercase tracking-widest text-indigo-500`}>Performance Matrix</p>
                  <h3 className={`text-2xl font-black ${themeClasses.headerText}`}>Efficiency: {efficiency}%</h3>
               </div>
               <div className="text-right">
                  <p className={`text-xs font-medium ${themeClasses.mutedText}`}>
                    <span className="text-emerald-500 font-bold">{completedTasks.length} Done</span> / {totalTasksCount} Total
                  </p>
               </div>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
               <div 
                 className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                 style={{ width: `${efficiency}%` }}
               />
               <div 
                 className="h-full bg-amber-500/50 transition-all duration-1000 ease-out" 
                 style={{ width: `${totalTasksCount ? (activeTasks.length / totalTasksCount) * 100 : 0}%` }}
               />
            </div>
            <div className="flex gap-6 mt-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-xs font-bold">Completed</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                  <span className="text-xs font-bold">Pending</span>
               </div>
            </div>
          </section>

          {/* MISSION SUGGESTIONS */}
          <section className="space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-widest text-indigo-500`}>Mission Suggestions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {suggestions.map((sug) => (
                <button
                  key={sug.title}
                  onClick={() => handleSuggestionClick(sug)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    expandedSuggestion === sug.title 
                    ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20 shadow-lg" 
                    : themeClasses.card + " hover:border-slate-600"
                  }`}
                >
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">{sug.cat}</p>
                  <p className={`text-xs font-bold ${themeClasses.headerText}`}>{sug.title}</p>
                  {expandedSuggestion === sug.title && (
                    <div className="mt-2 text-[10px] leading-tight text-slate-400 animate-in fade-in slide-in-from-top-1 duration-300">
                      {sug.desc}
                      <p className="mt-2 text-indigo-500 font-black">DEPLOY AS HIGH PRIORITY</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className={`border p-8 rounded-[2.5rem] ${themeClasses.card} border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-transparent`}>
                <h3 className={`text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4`}>Quick Deployment</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedCategory === cat 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" 
                        : theme === "dark" 
                          ? "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"
                          : "bg-gray-100 border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <input 
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder={`Define mission title...`}
                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all ${themeClasses.input}`}
                  />
                  <textarea 
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Enter task description here..."
                    rows={2}
                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all resize-none ${themeClasses.input}`}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Priority Level</label>
                      <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all cursor-pointer ${themeClasses.input}`}
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority 🔥</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Deadline</label>
                      <input 
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none border transition-all ${themeClasses.input}`}
                      />
                    </div>
                  </div>
                  <button onClick={() => addTask()} className="w-full py-4 mt-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">
                    Deploy Task
                  </button>
                </div>
              </div>

              {/* CURRENT SPRINT */}
              <div className={`border rounded-[2rem] p-6 ${themeClasses.card}`}>
                <h3 className={`text-xl font-bold mb-6 ${themeClasses.headerText}`}>Current Sprint</h3>
                <div className="space-y-3">
                  {activeTasks.length > 0 ? activeTasks.map(task => (
                    <TaskItem key={task._id} task={task} onToggle={() => toggleTaskStatus(task._id)} themeClasses={themeClasses} />
                  )) : (
                    <div className={`text-center py-10 ${themeClasses.mutedText}`}>
                      <p className="text-2xl mb-2">🚀</p>
                      <p>Sprint is empty. Start a suggestion above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`border rounded-[2.5rem] p-8 h-fit ${themeClasses.card}`}>
              <h3 className={`text-xl font-bold mb-6 ${themeClasses.headerText}`}>Summary</h3>
              <div className="space-y-4">
                <SummaryRow label="Total Scope" val={totalTasksCount} color={themeClasses.headerText} />
                <SummaryRow label="Missions Completed" val={completedTasks.length} color="text-emerald-500" />
                <SummaryRow label="Open Vulnerabilities" val={activeTasks.length} color="text-amber-500" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, themeClasses }) {
  const priorityColors = {
    High: "text-red-500 border-red-500/20 bg-red-500/5",
    Medium: "text-amber-500 border-amber-500/20 bg-amber-500/5",
    Low: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:translate-x-1 border-transparent hover:border-indigo-500/30 ${themeClasses.sidebar}`}>
      <div className="flex items-center gap-4">
        <button onClick={onToggle} className={`w-6 h-6 border-2 border-indigo-500 rounded-lg transition-all flex items-center justify-center ${task.status === 'Completed' ? 'bg-indigo-500' : 'hover:bg-indigo-500/20'}`}>
            {task.status === 'Completed' && <span className="text-white text-xs font-bold">✓</span>}
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
             <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black uppercase tracking-tighter ${priorityColors[task.priority] || "text-slate-500 border-slate-800"}`}>
              {task.priority || "Medium"}
            </span>
            <span className={`text-[10px] font-bold text-indigo-500 uppercase`}>{task.category || "General"}</span>
          </div>
          <span className={`font-medium ${themeClasses.headerText}`}>{task.title}</span>
          {task.dueDate && (
            <span className="text-[10px] text-slate-500 mt-1">
              Due: {new Date(task.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, children, active = false, theme }) {
  const activeClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20";
  const inactiveClass = theme === "dark" ? "text-slate-400 hover:bg-slate-800/50 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900";
  return (
    <Link href={href} className={`block px-4 py-2.5 rounded-xl transition-all font-semibold ${active ? activeClass : inactiveClass}`}>{children}</Link>
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