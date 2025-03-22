"use client";

import { useState, useEffect } from "react";
import { getRecentNotifications } from "@/utils/db/actions/notifications";

interface Notification {
  id: number;
  message: string;
  type: string;
  createdAt: Date;
}

export default function NotificationOverview() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getRecentNotifications(3); // ✅ Fetch latest 3 notifications
        setNotifications(data);
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
      {/* ✅ Title Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🔔 Recent Notifications
        </h2>
      </div>

      {/* ✅ Notification List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors duration-200 ease-in-out"
            >
              {/* ✅ Notification Message */}
              <p className="text-sm text-gray-700 leading-relaxed">
                {notif.message}
              </p>

              {/* ✅ Date and Type */}
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span className="italic">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    notif.type === "success"
                      ? "bg-green-100 text-green-600"
                      : notif.type === "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {notif.type.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic text-center">
            No recent notifications available.
          </div>
        )}
      </div>

      {/* ✅ Info Section */}
      <div className="mt-6 text-sm text-gray-600">
        Showing the <span className="text-green-500 font-semibold">3</span> most
        recent notifications.
      </div>
    </div>
  );
}
