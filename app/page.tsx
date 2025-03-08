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
    <div className="relative w-40 h-40 mx-auto mb-12">
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
      <div className="absolute inset-1 rounded-full bg-green-400 opacity-40 animate-ping"></div>
      <div className="absolute inset-3 rounded-full bg-green-300 opacity-60 animate-spin"></div>
      <div className="absolute inset-5 rounded-full bg-green-200 opacity-80 animate-bounce"></div>
      <Leaf className="absolute inset-0 m-auto h-20 w-20 text-green-600 animate-pulse" />
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
          co2Offset: Math.round(wasteCollected * 0.5 * 10) / 10,
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
    router.push(loggedIn ? "/report" : "/login");
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${poppins.className}`}>
      {/* Hero Section */}
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
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-8 rounded-full transition-transform transform hover:scale-105"
        />
      </section>

      {/* Feature Section */}
      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 mb-20">
        <FeatureCard
          icon={Leaf}
          title="Eco-Friendly"
          description="Contribute to a cleaner environment."
          className="hover:scale-105 transition-transform"
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Get tokens for your contributions."
          className="hover:scale-105 transition-transform"
        />
        <FeatureCard
          icon={Users}
          title="Community-Driven"
          description="Be part of a growing community."
          className="hover:scale-105 transition-transform"
        />
      </section>

      {/* Impact Section */}
      <section className="bg-gradient-to-b from-white to-green-50 p-10 rounded-3xl shadow-xl mb-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
          Our Impact
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {loading ? (
            <p className="text-center col-span-4 text-gray-500">
              Loading impact data...
            </p>
          ) : (
            <>
              <ImpactCard
                title="Waste Collected (kg)"
                value={impactData.wasteCollected}
                icon={Recycle}
                className="animate-fade-in"
              />
              <ImpactCard
                title="Reports Submitted"
                value={impactData.reportsSubmitted}
                icon={MapPin}
                className="animate-fade-in"
              />
              <ImpactCard
                title="Tokens Earned"
                value={impactData.tokensEarned}
                icon={Coins}
                className="animate-fade-in"
              />
              <ImpactCard
                title="CO₂ Offset (kg)"
                value={impactData.co2Offset}
                icon={Leaf}
                className="animate-fade-in"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
