import { sql } from "drizzle-orm";
import {
  integer,
  varchar,
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  boolean,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Users table
export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  level: integer("level").notNull().default(1),
  role: varchar("role", { length: 50 }).notNull().default("user"),
});

// Reports table
export const Reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    .notNull(),
  location: text("location").notNull(),
  wasteType: varchar("waste_type", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  verificationResult: jsonb("verification_result"),
  status: varchar("status", { length: 255 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  collectorId: integer("collector_id").references(() => Users.id),
});

// Rewards table
export const Rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    .notNull(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  description: text("description"),
  name: varchar("name", { length: 255 }).notNull(),
  collectionInfo: text("collection_info").notNull(),
});

// Notifications table
export const Notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    .notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New Transactions table
export const Transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    .notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'earned' or 'redeemed'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

// Badges table
export const Badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., 'Waste Collection'
  description: text("description").notNull(),
  criteria: jsonb("criteria").notNull(), // Stores badge conditions as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Badges table
export const UserBadges = pgTable(
  "user_badges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => Users.id),
    badgeId: integer("badge_id")
      .notNull()
      .references(() => Badges.id),
    awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userBadgeUnique: unique().on(table.userId, table.badgeId), // Ensure a badge is awarded once
    };
  }
);

export const Posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const Comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => Posts.id, {
    onDelete: "cascade",
  }),
  userId: integer("user_id").references(() => Users.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const Votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => Users.id, {
      onDelete: "cascade",
    }),
    postId: integer("post_id")
      .references(() => Posts.id, { onDelete: "cascade" })
      .default(sql<number>`NULL`),
    commentId: integer("comment_id")
      .references(() => Comments.id, { onDelete: "cascade" })
      .default(sql<number>`NULL`),
    voteType: integer("vote_type").notNull(), // Check constraint added below
  },
  (table) => {
    return {
      uniqueVote: unique().on(table.userId, table.postId, table.commentId),
      voteTypeCheck: sql`CHECK (${table.voteType} IN (-1, 1))`, // Correct check placement
    };
  }
);

export const BestAnswers = pgTable("best_answers", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .unique()
    .references(() => Posts.id, { onDelete: "cascade" }),
  commentId: integer("comment_id").references(() => Comments.id, {
    onDelete: "cascade",
  }),
  selectedBy: integer("selected_by").references(() => Users.id, {
    onDelete: "cascade",
  }),
  selectedAt: timestamp("selected_at").defaultNow(),
});
