// utils/db/dashboardActions.ts
import { db } from "@/utils/db/dbConfig";
import {
  Reports,
  Users,
  Transactions,
  BestAnswers,
  Votes,
  Comments,
  Posts,
} from "@/utils/db/schema";
import { and, eq } from "drizzle-orm";

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

export const deletePostByAdmin = async (postId: number, userId: number) => {
  // Check if the user performing the action is an admin
  const isAdmin = await db
    .select()
    .from(Users)
    .where(and(eq(Users.id, userId), eq(Users.role, "admin")))
    .limit(1);

  if (!isAdmin.length) {
    throw new Error("Unauthorized: Only admins can delete posts.");
  }

  // Delete best answer if it exists
  await db.delete(BestAnswers).where(eq(BestAnswers.postId, postId));

  // Delete votes associated with the post
  await db.delete(Votes).where(eq(Votes.postId, postId));

  // Delete comments associated with the post
  await db.delete(Comments).where(eq(Comments.postId, postId));

  // Finally, delete the post itself
  return await db.delete(Posts).where(eq(Posts.id, postId)).returning();
};
