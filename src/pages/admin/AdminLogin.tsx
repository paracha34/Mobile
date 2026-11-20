import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, Lock, Mail, ShieldAlert, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, isSupabaseConnected } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleFillDemo = () => {
    setEmail('captaina381924@gmail.com');
    setPassword('office@95');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background neon elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 p-0.5 shadow-xl shadow-purple-900/30">
            <div className="w-full h-full bg-[#0a0a0f] rounded-[14px] flex items-center justify-center">
              <Zap className="w-7 h-7 text-purple-400 fill-purple-400/20" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Operations Portal</h1>
          <p className="text-xs text-gray-400">
            Sign in with authorized administrator credentials to manage inventory, banners, and orders
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-[#12121a] border border-[#2a2a3e] p-6 sm:p-8 shadow-2xl space-y-6 text-left">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="captaina381924@gmail.com"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                  required
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0f] border border-[#2a2a3e] focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-futuristic-primary w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 transition-all duration-200"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick fill / Supabase info box */}
          <div className="pt-4 border-t border-[#2a2a3e] space-y-3">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Admin Authentication:</span>
              <span className={`font-semibold ${isSupabaseConnected ? 'text-emerald-400' : 'text-purple-400'}`}>
                {isSupabaseConnected ? 'Live Supabase Instance' : 'Admin Secure Access'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-xl bg-[#1a1a2e] hover:bg-[#25253d] border border-[#2a2a3e] text-[11px] font-medium text-purple-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Admin Credentials (captaina381924@gmail.com / office@95)</span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Return to Gadget Zone Public Store
          </a>
        </div>
      </div>
    </div>
  );
};
