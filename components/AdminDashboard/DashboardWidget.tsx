import React from "react";

interface DashboardWidgetProps {
  title: string;
  value: number;
  icon: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  icon,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md flex items-center space-x-4 border border-gray-200 hover:shadow-lg transition">
      <div className="text-4xl">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <p className="text-2xl font-bold text-green-700">{value}</p>
      </div>
    </div>
  );
};

export default DashboardWidget;
