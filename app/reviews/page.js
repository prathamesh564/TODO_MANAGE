"use client";
import { useState } from "react";
import { auth } from "../core/firebase.js";
import Link from "next/link";

export default function ReviewPage() {
  const [reviews, setReviews] = useState([
    { 
      id: 1, 
      user: "Alex Chen", 
      rating: 5, 
      comment: "The mission-control interface is exactly what I needed for my dev workflow.", 
      date: "2024-03-20",
      avatar: "https://m.media-amazon.com/images/S/amzn-author-media-prod/g20f0utgoaqmmt8bdggg5ppuf2._SY600_.jpg" 
    },
    { 
      id: 2, 
      user: "Sarah Miller", 
      rating: 4, 
      comment: "Great efficiency tracking. Would love to see more theme options!", 
      date: "2024-03-18",
      avatar: "https://celebwell.com/wp-content/uploads/sites/2/2024/08/GettyImages-2066809203-copy.jpeg?quality=82&strip=all"
    },
  ]);
  
  const [formData, setFormData] = useState({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newReview = {
        id: Date.now(),
        user: auth.currentUser?.displayName || "Agent User",
        rating: formData.rating,
        comment: formData.comment,
        date: new Date().toISOString().split('T')[0],
        avatar: "https://tse2.mm.bing.net/th/id/OIP.8hjyrFwct-UmY0L_VwsFeQHaHH?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
      };
      setReviews([newReview, ...reviews]);
      setFormData({ rating: 5, comment: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:block bg-slate-900/50">
        <h2 className="text-xl font-bold text-indigo-500 mb-8 italic tracking-tighter">TASKFLOW</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Dashboard</Link>
          <Link href="/tasks" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Task List</Link>
          <Link href="/history" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">History</Link>
          <Link href="/reviews" className="block px-4 py-2.5 rounded-xl bg-indigo-600 text-white shadow-lg">Reviews</Link>
          <Link href="/ProductivityDashboard" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Productivity Dashboard</Link>
                    <Link href="/flow" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Flow</Link>
          <Link href="/profile" className="block px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">Profile</Link>
            </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Hero Visual Header */}
        <div className="relative h-64 w-full overflow-hidden">
          <img 
            src="https://tse2.mm.bing.net/th/id/OIP.8hjyrFwct-UmY0L_VwsFeQHaHH?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" 
            alt="Dashboard Aesthetic" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-10">
            <h1 className="text-4xl font-black text-white tracking-tight">MISSION DEBRIEF</h1>
            <p className="text-indigo-400 font-mono text-sm tracking-[0.2em] uppercase">Community Feedback & Ratings</p>
          </div>
        </div>

        <div className="p-6 md:p-10 max-w-5xl mx-auto">
          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {reviews.map((rev) => (
              <div key={rev.id} className="group p-6 rounded-3xl border border-slate-800 bg-slate-900/20 hover:border-indigo-500/30 transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <img src={rev.avatar} className="w-12 h-12 rounded-full border-2 border-slate-800 bg-slate-800" alt="avatar" />
                    <div>
                      <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{rev.user}</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-mono">{rev.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < rev.rating ? 'text-amber-400' : 'text-slate-700'}`}>✦</span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-slate-800 pl-4">"{rev.comment}"</p>
              </div>
            ))}
          </div>

          {/* Feedback Form Card */}
          <div className="relative bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden max-w-3xl mx-auto">
            {/* Background Icon Decoration */}
            <img 
              src="http://googleusercontent.com/image_collection/image_retrieval/14103415114894594560_0" 
              className="absolute -right-10 -top-10 w-40 h-40 opacity-10 grayscale pointer-events-none" 
              alt="Decoration"
            />

            <div className="relative z-10 text-center mb-10">
              <h2 className="text-3xl font-bold text-white">Transmit Feedback</h2>
              <p className="text-slate-500 mt-2">Your insights help calibrate the TaskFlow core.</p>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              <div className="flex flex-col items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">System Rating</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: num })}
                      className={`w-14 h-14 rounded-2xl border-2 font-black text-xl transition-all ${
                        formData.rating === num 
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                        : 'border-slate-800 text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Review Content</label>
                <textarea
                  required
                  rows="4"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Analyze your experience..."
                  className="w-full bg-[#020617]/50 border border-slate-800 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 tracking-widest"
              >
                {isSubmitting ? "ENCRYPTING & SENDING..." : "DEPLOY FEEDBACK"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}