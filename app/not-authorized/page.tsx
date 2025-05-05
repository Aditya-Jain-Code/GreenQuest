"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LockIcon } from "lucide-react";

export default function NotAuthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-50 text-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex flex-col items-center space-y-4">
          <LockIcon className="text-green-600 w-12 h-12" />
          <h1 className="text-2xl font-semibold text-gray-800">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You do not have permission to view this page. Please return to a
            valid section.
          </p>
          <Button
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl"
            onClick={() => router.push("/")}
          >
            Go Back Home
          </Button>
        </div>
      </div>
    </div>
  );
}
