"use client";
import { useEffect, useState, useCallback } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TodoDashboard() {
  const [profile, setProfile] = useState({ name: "Coder", tasks: [] });
  const [loading, setLoading] = useState(true);
  const [taskInput, setTaskInput] = useState("");
  const [taskDesc, setTaskDesc] = useState(""); // New description state
  const [selectedCategory, setSelectedCategory] = useState("Coding");
  const [theme, setTheme] = useState("dark");
  const [expandedSuggestion, setExpandedSuggestion] = useState(null); // Track 1st tap
  const router = useRouter();

  const API_BASE = "http://localhost:5000";

  const categories = ["Coding", "Meeting", "Design", "Research", "Health", "Finances"];

  // Predefined 6 Quick Missions
  const suggestions = [
    { title: "Code Review", cat: "Coding", desc: "Perform a deep dive into pending pull requests and check for logic errors." },
    { title: "Standup Sync", cat: "Meeting", desc: "Briefly align with the team on today's blockers and progress." },
    { title: "Refactor UI", cat: "Design", desc: "Improve component spacing and ensure mobile responsiveness." },
    { title: "Competitor Audit", cat: "Research", desc: "Analyze the latest feature updates from top competitors." },
    { title: "Core Workout", cat: "Health", desc: "Engage in a 20-minute physical session to boost mental clarity." },
    { title: "Tax Planning", cat: "Finances", desc: "Categorize business expenses and prepare for monthly reporting." }
  ];

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

  const addTask = async (manualTitle = null, manualDesc = null, manualCat = null) => {
    if (!auth.currentUser) return;
    
    const finalTitle = manualTitle || taskInput.trim();
    const finalDesc = manualDesc || taskDesc.trim();
    const finalCat = manualCat || selectedCategory;

    if (!finalTitle) return;

    const taskData = {
      title: finalTitle,
      description: finalDesc,
      userId: auth.currentUser.uid,
      category: finalCat,
      status: "Pending",
      createdAt: new Date().toISOString() 
    };

    try {
      await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      setTaskInput("");
      setTaskDesc("");
      fetchTasks(auth.currentUser.uid);
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  // Logic for the 2-tap suggestion system
  const handleSuggestionClick = (sug) => {
    if (expandedSuggestion === sug.title) {
      addTask(sug.title, sug.desc, sug.cat);
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

  const getGroupedTasks = () => {
    const groups = {};
    profile.tasks.forEach(task => {
      const date = new Date(task.createdAt || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      if (!groups[date]) groups[date] = { date, count: 0, titles: [], categories: new Set() };
      groups[date].count += 1;
      groups[date].categories.add(task.category || "General");
    });
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const groupedData = getGroupedTasks();
  const activeTasks = profile.tasks.filter(t => t.status === "Pending");
  const completedTasks = profile.tasks.filter(t => t.status === "Completed");

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
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          <header className="flex justify-between items-start">
            <div>
              <h1 className={`text-4xl font-extrabold tracking-tight ${themeClasses.headerText}`}>
                Focus, {profile.name.split(" ")[0]}! 🎯
              </h1>
              <p className={`mt-2 ${themeClasses.mutedText}`}>{activeTasks.length} missions active.</p>
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={`p-3 rounded-xl border transition-all hover:scale-110 ${themeClasses.card}`}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatCard title="Total" value={profile.tasks.length} icon="📁" color="indigo" themeClasses={themeClasses} />
             <StatCard title="Done" value={completedTasks.length} icon="✅" color="emerald" themeClasses={themeClasses} />
             <StatCard title="Pending" value={activeTasks.length} icon="⏳" color="amber" themeClasses={themeClasses} />
             <StatCard title="Score" value={`${calculateRate(profile.tasks)}%`} icon="📈" color="blue" themeClasses={themeClasses} />
          </div>

          {/* Activity Timeline Table - RENDERED AS REQUESTED */}
          <section className={`border rounded-3xl overflow-hidden ${themeClasses.card}`}>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-indigo-500/5">
              <h3 className={`text-lg font-bold ${themeClasses.headerText}`}>Activity Timeline</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-xs uppercase tracking-widest ${themeClasses.mutedText} border-b border-slate-800`}>
                    <th className="px-6 py-4 font-bold">Log Date</th>
                    <th className="px-6 py-4 font-bold">Volume</th>
                    <th className="px-6 py-4 font-bold">Domains Covered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {groupedData.length > 0 ? groupedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-500/5 transition-colors group">
                      <td className={`px-6 py-4 font-medium ${themeClasses.headerText}`}>{row.date}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          {row.count} Tasks
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm max-w-sm truncate ${themeClasses.mutedText}`}>
                        {Array.from(row.categories).join(", ") || "General"}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-500 italic">No activity logs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SUGGESTED TASKS SECTION (2-CLICK SYSTEM) */}
          <section className="space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-widest text-indigo-500`}>Mission Suggestions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {suggestions.map((sug) => (
                <button
                  key={sug.title}
                  onClick={() => handleSuggestionClick(sug)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    expandedSuggestion === sug.title 
                    ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20" 
                    : themeClasses.card + " hover:border-slate-600"
                  }`}
                >
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">{sug.cat}</p>
                  <p className={`text-xs font-bold ${themeClasses.headerText}`}>{sug.title}</p>
                  {expandedSuggestion === sug.title && (
                    <div className="mt-2 text-[10px] text-slate-400 animate-in fade-in duration-300">
                      {sug.desc}
                      <p className="mt-2 text-indigo-500 font-black">TAP AGAIN TO ADD</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* MANUAL DEPLOYMENT WITH DESCRIPTION BOX */}
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
                    placeholder={`Mission Title...`}
                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all ${themeClasses.input}`}
                  />
                  <textarea 
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Detailed Description (Optional)..."
                    rows={2}
                    className={`w-full rounded-xl px-4 py-3 outline-none border transition-all resize-none ${themeClasses.input}`}
                  />
                  <button onClick={() => addTask()} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">
                    Deploy Mission
                  </button>
                </div>
              </div>

              {/* CURRENT SPRINT LIST */}
              <div className={`border rounded-[2rem] p-6 ${themeClasses.card}`}>
                <h3 className={`text-xl font-bold mb-6 ${themeClasses.headerText}`}>Current Sprint</h3>
                <div className="space-y-3">
                  {activeTasks.length > 0 ? activeTasks.map(task => (
                    <TaskItem key={task._id} task={task} onToggle={() => toggleTaskStatus(task._id)} themeClasses={themeClasses} />
                  )) : (
                    <p className={`text-center py-10 ${themeClasses.mutedText}`}>All missions clear.</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* SUMMARY SIDEBAR */}
            <div className={`border rounded-[2.5rem] p-8 h-fit ${themeClasses.card}`}>
              <h3 className={`text-xl font-bold mb-6 ${themeClasses.headerText}`}>Summary</h3>
              <div className="space-y-4">
                <SummaryRow label="Total Scope" val={profile.tasks.length} color={themeClasses.headerText} />
                <SummaryRow label="Missions Completed" val={completedTasks.length} color="text-emerald-500" />
                <SummaryRow label="Open Vulnerabilities" val={activeTasks.length} color="text-amber-500" />
                <hr className={theme === "dark" ? "border-slate-800" : "border-gray-100"} />
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Recently Resolved</h4>
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

// Sub-components kept identical as requested
function TaskItem({ task, onToggle, themeClasses }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:translate-x-1 border-transparent hover:border-indigo-500/30 ${themeClasses.sidebar}`}>
      <div className="flex items-center gap-4">
        <button onClick={onToggle} className={`w-6 h-6 border-2 border-indigo-500 rounded-lg transition-all flex items-center justify-center ${task.status === 'Completed' ? 'bg-indigo-500' : 'hover:bg-indigo-500/20'}`}>
            {task.status === 'Completed' && <span className="text-white text-xs font-bold">✓</span>}
        </button>
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold text-indigo-500 uppercase`}>{task.category || "General"}</span>
          <span className={`font-medium ${themeClasses.headerText}`}>{task.title}</span>
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

function StatCard({ title, value, icon, color, themeClasses }) {
  const colors = {
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/10",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/10",
  };
  return (
    <div className={`border p-5 rounded-2xl flex items-center gap-4 ${themeClasses.card} ${colors[color]}`}>
      <div className="text-2xl">{icon}</div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${themeClasses.mutedText}`}>{title}</p>
        <p className={`text-2xl font-black mt-0.5 ${themeClasses.headerText}`}>{value}</p>
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