// utils/db/dashboardActions.ts
import { db } from "@/utils/db/dbConfig";
import { Reports, Users, Transactions, UserBadges } from "@/utils/db/schema";
import { eq } from "drizzle-orm";

// Get Dashboard Stats
export const getDashboardStats = async () => {
  try {
    // Fetch all data concurrently
    const [reportStats, userStats, tokenStats, co2OffsetStats] =
      await Promise.all([
        db.select().from(Reports).execute(),
        db.select().from(Users).execute(),
        db
          .select({ amount: Transactions.amount })
          .from(Transactions)
          .where(eq(Transactions.type, "redeemed"))
          .execute(),
        db
          .select({ amount: Reports.amount })
          .from(Reports)
          .where(eq(Reports.status, "completed"))
          .execute(),
      ]);

    // Calculate Report Stats
    const totalReports = reportStats.length;
    const pendingReports = reportStats.filter(
      (report) => report.status === "pending"
    ).length;
    const completedReports = reportStats.filter(
      (report) => report.status === "completed"
    ).length;

    // Total Users
    const totalUsers = userStats.length;

    // Total Tokens Redeemed
    const tokensRedeemed = tokenStats.reduce(
      (sum, tx) => sum + (tx.amount || 0),
      0
    );

    // Calculate CO₂ Offset (in kg)
    const co2Offset = co2OffsetStats.reduce(
      (sum, report) => sum + parseFloat(report.amount || "0"),
      0
    );

    // Return aggregated stats
    return {
      totalReports,
      pendingReports,
      completedReports,
      totalUsers,
      tokensRedeemed,
      co2Offset,
    };
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats.");
  }
};
