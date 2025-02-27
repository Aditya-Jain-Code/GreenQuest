"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, Camera, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type UserSettings = {
  profilePic: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notifications: boolean;
};

const SETTINGS_KEY = "user-settings"; // Key for localStorage

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    profilePic: "/default-avatar.png", // Default avatar
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    address: "123 Eco Street, Green City, 12345",
    notifications: true,
  });

  const [savedSettings, setSavedSettings] = useState<UserSettings | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      setSettings(parsedSettings);
      setSavedSettings(parsedSettings); // Store a copy for reset functionality
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const updatedSettings = {
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    };

    setSettings(updatedSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setSettings((prev) => ({ ...prev, profilePic: imageUrl }));
        localStorage.setItem(
          SETTINGS_KEY,
          JSON.stringify({ ...settings, profilePic: imageUrl })
        );
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUndoChanges = () => {
    if (savedSettings) {
      setSettings(savedSettings);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(savedSettings));
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-xl rounded-xl">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Account Settings
      </h1>

      {/* Profile Picture */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <Image
            src={settings.profilePic}
            alt="Profile Picture"
            width={80}
            height={80}
            className="rounded-full border border-gray-300"
          />
          <label
            htmlFor="profilePic"
            className="absolute bottom-0 right-0 bg-gray-200 p-1 rounded-full cursor-pointer"
          >
            <Camera size={18} className="text-gray-600" />
          </label>
          <input
            type="file"
            id="profilePic"
            className="hidden"
            accept="image/*"
            onChange={handleProfilePicChange}
          />
        </div>
        <div>
          <p className="text-lg font-medium">{settings.name}</p>
          <p className="text-sm text-gray-500">{settings.email}</p>
        </div>
      </div>

      {/* Form */}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <Phone
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <div className="relative">
            <input
              type="text"
              name="address"
              value={settings.address}
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </form>

      {/* Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={handleUndoChanges}
          className="bg-gray-500 hover:bg-gray-600 text-white flex items-center"
        >
          <Undo2 className="w-4 h-4 mr-2" />
          Undo Changes
        </Button>
        <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
