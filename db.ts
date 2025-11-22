import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, events, galleryImages, stories, contactMessages, scoutLogo, adminPassword } from "./schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
// This file is server-side only and should not be imported in browser code.
export async function getDb() {
  // Skip database connection in browser environment
  if (typeof window !== 'undefined') {
    return null;
  }
  
  if (!_db && ENV.databaseUrl) {
    try {
      // Use the DATABASE_URL environment variable
      // For Supabase, this should be the direct PostgreSQL connection string
      // Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
      // You can find this in your Supabase project settings under Database > Connection string
      
      _client = postgres(ENV.databaseUrl, {
        max: 1, // Connection pool size
        ssl: 'require', // Supabase requires SSL
      });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _client = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerUserId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    
    // Always update updatedAt on conflict
    updateSet.updatedAt = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// User profile queries
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(
  userId: number,
  data: { age?: number; phone?: string; scoutLevel?: string; profileCompleted?: boolean }
) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId));
  return getUserById(userId);
}

// Event queries
export async function getEvents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(events).orderBy(events.date);
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Gallery queries
export async function getGalleryImages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(galleryImages).orderBy(galleryImages.createdAt);
}

// Stories queries
export async function getStories(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  // If user is logged in, show all stories; if not, show only public stories
  if (userId) {
    return await db.select().from(stories).orderBy(stories.createdAt);
  } else {
    return await db.select().from(stories).where(eq(stories.visibleToAll, true)).orderBy(stories.createdAt);
  }
}

// Contact message queries
export async function createContactMessage(data: {
  nameAr: string;
  phone: string;
  messageAr: string;
  email?: string;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(contactMessages).values(data);
  return result;
}

// Get contact messages
export async function getContactMessages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contactMessages).orderBy(contactMessages.createdAt);
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(users.createdAt);
}

// Event CRUD operations
export async function createEvent(data: {
  titleAr: string;
  descriptionAr?: string;
  date: Date;
  location?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(events).values(data);
  return result;
}

export async function updateEvent(
  id: number,
  data: Partial<{
    titleAr: string;
    descriptionAr: string;
    date: Date;
    location: string;
  }>
) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(events).set({ ...data, updatedAt: new Date() }).where(eq(events.id, id));
  return getEventById(id);
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(events).where(eq(events.id, id));
  return true;
}

// Gallery CRUD operations
export async function createGalleryImage(data: {
  imageUrl: string;
  titleAr: string;
  descriptionAr?: string;
  uploadedBy: number;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(galleryImages).values(data);
  return result;
}

export async function updateGalleryImage(
  id: number,
  data: Partial<{
    imageUrl: string;
    titleAr: string;
    descriptionAr: string;
  }>
) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(galleryImages).set({ ...data, updatedAt: new Date() }).where(eq(galleryImages.id, id));
  const result = await db.select().from(galleryImages).where(eq(galleryImages.id, id)).limit(1);
  return result[0];
}

export async function deleteGalleryImage(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(galleryImages).where(eq(galleryImages.id, id));
  return true;
}

// Stories CRUD operations
export async function createStory(data: {
  titleAr: string;
  contentAr: string;
  authorId: number;
  visibleToAll: boolean;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(stories).values(data);
  return result;
}

export async function updateStory(
  id: number,
  data: Partial<{
    titleAr: string;
    contentAr: string;
    visibleToAll: boolean;
  }>
) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(stories).set({ ...data, updatedAt: new Date() }).where(eq(stories.id, id));
  const result = await db.select().from(stories).where(eq(stories.id, id)).limit(1);
  return result[0];
}

export async function deleteStory(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(stories).where(eq(stories.id, id));
  return true;
}

// Contact message operations
export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(contactMessages).set({ read: true }).where(eq(contactMessages.id, id));
  const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  return result[0];
}

export async function deleteContactMessage(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  return true;
}


// Logo operations
export async function getLogo() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(scoutLogo).orderBy(scoutLogo.createdAt).limit(1);
  return result[0];
}

export async function updateLogo(logoUrl: string, uploadedBy: number) {
  const db = await getDb();
  if (!db) return undefined;
  // Delete old logo
  await db.delete(scoutLogo);
  // Insert new logo
  const result = await db.insert(scoutLogo).values({ logoUrl, uploadedBy });
  return result;
}

// Admin password operations
export async function getAdminPassword() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminPassword).orderBy(adminPassword.createdAt).limit(1);
  return result[0];
}

export async function setAdminPassword(passwordHash: string, updatedBy: number) {
  const db = await getDb();
  if (!db) return undefined;
  // Delete old password
  await db.delete(adminPassword);
  // Insert new password
  const result = await db.insert(adminPassword).values({ passwordHash, updatedBy, updatedAt: new Date() });
  return result;
}
