"use client";

import Link from "next/link";
import { LayoutGrid, List, User, Settings, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

// Sidebar menu items
const menuItems = [
  { name: "Dashboard", icon: LayoutGrid, path: "/pickup" },
  { name: "Assigned Pickups", icon: List, path: "/pickup/assigned" },
  { name: "History", icon: History, path: "/pickup/history" },
  { name: "Profile", icon: User, path: "/pickup/profile" },
  { name: "Settings", icon: Settings, path: "/pickup/settings" },
];

interface PickupSidebarProps {
  open: boolean;
}

export default function PickupSidebar({ open }: PickupSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`bg-white border-r pt-20 border-gray-200 text-gray-800 w-64 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <nav className="h-full flex flex-col justify-between">
        <div className="px-4 py-6 space-y-8">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path} passHref>
              <Button
                variant={pathname === item.path ? "secondary" : "ghost"}
                className={`w-full justify-start py-3 ${
                  pathname === item.path
                    ? "bg-green-100 text-green-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span className="text-base">{item.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
