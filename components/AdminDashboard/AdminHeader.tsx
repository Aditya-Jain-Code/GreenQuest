"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const adminEmail = localStorage.getItem("adminEmail");
    setIsAdminLoggedIn(!!adminEmail);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminEmail"); // Clear user session
    router.push("/admin/login"); // Redirect to login
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:mr-4 hover:bg-green-100 focus:ring-2 focus:ring-green-500 rounded-lg"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6 text-green-700" />
        </Button>

        {/* Logo / Title */}
        <Link
          href="/admin"
          className="text-2xl font-bold text-green-700 hover:text-green-600 transition-all"
        >
          🌱 Green-Quest Admin
        </Link>

        {/* Profile Dropdown */}
        {isAdminLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-green-100 focus:ring-2 focus:ring-green-500 rounded-lg px-4 py-2"
              >
                <span className="font-medium text-gray-700">👤 Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white text-gray-700 shadow-xl rounded-lg w-48 mt-2 border border-gray-200">
              <DropdownMenuItem
                onClick={() => router.push("/admin/settings")}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-green-100 hover:text-green-700 cursor-pointer rounded-md"
              >
                <Settings size={16} className="text-green-600" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-red-100 hover:text-red-700 cursor-pointer rounded-md"
              >
                <LogOut size={16} className="text-red-600" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
