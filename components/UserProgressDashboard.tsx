import React from "react";
import {
  FaLeaf,
  FaRecycle,
  FaGift,
  FaCloud,
  FaStar,
  FaLevelUpAlt,
} from "react-icons/fa";

interface UserProgressProps {
  wasteCollected: string;
  reportsSubmitted: number;
  rewardsRedeemed: number;
  co2Offset: number;
  pointsEarned: number;
  userLevel: number;
}

const UserProgressDashboard: React.FC<UserProgressProps> = ({
  wasteCollected,
  reportsSubmitted,
  rewardsRedeemed,
  co2Offset,
  pointsEarned,
  userLevel,
}) => {
  const stats = [
    {
      title: "Waste Collected",
      value: wasteCollected,
      icon: <FaRecycle />,
      color: "from-green-400 to-green-600",
    },
    {
      title: "Reports Completed",
      value: reportsSubmitted,
      icon: <FaLeaf />,
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "Rewards Redeemed",
      value: rewardsRedeemed,
      icon: <FaGift />,
      color: "from-yellow-400 to-yellow-600",
    },
    {
      title: "CO₂ Offset (kg)",
      value: `${co2Offset.toFixed(2)} kg`,
      icon: <FaCloud />,
      color: "from-teal-400 to-teal-600",
    },
    {
      title: "Points Earned",
      value: pointsEarned,
      icon: <FaStar />,
      color: "from-purple-400 to-purple-600",
    },
    {
      title: "Level",
      value: `Level ${userLevel}`,
      icon: <FaLevelUpAlt />,
      color: "from-pink-400 to-pink-600",
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-b from-green-50 to-green-100 rounded-lg shadow-xl">
      <h2 className="text-4xl font-extrabold mb-8 text-green-700 text-center">
        Your Progress 🌱
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-r ${stat.color} p-6 rounded-xl shadow-lg text-white flex items-center transform transition-transform hover:scale-105`}
          >
            <div className="text-4xl">{stat.icon}</div>
            <div className="ml-6">
              <h3 className="text-2xl font-semibold">{stat.title}</h3>
              <p className="text-3xl mt-2 font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProgressDashboard;
