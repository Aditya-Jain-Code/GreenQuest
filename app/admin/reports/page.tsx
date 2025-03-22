"use client";

import { useEffect, useState } from "react";
import {
  getAllReports,
  deleteReport,
  updateReportStatus,
} from "@/utils/db/actions/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye, Trash2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Report {
  id: number;
  userId: number;
  location: string;
  wasteType: string;
  amount: string;
  status: string;
  createdAt: Date;
  imageUrl?: string | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🔥 Fetch all reports on page load
  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await getAllReports();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Failed to load reports.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, []);

  // 🔎 Filter reports based on search term
  useEffect(() => {
    const filtered = reports.filter(
      (report) =>
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  // 🔍 Open report details dialog
  const openReportDetails = (report: Report) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  // ✅ Update report status
  const handleUpdateStatus = async (reportId: number, status: string) => {
    try {
      await updateReportStatus(reportId, status);
      toast.success("Report status updated successfully!");
      refreshReports();
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update status.");
    }
  };

  // ❌ Delete report
  const handleDeleteReport = async (reportId: number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteReport(reportId);
      toast.success("Report deleted successfully!");
      refreshReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report.");
    }
  };

  // 🔄 Refresh reports after update or delete
  const refreshReports = async () => {
    const data = await getAllReports();
    setReports(data);
    setFilteredReports(data);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-700">
        📄 Report Management
      </h1>

      {/* Search Bar */}
      <Input
        type="text"
        placeholder="Search by location, type, or status..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full md:w-1/2"
      />

      {/* Report Table */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading reports...</p>
      ) : (
        <Table className="w-full bg-white shadow-md rounded-lg">
          <TableHeader>
            <TableRow>
              <TableCell className="font-bold">ID</TableCell>
              <TableCell className="font-bold">Location</TableCell>
              <TableCell className="font-bold">Type</TableCell>
              <TableCell className="font-bold">Amount</TableCell>
              <TableCell className="font-bold">Status</TableCell>
              <TableCell className="font-bold">Created At</TableCell>
              <TableCell className="font-bold">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id} className="hover:bg-gray-50">
                <TableCell>{report.id}</TableCell>
                <TableCell>{report.location}</TableCell>
                <TableCell>{report.wasteType}</TableCell>
                <TableCell>{report.amount}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-md text-white ${
                      report.status === "completed"
                        ? "bg-green-500"
                        : report.status === "in-progress"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {report.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(report.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex space-x-2">
                  <Button
                    onClick={() => openReportDetails(report)}
                    className="bg-blue-500 text-white px-3 py-1"
                  >
                    <Eye size={18} />
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(report.id, "completed")}
                    className="bg-green-500 text-white px-3 py-1"
                  >
                    <CheckCircle size={18} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteReport(report.id)}
                    className="bg-red-500 text-white px-3 py-1"
                  >
                    <Trash2 size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Report Details Dialog */}
      {isDetailsOpen && selectedReport && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                <strong>Location:</strong> {selectedReport.location}
              </p>
              <p>
                <strong>Type:</strong> {selectedReport.wasteType}
              </p>
              <p>
                <strong>Amount:</strong> {selectedReport.amount}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-green-600">{selectedReport.status}</span>
              </p>
              {selectedReport.imageUrl && (
                <img
                  src={selectedReport.imageUrl}
                  alt="Report Image"
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsDetailsOpen(false)}
                className="bg-gray-500"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
