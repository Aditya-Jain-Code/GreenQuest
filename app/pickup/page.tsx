"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  CheckCircle,
  Clock,
  List,
  Wallet,
  User,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPickupStats,
  getRecentPickups,
  getEarningsSummary,
} from "@/utils/db/actions/pickups";
import { getUserByEmail } from "@/utils/db/actions/users";
import { toast } from "react-hot-toast";

type Stats = {
  assigned: number;
  inProgress: number;
  completed: number;
};

type Pickup = {
  id: number;
  location: string;
  status: "assigned" | "in_progress" | "completed";
  wasteType: string;
  amount: string;
  updatedAt: string;
};

type Earnings = {
  totalEarnings: number;
  completedPickups: number;
  earningsThisWeek: number;
};

export default function PickupDashboard() {
  const [stats, setStats] = useState<Stats>({
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });
  const [recentPickups, setRecentPickups] = useState<Pickup[]>([]);
  const [earnings, setEarnings] = useState<Earnings>({
    totalEarnings: 0,
    completedPickups: 0,
    earningsThisWeek: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const agentEmail = localStorage.getItem("agentEmail");

        if (!agentEmail) {
          toast.error("User not found. Please log in again.");
          router.push("/pickup/login");
          return;
        }

        // ✅ Check if the user is an agent
        const user = await getUserByEmail(agentEmail);
        if (user?.role !== "agent") {
          toast.error("Access denied. Only agents can access this page.");
          router.push("/not-authorized");
          return;
        }

        // ✅ Fetch agent data if valid
        const [statsData, pickupsData, earningsData] = await Promise.all([
          getPickupStats(agentEmail),
          getRecentPickups(agentEmail),
          getEarningsSummary(agentEmail),
        ]);

        setStats(statsData);
        const formattedPickupsData = pickupsData.map((pickup: any) => ({
          ...pickup,
          status: pickup.status as "assigned" | "in_progress" | "completed",
        }));
        setRecentPickups(formattedPickupsData);
        setEarnings(earningsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleViewPickups = () => router.push("/pickup/assigned");
  const handleProfile = () => router.push("/pickup/profile");
  const handleSettings = () => router.push("/pickup/settings");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-6">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-green-700 mb-8 text-center bg-white py-4 shadow-md rounded-xl">
          🚛 Pickup Agent Dashboard
        </h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Assigned Pickups"
            value={stats.assigned}
            icon={<Truck className="text-blue-600" size={32} />}
            bgColor="bg-blue-100"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Clock className="text-yellow-600" size={32} />}
            bgColor="bg-yellow-100"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="text-green-600" size={32} />}
            bgColor="bg-green-100"
          />
          <StatCard
            title="Total Earnings (₹)"
            value={earnings.totalEarnings.toFixed(2)}
            icon={<Wallet className="text-purple-600" size={32} />}
            bgColor="bg-purple-100"
          />
        </div>

        {/* Recent Pickups & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Pickups */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📦 Recent Pickup Activity
            </h2>
            {recentPickups.length === 0 ? (
              <p className="text-gray-600">No recent activity.</p>
            ) : (
              <div className="flex justify-between items-center bg-white shadow-lg border border-gray-200 p-4 rounded-lg hover:shadow-xl transition-transform transform hover:scale-105">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    📦 {recentPickups[0]?.wasteType} at{" "}
                    {recentPickups[0]?.location}
                  </h3>
                  <p className="text-sm text-gray-500">
                    📅 {new Date(recentPickups[0]?.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`flex items-center text-sm px-4 py-1 rounded-full ${
                    recentPickups[0]?.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : recentPickups[0]?.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <span className="mr-1 text-lg">
                    {recentPickups[0]?.status === "completed"
                      ? "✅"
                      : recentPickups[0]?.status === "in_progress"
                      ? "⏳"
                      : "📦"}
                  </span>
                  <span className="font-medium">
                    {recentPickups[0]?.status === "completed"
                      ? "Completed"
                      : recentPickups[0]?.status === "in_progress"
                      ? "In Progress"
                      : "Assigned"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Performance Overview */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📈 Performance Overview
            </h2>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-lg text-gray-600">
                  Completed Pickups This Week
                </p>
                <h3 className="text-2xl font-bold text-green-700">
                  {earnings.earningsThisWeek}
                </h3>
              </div>
              <div>
                <p className="text-lg text-gray-600">Total Pickups</p>
                <h3 className="text-2xl font-bold text-blue-700">
                  {earnings.completedPickups}
                </h3>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${(
                    (earnings.completedPickups /
                      (earnings.completedPickups +
                        stats.assigned +
                        stats.inProgress)) *
                    100
                  ).toFixed(0)}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Progress:{" "}
              {(
                (earnings.completedPickups /
                  (earnings.completedPickups +
                    stats.assigned +
                    stats.inProgress)) *
                100
              ).toFixed(0)}
              %
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-10 flex justify-center gap-6">
          <Button
            onClick={handleViewPickups}
            className="bg-green-600 text-white hover:bg-green-700 flex items-center px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
          >
            <List className="mr-2" size={20} />
            View Assigned Pickups
          </Button>
          <Button
            onClick={handleProfile}
            className="bg-blue-600 text-white hover:bg-blue-700 flex items-center px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
          >
            <User className="mr-2" size={20} />
            View Profile
          </Button>
          <Button
            onClick={handleSettings}
            className="bg-gray-600 text-white hover:bg-gray-700 flex items-center px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
          >
            <Settings className="mr-2" size={20} />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
interface StatCardProps {
  title: string;
  value: number | string;
  icon: JSX.Element;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor }) => {
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-gray-50`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <div
          className={`p-3 rounded-full ${bgColor} bg-opacity-20 shadow-inner`}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-700">{value}</p>
    </div>
  );
};
