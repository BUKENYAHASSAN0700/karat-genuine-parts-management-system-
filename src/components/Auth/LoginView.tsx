import React, { useState } from 'react';
import { 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Boxes, 
  TrendingUp, 
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

export const LoginView: React.FC = () => {
  const { login } = useInertia();
  const [email, setEmail] = useState('owner@karat.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, password);
      setIsLoading(false);
    }, 400);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setEmail('owner@karat.com');
    setPassword('••••••••••••');
    setTimeout(() => {
      login('owner@karat.com', 'demo123');
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#111111] flex flex-col justify-between font-sans selection:bg-[#F6AF31] selection:text-[#111111] p-4 sm:p-6 lg:p-8">
      {/* Top Bar with Brand Emblem */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black text-xl shadow-xs border border-[#111111]">
            <Cpu className="w-5 h-5 text-[#F6AF31]" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-[#111111] flex items-center gap-1.5 font-mono">
              KARAT
              <span className="w-2 h-2 rounded-full bg-[#F6AF31]" />
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#111111]/50">
              Heavy Machinery & Spare Parts
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-[#111111] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#22A06B]" />
            Online Cloud Portal
          </span>
        </div>
      </header>

      {/* Main Authentication Bento Container */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Welcome & Value Prop */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F7F6F3] text-[#111111] border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F6AF31]" />
              Shop Owner Master Access
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight leading-tight">
                Control your inventory, cashflow & machinery fleet.
              </h1>
              <p className="text-sm text-[#111111]/60 mt-3 leading-relaxed">
                Log in to your KARAT management workspace to track hydraulic valves, CAT/Komatsu/Volvo components, customer quotations, and real-time revenue.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-[#111111]/80 font-medium">
                <div className="w-6 h-6 rounded-full bg-[#22A06B]/15 text-[#22A06B] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Real-time low stock alerts & minimum threshold triggers</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#111111]/80 font-medium">
                <div className="w-6 h-6 rounded-full bg-[#F6AF31]/20 text-[#111111] flex items-center justify-center shrink-0 font-bold">
                  <Boxes className="w-3.5 h-3.5 text-[#111111]" />
                </div>
                <span>Full catalog for Caterpillar, Komatsu, Volvo, Hitachi</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#111111]/80 font-medium">
                <div className="w-6 h-6 rounded-full bg-[#111111] text-[#F6AF31] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-[#F6AF31]" />
                </div>
                <span>Live commercial quotes & automated customer invoicing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-6 bg-[#F7F6F3] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#111111] tracking-tight">Shop Owner Sign In</h2>
              <p className="text-xs text-[#111111]/60 mt-0.5">Enter your shop credentials to open KARAT</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/70 mb-1.5">
                  Owner Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@karat.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#111111] font-medium placeholder:text-[#111111]/40 focus:outline-none focus:ring-2 focus:ring-[#F6AF31] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/70">
                    Master Password
                  </label>
                  <span className="text-[11px] text-[#111111]/50 cursor-pointer hover:underline">
                    Forgot key?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#111111] font-medium placeholder:text-[#111111]/40 focus:outline-none focus:ring-2 focus:ring-[#F6AF31] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#111111]/80 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#111111] focus:ring-[#F6AF31] w-4 h-4 accent-[#111111]"
                  />
                  <span>Stay signed in on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 tracking-wide cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to KARAT Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-widest text-[#111111]/40">Quick Access</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Instant Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#111111] text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F6AF31]" />
              <span>1-Click Owner Demo Login</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
