"use client";

import React, { useEffect, useState } from "react";
import { getUserBadges } from "@/utils/db/actions/badges";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircleIcon, LockIcon } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  awardedAt: Date | null;
}

interface UserBadgesProps {
  userId: number;
}

const UserBadges: React.FC<UserBadgesProps> = ({ userId }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const userBadges = await getUserBadges(userId);
        setBadges(userBadges);
      } catch (err) {
        setError("Failed to fetch badges. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center p-8 text-gray-500 animate-pulse">
        🔄 Loading your badges...
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (badges.length === 0) {
    return (
      <div className="text-center p-8">
        🏆 No badges earned yet. Keep going!
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-8">
        <h2 className="text-4xl font-extrabold mb-12 text-center text-indigo-700">
          🏆 Your Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {badges.map((badge) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Card
                  className={`relative overflow-hidden rounded-3xl p-6 transition-transform hover:scale-105 duration-300 ${
                    badge.awardedAt
                      ? "bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 text-white shadow-2xl hover:brightness-110"
                      : "bg-gray-200 text-gray-400 opacity-60 blur-[1px]"
                  }`}
                >
                  {/* ✨ Shine effect layer */}
                  {badge.awardedAt && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine z-10 pointer-events-none" />
                  )}
                  <CardContent className="relative flex flex-col items-center justify-between h-full z-20">
                    <div className="text-5xl mb-4">
                      {badge.awardedAt ? "🏅" : "🔒"}
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{badge.name}</p>
                    </div>
                    {badge.awardedAt ? (
                      <CheckCircleIcon
                        className="absolute top-3 right-3 text-white drop-shadow-lg"
                        size={24}
                      />
                    ) : (
                      <LockIcon
                        className="absolute top-3 right-3 text-gray-500"
                        size={24}
                      />
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-5 bg-white border border-gray-300 rounded-2xl shadow-xl">
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-lg text-gray-800">
                    {badge.name}
                  </p>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                  {badge.awardedAt ? (
                    <p className="mt-2 text-xs text-green-700">
                      🗓️ Earned:{" "}
                      {new Date(badge.awardedAt).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-gray-400">
                      🔒 Not earned yet
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UserBadges;
