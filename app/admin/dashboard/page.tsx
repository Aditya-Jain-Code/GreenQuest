// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Recycle, Users, Coins, MapPin, TreesIcon } from "lucide-react";
import ImpactCard from "@/components/ImpactCard";
import ActionButton from "@/components/ActionButton";
import { Poppins } from "next/font/google";
import { Toaster, toast } from "react-hot-toast";
import {
  getAllRewards,
  getRecentReports,
  getWasteCollectionTasks,
} from "@/utils/db/actions";

const poppins = Poppins({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
});

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0,
  });

  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if Admin is Logged In
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      toast.error("Access denied! Please log in.");
      router.push("/admin/login");
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    if (isLoading) return;

    async function fetchDashboardData() {
      setLoading(true);
      try {
        const [reports, rewards, tasks] = await Promise.allSettled([
          getRecentReports(5),
          getAllRewards(),
          getWasteCollectionTasks(100),
        ]);

        const wasteCollected =
          tasks.status === "fulfilled"
            ? tasks.value.reduce(
                (total, task) =>
                  total +
                  parseFloat(task.amount.match(/(\d+(\.\d+)?)/)?.[0] || "0"),
                0
              )
            : 0;

        setImpactData({
          wasteCollected: Math.round(wasteCollected * 10) / 10,
          reportsSubmitted:
            reports.status === "fulfilled" ? reports.value.length : 0,
          tokensEarned:
            rewards.status === "fulfilled"
              ? rewards.value.reduce(
                  (total, reward) => total + (reward.points || 0),
                  0
                )
              : 0,
          co2Offset: Math.round(wasteCollected * 0.5 * 10) / 10,
        });

        if (reports.status === "fulfilled") {
          setRecentReports(reports.value);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [isLoading]);

  // Navigate to specific sections
  const navigateTo = (path) => router.push(path);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Checking access...
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-6 py-12 ${poppins.className}`}>
      <Toaster />

      <h1 className="text-5xl font-extrabold mb-12 text-gray-800 text-center">
        🌟 Admin Dashboard
      </h1>

      {/* Impact Summary Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <ImpactCard
          title="Waste Collected (kg)"
          value={impactData.wasteCollected}
          icon={Recycle}
          loading={loading}
        />
        <ImpactCard
          title="Reports Submitted"
          value={impactData.reportsSubmitted}
          icon={MapPin}
          loading={loading}
        />
        <ImpactCard
          title="Tokens Earned"
          value={impactData.tokensEarned}
          icon={Coins}
          loading={loading}
        />
        <ImpactCard
          title="CO₂ Offset (kg)"
          value={impactData.co2Offset}
          icon={TreesIcon}
          loading={loading}
        />
      </section>

      {/* Recent Reports Section */}
      <section className="bg-white p-8 rounded-2xl shadow-xl mb-16">
        <h2 className="text-4xl font-semibold mb-8 text-gray-800">
          📊 Recent Reports
        </h2>
        {loading ? (
          <p>Loading recent reports...</p>
        ) : recentReports.length === 0 ? (
          <p>No recent reports available.</p>
        ) : (
          <ul className="space-y-6">
            {recentReports.map((report) => (
              <li
                key={report.id}
                className="p-6 border rounded-xl flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
              >
                <div>
                  <p className="text-xl font-medium text-gray-700">
                    {report.location}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {report.description}
                  </p>
                </div>
                <span
                  className={`text-lg font-semibold ${
                    report.status === "completed"
                      ? "text-green-600"
                      : report.status === "pending"
                      ? "text-yellow-500"
                      : "text-blue-500"
                  }`}
                >
                  {report.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Quick Actions Section */}
      <section className="flex flex-wrap justify-center gap-8">
        <ActionButton
          onClick={() => navigateTo("/admin/reports")}
          label="📋 Manage Reports"
        />
        <ActionButton
          onClick={() => navigateTo("/admin/users")}
          label="👤 View Users"
        />
        <ActionButton
          onClick={() => navigateTo("/admin/rewards")}
          label="🎁 Manage Rewards"
        />
      </section>
    </div>
  );
}
