import { db } from "@/utils/db/dbConfig";
import { Users, Reports } from "@/utils/db/schema";
import { eq, and } from "drizzle-orm";

// Fetch agent profile by email stored in localStorage
export const getAgentProfile = async () => {
  try {
    const agentEmail = localStorage.getItem("agentEmail"); // Fetch email from localStorage
    if (!agentEmail) {
      throw new Error("Agent email not found in localStorage.");
    }

    // Get agent details
    const agent = await db
      .select({
        id: Users.id,
        name: Users.name,
        email: Users.email,
      })
      .from(Users)
      .where(eq(Users.email, agentEmail))
      .limit(1)
      .execute();

    if (!agent[0]) {
      throw new Error("Agent profile not found.");
    }

    const agentId = agent[0].id;

    // Fetch pickup stats for agent
    const completedPickups = await db
      .select()
      .from(Reports)
      .where(
        and(eq(Reports.collectorId, agentId), eq(Reports.status, "completed"))
      )
      .execute();

    const pendingPickups = await db
      .select()
      .from(Reports)
      .where(
        and(eq(Reports.collectorId, agentId), eq(Reports.status, "in_progress"))
      )
      .execute();

    // Fetch assigned pickups
    const assignedPickups = await db
      .select({
        id: Reports.id,
        location: Reports.location,
        wasteType: Reports.wasteType,
        status: Reports.status,
      })
      .from(Reports)
      .where(
        and(eq(Reports.collectorId, agentId), eq(Reports.status, "assigned"))
      )
      .execute();

    return {
      id: agent[0].id,
      name: agent[0].name,
      email: agent[0].email,
      completedPickups: completedPickups.length,
      pendingPickups: pendingPickups.length,
      assignedPickups,
    };
  } catch (error) {
    console.error("Error fetching agent profile:", error);
    throw new Error("Failed to load agent profile.");
  }
};

export const logoutAgent = async () => {
  try {
    localStorage.removeItem("userEmail"); // Remove session
    localStorage.removeItem("userRole"); // Optional: Remove role if stored
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error("Failed to log out.");
  }
};
