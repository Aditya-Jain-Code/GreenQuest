import { db } from "../dbConfig";
import { Reports, Users } from "../schema";
import { and, desc, eq } from "drizzle-orm";
import { getUserByEmail } from "./users";
import { createReward } from "./rewards";
import { updateUserLevel } from "./helperActions";
import { awardUserBadges } from "./badges";
import { createTransaction } from "./transactions";
import { createNotification } from "./notifications";

// ✅ Fetch all pickup requests
export async function getAllPickupRequests() {
  try {
    const pickups = await db.select().from(Reports).execute();
    return pickups;
  } catch (error) {
    console.error("Error fetching pickup requests:", error);
    throw new Error("Failed to fetch pickup requests.");
  }
}

// ✅ Assign a collector to a pickup request
export async function assignCollector(reportId: number, collectorId: number) {
  try {
    await db
      .update(Reports)
      .set({ collectorId, status: "assigned" })
      .where(eq(Reports.id, reportId))
      .execute();
  } catch (error) {
    console.error("Error assigning collector:", error);
    throw new Error("Failed to assign collector.");
  }
}

// ✅ Unassign a collector from a pickup request
export async function unassignCollector(reportId: number) {
  try {
    await db
      .update(Reports)
      .set({ collectorId: null, status: "pending" })
      .where(eq(Reports.id, reportId))
      .execute();
  } catch (error) {
    console.error("Error unassigning collector:", error);
    throw new Error("Failed to unassign collector.");
  }
}

export const getAssignedPickups = async (email: string) => {
  const agent = await db
    .select({ id: Users.id })
    .from(Users)
    .where(eq(Users.email, email))
    .limit(1)
    .execute();

  if (!agent[0]) {
    throw new Error("Agent not found");
  }

  const pickups = await db
    .select({
      id: Reports.id,
      location: Reports.location,
      status: Reports.status,
      wasteType: Reports.wasteType,
      amount: Reports.amount,
    })
    .from(Reports)
    .where(eq(Reports.collectorId, agent[0].id))
    .execute();

  return pickups;
};

export const getPickupStats = async (email: string) => {
  const agent = await db
    .select({ id: Users.id })
    .from(Users)
    .where(eq(Users.email, email))
    .limit(1)
    .execute();

  if (!agent[0]) {
    throw new Error("Agent not found");
  }

  const assigned = await db
    .select()
    .from(Reports)
    .where(
      and(eq(Reports.collectorId, agent[0].id), eq(Reports.status, "assigned"))
    )
    .execute();

  const inProgress = await db
    .select()
    .from(Reports)
    .where(
      and(
        eq(Reports.collectorId, agent[0].id),
        eq(Reports.status, "in_progress")
      )
    )
    .execute();

  const completed = await db
    .select()
    .from(Reports)
    .where(
      and(eq(Reports.collectorId, agent[0].id), eq(Reports.status, "completed"))
    )
    .execute();

  return {
    assigned: assigned.length,
    inProgress: inProgress.length,
    completed: completed.length,
  };
};

export const getRecentPickups = async (email: string) => {
  const agent = await db
    .select({ id: Users.id })
    .from(Users)
    .where(eq(Users.email, email))
    .limit(1)
    .execute();

  if (!agent[0]) {
    return [];
  }

  const pickups = await db
    .select({
      id: Reports.id,
      location: Reports.location,
      status: Reports.status,
      wasteType: Reports.wasteType,
      amount: Reports.amount,
      updatedAt: Reports.updatedAt,
    })
    .from(Reports)
    .where(eq(Reports.collectorId, agent[0].id))
    .orderBy(desc(Reports.createdAt))
    .limit(5)
    .execute();

  return pickups;
};

export const getEarningsSummary = async (email: string) => {
  const agent = await db
    .select({ id: Users.id })
    .from(Users)
    .where(eq(Users.email, email))
    .limit(1)
    .execute();

  if (!agent[0]) {
    return {
      totalEarnings: 0,
      completedPickups: 0,
      earningsThisWeek: 0,
    };
  }

  const completedPickups = await db
    .select()
    .from(Reports)
    .where(
      and(eq(Reports.collectorId, agent[0].id), eq(Reports.status, "completed"))
    )
    .execute();

  const earningsThisWeek = completedPickups.filter((pickup) => {
    const updatedDate = new Date(pickup.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return updatedDate >= oneWeekAgo;
  }).length;

  return {
    totalEarnings: completedPickups.length * 50, // ₹50 per completed pickup
    completedPickups: completedPickups.length,
    earningsThisWeek,
  };
};

// Get Pickup Details by ID
export const getPickupDetails = async (pickupId: number) => {
  const pickup = await db
    .select()
    .from(Reports)
    .where(eq(Reports.id, pickupId))
    .limit(1)
    .execute();

  if (!pickup[0]) {
    throw new Error("Pickup not found.");
  }

  return pickup[0];
};

export type Pickup = {
  id: number;
  location: string;
  status: string;
  wasteType: string;
  amount: string;
  updatedAt: Date;
};

export type PickupStatus = "all" | "assigned" | "in_progress" | "completed";

// Update Pickup Status
export const updatePickupStatus = async (
  pickupId: number,
  newStatus: "assigned" | "in_progress" | "completed"
) => {
  try {
    // ✅ Update pickup status and updatedAt timestamp
    const [updatedPickup] = await db
      .update(Reports)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(Reports.id, pickupId))
      .returning()
      .execute();

    if (!updatedPickup) {
      throw new Error(`❌ Failed to update pickup status for ID ${pickupId}.`);
    }

    const { userId } = updatedPickup;

    // ✅ Check if the status is 'completed' and trigger reward, transaction, and notification
    if (newStatus === "completed") {
      const pointsEarned = 50; // Points for completing a pickup task
      const rewardName = "Pickup Task Completion";
      const rewardDescription =
        "Points awarded for successfully completing a pickup task.";

      // 🎁 Create a reward for the user
      await createReward(userId, pointsEarned, rewardName, rewardDescription);

      // 🔼 Update user's level and check for new badges
      await updateUserLevel(userId);
      await awardUserBadges(userId);

      // 💸 Create a transaction for the reward
      await createTransaction(
        userId,
        "earned_collect",
        pointsEarned,
        `Reward for completing pickup #${pickupId}`
      );

      // 🔔 Send notification to the user
      await createNotification(
        userId,
        `You have earned ${pointsEarned} points for completing a pickup task!`,
        "reward"
      );
    }

    return updatedPickup;
  } catch (error) {
    console.error(
      "❌ Error updating pickup status:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};

export const getPickupHistory = async (
  agentEmail: string,
  status?: "in_progress" | "completed"
) => {
  try {
    // Get agent details by email
    const agent = await getUserByEmail(agentEmail);
    if (!agent) {
      throw new Error("Agent not found.");
    }

    const agentId = agent.id;

    const condition = status
      ? and(eq(Reports.collectorId, agentId), eq(Reports.status, status))
      : eq(Reports.collectorId, agentId);

    const pickups = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        amount: Reports.amount,
        status: Reports.status,
        updatedAt: Reports.updatedAt,
      })
      .from(Reports)
      .where(condition) // ✅ Correct condition
      .execute();

    return pickups;
  } catch (error) {
    console.error("Error fetching pickup history:", error);
    throw new Error("Failed to load pickup history.");
  }
};
