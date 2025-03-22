import { db } from "../dbConfig";
import { Reports, Rewards, Users } from "../schema";
import { and, desc, eq } from "drizzle-orm";

export async function createUser(email: string, name: string) {
  try {
    const [existingUser] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email.toLowerCase())) // Case-insensitive
      .limit(1) // Return only one user
      .execute();

    if (existingUser) {
      return existingUser;
    }

    const [user] = await db
      .insert(Users)
      .values({ email: email.toLowerCase(), name })
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
      .where(eq(Users.email, email.toLowerCase()))
      .limit(1)
      .execute();
    return user || null; // Return null if not found
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export const getUserById = async (userId: number) => {
  const result = await db
    .select({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      level: Users.level,
      createdAt: Users.createdAt,
    })
    .from(Users)
    .where(eq(Users.id, userId))
    .limit(1)
    .execute();

  return result[0] || null;
};

// Get all users with optional search and limit
export const getAllUsers = async (limit?: number) => {
  const result = await db
    .select({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      level: Users.level,
      createdAt: Users.createdAt,
      role: Users.role,
    })
    .from(Users)
    .orderBy(desc(Users.createdAt)) // Order by created date
    .limit(limit || 10) // Default limit to 10 if not provided
    .execute();

  return result;
};

// Update user details
export const updateUser = async (
  userId: number,
  data: Partial<{ name: string; email: string; level: number }>
) => {
  await db.update(Users).set(data).where(eq(Users.id, userId)).execute();
};

export async function deleteUser(userId: number) {
  try {
    const deleted = await db
      .delete(Users)
      .where(eq(Users.id, userId))
      .execute();
    if (deleted.rowCount === 0) throw new Error("User not found.");

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

export const getUserIdByEmail = async (userEmail: string) => {
  const user = await db
    .select({ id: Users.id })
    .from(Users)
    .where(eq(Users.email, userEmail.toLowerCase()))
    .limit(1)
    .execute();

  return user[0]?.id || null;
};

// Define UserProgress interface with added 'pickupTasksCompleted'
export interface UserProgress {
  wasteCollected: string;
  reportsSubmitted: number;
  rewardsRedeemed: number;
  co2Offset: number;
  pointsEarned: number;
  userLevel: number;
  pickupTasksCompleted: number;
}

export const getUserProgress = async (
  userId: number
): Promise<UserProgress> => {
  try {
    const [completedReports, redeemedRewards, earnedPoints, userLevelData] =
      await Promise.all([
        db
          .select({
            amount: Reports.amount,
          })
          .from(Reports)
          .where(
            and(eq(Reports.userId, userId), eq(Reports.status, "completed"))
          )
          .execute(),

        db
          .select()
          .from(Rewards)
          .where(
            and(eq(Rewards.userId, userId), eq(Rewards.isAvailable, false))
          )
          .execute(),

        db
          .select({ points: Rewards.points })
          .from(Rewards)
          .where(and(eq(Rewards.userId, userId), eq(Rewards.isAvailable, true)))
          .execute(),

        db
          .select({ level: Users.level })
          .from(Users)
          .where(eq(Users.id, userId))
          .limit(1)
          .execute(),
      ]);

    const totalWaste = completedReports.reduce(
      (sum, report) => sum + (parseFloat(report.amount as string) || 0),
      0
    );

    const totalPointsEarned = earnedPoints.reduce(
      (sum, txn) => sum + (Number(txn.points) || 0),
      0
    );

    const userLevel = userLevelData[0]?.level ?? 1;

    const co2Offset = totalWaste * 0.5;

    return {
      wasteCollected: `${totalWaste.toFixed(2)} kg`, // 2 decimal precision
      reportsSubmitted: completedReports.length,
      rewardsRedeemed: redeemedRewards.length,
      co2Offset: parseFloat(co2Offset.toFixed(2)), // CO₂ offset formatted
      pointsEarned: totalPointsEarned,
      userLevel,
      pickupTasksCompleted: completedReports.length, // Same as completed reports
    };
  } catch (error) {
    console.error("❌ Error fetching user progress:", error);
    throw new Error("Failed to fetch user progress.");
  }
};

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  level: number;
}

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const user = await db
    .select({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      level: Users.level,
    })
    .from(Users)
    .where(eq(Users.id, userId))
    .limit(1)
    .execute();

  if (!user[0]) {
    throw new Error("User not found"); // Or return a default object with an id
  }
  return user[0];
};

export const getRecentUsers = async (limit: number) => {
  return await db
    .select({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      createdAt: Users.createdAt,
    })
    .from(Users)
    .orderBy(desc(Users.createdAt))
    .limit(limit)
    .execute();
};

// Get users with pagination
export const getUsersWithPagination = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const result = await db
    .select({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      level: Users.level,
      createdAt: Users.createdAt,
    })
    .from(Users)
    .orderBy(desc(Users.createdAt))
    .offset(offset)
    .limit(limit)
    .execute();

  const totalUsers = await db.select({ count: Users.id }).from(Users).execute();

  const totalCount = totalUsers[0]?.count ? Number(totalUsers[0]?.count) : 0;

  return {
    users: result,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    totalUsers: totalCount,
  };
};

// Update user role by admin
export const updateUserRole = async (userId: number, role: string) => {
  await db.update(Users).set({ role }).where(eq(Users.id, userId)).execute();
};
