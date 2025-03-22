import { db } from "../dbConfig";
import { UserBadges, Badges } from "../schema";
import { getUserProgress } from "./users";
import { createNotification } from "./notifications";
import { desc, eq } from "drizzle-orm";

// Define the type for badge criteria
type BadgeCriteria = {
  type:
    | "firstWasteCollected"
    | "wasteCollected"
    | "reportsSubmitted"
    | "rewardsRedeemed"
    | "co2Offset"
    | "userLevel"
    | "pickupTasksCompleted"; // Added pickup task completion support
  amount: number;
};

// Helper function to validate badge criteria
const isBadgeCriteria = (criteria: any): criteria is BadgeCriteria => {
  return (
    criteria &&
    typeof criteria === "object" &&
    [
      "firstWasteCollected",
      "wasteCollected",
      "reportsSubmitted",
      "rewardsRedeemed",
      "co2Offset",
      "userLevel",
      "pickupTasksCompleted",
    ].includes(criteria.type) &&
    typeof criteria.amount === "number"
  );
};

// Ensure 'userId' is a valid number
export const awardUserBadges = async (userId: number): Promise<void> => {
  try {
    // Fetch the user's progress data
    const userProgress = await getUserProgress(userId);

    // Helper function to extract numeric value from strings like "100 kg"
    const extractNumericValue = (value: string): number => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num; // Handle invalid or non-numeric values
    };

    // Fetch all available badges and user's current badges
    const [allBadges, userBadges] = await Promise.all([
      db.select().from(Badges).execute(),
      db
        .select({ badgeId: UserBadges.badgeId })
        .from(UserBadges)
        .where(eq(UserBadges.userId, userId))
        .execute(),
    ]);

    // Get badge IDs that the user already has
    const userBadgeIds = new Set(userBadges.map((badge) => badge.badgeId));

    // Identify new badges that need to be awarded
    const newBadges = allBadges.filter((badge) => {
      if (userBadgeIds.has(badge.id)) {
        console.log(
          `✅ User ${userId} already has badge ${badge.id}. Skipping.`
        );
        return false;
      }

      try {
        // Parse badge criteria
        const criteria = badge.criteria;

        // Validate criteria
        if (!isBadgeCriteria(criteria)) {
          console.warn(
            `⚠️ Invalid criteria for badge ${badge.id}:`,
            JSON.stringify(criteria)
          );
          return false;
        }

        // Check if the user meets the badge criteria
        switch (criteria.type) {
          case "firstWasteCollected":
            return extractNumericValue(userProgress.wasteCollected) > 0; // Award if collected any waste
          case "wasteCollected":
            const wasteAmount = extractNumericValue(
              userProgress.wasteCollected
            );
            return wasteAmount >= criteria.amount;
          case "reportsSubmitted":
            return userProgress.reportsSubmitted >= criteria.amount;
          case "rewardsRedeemed":
            return userProgress.rewardsRedeemed >= criteria.amount;
          case "co2Offset":
            return userProgress.co2Offset >= criteria.amount;
          case "pickupTasksCompleted":
            return userProgress.pickupTasksCompleted >= criteria.amount;
          case "userLevel":
            return userProgress.userLevel >= criteria.amount;
          default:
            console.warn(`⚠️ Unknown badge criteria type: ${criteria.type}`);
            return false;
        }
      } catch (error) {
        console.error(
          `❌ Error evaluating criteria for badge ${badge.id}:`,
          error
        );
        return false;
      }
    });

    // Award new badges if any criteria matched
    if (newBadges.length > 0) {
      await db.insert(UserBadges).values(
        newBadges.map((badge) => ({
          userId,
          badgeId: badge.id,
        }))
      );

      // Notify the user about the awarded badges
      const badgeNames = newBadges.map((badge) => badge.name).join(", ");
      const notificationMessage = `🎉 Congratulations! You've earned the following badges: ${badgeNames}`;
      await createNotification(userId, notificationMessage, "badge_award");

      console.log(
        `🏆 Awarded ${newBadges.length} new badges to user ${userId}`
      );
    } else {
      console.log(`🚫 No new badges to award for user ${userId}`);
    }
  } catch (error) {
    console.error(`❌ Error awarding badges for user ${userId}:`, error);
    throw error; // Re-throw for error handling
  }
};

// Fetch all badges
export async function getAllBadges() {
  return await db
    .select()
    .from(Badges)
    .orderBy(desc(Badges.createdAt))
    .execute();
}

// Create a new badge

export async function createBadge(
  name: string,
  description: string,
  category: string,
  criteria: any = {} // 👈 Default to empty object or provide real criteria
) {
  const [badge] = await db
    .insert(Badges)
    .values({ name, description, category, criteria })
    .returning()
    .execute();

  return badge; // ✅ Return the created badge properly
}

// Update an existing badge
export async function updateBadge(
  badgeId: number,
  name: string,
  description: string,
  category: string
) {
  return await db
    .update(Badges)
    .set({ name, description, category })
    .where(eq(Badges.id, badgeId))
    .returning()
    .execute();
}

// Delete a badge
export async function deleteBadge(badgeId: number) {
  return await db.delete(Badges).where(eq(Badges.id, badgeId)).execute();
}

export const getUserBadges = async (userId: number) => {
  return await db
    .select({
      id: Badges.id,
      name: Badges.name,
      description: Badges.description,
      category: Badges.category,
      awardedAt: UserBadges.awardedAt,
    })
    .from(UserBadges)
    .innerJoin(Badges, eq(UserBadges.badgeId, Badges.id))
    .where(eq(UserBadges.userId, userId))
    .orderBy(UserBadges.awardedAt);
};
