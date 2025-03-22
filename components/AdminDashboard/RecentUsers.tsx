"use client";

import { useState, useEffect } from "react";
import { getRecentUsers } from "@/utils/db/actions/users";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export default function RecentUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getRecentUsers(5); // ✅ Fetch latest 5 users
        setUsers(data);
      } catch (error) {
        console.error("❌ Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
      {/* ✅ Title Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          👥 Recent Users
        </h2>
        <button
          onClick={() => router.push("/admin/users")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
        >
          View All Users →
        </button>
      </div>

      {/* ✅ User Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-xl">
          <thead className="bg-gray-100 text-sm text-gray-600 uppercase">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="p-3 text-sm text-gray-700">{user.name}</td>
                  <td className="p-3 text-sm text-gray-700">{user.email}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="p-4 text-center text-gray-500 italic"
                >
                  No recent users available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Info Section */}
      <div className="mt-6 text-sm text-gray-600">
        Showing the <span className="text-green-500 font-semibold">5</span> most
        recent users.
      </div>
    </div>
  );
}
