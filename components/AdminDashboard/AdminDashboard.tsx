"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardWidget from "./DashboardWidget";
import { getDashboardStats } from "@/utils/db/actions/admin";
import { getUserByEmail } from "@/utils/db/actions/users"; // Fetch user details
import { Loader } from "lucide-react";
import ReportSummary from "./ReportSummary";
import RecentUsers from "./RecentUsers";
import NotificationOverview from "./NotificationOverview";
import ReportTrends from "./ReportTrends";

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  completedReports: number;
  totalUsers: number;
  tokensRedeemed: number;
  co2Offset: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const adminEmail = localStorage.getItem("adminEmail");
        if (!adminEmail) {
          router.push("/not-authorized"); // Redirect if no user
          return;
        }

        const user = await getUserByEmail(adminEmail);
        if (user?.role !== "admin") {
          router.push("/not-authorized"); // Redirect if not admin
          return;
        }

        setAuthorized(true); // Allow if admin
      } catch (error) {
        console.error("❌ Error verifying user role:", error);
        router.push("/not-authorized"); // Redirect on error
      }
    };

    checkUserRole();
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authorized) {
      fetchStats();
    }
  }, [authorized]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin text-green-500" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        📊 Admin Dashboard
      </h1>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardWidget
          title="Total Reports"
          value={stats.totalReports}
          icon="📄"
        />
        <DashboardWidget
          title="Pending Reports"
          value={stats.pendingReports}
          icon="⏳"
        />
        <DashboardWidget
          title="Completed Reports"
          value={stats.completedReports}
          icon="✅"
        />
        <DashboardWidget
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
        />
        <DashboardWidget
          title="Tokens Redeemed"
          value={stats.tokensRedeemed}
          icon="🪙"
        />
        <DashboardWidget
          title="CO₂ Offset (kg)"
          value={stats.co2Offset}
          icon="🌱"
        />
      </div>

      {/* Report Summary + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportSummary />
        <RecentUsers />
      </div>

      {/* Report Trends + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportTrends />
        <NotificationOverview />
      </div>
    </div>
  );
}
