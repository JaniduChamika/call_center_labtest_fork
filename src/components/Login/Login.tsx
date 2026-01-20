'use client';

// 1. Import useRouter from next/navigation
import { useRouter } from 'next/navigation';
import React from 'react';
import { Settings, User, ArrowRight, ShieldCheck, Stethoscope, Activity } from 'lucide-react';
// Import Toast components
import { toast, Toaster } from 'react-hot-toast';

const PORTAL_CONFIG = {
  brandName: "eCHANNELLING",
  copyrightYear: 2025,
  companyName: "Sri Lanka Telecom - eChannelling"
};

const LOGIN_OPTIONS = [
  {
    id: 'agent',
    role: 'AGENT',
    title: 'Agent Login',
    description: 'Access the agent portal to manage appointments and patient information.',
    theme: {
      primary: 'bg-emerald-500 hover:bg-emerald-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-500',
      badgeIcon: <Stethoscope size={14} className="mr-1" />,
      mainIcon: <User size={32} className="text-white" />
    }
  },
  {
    id: 'admin',
    role: 'ADMIN',
    title: 'Admin Login',
    description: 'Access the admin portal to manage system settings and user accounts.',
    theme: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      iconBg: 'bg-blue-500',
      badgeIcon: <Activity size={14} className="mr-1" />, 
      mainIcon: <Settings size={32} className="text-white" />
    }
  }
];

export default function PortalLanding() {
  // 2. Initialize the router
  const router = useRouter();

  const handleNavigation = (role: string) => {
    // Dismiss any existing toasts to prevent clutter
    toast.dismiss();

    if (!role) {
      // Show Error message if role is missing
      toast.error("Configuration Error: Invalid Role Detected");
      return;
    }

    try {
      console.log(`Navigating to ${role} login flow...`);
      
      // UX: Show a loading/connecting toast before redirecting
      toast.loading(`Securely connecting to ${role} Portal...`, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // 3. Update the path to match 'src/app/pages/login/page.tsx'
      router.push(`/pages/login?role=${role}`);

    } catch (error) {
      console.error("Navigation failed:", error);
      // Show Error message if navigation fails
      toast.error("Navigation Failed. Please refresh and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      
      {/* Toast Container Configured here */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'sans-serif',
          }
        }}
      />

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl p-8 md:p-12">
        
        <div className="text-center mb-10 space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                <span className="text-emerald-500 font-bold text-xl italic">e</span>
              </div>
              <span className="text-blue-900 font-bold text-2xl tracking-wide uppercase">
                {PORTAL_CONFIG.brandName}
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Welcome to eChannelling Portal
          </h1>
          <p className="text-slate-500">Choose your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {LOGIN_OPTIONS.map((option) => (
            <div 
              key={option.id} 
              className="border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:border-slate-200 bg-white group"
            >
              <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-2xl ${option.theme.iconBg} flex items-center justify-center shadow-lg shadow-slate-200`}>
                  {option.theme.mainIcon}
                </div>
                <div className={`absolute -top-3 -right-6 ${option.theme.light} ${option.theme.text} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center shadow-sm border border-white`}>
                  {option.theme.badgeIcon}
                  {option.role}
                </div>
              </div>

              <h2 className="text-xl font-bold mb-3 text-slate-800">{option.title}</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">
                {option.description}
              </p>

              <button 
                onClick={() => handleNavigation(option.id)}
                className={`w-full py-3 px-6 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-transform active:scale-95 ${option.theme.primary}`}
              >
                Sign in as {option.role.charAt(0) + option.role.slice(1).toLowerCase()}
                <ArrowRight size={18} />
              </button>

              <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs">
                <ShieldCheck size={14} />
                <span>Secure & HIPAA Compliant</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-400 text-xs">
            © {PORTAL_CONFIG.copyrightYear} {PORTAL_CONFIG.companyName}
          </p>
        </div>

      </div>
    </div>
  );
}