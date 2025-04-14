import { db } from "../dbConfig";
import { Reports, Users } from "../schema";
import { desc, eq, sql } from "drizzle-orm";
import { createNotification } from "./notifications";
import { createTransaction } from "./transactions";
import { createReward } from "./rewards";
import { updateUserLevel } from "./helperActions";
import { awardUserBadges } from "./badges";

export const getRecentReports = async (limit: number = 10) => {
  const reports = await db
    .select({
      id: Reports.id,
      userName: Users.name,
      wasteType: Reports.wasteType,
      status: Reports.status,
      createdAt: Reports.createdAt,
      amount: Reports.amount,
      location: Reports.location,
    })
    .from(Reports)
    .leftJoin(Users, eq(Reports.userId, Users.id)) // Join with Users table
    .orderBy(desc(Reports.createdAt))
    .limit(limit)
    .execute();

  return reports;
};

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
    const rewardName = "Waste Report Submission";
    const rewardDescription = "Points awarded for submitting a waste report.";

    // ✅ Create reward for the user
    await createReward(userId, pointsEarned, rewardName, rewardDescription);

    await updateUserLevel(userId);
    await awardUserBadges(userId);

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

    await awardUserBadges(collectorId!); // Award badges to the collector

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

const VALID_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "assigned",
  "cancelled",
];

// ✅ Updated function to handle reward, transaction, and notification on status update
export async function updateReportStatus(reportId: number, newStatus: string) {
  try {
    // Validate status
    if (!VALID_STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    // Ensure the report exists
    const existingReport = await db
      .select()
      .from(Reports)
      .where(eq(Reports.id, reportId))
      .limit(1)
      .execute();

    if (existingReport.length === 0) {
      throw new Error(`Report with ID ${reportId} not found.`);
    }

    const report = existingReport[0];
    const { userId } = report;

    // Update the report status
    const [updatedReport] = await db
      .update(Reports)
      .set({ status: newStatus })
      .where(eq(Reports.id, reportId))
      .returning()
      .execute();

    // ✅ Check if status is 'completed' and trigger reward, transaction, and notification
    if (newStatus === "completed") {
      const rewardPoints = 50; // You can dynamically calculate points if needed
      const rewardName = "Waste Report Completion";
      const rewardDescription = "Points awarded for completing a waste report.";

      // 🎁 Create reward
      const reward = await createReward(
        userId,
        rewardPoints,
        rewardName,
        rewardDescription
      );

      // 💸 Create transaction for the reward
      await createTransaction(
        userId,
        "earned_report",
        rewardPoints,
        `Reward for completing report #${reportId}`
      );

      // 🔔 Create notification for the user
      await createNotification(
        userId,
        `You have been awarded ${rewardPoints} points for completing a waste report.`,
        "reward"
      );
    }

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

export async function getReportById(reportId: number) {
  try {
    const [report] = await db
      .select()
      .from(Reports)
      .where(eq(Reports.id, reportId))
      .execute();

    if (!report) {
      throw new Error(`Report with ID ${reportId} not found.`);
    }

    return report;
  } catch (error) {
    console.error("Error fetching report by ID:", error);
    throw error;
  }
}

// Get Report Trends (Weekly/Monthly)

// Get Report Trends (Weekly/Monthly)
export const getReportTrends = async (
  interval: "weekly" | "monthly" = "weekly"
) => {
  const intervalFormat = interval === "weekly" ? "YYYY-WW" : "YYYY-MM";

  // Query to group reports by week or month
  const result = await db.execute(
    sql`
      SELECT
        TO_CHAR(${Reports.createdAt}, ${intervalFormat}) AS period,
        COUNT(*)::int AS report_count
      FROM ${Reports}
      WHERE ${Reports.status} = 'completed' -- Optional: Only count completed reports
      GROUP BY period
      ORDER BY period ASC
    `
  );

  // Access the rows properly
  const data = result.rows.map((row: any) => row.report_count);
  const labels = result.rows.map((row: any) => row.period);

  return { data, labels };
};
