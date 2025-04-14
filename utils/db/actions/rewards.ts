import { db } from "../dbConfig";
import { Rewards, Transactions, Users } from "../schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { getUserBalance, createTransaction } from "./transactions";
import { createNotification } from "./notifications";
import { updateUserLevel } from "./helperActions";
import { awardUserBadges } from "./badges";

export async function getAvailableRewards(userId: number) {
  try {
    // Get user's total points correctly
    const userPoints = await getUserBalance(userId);

    // Get available rewards for this specific user
    const dbRewards = await db
      .select({
        id: Rewards.id,
        name: Rewards.name,
        cost: Rewards.points,
        description: Rewards.description,
        collectionInfo: Rewards.collectionInfo,
      })
      .from(Rewards)
      .where(and(eq(Rewards.isAvailable, true), eq(Rewards.userId, userId))) // Ensure rewards belong to the user
      .execute();

    // Combine user points with available rewards
    const allRewards = [
      {
        id: 0, // Special ID for user's points
        name: "Your Points",
        cost: userPoints, // Use the correct balance here
        description: "Redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste",
      },
      ...dbRewards,
    ];

    return allRewards;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
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
        name: Rewards.name,
        description: Rewards.description,
        collectionInfo: Rewards.collectionInfo, // ✅ Include this
        isAvailable: Rewards.isAvailable, // ✅ Include this
        userName: Users.name, // ✅ Join with Users table
      })
      .from(Rewards)
      .leftJoin(Users, eq(Rewards.userId, Users.id)) // Join with Users
      .orderBy(desc(Rewards.points)) // Sort by points
      .execute();

    return rewards;
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    return [];
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

export async function getReward(userId: number) {
  try {
    const [reward] = await db
      .select()
      .from(Rewards)
      .where(eq(Rewards.userId, userId))
      .limit(1) // Ensure only one record is fetched
      .execute();

    return reward || null; // Return the reward or null if not found
  } catch (error) {
    console.error("Error fetching reward:", error);
    return null;
  }
}

export async function createReward(
  userId: number,
  points: number,
  name: string,
  description: string
) {
  try {
    // Check if userId is valid before inserting
    const [userExists] = await db
      .select()
      .from(Users) // Assuming 'users' table name
      .where(eq(Users.id, userId))
      .limit(1)
      .execute();

    if (!userExists) {
      throw new Error(`User with ID ${userId} does not exist.`);
    }

    // Insert reward with dynamic name and description
    const [createdReward] = await db
      .insert(Rewards)
      .values({
        userId,
        name, // Pass name as parameter
        collectionInfo: "Points earned from waste report",
        points,
        level: 1,
        isAvailable: true,
        description, // Pass description as parameter
      })
      .returning({
        id: Rewards.id,
        userId: Rewards.userId,
        name: Rewards.name,
        collectionInfo: Rewards.collectionInfo,
        points: Rewards.points,
        level: Rewards.level,
        isAvailable: Rewards.isAvailable,
        description: Rewards.description,
        createdAt: Rewards.createdAt,
      })
      .execute();

    return createdReward;
  } catch (error) {
    console.error("❌ Error creating reward:", error);
    throw new Error("Failed to create reward.");
  }
}

export async function redeemReward(userId: number, rewardId: number) {
  try {
    const userReward = (await getReward(userId)) as any;

    if (rewardId === 0) {
      // Redeem all points
      const [updatedReward] = await db
        .update(Rewards)
        .set({
          points: 0,
          updatedAt: new Date(),
          isAvailable: false,
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      await updateUserLevel(userId);
      await awardUserBadges(userId);

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
        userReward.points <= availableReward[0].points
      ) {
        throw new Error("Insufficient points or invalid reward");
      }

      const [updatedReward] = await db
        .update(Rewards)
        .set({
          points: sql`${Rewards.points} - ${availableReward[0].points}`,
          updatedAt: new Date(),
          isAvailable: false,
        })
        .where(eq(Rewards.userId, userId))
        .returning()
        .execute();

      await updateUserLevel(userId);

      return updatedReward;
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
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
