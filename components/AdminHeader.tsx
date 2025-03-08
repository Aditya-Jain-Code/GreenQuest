// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  User,
  ChevronDown,
  LogOut,
  ClipboardList,
  Users,
  LayoutDashboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
});

interface AdminHeaderProps {
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export default function AdminHeader({
  isAdminLoggedIn,
  onLogout,
}: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    onLogout();
    router.push("/admin/login");
  };

  return (
    <header
      className={`bg-white shadow-md px-6 py-4 flex items-center justify-between ${poppins.className}`}
    >
      <Link href="/admin/dashboard" className="flex items-center gap-3">
        <Leaf className="h-8 w-8 text-green-600" />
        <span className="text-2xl font-semibold text-gray-800">
          Admin Panel
        </span>
      </Link>

      <nav className="flex items-center gap-8">
        <Link
          href="/admin/dashboard"
          className="text-gray-700 hover:text-green-600 transition-colors flex items-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
        <Link
          href="/admin/users"
          className="text-gray-700 hover:text-green-600 transition-colors flex items-center gap-2"
        >
          <Users className="w-4 h-4" /> Users
        </Link>
        <Link
          href="/admin/reports"
          className="text-gray-700 hover:text-green-600 transition-colors flex items-center gap-2"
        >
          <ClipboardList className="w-4 h-4" /> Reports
        </Link>
      </nav>

      {isAdminLoggedIn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 hover:text-green-600"
            >
              <User className="w-5 h-5" />
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-100"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
