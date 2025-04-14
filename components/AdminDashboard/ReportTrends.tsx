"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getReportTrends } from "@/utils/db/actions/reports";
import { Button } from "@/components/ui/button";

// ✅ Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportTrends() {
  const [trendData, setTrendData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"daily" | "weekly">("weekly");

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const { data, labels } = await getReportTrends(viewType);
        setTrendData(data);
        setLabels(labels);
      } catch (error) {
        console.error("❌ Error fetching report trends:", error);
      }
    };

    fetchTrendData();
  }, [viewType]);

  // ✅ Prepare chart data
  const chartData = {
    labels,
    datasets: [
      {
        label: viewType === "daily" ? "Daily Reports" : "Weekly Reports",
        data: trendData,
        fill: true,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // ✅ Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text:
          viewType === "daily"
            ? "Daily Report Submission Trends"
            : "Weekly Report Submission Trends",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: viewType === "daily" ? "Day" : "Week",
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Reports",
          font: {
            size: 14,
          },
        },
        beginAtZero: true,
      },
    },
  };

  // ✅ Handle view toggle
  const toggleView = () => {
    setViewType(viewType === "daily" ? "weekly" : "daily");
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📊 Report Trends
        </h2>
        {/* Toggle View Button */}
        <Button
          onClick={toggleView}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
        >
          Switch to {viewType === "daily" ? "Weekly" : "Daily"} View ↻
        </Button>
      </div>

      {/* Chart Container */}
      <div className="relative h-64 lg:h-80 mb-6">
        <Line data={chartData} options={options} />
      </div>

      {/* Info Section */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Viewing data by{" "}
          <span className="text-green-500 font-semibold">
            {viewType === "daily" ? "day" : "week"}
          </span>
          .
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
        >
          Refresh Trends ↻
        </button>
      </div>
    </div>
  );
}
