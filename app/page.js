"use client";
import { useRouter } from "next/navigation";
import { 
  Sparkles,  
  ListTodo, 
  Zap,  
  Clock,
  ShieldCheck,
  Layout
} from "lucide-react";

export default function TodoLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 flex flex-col font-sans transition-colors duration-300">
      <main className="flex-grow">        
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6">   
          {/* Subtle Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
          
          <div className="max-w-5xl mx-auto text-center relative z-10">  
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-bold mb-10 uppercase tracking-[0.2em]">
              <Sparkles size={14} className="animate-pulse" />
              Focus. Execute. Finish.
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tight">
              Silence the noise, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400">
                get the work done.
              </span>
            </h1>
            
            <div className="text-lg md:text-lg text-slate-600 dark:text-slate-400 max-w-3xl font-serif mx-auto mb-12 leading-relaxed">
              We’ve crafted the minimal workspace for maximal output. Organize your 
              engineering sprints, daily habits, and long-term goals without the clutter 
              of traditional management tools.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button 
                onClick={() => router.push("/login")} 
                className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-2xl active:scale-95 transform transition-all duration-300 ease-in-out font-bold px-10 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                Start Your List
              </button>
              <button 
                onClick={() => router.push("/login")} 
                className="w-full sm:w-auto bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-500/50 hover:scale-105 hover:shadow-xl active:scale-95 transform transition-all duration-300 ease-in-out font-bold px-10 py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 pb-32">
          <FeatureCard 
            icon={<Zap className="text-blue-500 dark:text-blue-400" />} 
            title="Rapid Entry" 
            desc="Add tasks in milliseconds with keyboard-first navigation. Designed for the speed of thought."
          />
          <FeatureCard 
            icon={<Layout className="text-indigo-600 dark:text-indigo-400" />} 
            title="Clean Workflow" 
            desc="A distraction-free interface that helps you focus on your active task while keeping history organized."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-emerald-600 dark:text-emerald-400" />} 
            title="Data Integrity" 
            desc="Securely synced to your MongoDB cloud. Your tasks are available whenever and wherever you need them."
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 hover:shadow-xl dark:hover:bg-blue-500/[0.02] transition-all group">
      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}