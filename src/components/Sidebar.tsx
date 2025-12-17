import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { FileText, Settings, HelpCircle, Upload, Link as LinkIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive }) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
      isActive
        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
        : "text-muted-foreground",
    )}
  >
    {icon}
    {label}
  </Link>
);

const Sidebar: React.FC = () => {
  // For now, we assume the current path is '/' (Reconciliation Setup)
  const currentPath = "/"; 

  return (
    <div className="flex h-full flex-col border-r bg-card p-4 shadow-lg rounded-r-xl">
      <div className="flex items-center justify-start h-16 mb-6">
        <span className="text-2xl font-bold text-primary flex items-center gap-2">
          <FileText className="w-6 h-6" /> Reconciliación
        </span>
      </div>
      <nav className="flex-1 space-y-1">
        <NavItem
          href="/"
          icon={<Upload className="h-5 w-5" />}
          label="Configuración"
          isActive={currentPath === "/"}
        />
        <NavItem
          href="/results"
          icon={<FileText className="h-5 w-5" />}
          label="Resultados (Simulado)"
          isActive={currentPath === "/results"}
        />
      </nav>
      <div className="mt-auto pt-4 border-t border-border space-y-1">
        <NavItem
          href="/settings"
          icon={<Settings className="h-5 w-5" />}
          label="Ajustes"
          isActive={currentPath === "/settings"}
        />
        <NavItem
          href="/help"
          icon={<HelpCircle className="h-5 w-5" />}
          label="Ayuda & Soporte"
          isActive={currentPath === "/help"}
        />
      </div>
    </div>
  );
};

export default Sidebar;