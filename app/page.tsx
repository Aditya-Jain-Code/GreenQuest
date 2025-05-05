"use client";

import { useState, useEffect } from "react";
import { Leaf, Recycle, Users, Coins, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import ImpactCard from "@/components/ImpactCard";
import FeatureCard from "@/components/FeatureCard";
import ActionButton from "@/components/ActionButton";
import { Poppins } from "next/font/google";
import {
  getRecentReports,
  getWasteCollectionTasks,
} from "@/utils/db/actions/reports";
import { getAllRewards } from "@/utils/db/actions/rewards";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animation";

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

      {/* Feature Section - Real Features */}
      <motion.section
        className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 mb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {[
          {
            icon: Leaf,
            title: "AI-Based Waste Classification",
            description:
              "Upload waste images and let AI categorize them automatically.",
          },
          {
            icon: MapPin,
            title: "Report with Location",
            description:
              "Submit pickup requests with GPS-tagged location data.",
          },
          {
            icon: Recycle,
            title: "Impact Tracking",
            description:
              "Visualize your waste collection and CO₂ offset stats.",
          },
          {
            icon: Coins,
            title: "Earn & Redeem Tokens",
            description:
              "Receive tokens for reports and redeem for real-world rewards.",
          },
          {
            icon: Users,
            title: "Achievements & Badges",
            description: "Unlock eco-badges and celebrate your progress.",
          },
          {
            icon: Leaf,
            title: "Personal Progress Dashboard",
            description: "Track your contributions with detailed visual stats.",
          },
        ].map((feature, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className="hover:scale-105 transition-transform"
            />
          </motion.div>
        ))}
      </motion.section>

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
              <motion.div variants={fadeInUp}>
                <ImpactCard
                  title="Waste Collected (kg)"
                  value={impactData.wasteCollected}
                  icon={Recycle}
                  className="animate-fade-in"
                />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <ImpactCard
                  title="Reports Submitted"
                  value={impactData.reportsSubmitted}
                  icon={MapPin}
                  className="animate-fade-in"
                />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <ImpactCard
                  title="Tokens Earned"
                  value={impactData.tokensEarned}
                  icon={Coins}
                  className="animate-fade-in"
                />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <ImpactCard
                  title="CO₂ Offset (kg)"
                  value={impactData.co2Offset}
                  icon={Leaf}
                  className="animate-fade-in"
                />
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Why Green-Quest Section */}
      <motion.section
        className="bg-white border border-green-100 p-10 rounded-3xl shadow-lg mb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold mb-10 text-center text-gray-800">
          Why Green-Quest?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: Leaf,
              title: "Eco Impact",
              description:
                "Every action contributes to reducing waste and lowering CO₂ emissions.",
            },
            {
              icon: Users,
              title: "Community First",
              description:
                "Join a movement of people who care about the planet and act locally.",
            },
            {
              icon: Coins,
              title: "Rewards System",
              description:
                "Earn tokens for your efforts and redeem them for real-world rewards.",
            },
          ].map((card, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <card.icon className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                {card.title}
              </h3>
              <p className="text-gray-600">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
