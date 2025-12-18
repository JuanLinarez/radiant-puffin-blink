import React from 'react';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { LayoutDashboard } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="dark flex min-h-screen bg-background">
      
      {/* Desktop Sidebar Container */}
      <div className="hidden lg:block w-20 flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Header for Mobile/Tablet */}
        <header className="lg:hidden sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
          <MobileSidebar />
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <LayoutDashboard className="w-6 h-6" />
            {/* We use sr-only here since the sidebar already has the logo on desktop */}
            <span className="sr-only">Reconciliation App</span> 
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;