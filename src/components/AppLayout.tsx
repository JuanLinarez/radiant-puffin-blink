import React from 'react';
import Sidebar from './Sidebar';

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