"use client";

import { useEffect, useState } from "react";
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

interface PickupHeaderProps {
  onMenuClick: () => void;
}

const PickupHeader: React.FC<PickupHeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const [isAgentLoggedIn, setIsAgentLoggedIn] = useState(false);

  useEffect(() => {
    const agentEmail =
      typeof window !== "undefined" && localStorage.getItem("agentEmail");
    setIsAgentLoggedIn(!!agentEmail);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("agentEmail");
    router.push("/pickup/login");
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
          href="/pickup"
          className="text-2xl font-bold text-green-700 hover:text-green-600 transition-all"
        >
          🚛 Pickup Agent Panel
        </Link>

        {/* Profile Dropdown */}
        {isAgentLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-green-100 focus:ring-2 focus:ring-green-500 rounded-lg px-4 py-2"
              >
                <span className="font-medium text-gray-700">👤 Agent</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white text-gray-700 shadow-xl rounded-lg w-48 mt-2 border border-gray-200">
              <DropdownMenuItem
                onClick={() => router.push("/pickup/settings")}
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

export default PickupHeader;
