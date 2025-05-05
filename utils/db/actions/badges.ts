import { db } from "../dbConfig";
import { UserBadges, Badges } from "../schema";
import { getUserProgress } from "./users";
import { createNotification } from "./notifications";
import { desc, eq } from "drizzle-orm";

type BadgeCriteriaType =
  | "firstWasteCollected"
  | "wasteCollected"
  | "reportsSubmitted"
  | "rewardsRedeemed"
  | "co2Offset"
  | "userLevel"
  | "pickupTasksCompleted";

export const awardUserBadges = async (userId: number) => {
  try {
    const badges = await db.select().from(Badges).execute();
    if (!badges.length) return;

    const awardedBadges = await db
      .select({ badgeId: UserBadges.badgeId })
      .from(UserBadges)
      .where(eq(UserBadges.userId, userId))
      .execute();

    const awardedBadgeIds = new Set(awardedBadges.map((b) => b.badgeId));

    const progress = await getUserProgress(userId);

    const wasteCollectedKg = parseFloat(
      progress.wasteCollected.replace(" kg", "")
    );

    const badgeAwardsToInsert: { userId: number; badgeId: number }[] = [];

    for (const badge of badges) {
      if (awardedBadgeIds.has(badge.id)) continue;

      const criteria = badge.criteria as {
        type: BadgeCriteriaType;
        amount: number;
      };
      let isEligible = false;

      switch (criteria.type) {
        case "firstWasteCollected":
          isEligible = wasteCollectedKg >= 1;
          break;
        case "wasteCollected":
          isEligible = wasteCollectedKg >= criteria.amount;
          break;
        case "reportsSubmitted":
          isEligible = progress.reportsSubmitted >= criteria.amount;
          break;
        case "rewardsRedeemed":
          isEligible = progress.rewardsRedeemed >= criteria.amount;
          break;
        case "co2Offset":
          isEligible = progress.co2Offset >= criteria.amount;
          break;
        case "userLevel":
          isEligible = progress.userLevel >= criteria.amount;
          break;
        case "pickupTasksCompleted":
          isEligible = progress.pickupTasksCompleted >= criteria.amount;
          break;
      }

      if (isEligible) {
        badgeAwardsToInsert.push({
          userId,
          badgeId: badge.id,
        });

        // ✅ Create notification for the badge earned
        await createNotification(
          userId,
          `🏅 Congratulations! You have earned the "${badge.name}" badge.`,
          "badge"
        );
      }
    }

    if (badgeAwardsToInsert.length > 0) {
      await db.insert(UserBadges).values(badgeAwardsToInsert).execute();
      console.log(
        `🏅 Awarded ${badgeAwardsToInsert.length} badges to user ${userId}`
      );
    } else {
      console.log(`ℹ️ No new badges awarded for user ${userId}`);
    }
  } catch (error) {
    console.error("❌ Error awarding badges:", error);
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

export interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  awardedAt: Date;
}
