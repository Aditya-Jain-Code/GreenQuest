"use client";

import Link from "next/link";

export default function NotAuthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          🚫 Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You are not authorized to view this page.
        </p>
        <Link
          href="/"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
