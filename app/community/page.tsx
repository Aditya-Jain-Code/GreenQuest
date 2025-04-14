import Link from "next/link";
import { getAllPosts } from "@/utils/db/actions/community";
import { formatDate } from "@/lib/formatDate";

export default async function CommunityPage() {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Discussions</h1>
        <Link
          href="/community/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Create Post
        </Link>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/community/page/${post.id}`}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-600 line-clamp-2">{post.content}</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                {post.category}
              </span>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span>
                {post.createdAt ? formatDate(post.createdAt) : "Unknown date"}
              </span>
              <span className="mx-2">•</span>
              <span>{post.commentCount || 0} comments</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
