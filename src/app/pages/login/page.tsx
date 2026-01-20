'use client';

import React, { useState, Suspense } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react'; // <--- 1. Import signIn

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const role = searchParams.get('role') || 'agent'; 
  const isAgent = role === 'agent';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => { // <--- 2. Make async
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // --- 3. CALL NEXTAUTH BACKEND ---
      const result = await signIn('credentials', {
        redirect: false, // Prevent page reload
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        // Handle backend errors (e.g. "Invalid credentials", "Account suspended")
        setError(result.error);
        setLoading(false);
      } else if (result?.ok) {
        // --- 4. SUCCESS REDIRECTION ---
        // Note: For a strictly professional setup, you might want to check 
        // the user's role in the session here before redirecting.
        // For now, we redirect based on the requested portal.
        
        console.log('Login successful');
        
        if (isAgent) {
          router.push('/pages/booking');
        } else {
          router.push('/pages/admin/dashboard');
        }
        
        // Don't set loading false here to prevent UI flash before redirect
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const switchRole = () => {
    const newRole = isAgent ? 'admin' : 'agent';
    setFormData({ email: '', password: '', rememberMe: false });
    setError('');
    router.push(`/pages/login?role=${newRole}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[450px] p-8 md:p-10 relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                <span className="text-emerald-500 font-bold text-lg italic">e</span>
              </div>
              <span className="text-blue-900 font-bold text-xl tracking-wide uppercase">
                CHANNELLING
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            {isAgent ? 'Agent Portal Access' : 'Administrative Access'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              {isAgent ? 'Agent Email' : 'Admin Email'} <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder={isAgent ? "agent@test.com" : "admin@test.com"}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-sm"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              Remember me
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center justify-center text-center animate-in fade-in slide-in-from-top-1">
              {error === "CredentialsSignin" ? "Invalid email or password" : error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${
               isAgent 
                 ? "bg-blue-900 hover:bg-blue-800 shadow-blue-900/20" 
                 : "bg-slate-800 hover:bg-slate-700 shadow-slate-800/20"
            }`}
          >
            {loading ? 'Authenticating...' : `Sign in as ${isAgent ? 'Agent' : 'Admin'}`}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          <p>
            Need to switch portals?{' '}
            <button 
              onClick={switchRole}
              className="text-blue-600 font-medium hover:underline focus:outline-none"
            >
              Login as {isAgent ? 'Admin' : 'Agent'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}