// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Leaf, Recycle, Users, Coins, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import ImpactCard from "@/components/ImpactCard";
import FeatureCard from "@/components/FeatureCard";
import ActionButton from "@/components/ActionButton";
import { Poppins } from "next/font/google";
import { Toaster, toast } from "react-hot-toast";

const poppins = Poppins({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
});

// Animated Globe Component
function AnimatedGlobe() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-green-400 opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-green-300 opacity-60 animate-spin"></div>
      <div className="absolute inset-6 rounded-full bg-green-200 opacity-80 animate-bounce"></div>
      <Leaf className="absolute inset-0 m-auto h-16 w-16 text-green-600 animate-pulse" />
    </div>
  );
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Force logout on page load
  useEffect(() => {
    localStorage.removeItem("userEmail"); // Clear user session
    setLoggedIn(false); // Ensure logged out

    const storedEmail = localStorage.getItem("adminEmail");
    const storedPassword = localStorage.getItem("adminPassword");

    // Set default credentials if not already stored
    if (!storedEmail || !storedPassword) {
      localStorage.setItem("adminEmail", "adityajai2104@gmail.com");
      localStorage.setItem("adminPassword", "Flash!123");
    }
  }, []);

  // Handle Login
  const handleLogin = () => {
    const storedEmail = localStorage.getItem("adminEmail");
    const storedPassword = localStorage.getItem("adminPassword");

    if (email === storedEmail && password === storedPassword) {
      localStorage.setItem("userEmail", email);
      setLoggedIn(true);
      toast.success("Login successful! Redirecting...");
      router.push("/admin/dashboard");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setLoggedIn(false);
    toast.success("Logged out successfully.");
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${poppins.className}`}>
      <Toaster />
      <section className="text-center mb-20">
        <AnimatedGlobe />
        <h1 className="text-6xl font-bold mb-6 text-gray-800 tracking-tight">
          Green-Quest <span className="text-green-600">Admin Dashboard</span>
        </h1>

        {loggedIn ? (
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Welcome back, Admin!
          </p>
        ) : (
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Please log in to access the admin dashboard.
          </p>
        )}

        {loggedIn ? (
          <ActionButton onClick={handleLogout} label="Logout" />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="max-w-sm mx-auto"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-2 mb-4 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-2 mb-4 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
              required
            />
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Login
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
