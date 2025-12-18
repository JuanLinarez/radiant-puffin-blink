import React from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import MobileSidebar from './MobileSidebar';

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Configuración de Reconciliación';
    case '/results':
      return 'Resultados de Reconciliación';
    case '/features':
      return 'Características Avanzadas';
    case '/settings':
      return 'Ajustes de la Aplicación';
    case '/help':
      return 'Ayuda y Soporte';
    default:
      return 'Dashboard';
  }
};

const Header: React.FC = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 lg:px-8 border-b border-border bg-card/90 backdrop-blur-sm w-full">
      
      {/* Left side: Mobile Menu & Title */}
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <MobileSidebar />
        </div>
        <h1 className="text-xl font-semibold text-foreground hidden lg:block">{title}</h1>
        <div className="flex items-center gap-2 lg:hidden">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <span className="text-lg font-semibold text-foreground">Reconciliación</span>
        </div>
      </div>

      {/* Center: Title for Desktop (if needed, currently handled by left side) */}
      <h1 className="text-xl font-semibold text-foreground lg:hidden">{title}</h1>

      {/* Right side: User/Profile */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
        <Avatar className="h-8 w-8 hidden sm:flex">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;