import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AdminDashboardModule } from '../../features/admin/AdminDashboard';
import { Shield, LogOut, Sparkles } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useWorkspace();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Admin Light Theme Header */}
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 shadow-sm">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg tracking-wide flex items-center gap-2">
              AI Ads™ <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black bg-brand-50 text-brand-600 border border-brand-200">Super Admin</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Ecosystem Control Panel</p>
          </div>
        </div>

        {/* Right: User & Logout */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900">{user?.name || user?.email?.split('@')[0] || 'Admin User'}</p>
              <p className="text-[10px] text-slate-400 font-medium">{user?.email || 'admin@aiads.com'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm font-bold text-xs">
              <Shield className="w-4 h-4 text-brand-600" />
            </div>
          </div>
          
          <div className="w-px h-7 bg-slate-200"></div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors font-extrabold text-xs border border-red-200/80 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto overflow-y-auto bg-slate-50">
        <AdminDashboardModule />
      </main>
    </div>
  );
};
