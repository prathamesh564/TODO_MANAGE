"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { CheckCircle, Clock, Flame, TrendingUp } from 'lucide-react';

export default function TodoDashboard() {
  const [profile, setProfile] = useState({ name: "Coder", tasks: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE = "http://localhost:5000";

  // --- HARDCODED DARK THEME CLASSES ---
  const themeClasses = {
    bg: "bg-[#020617] text-slate-200",
    card: "bg-slate-900/40 border-slate-800",
    sidebar: "bg-slate-900/50 border-slate-800",
    headerText: "text-white",
    mutedText: "text-slate-400",
  };

  const stats = useMemo(() => {
    const tasks = profile.tasks || [];
    const completed = tasks.filter(t => t.status === "Completed");
    const activeTasks = tasks.filter(t => t.status === "Pending");
    const totalTasksCount = tasks.length;
    const efficiency = totalTasksCount ? Math.round((completed.length / totalTasksCount) * 100) : 0;

    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = tasks.filter(t => t.status === "Completed" && t.createdAt?.startsWith(dateKey)).length;
      return { date: formattedDate, count };
    }).reverse();

    return { totalTasksCount, completedCount: completed.length, activeCount: activeTasks.length, efficiency, last7Days };
  }, [profile.tasks]);

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.bg}`}>
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className={`w-64 border-r p-6 hidden md:block ${themeClasses.sidebar}`}>
          <div className="mb-8 px-4"><h2 className="text-xl font-bold text-indigo-500">TaskFlow</h2></div>
          <nav className="space-y-2">
            <NavLink href="/dashboard" active>Dashboard</NavLink>
            <NavLink href="/tasks">Task List</NavLink>
            <NavLink href="/history">History</NavLink>
            <NavLink href="/reviews">Reviews</NavLink>
            <NavLink href="/ProductivityDashboard">Productivity Dashboard</NavLink>
            <NavLink href="/flow">Flow</NavLink>
            <NavLink href="/profile">Profile</NavLink>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          <header className="flex justify-between items-center">
            <h1 className={`text-4xl font-extrabold tracking-tight ${themeClasses.headerText}`}>
              Performance <span className="text-indigo-500 underline decoration-indigo-500/30">Insights</span>
            </h1>
          </header>

          {/* SUMMARY GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryStat label="Completed" val={stats.completedCount} icon={<CheckCircle size={16}/>} themeClasses={themeClasses} />
            <SummaryStat label="Pending" val={stats.activeCount} icon={<Clock size={16}/>} themeClasses={themeClasses} />
            <SummaryStat label="Efficiency" val={`${stats.efficiency}%`} icon={<TrendingUp size={16}/>} themeClasses={themeClasses} />
            <SummaryStat label="Streak" val="5 Days" icon={<Flame size={16}/>} themeClasses={themeClasses} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PRODUCTIVITY PULSE CHART */}
            <div className={`lg:col-span-2 border p-8 rounded-[2.5rem] ${themeClasses.card} border-indigo-500/20`}>
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Productivity Pulse</h3>
                    <p className={`text-xl font-black mt-1 ${themeClasses.headerText}`}>Daily Output</p>
                 </div>
                 <div className="text-[10px] font-bold px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded border border-indigo-500/20 uppercase">Live Analysis</div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%">
                  <BarChart data={stats.last7Days} margin={{left: -5}}>
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#f8fafc', fontSize: 10, fontWeight: 700}} // White text for dates
                        dy={10} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#f8fafc', fontSize: 10}} // White text for counts
                        allowDecimals={false} 
                    />
                    <Tooltip 
                      cursor={{fill: '#1e293b'}}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]} barSize={35}>
                      {stats.last7Days.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#6366f1' : '#6366f144'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* FOCUS SIDEBAR */}
            <div className={`border rounded-[2.5rem] p-8 h-fit ${themeClasses.card}`}>
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-6">Focus Distribution</h3>
              <div className="space-y-6">
                <FocusBar label="Web Development" progress={75} color="bg-indigo-500" themeClasses={themeClasses} />
                <FocusBar label="Design" progress={40} color="bg-pink-500" themeClasses={themeClasses} />
                <FocusBar label="College Work" progress={60} color="bg-amber-500" themeClasses={themeClasses} />
                
                <div className="pt-6 mt-6 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 italic leading-relaxed uppercase font-bold tracking-tighter">
                    "Your activity peaks on Tuesdays. Deploy your high-priority missions then."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SummaryStat({ label, val, icon, themeClasses }) {
  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${themeClasses.card} hover:border-indigo-500/40 group`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-2xl font-black ${themeClasses.headerText}`}>{val}</p>
    </div>
  );
}

function FocusBar({ label, progress, color, themeClasses }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className={`text-[11px] font-bold uppercase tracking-tight ${themeClasses.headerText}`}>{label}</span>
        <span className="text-[10px] font-mono text-slate-400">{progress}%</span>
      </div>
      <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
        <div className={`${color} h-full rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]`} style={{ width: `${progress}%` }} />
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