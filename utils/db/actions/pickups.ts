import { db } from "../dbConfig";
import { Reports } from "../schema";
import { eq } from "drizzle-orm";

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

// ✅ Update pickup status
export async function updatePickupStatus(reportId: number, status: string) {
  try {
    await db
      .update(Reports)
      .set({ status })
      .where(eq(Reports.id, reportId))
      .execute();
  } catch (error) {
    console.error("Error updating pickup status:", error);
    throw new Error("Failed to update pickup status.");
  }
}
