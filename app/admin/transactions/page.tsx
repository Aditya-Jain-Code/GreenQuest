"use client";

import React, { useEffect, useState } from "react";
import TransactionTable from "./TransactionTable";
import { getAllTransactions } from "@/utils/db/actions/transactions";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { getUserByEmail } from "@/utils/db/actions/users";

const TransactionPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [authorized, setAuthorized] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const adminEmail = localStorage.getItem("adminEmail");
        if (!adminEmail) {
          router.push("/not-authorized"); // Redirect if no user
          return;
        }

        const user = await getUserByEmail(adminEmail);
        if (user?.role !== "admin") {
          router.push("/not-authorized"); // Redirect if not admin
          return;
        }

        setAuthorized(true); // Allow if admin
      } catch (error) {
        console.error("❌ Error verifying user role:", error);
        router.push("/not-authorized"); // Redirect on error
      }
    };

    checkUserRole();
  }, [router]);

  useEffect(() => {
    if (authorized) {
      fetchTransactions();
    }
  }, [authorized]);

  const fetchTransactions = async () => {
    try {
      const data = await getAllTransactions();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Filter transactions based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = transactions.filter((transaction) =>
      transaction.userName?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-700">
          💸 Transaction Logs
        </h1>
        <Input
          type="text"
          placeholder="🔎 Search by user name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-72"
        />
      </div>

      {/* Transaction Table */}
      <TransactionTable transactions={filteredTransactions} />
    </div>
  );
};

export default TransactionPage;
