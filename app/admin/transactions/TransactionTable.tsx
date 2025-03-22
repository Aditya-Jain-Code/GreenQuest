import React from "react";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  type: string;
  description: string;
  date: Date;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-green-500 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Description
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {transaction.userName || "Unknown User"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {transaction.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Badge
                  variant="secondary"
                  className={
                    transaction.type === "earned_report"
                      ? "bg-blue-500 text-white"
                      : transaction.type === "earned_collect"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-white"
                  }
                >
                  {transaction.type.replace("_", " ").toUpperCase()}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(transaction.date).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
