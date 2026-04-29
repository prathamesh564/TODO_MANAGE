"use client";
import { useEffect, useState } from "react";
import { auth } from "../core/firebase.js";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    college: "",
    email: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const res = await fetch(`${API_BASE}/profile/${user.uid}`);
          const data = await res.json();
          // If profile exists, merge it; otherwise keep defaults and add email
          setProfile(prev => ({ 
            ...prev, 
            ...data, 
            email: data.email || user.email || "" 
          }));
        } catch (err) {
          console.error("Profile load error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, userId: user.uid }),
      });
      if (res.ok) {
        setIsEditing(false);
        alert("Profile Protocol Updated.");
      }
    } catch (err) {
      alert("Failed to sync with server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="animate-pulse text-indigo-500 font-mono tracking-widest">LOADING_USER_DATA...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:block bg-slate-900/50">
        <h2 className="text-xl font-bold text-indigo-500 mb-8 italic">TASKFLOW</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Dashboard</Link>
          <Link href="/tasks" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Task List</Link>
          <Link href="/history" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">History</Link>
          <Link href="/reviews" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Reviews</Link>
          <Link href="/ProductivityDashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Productivity Dashboard</Link>
            <Link href="/flow" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Flow</Link>      
            <Link href="/profile" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Profile</Link>
           
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">User Profile</h1>
            <p className="text-slate-500 mt-1">Manage your identity and credentials.</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all border ${isEditing ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10'}`}
          >
            {isEditing ? "CANCEL" : "EDIT PROFILE"}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-5xl font-bold text-white mb-6 border-4 border-slate-800 shadow-xl">
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="text-xl font-bold text-white">{profile.name || "Agent User"}</h2>
              <p className="text-indigo-400 text-xs font-mono mt-1 uppercase tracking-widest">{profile.college || "Unassigned Sector"}</p>
              
              <div className="mt-8 w-full space-y-4 pt-8 border-t border-slate-800/50">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase">Account Status</span>
                  <span className="text-emerald-500 font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase">Rank</span>
                  <span className="text-indigo-400 font-bold">LEAD ARCHITECT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    disabled={!isEditing}
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Enter name"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                  />
                </div>

                {/* Email (Read Only usually) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Primary Email</label>
                  <input 
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full bg-slate-950/20 border border-slate-800/50 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Comm Link (Phone)</label>
                  <input 
                    type="text"
                    disabled={!isEditing}
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="+1 234..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                  />
                </div>

                {/* College */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Affiliation (College)</label>
                  <input 
                    type="text"
                    disabled={!isEditing}
                    value={profile.college}
                    onChange={(e) => setProfile({...profile, college: e.target.value})}
                    placeholder="University Name"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Agent Bio</label>
                  <textarea 
                    rows="4"
                    disabled={!isEditing}
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Describe your mission objectives..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 resize-none transition-all"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "SYNCING..." : "SAVE CHANGES"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}