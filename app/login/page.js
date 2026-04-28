"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListTodo, Loader2, ShieldCheck, Code2 } from "lucide-react";
// Import the actual logic from your Auth file
import { login, createAccount } from "../core/Auth"; 

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  async function handleAuth(type) {
    // Basic validation
    if (!email || !password) return alert("Please fill in all fields.");
    if (type === 'signup' && !checked) return alert("Please agree to the privacy terms!");
    
    setLoading(true);
    try {
      if (type === 'signup') {
        await createAccount(email, password);
        alert(`Welcome to Silent Coders! Account created.`);
      } else {
        await login(email, password);
      }
      
      // If successful, the auth state change in Dashboard will take over,
      // but we redirect manually here for speed.
      router.push("/dashboard"); 
    } catch (e) {
      // Friendly error mapping
      const errorMessage = e.code === 'auth/user-not-found' 
        ? "No account found with this email." 
        : e.message;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0a0a0a] text-white font-sans">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          
          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center border-r border-white/5">
            
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <ListTodo size={22} className="text-white" />
              </div>
              <div className="text-2xl font-black tracking-tighter">
                TO<span className="text-blue-300">_DO</span><span className="text-blue-500"> MANAGER</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold leading-tight">Focus on what <br /><span className="text-blue-500">matters most.</span></h2>
              <p className="text-gray-500 mt-2 text-sm font-medium">Join the minimal productivity workspace.</p>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Work Email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl border border-white/10 bg-white/[0.03] text-white outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all font-medium"
              />
              <input 
                type="password"
                placeholder="Secure Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl border border-white/10 bg-white/[0.03] text-white outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all font-medium"
              />
            </div>

            {/* Terms */}
            <label className="flex items-center gap-3 mt-6 mb-8 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
                className="peer h-5 w-5 appearance-none rounded border border-white/20 bg-white/5 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
              />
              <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300">
                I agree to the <span className="text-blue-400 underline underline-offset-4">Productivity Terms</span>
              </span>
            </label>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleAuth('login')}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : "LOG IN TO DASHBOARD"}
              </button>
              
              <div className="flex items-center gap-4 my-2">
                <div className="h-[1px] flex-1 bg-white/10"></div>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">or</span>
                <div className="h-[1px] flex-1 bg-white/10"></div>
              </div>

              <button 
                onClick={() => handleAuth('signup')}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : "CREATE NEW ACCOUNT"}
              </button>
            </div>
          </div>

          {/* Decorative Side */}
          <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-600/10 to-transparent p-12 flex-col justify-between">
            <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                    <ShieldCheck className="text-blue-500 mt-1" size={20} />
                    <div>
                        <h4 className="font-bold text-sm">Military Grade Security</h4>
                        <p className="text-xs text-gray-500">Your tasks are encrypted and synced across all your devices.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                    <Code2 className="text-blue-500 mt-1" size={20} />
                    <div>
                        <h4 className="font-bold text-sm">Open Source Core</h4>
                        <p className="text-xs text-gray-500">Built by engineers, for engineers. Totally transparent.</p>
                    </div>
                </div>
            </div>

            <div className="relative mt-auto">
                <div className="p-6 rounded-3xl bg-blue-600/20 border border-blue-500/30 backdrop-blur-md">
                    <p className="text-sm italic text-blue-200">"The secret of getting ahead is getting started."</p>
                    <p className="text-xs mt-2 font-bold text-blue-400 opacity-80">— Mark Twain</p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}