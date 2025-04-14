import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../dbConfig";
import { Posts, Comments, Votes, BestAnswers } from "../schema";

// Post Functions
export const createPost = async (
  userId: number,
  title: string,
  content: string,
  category: string
) => {
  return await db
    .insert(Posts)
    .values({
      userId,
      title,
      content,
      category,
      createdAt: new Date(),
    })
    .returning();
};

// utils/db/actions/community.ts
export const getAllPosts = async () => {
  const posts = await db.select().from(Posts).orderBy(desc(Posts.createdAt));

  // Get comment counts for all posts in one query
  const commentCounts = await db
    .select({
      postId: Comments.postId,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(Comments)
    .groupBy(Comments.postId);

  // Map comment counts to posts
  return posts.map((post) => ({
    ...post,
    commentCount: commentCounts.find((c) => c.postId === post.id)?.count || 0,
  }));
};

export const getPostById = async (postId: number) => {
  return await db.query.Posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, postId),
  });
};

export const updatePost = async (
  postId: number,
  userId: number,
  updates: { title?: string; content?: string; category?: string }
) => {
  return await db
    .update(Posts)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(Posts.id, postId), eq(Posts.userId, userId)))
    .returning();
};

export const deletePost = async (postId: number, userId: number) => {
  return await db
    .delete(Posts)
    .where(and(eq(Posts.id, postId), eq(Posts.userId, userId)))
    .returning();
};

// Comment Functions
export const createComment = async (
  postId: number,
  userId: number,
  content: string
) => {
  return await db
    .insert(Comments)
    .values({ postId, userId, content })
    .returning();
};

export const getCommentsForPost = async (
  postId: number,
  limit: number = 10,
  offset: number = 0
) => {
  return await db.query.Comments.findMany({
    where: (comments, { eq }) => eq(comments.postId, postId),
    orderBy: (comments, { desc }) => desc(comments.createdAt),
    limit,
    offset,
  });
};

export const updateComment = async (
  commentId: number,
  userId: number,
  content: string
) => {
  return await db
    .update(Comments)
    .set({
      content,
      // Remove isEdited since it's not in your schema
      updatedAt: new Date(),
    })
    .where(and(eq(Comments.id, commentId), eq(Comments.userId, userId)))
    .returning();
};

export const deleteComment = async (commentId: number, userId: number) => {
  return await db
    .delete(Comments)
    .where(and(eq(Comments.id, commentId), eq(Comments.userId, userId)))
    .returning();
};

// Vote Functions
export const vote = async (
  userId: number,
  postId: number | null,
  commentId: number | null,
  voteType: number
) => {
  if (voteType !== 1 && voteType !== -1) {
    throw new Error("Invalid vote type");
  }

  if (!postId && !commentId) {
    throw new Error("Must vote on either a post or comment");
  }

  return await db
    .insert(Votes)
    .values({ userId, postId, commentId, voteType })
    .onConflictDoUpdate({
      target: [Votes.userId, Votes.postId, Votes.commentId],
      set: { voteType },
    })
    .returning();
};

export const getPostVotes = async (postId: number) => {
  const result = await db
    .select({
      upvotes: sql<number>`sum(case when ${Votes.voteType} = 1 then 1 else 0 end)`,
      downvotes: sql<number>`sum(case when ${Votes.voteType} = -1 then 1 else 0 end)`,
    })
    .from(Votes)
    .where(eq(Votes.postId, postId));

  return {
    upvotes: result[0]?.upvotes ?? 0,
    downvotes: result[0]?.downvotes ?? 0,
  };
};

export const getCommentVotes = async (commentId: number) => {
  const result = await db
    .select({
      upvotes: sql<number>`sum(case when ${Votes.voteType} = 1 then 1 else 0 end)`,
      downvotes: sql<number>`sum(case when ${Votes.voteType} = -1 then 1 else 0 end)`,
    })
    .from(Votes)
    .where(eq(Votes.commentId, commentId));

  return {
    upvotes: result[0]?.upvotes ?? 0,
    downvotes: result[0]?.downvotes ?? 0,
  };
};

// Best Answer Functions
export const selectBestAnswer = async (
  postId: number,
  commentId: number,
  userId: number
) => {
  // Verify post ownership
  const post = await db.query.Posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, postId),
  });

  if (!post || post.userId !== userId) {
    throw new Error("Only the post owner can select the best answer.");
  }

  // Verify comment belongs to post
  const comment = await db.query.Comments.findFirst({
    where: (comments, { and, eq }) =>
      and(eq(comments.id, commentId), eq(comments.postId, postId)),
  });

  if (!comment) {
    throw new Error("Comment doesn't belong to this post");
  }

  return await db
    .insert(BestAnswers)
    .values({ postId, commentId, selectedBy: userId, selectedAt: new Date() })
    .onConflictDoUpdate({
      target: BestAnswers.postId,
      set: { commentId, selectedBy: userId, selectedAt: new Date() },
    })
    .returning();
};

export const getBestAnswerForPost = async (postId: number) => {
  return await db
    .select()
    .from(BestAnswers)
    .where(eq(BestAnswers.postId, postId))
    .limit(1);
};

export const removeBestAnswer = async (postId: number, userId: number) => {
  const post = await db.query.Posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, postId),
  });

  if (!post || post.userId !== userId) {
    throw new Error("Only the post owner can remove the best answer.");
  }

  return await db
    .delete(BestAnswers)
    .where(eq(BestAnswers.postId, postId))
    .returning();
};

// Utility Functions
export const getPostWithDetails = async (postId: number) => {
  const post = await getPostById(postId);
  if (!post) return null;

  const [comments, bestAnswer, votes] = await Promise.all([
    getCommentsForPost(postId),
    getBestAnswerForPost(postId),
    getPostVotes(postId),
  ]);

  return {
    ...post,
    comments,
    bestAnswer: bestAnswer[0] || null,
    votes,
  };
};
