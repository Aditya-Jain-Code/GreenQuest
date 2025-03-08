import { db } from "./dbConfig";
import {
  Users,
  Reports,
  Rewards,
  CollectedWastes,
  Notifications,
  Transactions,
} from "./schema";
import { eq, sql, and, desc } from "drizzle-orm";

export async function createUser(email: string, name: string) {
  try {
    const existingUser = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .execute();

    if (existingUser.length > 0) {
      return existingUser[0]; // Return the existing user
    }

    // Insert new user if they don't exist
    const [user] = await db
      .insert(Users)
      .values({ email, name })
      .returning()
      .execute();

    return user;
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .execute();
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function getUnreadNotifications(userId: number) {
  try {
    return await db
      .select()
      .from(Notifications)
      .where(
        and(eq(Notifications.userId, userId), eq(Notifications.isRead, false))
      )
      .execute();
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}

export async function getRewardTransactions(userId: number) {
  try {
    console.log("Fetching transactions for user ID:", userId);
    const transactions = await db
      .select({
        id: Transactions.id,
        type: Transactions.type,
        amount: Transactions.amount,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .where(eq(Transactions.userId, userId))
      .orderBy(desc(Transactions.date))
      .limit(10)
      .execute();

    console.log("Raw transactions from database:", transactions);

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      date: t.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
    }));

    console.log("Formatted transactions:", formattedTransactions);
    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return [];
  }
}

export async function getUserBalance(userId: number): Promise<number> {
  const transactions = await getRewardTransactions(userId);
  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type.startsWith("earned")
      ? acc + transaction.amount
      : acc - transaction.amount;
  }, 0);
  return Math.max(balance, 0); // Ensure balance is never negative
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    await db
      .update(Notifications)
      .set({ isRead: true })
      .where(eq(Notifications.id, notificationId))
      .execute();
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function getAvailableRewards(userId: number) {
  try {
    console.log("Fetching available rewards for user:", userId);

    // Get user's total points
    const userTransactions = await getRewardTransactions(userId);
    const userPoints = userTransactions.reduce((total, transaction) => {
      return transaction.type.startsWith("earned")
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);

    console.log("User total points:", userPoints);

    // Get available rewards from the database
    const dbRewards = await db
      .select({
        id: Rewards.id,
        name: Rewards.name,
        cost: Rewards.points,
        description: Rewards.description,
        collectionInfo: Rewards.collectionInfo,
      })
      .from(Rewards)
      .where(eq(Rewards.isAvailable, true))
      .execute();

    console.log("Rewards from database:", dbRewards);

    // Combine user points and database rewards
    const allRewards = [
      {
        id: 0, // Use a special ID for user's points
        name: "Your Points",
        cost: userPoints,
        description: "Redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste",
      },
      ...dbRewards,
    ];

    console.log("All available rewards:", allRewards);
    return allRewards;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return [];
  }
}

export async function getRecentReports(limit: number = 10) {
  try {
    const reports = await db
      .select()
      .from(Reports)
      .orderBy(desc(Reports.createdAt))
      .limit(limit)
      .execute();
    return reports;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}
export async function getAllRewards() {
  try {
    const rewards = await db
      .select({
        id: Rewards.id,
        userId: Rewards.userId,
        points: Rewards.points,
        level: Rewards.level,
        createdAt: Rewards.createdAt,
        name: Rewards.name, // Add this field
        description: Rewards.description, // Add this field
        userName: Users.name, // This is from the Users table
      })
      .from(Rewards)
      .leftJoin(Users, eq(Rewards.userId, Users.id)) // Join with Users table
      .orderBy(desc(Rewards.points)) // Order by points in descending order
      .execute();

    return rewards;
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    return [];
  }
}

export async function getWasteCollectionTasks(limit: number = 20) {
  try {
    const tasks = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        status: Reports.status,
        date: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .limit(limit)
      .execute();

    return tasks.map((task) => ({
      ...task,
      date: task.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
    }));
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return [];
  }
}

export async function createNotification(
  userId: number,
  message: string,
  type: string
) {
  try {
    const [notification] = await db
      .insert(Notifications)
      .values({ userId, message, type })
      .returning()
      .execute();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function updateRewardPoints(userId: number, pointsToAdd: number) {
  try {
    // Check if the "Waste Reporting Reward" exists for the user
    const existingReward = await db
      .select()
      .from(Rewards)
      .where(eq(Rewards.userId, userId))
      .execute();

    // If the reward doesn't exist, create it
    if (existingReward.length === 0) {
      await db
        .insert(Rewards)
        .values({
          userId: userId,
          name: "Waste Reporting Reward",
          points: 0, // Start with 0 points
          level: 1, // Default level
          description: "Reward for reporting waste in the app.",
          collectionInfo:
            "This reward is automatically awarded for reporting waste.",
          isAvailable: true,
        })
        .execute();
    }

    // Update the reward points
    const [updatedReward] = await db
      .update(Rewards)
      .set({
        points: sql`${Rewards.points} + ${pointsToAdd}`,
        updatedAt: new Date(),
      })
      .where(eq(Rewards.userId, userId))
      .returning()
      .execute();

    return updatedReward;
  } catch (error) {
    console.error("Error updating reward points:", error);
    return null;
  }
}

export async function createTransaction(
  userId: number,
  type: "earned_report" | "earned_collect" | "redeemed",
  amount: number,
  description: string
) {
  try {
    const [transaction] = await db
      .insert(Transactions)
      .values({ userId, type, amount, description })
      .returning()
      .execute();
    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  verificationResult?: any
) {
  try {
    const [report] = await db
      .insert(Reports)
      .values({
        userId,
        location,
        wasteType,
        amount,
        imageUrl,
        verificationResult,
        status: "pending",
      })
      .returning()
      .execute();

    // Award 10 points for reporting waste
    const pointsEarned = 10;
    await updateRewardPoints(userId, pointsEarned);

    // Create a transaction for the earned points
    await createTransaction(
      userId,
      "earned_report",
      pointsEarned,
      "Points earned for making a waste report."
    );

    // Create a notification for the user
    await createNotification(
      userId,
      `You've earned ${pointsEarned} points for reporting waste!`,
      "reward"
    );

    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    return null;
  }
}

export async function updateTaskStatus(
  reportId: number,
  newStatus: string,
  collectorId?: number
) {
  try {
    const updateData: any = { status: newStatus };
    if (collectorId !== undefined) {
      updateData.collectorId = collectorId;
    }
    const [updatedReport] = await db
      .update(Reports)
      .set(updateData)
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();
    return updatedReport;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

export async function saveReward(
  userId: number,
  amount: number,
  name: string, // Add this parameter
  description: string
) {
  try {
    const [reward] = await db
      .insert(Rewards)
      .values({
        userId,
        name, // Use the name parameter
        collectionInfo: "Points earned from waste collection",
        points: amount,
        level: 1,
        isAvailable: true,
        description: description,
      })
      .returning()
      .execute();

    // Create a transaction for this reward
    await createTransaction(userId, "earned_collect", amount, description);

    // Create a notification for the user
    await createNotification(
      userId,
      `You've earned ${amount} points for waste report completion!`,
      "reward"
    );

    return reward;
  } catch (error) {
    console.error("Error saving reward:", error);
    throw error;
  }
}

export async function saveCollectedWaste(
  reportId: number,
  collectorId: number
) {
  try {
    const [collectedWaste] = await db
      .insert(CollectedWastes)
      .values({
        reportId,
        collectorId,
        collectionDate: new Date(),
        status: "verified",
      })
      .returning()
      .execute();
    return collectedWaste;
  } catch (error) {
    console.error("Error saving collected waste:", error);
    throw error;
  }
}

export async function getOrCreateReward(userId: number) {
  try {
    let [reward] = await db
      .select()
      .from(Rewards)
      .where(eq(Rewards.userId, userId))
      .execute();
    if (!reward) {
      [reward] = await db
        .insert(Rewards)
        .values({
          userId,
          name: "Default Reward",
          collectionInfo: "Default Collection Info",
          points: 0,
          level: 1,
          isAvailable: true,
        })
        .returning()
        .execute();
    }
    return reward;
  } catch (error) {
    console.error("Error getting or creating reward:", error);
    return null;
  }
}

export async function redeemReward(userId: number, rewardId: number) {
  try {
    const userReward = (await getOrCreateReward(userId)) as any;

    if (rewardId === 0) {
      // Redeem all points
      const [updatedReward] = await db
        .update(Rewards)
        .set({
          points: 0,
          updatedAt: new Date(),
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      // Create a transaction for this redemption
      await createTransaction(
        userId,
        "redeemed",
        userReward.points,
        `Redeemed all points: ${userReward.points}`
      );

      return updatedReward;
    } else {
      // Existing logic for redeeming specific rewards
      const availableReward = await db
        .select()
        .from(Rewards)
        .where(eq(Rewards.id, rewardId))
        .execute();

      if (
        !userReward ||
        !availableReward[0] ||
        userReward.points < availableReward[0].points
      ) {
        throw new Error("Insufficient points or invalid reward");
      }

      const [updatedReward] = await db
        .update(Rewards)
        .set({
          points: sql`${Rewards.points} - ${availableReward[0].points}`,
          updatedAt: new Date(),
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      // Create a transaction for this redemption
      await createTransaction(
        userId,
        "redeemed",
        availableReward[0].points,
        `Redeemed: ${availableReward[0].name}`
      );

      return updatedReward;
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const users = await db.select().from(Users).execute();
    console.log(`✅ Retrieved ${users.length} users.`);
    return users;
  } catch (error) {
    console.error(
      "❌ Error fetching users:",
      error instanceof Error ? error.message : "Unknown error occurred"
    );
    return [];
  }
}

export async function deleteUser(userId: number) {
  try {
    const deleted = await db
      .delete(Users)
      .where(eq(Users.id, userId))
      .execute();
    if (deleted.rowCount === 0) throw new Error("User not found.");

    console.log(`✅ User with ID ${userId} deleted.`);
    return { success: true };
  } catch (error) {
    console.error(
      "❌ Error deleting user:",
      error instanceof Error ? error.message : "Unknown error occurred"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAllReports() {
  try {
    const reports = await db
      .select({
        id: Reports.id,
        userId: Reports.userId,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        imageUrl: Reports.imageUrl,
        status: Reports.status,
        createdAt: Reports.createdAt,
        collectorId: Reports.collectorId,
      })
      .from(Reports)
      .orderBy(desc(Reports.createdAt))
      .execute();

    console.log(`✅ Retrieved ${reports.length} reports.`);
    return reports;
  } catch (error) {
    console.error(
      "❌ Error fetching reports:",
      error instanceof Error ? error.message : "Unknown error occurred"
    );
    return [];
  }
}

export async function deleteReport(reportId: number) {
  try {
    const deleted = await db
      .delete(Reports)
      .where(eq(Reports.id, reportId))
      .execute();
    if (deleted.rowCount === 0) throw new Error("Report not found.");

    console.log(`✅ Report with ID ${reportId} deleted.`);
    return { success: true };
  } catch (error) {
    console.error(
      "❌ Error deleting report:",
      error instanceof Error ? error.message : "Unknown error occurred"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteReward(rewardId: number) {
  try {
    // Ensure the reward exists before deleting
    const rewardExists = await db
      .select()
      .from(Rewards)
      .where(eq(Rewards.id, rewardId))
      .execute();

    if (!rewardExists.length) {
      throw new Error(`Reward with ID ${rewardId} not found.`);
    }

    // Get the userId from the reward
    const userId = rewardExists[0].userId;

    // Optional: Delete transactions related to the reward (if needed)
    // This assumes that reward-related transactions have a specific description or type
    await db
      .delete(Transactions)
      .where(
        and(
          eq(Transactions.userId, userId), // Filter by user
          eq(Transactions.type, "earned_collect") // Filter by transaction type
        )
      )
      .execute();

    // Delete the reward
    const deleted = await db
      .delete(Rewards)
      .where(eq(Rewards.id, rewardId))
      .returning()
      .execute();

    if (!deleted.length) {
      throw new Error(`Failed to delete reward with ID ${rewardId}.`);
    }

    console.log(`✅ Reward with ID ${rewardId} deleted.`);
    return { success: true };
  } catch (error) {
    console.error(
      "❌ Error deleting reward:",
      error instanceof Error ? error.message : "Unknown error occurred"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const VALID_STATUSES = ["pending", "in_progress", "completed", "cancelled"];

export async function updateReportStatus(reportId: number, newStatus: string) {
  try {
    // Validate status
    if (!VALID_STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    // Ensure report exists
    const existingReport = await db
      .select()
      .from(Reports)
      .where(eq(Reports.id, reportId))
      .limit(1)
      .execute();

    if (existingReport.length === 0) {
      throw new Error(`Report with ID ${reportId} not found.`);
    }

    // Update the report status
    const [updatedReport] = await db
      .update(Reports)
      .set({ status: newStatus })
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();

    console.log(`✅ Report ID ${reportId} status updated to ${newStatus}`);
    return { success: true, updatedReport };
  } catch (error) {
    console.error(
      "❌ Error updating report status:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
