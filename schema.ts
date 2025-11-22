import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean, serial } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: text("id").primaryKey(),
  /** Supabase Auth user ID (UUID) or OAuth identifier (openId). Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  // Scout profile fields
  age: integer("age"),
  phone: varchar("phone", { length: 20 }),
  scoutLevel: varchar("scoutLevel", { length: 100 }), // e.g., "كشاف", "رائد", etc.
  manualPoints: integer("manualPoints").default(0).notNull(),
  profileCompleted: boolean("profileCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Events/Workshops table
export const eventStatusEnum = pgEnum("event_status", ["upcoming", "ongoing", "completed"]);

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  titleAr: text("titleAr").notNull(), // Arabic title
  descriptionAr: text("descriptionAr"), // Arabic description
  date: timestamp("date").notNull(),
  location: text("location"),
  points: integer("points").default(10).notNull(),
  status: eventStatusEnum("status").default("upcoming").notNull(),
  createdBy: integer("createdBy").notNull(), // Admin user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Gallery images table
export const galleryImages = pgTable("gallery_images", {
  id: text("id").primaryKey(),
  imageUrl: text("imageUrl").notNull(), // S3 URL
  titleAr: text("titleAr").notNull(), // Arabic title
  descriptionAr: text("descriptionAr"), // Arabic description
  uploadedBy: text("uploadedBy").notNull(), // Admin user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

// Stories table
export const stories = pgTable("stories", {
  id: text("id").primaryKey(),
  titleAr: text("titleAr").notNull(), // Arabic title
  contentAr: text("contentAr").notNull(), // Arabic content
  authorId: integer("authorId").notNull(), // User ID or admin
  visibleToAll: boolean("visibleToAll").default(false).notNull(), // false = logged-in only
  createdBy: integer("createdBy").notNull(), // Admin user ID who created it
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  nameAr: text("nameAr").notNull(), // Arabic name
  phone: varchar("phone", { length: 20 }).notNull(), // Lebanese phone
  messageAr: text("messageAr").notNull(), // Arabic message
  email: varchar("email", { length: 320 }), // Optional email
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

// Event registrations and attendance tracking
export const eventRegistrations = pgTable("event_registrations", {
  id: text("id").primaryKey(),
  eventId: text("eventId").notNull(),
  userId: text("userId").notNull(),
  userName: text("userName").notNull(),
  userEmail: text("userEmail"),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  attended: boolean("attended").default(false).notNull(),
  pointsAwarded: boolean("pointsAwarded").default(false).notNull(),
});

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

// Scout logo table
export const scoutLogo = pgTable("scout_logo", {
  id: text("id").primaryKey(),
  logoUrl: text("logoUrl").notNull(), // S3 URL to logo image
  uploadedBy: text("uploadedBy").notNull(), // Admin user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ScoutLogo = typeof scoutLogo.$inferSelect;
export type InsertScoutLogo = typeof scoutLogo.$inferInsert;

// Admin password table (for password-based login)
export const adminPassword = pgTable("admin_password", {
  id: serial("id").primaryKey(),
  passwordHash: text("passwordHash").notNull(), // Hashed password
  updatedBy: integer("updatedBy").notNull(), // Admin user ID who set it
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdminPassword = typeof adminPassword.$inferSelect;
export type InsertAdminPassword = typeof adminPassword.$inferInsert;

// Competitions table
export const competitions = pgTable("competitions", {
  id: text("id").primaryKey(),
  titleAr: text("titleAr").notNull(),
  descriptionAr: text("descriptionAr"),
  password: text("password").notNull(),
  entryMode: text("entryMode").default('once').notNull(),
  numberOfQuestions: integer("numberOfQuestions").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: text("status").default("draft").notNull(), // draft, active, finished
  totalQuestions: integer("totalQuestions").default(0).notNull(),
  participationPoints: integer("participationPoints").default(20).notNull(),
  firstPlacePoints: integer("firstPlacePoints").default(100).notNull(),
  secondPlacePoints: integer("secondPlacePoints").default(75).notNull(),
  thirdPlacePoints: integer("thirdPlacePoints").default(50).notNull(),
  createdBy: text("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Competition questions table
export const competitionQuestions = pgTable("competition_questions", {
  id: text("id").primaryKey(),
  competitionId: text("competitionId").notNull(),
  questionAr: text("questionAr").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  correctAnswer: text("correctAnswer").notNull(), // A, B, C, D
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Competition results table
export const competitionResults = pgTable("competition_results", {
  id: text("id").primaryKey(),
  competitionId: text("competitionId").notNull(),
  userId: text("userId").notNull(),
  userName: text("userName").notNull(),
  userEmail: text("userEmail"),
  score: integer("score").notNull(),
  totalQuestions: integer("totalQuestions").notNull(),
  percentage: text("percentage").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

// Competition answers table (individual answers)
export const competitionAnswers = pgTable("competition_answers", {
  id: text("id").primaryKey(),
  competitionId: text("competitionId").notNull(),
  userId: text("userId").notNull(),
  questionId: text("questionId").notNull(),
  selectedAnswer: text("selectedAnswer").notNull(), // A, B, C, D
  isCorrect: boolean("isCorrect").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Competition = typeof competitions.$inferSelect;
export type InsertCompetition = typeof competitions.$inferInsert;

export type CompetitionQuestion = typeof competitionQuestions.$inferSelect;
export type InsertCompetitionQuestion = typeof competitionQuestions.$inferInsert;

export type CompetitionResult = typeof competitionResults.$inferSelect;
export type InsertCompetitionResult = typeof competitionResults.$inferInsert;

export type CompetitionAnswer = typeof competitionAnswers.$inferSelect;
export type InsertCompetitionAnswer = typeof competitionAnswers.$inferInsert;
