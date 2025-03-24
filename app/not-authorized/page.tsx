"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotAuthorizedPage = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="text-red-500 dark:text-red-400 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
          🚫 Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You do not have permission to access this page.
        </p>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => router.push("/")}
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default NotAuthorizedPage;
