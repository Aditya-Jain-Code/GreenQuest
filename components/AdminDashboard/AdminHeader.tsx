"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Users,
  FileText,
  Gift,
  Bell,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("userEmail"); // Clear user session
    router.push("/admin/login"); // Redirect to login
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:mr-4"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo / Title */}
        <Link href="/admin" className="text-2xl font-bold text-green-700">
          🌱 Green-Quest Admin
        </Link>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-green-100"
            >
              <span>👤 Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white text-gray-700 shadow-lg rounded-lg">
            <DropdownMenuItem
              onClick={() => router.push("/admin/settings")}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Settings size={16} />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
