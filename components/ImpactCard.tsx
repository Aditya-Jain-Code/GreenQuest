import React from "react";
import { LucideIcon } from "lucide-react"; // Import the correct type for icons

export default function ImpactCard({
  title,
  value,
  icon: Icon,
  loading = false,
  className,
}: {
  title: string; // Title of the card
  value: string | number; // Value to display (can be a string or number)
  icon: LucideIcon; // Explicit type for Lucide icons
  loading?: boolean; // Optional loading state
  className?: string; // Optional className for additional styling
}) {
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("en-US", { maximumFractionDigits: 1 })
      : value;

  return (
    <div
      className={`p-6 rounded-xl bg-gray-50 border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-md ${className}`}
    >
      {loading ? (
        <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
      ) : (
        <>
          <Icon className="h-10 w-10 text-green-500 mb-4" />
          <p className="text-3xl font-bold mb-2 text-gray-800">
            {formattedValue}
          </p>
          <p className="text-sm text-gray-600">{title}</p>
        </>
      )}
    </div>
  );
}
