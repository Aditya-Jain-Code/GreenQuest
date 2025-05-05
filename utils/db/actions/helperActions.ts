import { db } from "../dbConfig";
import { Users, Reports, Transactions } from "../schema";
import { eq, and } from "drizzle-orm";
import { createNotification } from "./notifications";
import { awardUserBadges } from "./badges";

const calculateUserLevel = (
  waste: number,
  reports: number,
  points: number
): number => {
  if (waste >= 1000 || reports >= 400 || points >= 10000) return 10; // Level 10
  if (waste >= 800 || reports >= 320 || points >= 8000) return 9; // Level 9
  if (waste >= 600 || reports >= 240 || points >= 6000) return 8; // Level 8
  if (waste >= 500 || reports >= 200 || points >= 5000) return 7; // Level 7
  if (waste >= 400 || reports >= 160 || points >= 4000) return 6; // Level 6
  if (waste >= 300 || reports >= 120 || points >= 3000) return 5; // Level 5
  if (waste >= 200 || reports >= 80 || points >= 2000) return 4; // Level 4
  if (waste >= 100 || reports >= 60 || points >= 1500) return 3; // Level 3
  if (waste >= 50 || reports >= 40 || points >= 1000) return 2; // Level 2
  return 1; // Level 1
};

export const updateUserLevel = async (userId: number): Promise<void> => {
  try {
    // Fetch all necessary data in parallel
    const [completedReports, earnedTokens, userLevelData] = await Promise.all([
      db
        .select({ amount: Reports.amount })
        .from(Reports)
        .where(and(eq(Reports.userId, userId), eq(Reports.status, "completed")))
        .execute(),

      db
        .select({ amount: Transactions.amount })
        .from(Transactions)
        .where(
          and(
            eq(Transactions.userId, userId),
            eq(Transactions.type, "earned_collect")
          )
        )
        .execute(),

      db
        .select({ level: Users.level })
        .from(Users)
        .where(eq(Users.id, userId))
        .limit(1)
        .execute(),
    ]);

    const totalWaste = completedReports.reduce(
      (sum, report) => sum + (parseFloat(report.amount) || 0),
      0
    );

    const reportCount = completedReports.length;

    const totalPoints = earnedTokens.reduce((sum, txn) => sum + txn.amount, 0);

    const currentLevel = userLevelData[0]?.level ?? 1;
    const newLevel = calculateUserLevel(totalWaste, reportCount, totalPoints);

    if (newLevel !== currentLevel) {
      await db
        .update(Users)
        .set({ level: newLevel })
        .where(eq(Users.id, userId))
        .execute();

      await Promise.all([
        createNotification(userId, "🎉 You have leveled up!", "level_up"),
        awardUserBadges(userId),
      ]);

      console.info(
        `✅ User ${userId} leveled up from ${currentLevel} ➡️ ${newLevel}`
      );
    } else {
      console.info(`ℹ️ User ${userId} remains at Level ${currentLevel}`);
    }
  } catch (error) {
    console.error(`❌ Error updating level for user ${userId}:`, error);
    throw new Error("Failed to update user level.");
  }
};
