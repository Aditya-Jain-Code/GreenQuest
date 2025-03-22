"use client";

import { useState, useEffect } from "react";
import { getRecentReports } from "@/utils/db/actions/reports";
import { useRouter } from "next/navigation";

interface Report {
  id: number;
  userName: string | null;
  wasteType: string;
  status: string;
  createdAt: Date;
}

export default function ReportSummary() {
  const [reports, setReports] = useState<Report[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getRecentReports(5); // ✅ Fetch latest 5 reports
        setReports(data);
      } catch (error) {
        console.error("❌ Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
      {/* ✅ Title with Icon */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📄 Recent Reports
        </h2>
        <button
          onClick={() => router.push("/admin/reports")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
        >
          View All Reports →
        </button>
      </div>

      {/* ✅ Report Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-xl">
          <thead className="bg-gray-100 text-sm text-gray-600 uppercase">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Waste Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length > 0 ? (
              reports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="p-3 text-sm text-gray-700">
                    {report.userName || "N/A"}
                  </td>
                  <td className="p-3 text-sm text-gray-700">
                    {report.wasteType}
                  </td>
                  <td
                    className={`p-3 text-sm font-semibold ${
                      report.status === "completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() +
                      report.status.slice(1)}
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-gray-500 italic"
                >
                  No recent reports available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Info + Button Section */}
      <div className="mt-6 text-sm text-gray-600">
        Showing the <span className="text-green-500 font-semibold">5</span> most
        recent reports.
      </div>
    </div>
  );
}
