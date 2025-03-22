"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Camera,
  Undo2,
  LogOut,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { deleteUser, getUserIdByEmail } from "@/utils/db/actions/users";

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

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const clientId = process.env.WEB3AUTH_CLIENT_ID;

  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0xaa36a7",
    rpcTarget: "https://rpc.ankr.com/eth_sepolia",
    displayName: "Ethereum Sepolia Testnet",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    ticker: "ETH",
    tickerName: "Ethereum",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  };

  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const [savedSettings, setSavedSettings] = useState<UserSettings | null>(null);
  const router = useRouter(); // For navigation

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      setSettings(parsedSettings);
      setSavedSettings(parsedSettings); // Store a copy for reset functionality
    }

    const email = localStorage.getItem("userEmail");
    setUserEmail(email);

    if (email) {
      getUserIdByEmail(email).then((id) => setUserId(id));
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
      toast.success("Changes undone successfully!");
    } else {
      toast.error("No saved settings to revert to.");
    }
  };

  const handleSaveChanges = () => {
    // Save changes logic here (if any additional logic is needed)
    setSavedSettings(settings); // Update saved settings
    toast.success("Changes saved successfully!");
  };

  // Logout Functionality
  const handleLogout = async () => {
    try {
      const web3auth = new Web3Auth({
        clientId: clientId!,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        privateKeyProvider,
      });

      // Initialize Web3Auth before checking connection
      await web3auth.initModal();

      if (!web3auth.connected) {
        throw new Error("Wallet is not connected. Please log in first.");
      }

      await web3auth.logout(); // Logout the user
      localStorage.removeItem(SETTINGS_KEY); // Clear settings from localStorage
      localStorage.removeItem("userEmail"); // Clear userEmail from localStorage
      router.push("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Delete Account Functionality
  const handleDeleteAccount = async () => {
    try {
      if (!userId) throw new Error("User ID not found.");

      const result = await deleteUser(Number(userId)); // Pass userId to deleteUser
      if (!result.success) throw new Error(result.error);

      const web3auth = new Web3Auth({
        clientId: clientId!,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        privateKeyProvider,
      });

      // Initialize Web3Auth before checking connection
      await web3auth.initModal();

      // Check if Web3Auth is connected
      if (!web3auth.connected) {
        throw new Error("Wallet is not connected. Please log in first.");
      }

      await web3auth.logout(); // Logout the user after deletion
      localStorage.removeItem(SETTINGS_KEY); // Clear settings from localStorage
      localStorage.removeItem("userEmail"); // Clear userId from localStorage
      router.push("/"); // Redirect to login page
    } catch (error) {
      console.error("Account deletion failed:", error);
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
        <Button
          onClick={handleSaveChanges}
          className="bg-green-500 hover:bg-green-600 text-white flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Logout and Delete Account Buttons */}
      <div className="mt-8 flex justify-between">
        {/* Logout Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600 text-white flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to logout?</DialogTitle>
              <DialogDescription>
                This action will log you out of your account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600"
              >
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-red-800 hover:bg-red-900 text-white flex items-center">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Are you sure you want to delete your account?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. All your data will be permanently
                deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button
                onClick={handleDeleteAccount}
                className="bg-red-800 hover:bg-red-900"
              >
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
