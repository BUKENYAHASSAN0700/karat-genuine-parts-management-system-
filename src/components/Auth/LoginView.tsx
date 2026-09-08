import React, { useState } from 'react';
import { 
  Cpu, 
  ArrowRight, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

export const LoginView: React.FC = () => {
  const { login } = useInertia();
  
  // Credentials: username = karat, password = Karat@2026
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('Please enter your username.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    // Verify username is 'karat' and password is 'Karat@2026'
    const isUserValid = cleanUser.toLowerCase() === 'karat';
    const isPassValid = cleanPass === 'Karat@2026';

    if (!isUserValid || !isPassValid) {
      setErrorMessage('Invalid username or password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(cleanUser, cleanPass);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0B0C0E] text-white font-sans selection:bg-[#F6AF31] selection:text-[#111111] relative overflow-hidden">
      
      {/* Background Micro-Grid & Ambient Radial Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(246,175,49,0.08),transparent_55%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* Main Centered Login Console */}
      <div className="relative z-10 w-full max-w-[420px] bg-[#121318] border border-white/10 rounded-3xl p-7 sm:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Brand Emblem & Header */}
        <div className="text-center space-y-3 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F6AF31] text-[#111111] flex items-center justify-center font-black shadow-lg shadow-[#F6AF31]/20 mx-auto">
            <Cpu className="w-6 h-6 text-[#111111]" />
          </div>

          <div>
            <div className="text-xl font-black tracking-tight text-white font-mono flex items-center justify-center">
              <span>KARAT GENUINE PARTS</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-2">
            Sign In
          </h1>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••"
                className="w-full bg-[#1A1B22] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-semibold text-white placeholder:text-slate-500 focus:bg-[#1E2028] focus:outline-none focus:border-[#F6AF31] focus:ring-2 focus:ring-[#F6AF31]/20 transition"
                autoComplete="username"
                autoFocus
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••"
                className="w-full bg-[#1A1B22] border border-white/10 rounded-2xl pl-11 pr-11 py-3.5 text-xs font-mono font-semibold text-white placeholder:text-slate-500 focus:bg-[#1E2028] focus:outline-none focus:border-[#F6AF31] focus:ring-2 focus:ring-[#F6AF31]/20 transition"
                autoComplete="current-password"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-200 absolute right-3.5 top-3.5 cursor-pointer transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#F6AF31] focus:ring-[#F6AF31] accent-[#F6AF31] bg-[#1A1B22] border-white/10"
              />
              <span className="text-xs font-semibold text-slate-300">
                Remember me
              </span>
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-black transition-all shadow-lg shadow-[#F6AF31]/20 hover:shadow-[#F6AF31]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 text-[#111111]" />
              </>
            )}
          </button>

        </form>

      </div>

    </div>
  );
};
