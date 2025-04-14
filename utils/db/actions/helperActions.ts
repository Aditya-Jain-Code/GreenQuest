import { db } from "../dbConfig";
import { Users, Reports, Transactions } from "../schema";
import { eq, and } from "drizzle-orm";
import { createNotification } from "./notifications";

const calculateUserLevel = (waste: number, reports: number, points: number) => {
  if (waste >= 500 || reports >= 200 || points >= 5000) return 5;
  if (waste >= 300 || reports >= 100 || points >= 3000) return 4;
  if (waste >= 150 || reports >= 50 || points >= 1500) return 3;
  if (waste >= 50 || reports >= 20 || points >= 500) return 2;
  return 1;
};

export const updateUserLevel = async (userId: number) => {
  try {
    // Fetch user's total waste from completed reports
    const wasteData = await db
      .select({ amount: Reports.amount })
      .from(Reports)
      .where(and(eq(Reports.userId, userId), eq(Reports.status, "completed")))
      .execute();

    const totalWaste = wasteData.reduce(
      (sum, report) => sum + (parseFloat(report.amount) || 0),
      0
    );

    // Get completed reports count
    const reportCount = wasteData.length;

    // Fetch user's total earned points
    const tokenData = await db
      .select({ amount: Transactions.amount })
      .from(Transactions)
      .where(
        and(
          eq(Transactions.userId, userId),
          eq(Transactions.type, "earned_collect")
        )
      )
      .execute();

    const totalPoints = tokenData.reduce((sum, txn) => sum + txn.amount, 0);

    // Calculate user's new level
    const newLevel = calculateUserLevel(totalWaste, reportCount, totalPoints);

    await createNotification(userId, "You have leveled up.", "level_up");

    // Update the user's level in the database if changed
    await db
      .update(Users)
      .set({ level: newLevel }) // Ensure 'level' is now valid
      .where(eq(Users.id, userId))
      .execute();
  } catch (error) {
    console.error(`Error updating level for user ${userId}:`, error);
    throw error;
  }
};
