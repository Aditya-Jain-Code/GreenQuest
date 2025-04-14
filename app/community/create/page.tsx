"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPost } from "@/utils/db/actions/community";
import { getUserByEmail } from "@/utils/db/actions/users";
import RichTextEditor from "@/components/RichTextEditor";

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ id: number } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userEmail =
          typeof window !== "undefined"
            ? localStorage.getItem("userEmail")
            : null;
        if (!userEmail) {
          setError("You must be logged in to create a post");
          return;
        }
        const userData = await getUserByEmail(userEmail);
        if (!userData) {
          setError("User not found");
          return;
        }
        setUser({ id: userData.id });
      } catch (err) {
        console.error("Error checking auth:", err);
        setError("Error verifying your account");
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create a post");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createPost(
        user.id,
        formData.title,
        formData.content,
        formData.category
      );
      router.push("/community");
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
        <p className="text-gray-600">Share your thoughts with the community</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!user ? (
        <div className="text-center py-8">
          <p className="text-lg mb-4">
            You need to be logged in to create posts
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="What's your post about?"
              required
              maxLength={200}
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.title.length}/200 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="general">General Discussion</option>
              <option value="questions">Questions</option>
              <option value="tips">Tips & Tricks</option>
              <option value="reports">Waste Reports</option>
              <option value="events">Community Events</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              placeholder="Write your post content here..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Minimum 30 characters of actual text
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/community")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
              disabled={
                isSubmitting ||
                !formData.title ||
                !formData.content ||
                formData.content.replace(/<[^>]*>/g, "").length < 30
              }
            >
              {isSubmitting ? "Posting..." : "Create Post"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
