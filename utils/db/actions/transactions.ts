import { db } from "../dbConfig";
import { Transactions, Users } from "../schema";
import { desc, eq } from "drizzle-orm";

export async function getRewardTransactions(userId: number) {
  try {
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

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      date: t.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
    }));

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

// Fetch all transactions with user details
export async function getAllTransactions() {
  try {
    const transactions = await db
      .select({
        id: Transactions.id,
        userId: Transactions.userId,
        userName: Users.name, // Get user name from Users table
        amount: Transactions.amount,
        type: Transactions.type,
        description: Transactions.description,
        date: Transactions.date,
      })
      .from(Transactions)
      .leftJoin(Users, eq(Transactions.userId, Users.id)) // Join with Users
      .orderBy(desc(Transactions.date))
      .execute();

    console.log(transactions);
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}
