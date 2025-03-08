"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AdminHeader from "@/components/AdminHeader";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
import { getAvailableRewards, getUserByEmail } from "@/utils/db/actions";

// Use Poppins font with multiple weights
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
  const [totalEarnings, setTotalEarnings] = useState(0);
  const pathname = usePathname();

  // Check if the current page is in the /admin route
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    const fetchTotalEarnings = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const user = await getUserByEmail(userEmail);

          if (user) {
            const rewards = await getAvailableRewards(user.id);

            // Ensure rewards is an array and calculate the total earnings
            const totalEarnings = Array.isArray(rewards)
              ? rewards.reduce((sum, reward) => sum + (reward.cost || 0), 0)
              : 0;

            setTotalEarnings(totalEarnings);
          }
        }
      } catch (error) {
        console.error("Error fetching total earnings:", error);
      }
    };

    fetchTotalEarnings();
  }, []);

  return (
    <html lang="en">
      {/* Apply Poppins font and white background */}
      <body className={`${poppins.className} bg-white text-gray-800`}>
        <div className="min-h-screen flex flex-col">
          {/* Dynamic Header: Admin vs. Regular */}
          {isAdminPage ? (
            <AdminHeader />
          ) : (
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              totalEarnings={totalEarnings}
            />
          )}

          <div className="flex flex-1">
            {/* Sidebar only on non-admin pages */}
            {!isAdminPage && <Sidebar open={sidebarOpen} />}

            {/* Adjust margin for sidebar or full-width */}
            <main
              className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${
                isAdminPage ? "ml-0" : "ml-64"
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
