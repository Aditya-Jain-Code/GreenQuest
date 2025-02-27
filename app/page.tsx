// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Leaf, Recycle, Users, Coins, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getRecentReports,
  getAllRewards,
  getWasteCollectionTasks,
} from "@/utils/db/actions";
import ImpactCard from "@/components/ImpactCard";
import FeatureCard from "@/components/FeatureCard";
import ActionButton from "@/components/ActionButton";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
});

function AnimatedGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-green-400 opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-green-300 opacity-60 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-green-200 opacity-80 animate-bounce"></div>
      <Leaf className="absolute inset-0 m-auto h-16 w-16 text-green-600 animate-pulse" />
    </div>
  );
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    async function fetchImpactData() {
      setLoading(true);
      try {
        const [reports, rewards, tasks] = await Promise.allSettled([
          getRecentReports(100),
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
          co2Offset: Math.round(wasteCollected * 0.5 * 10) / 10, // 1kg waste = 0.5kg CO2 offset
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchImpactData();
  }, []);

  const handleButtonClick = () => {
    if (loggedIn) {
      router.push("/report");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${poppins.className}`}>
      <section className="text-center mb-20">
        <AnimatedGlobe />
        <h1 className="text-6xl font-bold mb-6 text-gray-800 tracking-tight">
          Green-Quest <span className="text-green-600">Waste Management</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Join our community in making waste management more efficient and
          rewarding!
        </p>
        <ActionButton
          onClick={handleButtonClick}
          label={loggedIn ? "Report Waste" : "Get Started"}
        />
      </section>

      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 mb-20">
        <FeatureCard
          icon={Leaf}
          title="Eco-Friendly"
          description="Contribute to a cleaner environment."
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Get tokens for your contributions."
        />
        <FeatureCard
          icon={Users}
          title="Community-Driven"
          description="Be part of a growing community."
        />
      </section>

      <section className="bg-white p-10 rounded-3xl shadow-lg mb-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
          Our Impact
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
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
            icon={Leaf}
            loading={loading}
          />
        </div>
      </section>
    </div>
  );
}
