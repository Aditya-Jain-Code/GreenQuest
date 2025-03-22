"use client";

import Link from "next/link";
import {
  Users,
  FileText,
  Bell,
  Gift,
  Shield,
  FileBarChart,
  Truck,
} from "lucide-react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Reports", icon: FileText, path: "/admin/reports" },
  {
    name: "Notifications",
    icon: Bell,
    path: "/admin/notifications",
  },
  { name: "Rewards", icon: Gift, path: "/admin/rewards" },
  { name: "Badges", icon: Shield, path: "/admin/badges" },
  {
    name: "Transaction Logs",
    icon: FileBarChart,
    path: "/admin/transactions",
  },
  {
    name: "Pickup Requests",
    icon: Truck,
    path: "/admin/pickups",
  },
];

interface AdminSidebarProps {
  open: boolean;
}

export default function AdminSiderbar({ open }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`bg-white border-r pt-20 border-gray-200 text-gray-800 w-64 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full"
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
