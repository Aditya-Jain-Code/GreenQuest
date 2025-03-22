"use client";

import { useEffect, useState } from "react";
import { getUserByEmail, updateUser } from "@/utils/db/actions/users";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);

  const router = useRouter();

  // ✅ Fetch Admin Details
  useEffect(() => {
    async function fetchUser() {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast.error("Please login to access admin settings.");
        router.push("/admin/login");
        return;
      }

      try {
        const userData = await getUserByEmail(userEmail);
        if (userData?.role !== "admin") {
          toast.error("Unauthorized. Only admins can access settings.");
          router.push("/not-authorized");
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  // ✅ Handle Profile Update
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUser(user.id, {
        name: user.name,
        email: user.email,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handle Wallet Re-authentication
  const handleReauthenticateWallet = async () => {
    toast.success("Re-authenticate wallet initiated! 🔒");
    // You can add logic to reconnect wallet if needed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-green-700">
          ⚙️ Admin Settings
        </h1>

        {/* Profile Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              type="text"
              value={user?.name || ""}
              onChange={(e) => setUser({ ...user!, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-200 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <Input
              type="text"
              value={user?.role || ""}
              disabled
              className="bg-gray-200 cursor-not-allowed"
            />
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between mt-4">
            <label className="text-sm font-medium text-gray-700">
              Enable Admin Notifications
            </label>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={handleReauthenticateWallet}
              className="bg-blue-500 text-white flex items-center px-4"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Re-authenticate Wallet
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white flex items-center px-4"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
