"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Undo2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

type SettingsData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notifications: boolean;
};

export default function PickupSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notifications: true,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const router = useRouter();

  // Load settings from localStorage on page load
  useEffect(() => {
    const agentEmail = localStorage.getItem("agentEmail");
    if (!agentEmail) {
      toast.error("User not found. Please log in again.");
      router.push("/pickup/login");
      return;
    }

    const storedSettings = localStorage.getItem("pickupSettings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
    setLoading(false);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Save settings to localStorage
  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem("pickupSettings", JSON.stringify(settings));
      toast.success("✅ Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("❌ Failed to update settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default settings
  const handleReset = () => {
    localStorage.removeItem("pickupSettings");
    setSettings({
      name: "",
      email: "",
      phone: "",
      address: "",
      notifications: true,
    });
    toast.success("🔄 Settings reset to default!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md mt-12 border border-gray-200">
      <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
        ⚙️ Pickup Agent Settings
      </h1>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Name"
          name="name"
          value={settings.name}
          onChange={handleInputChange}
          placeholder="Enter your name"
        />
        <Input
          label="Email"
          name="email"
          value={settings.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
        />
        <Input
          label="Phone Number"
          name="phone"
          value={settings.phone}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
        />
        <Input
          label="Address"
          name="address"
          value={settings.address}
          onChange={handleInputChange}
          placeholder="Enter your address"
        />
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            id="notifications"
            name="notifications"
            checked={settings.notifications}
            onChange={handleInputChange}
            className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
          />
          <label
            htmlFor="notifications"
            className="text-sm font-medium text-gray-700"
          >
            Enable Notifications
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-4">
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex items-center"
        >
          <Undo2 className="mr-2" size={18} />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          className={`flex items-center bg-green-600 text-white hover:bg-green-700 ${
            saving && "opacity-50 cursor-not-allowed"
          }`}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={18} />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2" size={18} />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
