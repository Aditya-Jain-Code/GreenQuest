"use client";

import React, { useEffect, useState } from "react";
import {
  getRecentNotifications,
  markNotificationAsRead,
  createNotification,
} from "@/utils/db/actions/notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getUserByEmail } from "@/utils/db/actions/users";

interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newNotification, setNewNotification] = useState({
    userId: "",
    message: "",
    type: "general",
  });
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
      fetchNotifications();
    }
  }, [authorized]);

  // Fetch notifications from DB
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getRecentNotifications(50); // Get recent 50 notifications
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      toast.success("Notification marked as read!");
      fetchNotifications(); // Refresh data
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read.");
    }
  };

  // Create new notification
  const handleCreateNotification = async () => {
    const { userId, message, type } = newNotification;
    if (!userId || !message) {
      toast.error("User ID and message are required.");
      return;
    }
    try {
      await createNotification(Number(userId), message, type);
      toast.success("Notification created successfully!");
      setNewNotification({ userId: "", message: "", type: "general" });
      fetchNotifications(); // Refresh data
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to create notification.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        🔔 Notification Management
      </h1>

      {/* Create Notification Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">📣 Create Notification</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="number"
            placeholder="User ID"
            value={newNotification.userId}
            onChange={(e) =>
              setNewNotification({ ...newNotification, userId: e.target.value })
            }
          />
          <Input
            type="text"
            placeholder="Message"
            value={newNotification.message}
            onChange={(e) =>
              setNewNotification({
                ...newNotification,
                message: e.target.value,
              })
            }
          />
          <select
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            value={newNotification.type}
            onChange={(e) =>
              setNewNotification({ ...newNotification, type: e.target.value })
            }
          >
            <option value="general">General</option>
            <option value="reward">Reward</option>
            <option value="alert">Alert</option>
          </select>
          <Button onClick={handleCreateNotification} className="col-span-1">
            ➕ Create Notification
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">📥 Recent Notifications</h2>
        {loading ? (
          <p className="text-gray-600">⏳ Loading notifications...</p>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications found.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {notification.message}
                    </p>
                    <div className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()} -{" "}
                      {notification.isRead ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-500 text-white"
                        >
                          ✅ Read
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500 text-white"
                        >
                          🔔 Unread
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      onClick={() => handleMarkAsRead(notification.id)}
                      size="sm"
                      className="bg-green-600 text-white"
                    >
                      ✅ Mark as Read
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
