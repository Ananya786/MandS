import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  phone: varchar("phone"),
  company: varchar("company"),
  department: varchar("department"),
  role: varchar("role"),
  location: varchar("location"),
  website: varchar("website"),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand profiles for social media analytics
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  industry: varchar("industry", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social media metrics for each brand
export const socialMetrics = pgTable("social_metrics", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  platform: varchar("platform", { length: 50 }).notNull(), // twitter, facebook, instagram
  engagementScore: decimal("engagement_score", { precision: 5, scale: 2 }),
  totalPosts: integer("total_posts"),
  followers: integer("followers"),
  avgResponseTimeHours: decimal("avg_response_time_hours", { precision: 5, scale: 2 }),
  mentions: integer("mentions"),
  reach: integer("reach"),
  likes: integer("likes"),
  comments: integer("comments"),
  shares: integer("shares"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content posts performance
export const contentPosts = pgTable("content_posts", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  platform: varchar("platform", { length: 50 }).notNull(),
  content: text("content").notNull(),
  postType: varchar("post_type", { length: 50 }), // text, image, video
  publishedAt: timestamp("published_at").notNull(),
  views: integer("views"),
  likes: integer("likes"),
  comments: integer("comments"),
  shares: integer("shares"),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hashtags and trending topics
export const hashtags = pgTable("hashtags", {
  id: serial("id").primaryKey(),
  tag: varchar("tag", { length: 255 }).notNull(),
  brandId: integer("brand_id").references(() => brands.id), // null for industry trends
  category: varchar("category", { length: 50 }), // brand, competitor, industry
  mentionCount: integer("mention_count").default(0),
  trendingScore: decimal("trending_score", { precision: 5, scale: 2 }),
  date: date("date").notNull(),
  platform: varchar("platform", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audience demographics
export const audienceDemographics = pgTable("audience_demographics", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  platform: varchar("platform", { length: 50 }).notNull(),
  ageGroup: varchar("age_group", { length: 20 }), // 18-24, 25-34, etc.
  gender: varchar("gender", { length: 20 }), // male, female, other
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sentiment analysis data
export const sentimentData = pgTable("sentiment_data", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  platform: varchar("platform", { length: 50 }).notNull(),
  sentiment: varchar("sentiment", { length: 20 }), // positive, negative, neutral
  mentionCount: integer("mention_count"),
  score: decimal("score", { precision: 5, scale: 2 }),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertBrand = typeof brands.$inferInsert;
export type Brand = typeof brands.$inferSelect;

export type InsertSocialMetrics = typeof socialMetrics.$inferInsert;
export type SocialMetrics = typeof socialMetrics.$inferSelect;

export type InsertContentPost = typeof contentPosts.$inferInsert;
export type ContentPost = typeof contentPosts.$inferSelect;

export type InsertHashtag = typeof hashtags.$inferInsert;
export type Hashtag = typeof hashtags.$inferSelect;

export type InsertAudienceDemographics = typeof audienceDemographics.$inferInsert;
export type AudienceDemographics = typeof audienceDemographics.$inferSelect;

export type InsertSentimentData = typeof sentimentData.$inferInsert;
export type SentimentData = typeof sentimentData.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrandSchema = createInsertSchema(brands);
export const insertSocialMetricsSchema = createInsertSchema(socialMetrics);
export const insertContentPostSchema = createInsertSchema(contentPosts);
export const insertHashtagSchema = createInsertSchema(hashtags);
export const insertAudienceDemographicsSchema = createInsertSchema(audienceDemographics);
export const insertSentimentDataSchema = createInsertSchema(sentimentData);
