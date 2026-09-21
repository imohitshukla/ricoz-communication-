import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Sparkles } from 'lucide-react';

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
          
          {/* Ask Ricoz AI Floating Button */}
          <button className="absolute bottom-6 right-6 z-50 flex items-center space-x-2 bg-brand-primary text-white px-4 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(var(--brand-primary)/0.3)] hover:-translate-y-1 transition-all">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm">Ask Ricoz AI</span>
          </button>
        </main>
      </div>
    </div>
  );
}
