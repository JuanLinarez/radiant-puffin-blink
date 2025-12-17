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
      
      {/* Mobile Header/Trigger (Visible below lg breakpoint) */}
      <header className="lg:hidden sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b border-border bg-card/90 backdrop-blur-sm w-full">
        <MobileSidebar />
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">Reconciliación</span>
        </div>
        {/* Placeholder for alignment */}
        <div className="w-10"></div> 
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;