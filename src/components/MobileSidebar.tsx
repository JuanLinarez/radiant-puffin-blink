import React from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';

const MobileSidebar: React.FC = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      {/* Setting width to w-20 to match the desktop sidebar width */}
      <SheetContent side="left" className="p-0 w-20 sm:w-20"> 
        {/* The Sidebar component already handles the full navigation structure */}
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;