"use client";

import React, { useEffect, useState } from "react";
import { getUserBadges } from "@/utils/db/actions";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  awardedAt: Date | null; // Null if not earned
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

  if (loading)
    return (
      <div className="text-center p-8 text-gray-500 animate-pulse">
        🔄 Loading your badges...
      </div>
    );
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (badges.length === 0)
    return (
      <div className="text-center p-8">
        🏆 No badges earned yet. Keep going!
      </div>
    );

  return (
    <TooltipProvider>
      <div className="p-8">
        <h2 className="text-4xl font-extrabold mb-12 text-center text-blue-800">
          🏅 Your Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {badges.map((badge) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Card
                  className={`relative overflow-hidden rounded-2xl p-8 transition-transform transform hover:scale-110 shadow-xl ${
                    badge.awardedAt
                      ? "bg-gradient-to-br from-blue-200 to-blue-400"
                      : "bg-gray-200 opacity-60"
                  }`}
                >
                  <CardContent className="flex flex-col items-center justify-between h-full">
                    <div className="text-5xl mb-6">
                      {badge.awardedAt ? "🌟" : "🔒"}
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">
                        {badge.name}
                      </p>
                    </div>
                    {badge.awardedAt ? (
                      <CheckCircleIcon
                        className="absolute top-4 right-4 text-blue-700"
                        size={28}
                      />
                    ) : (
                      <XCircleIcon
                        className="absolute top-4 right-4 text-gray-500"
                        size={28}
                      />
                    )}
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-6 bg-white shadow-xl rounded-2xl border border-gray-300">
                <p className="text-base text-gray-800">{badge.description}</p>
                {badge.awardedAt ? (
                  <p className="mt-3 text-sm text-blue-700">
                    🗓️ Earned on:{" "}
                    {new Date(badge.awardedAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-gray-600">
                    🔒 Not yet earned
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UserBadges;
