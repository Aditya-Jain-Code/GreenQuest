import React from "react";

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ElementType; // The icon component
  title: string; // Title of the card
  description: string; // Description of the card
  className?: string; // Optional className for additional styling
}) {
  return (
    <div
      className={`bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col items-center text-center ${className}`}
    >
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <Icon className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
