import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { FileText, Settings, HelpCircle, Upload, LayoutDashboard, Zap } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, isActive }) => (
  <Link
    to={href}
    className={cn(
      "flex items-center justify-center h-12 w-12 rounded-xl transition-colors",
      isActive
        ? "bg-primary text-primary-foreground shadow-lg relative before:content-[''] before:absolute before:left-0 before:top-1/4 before:h-1/2 before:w-1 before:bg-primary before:rounded-r-full"
        : "text-muted-foreground hover:bg-accent hover:text-foreground",
    )}
    title={name}
  >
    {icon}
  </Link>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex h-full flex-col bg-card p-3 shadow-2xl rounded-r-2xl border-r border-border/50">
      <div className="flex items-center justify-center h-16 mb-6">
        <LayoutDashboard className="w-8 h-8 text-primary" />
      </div>
      <nav className="flex-1 space-y-3">
        <NavItem
          href="/"
          icon={<Upload className="h-6 w-6" />}
          label="Configuración"
          isActive={currentPath === "/"}
        />
        <NavItem
          href="/results"
          icon={<FileText className="h-6 w-6" />}
          label="Resultados (Simulado)"
          isActive={currentPath === "/results"}
        />
        <NavItem
          href="/features"
          icon={<Zap className="h-6 w-6" />}
          label="Características"
          isActive={currentPath === "/features"}
        />
      </nav>
      <div className="mt-auto pt-4 border-t border-border/50 space-y-3">
        <NavItem
          href="/settings"
          icon={<Settings className="h-6 w-6" />}
          label="Ajustes"
          isActive={currentPath === "/settings"}
        />
        <NavItem
          href="/help"
          icon={<HelpCircle className="h-6 w-6" />}
          label="Ayuda & Soporte"
          isActive={currentPath === "/help"}
        />
      </div>
    </div>
  );
};

export default Sidebar;