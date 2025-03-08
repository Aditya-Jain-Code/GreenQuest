// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  adminName?: string;
  onLogout: () => void;
}

export default function AdminHeader({
  isAdminLoggedIn,
  adminName = "Admin",
  onLogout,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    onLogout();
    router.push("/admin/login");
  };

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: ClipboardList },
  ];

  return (
    <header
      className={`bg-white shadow-lg px-6 py-4 flex items-center justify-between ${poppins.className}`}
    >
      {/* Logo */}
      <Link href="/admin/dashboard" className="flex items-center gap-3">
        <Leaf className="h-8 w-8 text-green-600" />
        <span className="text-2xl font-semibold text-gray-800 hover:text-green-600 transition-all">
          Green-Quest Admin
        </span>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors ${
              pathname === link.href ? "text-green-600 font-semibold" : ""
            }`}
          >
            <link.icon className="w-4 h-4" /> {link.label}
          </Link>
        ))}
      </nav>

      {/* Admin Actions */}
      {isAdminLoggedIn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 hover:text-green-600"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline-block">{adminName}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
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
