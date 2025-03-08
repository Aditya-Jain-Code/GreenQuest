"use client";

import { useEffect, useState } from "react";
import UserProgressDashboard from "@/components/UserProgressDashboard";
import { db } from "@/utils/db/dbConfig";
import { Users, Reports, Rewards, Transactions } from "@/utils/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { useRouter } from "next/navigation";

// Type definition for user progress
interface UserProgress {
  wasteCollected: string;
  reportsSubmitted: number;
  rewardsRedeemed: number;
  co2Offset: number;
  pointsEarned: number;
  userLevel: number;
}

// Fetch userId using userEmail from localStorage
const getUserIdByEmail = async (userEmail: string) => {
  const user = await db
    .select({ id: Users.id })
    .from(Users)
    .where(eq(Users.email, userEmail))
    .limit(1)
    .execute();

  return user[0]?.id || null;
};

// Fetch user progress
const getUserProgress = async (userId: number): Promise<UserProgress> => {
  // 1. Total Waste Collected
  const wasteData = await db
    .select({ amount: Reports.amount })
    .from(Reports)
    .where(and(eq(Reports.userId, userId), eq(Reports.status, "completed")));

  const totalWaste = wasteData.reduce((sum, report) => {
    const amount = parseFloat(report.amount) || 0;
    return sum + amount;
  }, 0);

  // 2. Verified Reports Submitted
  const totalReports = await db
    .select()
    .from(Reports)
    .where(and(eq(Reports.userId, userId), eq(Reports.status, "completed")))
    .execute();

  // 3. Rewards Redeemed
  const redeemedRewards = await db
    .select()
    .from(Rewards)
    .where(and(eq(Rewards.userId, userId), eq(Rewards.isAvailable, false)))
    .execute();

  // 4. CO₂ Offset Calculation (1kg waste = 0.5kg CO₂ offset)
  const co2Offset = totalWaste * 0.5;

  // 5. Total Points Earned
  const totalPoints = await db
    .select({ amount: Transactions.amount })
    .from(Transactions)
    .where(
      and(
        eq(Transactions.userId, userId),
        eq(Transactions.type, "earned_collect")
      )
    )
    .execute();

  const totalPointsEarned = totalPoints.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );

  // 6. User Level (Highest level achieved)
  const reward = await db
    .select({ level: Users.level })
    .from(Users)
    .where(eq(Users.id, userId))
    .orderBy(desc(Users.level))
    .limit(1)
    .execute();

  return {
    wasteCollected: `${totalWaste} kg`,
    reportsSubmitted: totalReports.length,
    rewardsRedeemed: redeemedRewards.length,
    co2Offset,
    pointsEarned: totalPointsEarned,
    userLevel: reward[0]?.level || 1,
  };
};

const DashboardPage = () => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        router.push("/login");
        return;
      }

      try {
        const userId = await getUserIdByEmail(userEmail);
        if (!userId) {
          router.push("/login");
          return;
        }

        const progress = await getUserProgress(userId);
        setUserProgress(progress);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    fetchUserData();
  }, [router]);

  if (!userProgress) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8">
      <UserProgressDashboard {...userProgress} />
    </div>
  );
};

export default DashboardPage;
