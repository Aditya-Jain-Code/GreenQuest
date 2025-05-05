"use client";

import { useEffect, useRef, useState } from "react";
import { FaEdit, FaSave, FaUndo } from "react-icons/fa";
import { Phone, MapPin, Camera } from "lucide-react";
import UserProgressDashboard from "@/components/UserProgressDashboard";
import UserBadges from "@/components/UserBadges"; // Import the UserBadges component
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getUserIdByEmail, getUserProfile } from "@/utils/db/actions/users";
import { awardUserBadges, getUserBadges } from "@/utils/db/actions/badges";

import {
  getUserProgress,
  UserProgress,
  UserProfile,
} from "@/utils/db/actions/users";
import toast from "react-hot-toast";

interface UserSettings {
  profilePic: string;
  phone: string;
  address: string;
  notifications: boolean;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  awardedAt: Date;
}

const SETTINGS_KEY = "user-settings"; // Key for localStorage

const ProfilePage = () => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userBadges, setUserBadges] = useState<Badge[]>([]); // State for user badges
  const [settings, setSettings] = useState<UserSettings>({
    profilePic: "/default-avatar.png",
    phone: "",
    address: "",
    notifications: true,
  });
  const [savedSettings, setSavedSettings] = useState<UserSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        if (!hasCheckedAuth.current) {
          toast.error("Please log in to view your profile.");
          hasCheckedAuth.current = true; // Mark as checked
        }
        router.push("/login");
        return;
      }

      try {
        const userId = await getUserIdByEmail(userEmail);
        if (!userId) {
          router.push("/login");
          return;
        }

        const [profile, progress, badges] = await Promise.all([
          getUserProfile(userId),
          getUserProgress(userId),
          getUserBadges(userId),
        ]);

        setUserProfile(profile);
        setUserProgress(progress);
        setUserBadges(badges);

        // Load settings from localStorage
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
          setSavedSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserProfile(null);
      }
    };

    fetchUserData();
  }, [router]);

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
        const updatedSettings = { ...settings, profilePic: imageUrl };
        setSettings(updatedSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
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

  const handleSaveChanges = () => {
    setSavedSettings(settings);
    setIsEditing(false);
  };

  if (!userProfile || !userProgress) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-4xl font-extrabold text-green-700 mb-6 text-center">
          Your Profile 🌿
        </h2>

        <div className="flex items-center gap-8 mb-6">
          <div className="relative">
            <Image
              src={settings.profilePic}
              alt="Profile Picture"
              width={80}
              height={80}
              className="rounded-full border border-gray-300"
            />
            {isEditing && (
              <label
                htmlFor="profilePic"
                className="absolute bottom-0 right-0 bg-gray-200 p-1 rounded-full cursor-pointer"
              >
                <Camera size={18} className="text-gray-600" />
              </label>
            )}
            <input
              type="file"
              id="profilePic"
              className="hidden"
              accept="image/*"
              onChange={handleProfilePicChange}
            />
          </div>
          <div>
            <h3 className="text-2xl font-semibold">{userProfile.name}</h3>
            <p className="text-xl text-gray-600">{userProfile.email}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            {isEditing ? <FaSave /> : <FaEdit />}
            {isEditing ? "Save" : "Edit Profile"}
          </button>
        </div>

        {isEditing && (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
        )}

        {isEditing && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={handleUndoChanges}
              className="bg-gray-500 hover:bg-gray-600 text-white flex items-center"
            >
              <FaUndo className="w-4 h-4 mr-2" />
              Undo Changes
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center"
            >
              <FaSave className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* User Progress Dashboard */}
      <UserProgressDashboard {...userProgress} />

      {/* User Badges Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <UserBadges userId={userProfile.id} />
      </div>
    </div>
  );
};

export default ProfilePage;
