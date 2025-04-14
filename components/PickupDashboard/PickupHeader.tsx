"use client";

import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Props for handling sidebar toggle
interface PickupHeaderProps {
  onMenuClick?: () => void;
}

const PickupHeader: React.FC<PickupHeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("agentEmail");
    router.push("/pickup/login");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Menu Button */}
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <Button
              onClick={onMenuClick}
              className="text-gray-600 bg-gray-100 p-2 rounded-lg hover:bg-gray-200"
            >
              <Menu size={24} />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-green-700 flex items-center space-x-2">
            <Truck className="text-green-600" size={28} />
            <span>Pickup Agent Panel</span>
          </h1>
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center space-x-4">
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200">
                <User size={20} className="text-gray-700" />
                <ChevronDown size={18} className="text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white shadow-lg rounded-lg">
              <DropdownMenuItem
                onClick={() => router.push("/pickup/profile")}
                className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <User size={18} />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/pickup/settings")}
                className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <Settings size={18} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-3 text-red-700 hover:bg-red-100 cursor-pointer"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default PickupHeader;
