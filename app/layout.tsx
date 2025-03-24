"use client";

import { useState, useEffect } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AdminHeader from "@/components/AdminDashboard/AdminHeader";
import AdminSidebar from "@/components/AdminDashboard/AdminSidebar";
import PickupHeader from "@/components/PickupDashboard/PickupHeader";
import PickupSidebar from "@/components/PickupDashboard/PickupSidebar";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

const poppins = Poppins({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // ✅ Identify admin and pickup pages
  const isAdminPage = pathname.includes("/admin");
  const isPickupPage = pathname.includes("/pickup");

  // ✅ Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Show plain layout for not-authorized page
  if (pathname === "/not-authorized") {
    return (
      <html>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={poppins.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* ✅ Top Header Logic */}
          <div className="w-full fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            {isAdminPage ? (
              <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            ) : isPickupPage ? (
              <PickupHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            ) : (
              <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            )}
          </div>

          <div className="flex flex-1 pt-16">
            {/* ✅ Sidebar Logic */}
            <div
              className={`fixed inset-y-0 left-0 z-40 w-64 bg-green-100 border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-64"
              }`}
            >
              {isAdminPage ? (
                <AdminSidebar open={sidebarOpen} />
              ) : isPickupPage ? (
                <PickupSidebar open={sidebarOpen} />
              ) : (
                <Sidebar open={sidebarOpen} />
              )}
            </div>

            {/* ✅ Main Content Area */}
            <main
              className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${
                sidebarOpen ? "ml-64" : "ml-0"
              }`}
            >
              {children}
            </main>
          </div>
        </div>

        <Toaster />
      </body>
    </html>
  );
}
