// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Eye, Trash } from "lucide-react";
import {
  getRecentReports,
  deleteReport,
  updateReportStatus,
  saveReward,
  createTransaction,
  createNotification,
  updateUserLevel,
} from "@/utils/db/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteReportId, setDeleteReportId] = useState<number | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch Reports on Page Load
  useEffect(() => {
    async function fetchReports() {
      const fetchedReports = await getRecentReports(50); // Fetch latest 50 reports
      setReports(fetchedReports);
    }
    fetchReports();
  }, []);

  // Open Image Dialog
  const viewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageDialogOpen(true);
  };

  // Open Delete Confirmation Dialog
  const confirmDelete = (reportId: number) => {
    setDeleteReportId(reportId);
    setIsDeleteDialogOpen(true);
  };

  // Handle Report Deletion
  const handleDelete = async () => {
    if (!deleteReportId) return;

    const result = await deleteReport(deleteReportId);
    if (result.success) {
      toast.success("Report deleted successfully!");
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== deleteReportId)
      );
    } else {
      toast.error("Failed to delete report.");
    }

    setIsDeleteDialogOpen(false);
    setDeleteReportId(null);
  };

  // Handle Status Update with Reward and Notification
  const handleStatusChange = async (reportId: number, newStatus: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    const result = await updateReportStatus(reportId, newStatus);

    if (result.success) {
      toast.success(`Status updated to "${newStatus}"`);
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );

      // If status changed to "completed", reward user and send notification
      if (newStatus === "completed" && report.userId) {
        try {
          const rewardAmount = 50;
          const rewardName = "Report Completion Reward";
          const rewardDescription =
            "Points earned for completing a waste report.";

          // Save reward for the user
          await saveReward(
            report.userId,
            rewardAmount,
            rewardName,
            rewardDescription
          );

          await updateUserLevel(report.userId);

          toast.success("User rewarded and notified successfully!");
        } catch (error) {
          console.error("Error rewarding user:", error);
          toast.error("Failed to reward user.");
        }
      }
    } else {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Manage Reports</h1>

      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Location</th>
            <th className="p-4 text-left">Waste Type</th>
            <th className="p-4 text-left">Amount</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Created At</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length > 0 ? (
            reports.map((report) => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{report.location}</td>
                <td className="p-4">{report.wasteType}</td>
                <td className="p-4">{report.amount}</td>

                {/* Status Dropdown */}
                <td className="p-4 capitalize">
                  <Select
                    value={report.status}
                    onValueChange={(newStatus) =>
                      handleStatusChange(report.id, newStatus)
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </td>

                <td className="p-4">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4 text-center flex justify-center gap-4">
                  {report.imageUrl && (
                    <Button
                      onClick={() => viewImage(report.imageUrl)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Image
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    onClick={() => confirmDelete(report.id)}
                    className="flex items-center"
                  >
                    <Trash className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                No reports found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Report"
              className="w-full h-auto rounded-lg"
            />
          )}
          <DialogFooter>
            <Button onClick={() => setIsImageDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this report?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
