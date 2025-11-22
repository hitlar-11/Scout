// API layer migrated from Supabase to Firebase Firestore
import { db } from './firebase';
import type {
  Event,
  InsertEvent,
  GalleryImage,
  InsertGalleryImage,
  Story,
  InsertStory,
  ContactMessage,
  InsertContactMessage,
  User,
  Competition,
  InsertCompetition,
  CompetitionQuestion,
  InsertCompetitionQuestion,
  CompetitionResult,
  EventRegistration,
  InsertCompetitionAnswer,
  InsertCompetitionResult,
} from '../schema';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
  limit,
} from 'firebase/firestore';

const toIso = (d: any) => (d instanceof Date ? d.toISOString() : new Date(d).toISOString());

// Events API (Firestore collection: `events`)
export const eventsApi = {
  list: async (): Promise<Event[]> => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Event), id: d.id }));
  },

  getById: async (id: string): Promise<Event | undefined> => {
    const ref = doc(db, 'events', id);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Event) : undefined;
  },

  create: async (data: Omit<InsertEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    await addDoc(collection(db, 'events'), { ...data, date: toIso(data.date), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  },

  update: async (id: string, data: Partial<Omit<InsertEvent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Event | undefined> => {
    const ref = doc(db, 'events', id);
    const updateData: any = { ...data, updatedAt: new Date().toISOString() };
    if (data.date) updateData.date = toIso(data.date);
    await updateDoc(ref, updateData);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Event) : undefined;
  },

  delete: async (id: string): Promise<boolean> => {
    await deleteDoc(doc(db, 'events', id));
    return true;
  },

  updateStatus: async (id: string, status: 'upcoming' | 'ongoing' | 'completed'): Promise<void> => {
    const ref = doc(db, 'events', id);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
  },
};

// Gallery API (collection: `gallery_images`)
export const galleryApi = {
  list: async (): Promise<GalleryImage[]> => {
    const q = query(collection(db, 'gallery_images'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as GalleryImage), id: d.id }));
  },
  create: async (data: Omit<InsertGalleryImage, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    await addDoc(collection(db, 'gallery_images'), { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  },
  update: async (id: string, data: Partial<Omit<InsertGalleryImage, 'id' | 'createdAt' | 'updatedAt'>>): Promise<GalleryImage | undefined> => {
    const ref = doc(db, 'gallery_images', id);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() } as any);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as GalleryImage) : undefined;
  },
  delete: async (id: string): Promise<boolean> => {
    await deleteDoc(doc(db, 'gallery_images', id));
    return true;
  },
};

// Stories API (collection: `stories`)
export const storiesApi = {
  list: async (userId?: string): Promise<Story[]> => {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ ...(d.data() as Story), id: d.id }));
    return items.filter((s: any) => (userId ? true : !!s.visibleToAll));
  },
  create: async (data: Omit<InsertStory, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    await addDoc(collection(db, 'stories'), { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  },
  update: async (id: string, data: Partial<Omit<InsertStory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Story | undefined> => {
    const ref = doc(db, 'stories', id);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() } as any);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Story) : undefined;
  },
  delete: async (id: string): Promise<boolean> => {
    await deleteDoc(doc(db, 'stories', id));
    return true;
  },
};

// Contact API (collection: `contact_messages`)
export const contactApi = {
  submit: async (data: Omit<InsertContactMessage, 'id' | 'read' | 'createdAt'>): Promise<void> => {
    await addDoc(collection(db, 'contact_messages'), { ...data, createdAt: new Date().toISOString(), read: false } as any);
  },
  list: async (): Promise<ContactMessage[]> => {
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as ContactMessage), id: d.id }));
  },
  markAsRead: async (id: string): Promise<ContactMessage | undefined> => {
    const ref = doc(db, 'contact_messages', id);
    await updateDoc(ref, { read: true } as any);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as ContactMessage) : undefined;
  },
  delete: async (id: string): Promise<boolean> => {
    await deleteDoc(doc(db, 'contact_messages', id));
    return true;
  },
};

// User API (collection: `users`)
export const userApi = {
  getProfile: async (userId: string): Promise<User | undefined> => {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? (snap.data() as User) : undefined;
  },
  updateProfile: async (userId: string, data: { age?: number; phone?: string; scoutLevel?: string; profileCompleted?: boolean }): Promise<User | undefined> => {
    const ref = doc(db, 'users', userId);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() } as any);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as User) : undefined;
  },
  getByOpenId: async (openId: string): Promise<User | undefined> => {
    const q = query(collection(db, 'users'), where('openId', '==', openId), limit(1));
    const snap = await getDocs(q);
    return snap.empty ? undefined : (snap.docs[0].data() as User);
  },
  upsert: async (user: any): Promise<void> => {
    const id = user.id || user.openId || user.email;
    if (!id) throw new Error('Cannot upsert user without id');
    await setDoc(doc(db, 'users', String(id)), { ...user, updatedAt: new Date().toISOString(), lastSignedIn: new Date().toISOString() }, { merge: true });
  },
};

// Admin API
export const adminApi = {
  getAllUsers: async (): Promise<User[]> => {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({ ...(d.data() as User), id: d.id }));
  },
  getMessages: async (): Promise<ContactMessage[]> => {
    return contactApi.list();
  },
};

// Competition API (collection: `competitions`)
export const competitionApi = {
  getAll: async (): Promise<Competition[]> => {
    const q = query(collection(db, 'competitions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Competition), id: d.id }));
  },
  getById: async (id: string): Promise<Competition | undefined> => {
    const ref = doc(db, 'competitions', id);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Competition) : undefined;
  },
  create: async (data: Omit<InsertCompetition, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    console.log("Attempting to create competition with data:", data);
    try {
      const payload = {
        ...data,
        startDate: toIso(data.startDate),
        endDate: toIso(data.endDate),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ensure no undefined values
        descriptionAr: data.descriptionAr || "",
        participationPoints: data.participationPoints || 20,
        firstPlacePoints: data.firstPlacePoints || 100,
        secondPlacePoints: data.secondPlacePoints || 75,
        thirdPlacePoints: data.thirdPlacePoints || 50,
      };
      console.log("Sanitized payload:", payload);
      await addDoc(collection(db, 'competitions'), payload);
      console.log("Competition created successfully");
    } catch (error) {
      console.error("Error in competitionApi.create:", error);
      throw error;
    }
  },
  updateStatus: async (id: string, status: 'draft' | 'active' | 'finished'): Promise<void> => {
    console.log(`Updating competition ${id} status to ${status}`);
    try {
      const ref = doc(db, 'competitions', id);
      await updateDoc(ref, {
        status,
        updatedAt: new Date().toISOString()
      });
      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  },
  delete: async (id: string): Promise<boolean> => {
    await deleteDoc(doc(db, 'competitions', id));
    return true;
  },
  hasUserEntered: async (competitionId: string, userId: string): Promise<boolean> => {
    // Check v2 results
    const qV2 = query(
      collection(db, 'competition_results_v2'),
      where('competitionId', '==', competitionId),
      where('userId', '==', userId),
      limit(1)
    );
    const snapV2 = await getDocs(qV2);
    if (!snapV2.empty) return true;

    // Check legacy results
    const q = query(
      collection(db, 'competition_results'),
      where('competitionId', '==', competitionId),
      where('userId', '==', userId),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  },
};

// Competition Questions API (collection: `competition_questions`)
export const competitionQuestionsApi = {
  getByCompetition: async (competitionId: string): Promise<CompetitionQuestion[]> => {
    console.log("Fetching questions for competitionId:", competitionId);
    try {
      // Temporarily removed orderBy to avoid index requirement
      const q = query(collection(db, 'competition_questions'), where('competitionId', '==', competitionId));
      const snap = await getDocs(q);
      console.log("Found questions:", snap.docs.length);
      const questions = snap.docs.map((d) => ({ ...(d.data() as CompetitionQuestion), id: d.id }));
      console.log("Questions data:", questions);
      // Sort in memory instead
      return questions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
  },
  create: async (data: Omit<InsertCompetitionQuestion, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    console.log("Creating question with data:", data);
    try {
      await addDoc(collection(db, 'competition_questions'), { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      console.log("Question created successfully");
    } catch (error) {
      console.error("Error creating question:", error);
      throw error;
    }
  },
  delete: async (id: string): Promise<boolean> => {
    console.log("Deleting question with id:", id);
    try {
      await deleteDoc(doc(db, 'competition_questions', id));
      console.log("Question deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  },
  getRandom: async (competitionId: string, count: number): Promise<CompetitionQuestion[]> => {
    const questions = await competitionQuestionsApi.getByCompetition(competitionId);
    // Shuffle array
    const shuffled = questions.sort(() => 0.5 - Math.random());
    // Get sub-array of first n elements
    return shuffled.slice(0, count);
  },
};

// Competition Results API (collection: `competition_results_v2`)
export const competitionResultsApi = {
  getByCompetition: async (competitionId: string): Promise<CompetitionResult[]> => {
    // Try the new v2 collection first
    const qV2 = query(
      collection(db, 'competition_results_v2'),
      where('competitionId', '==', competitionId)
    );
    const snapV2 = await getDocs(qV2);
    if (!snapV2.empty) {
      const results = snapV2.docs.map((d) => ({ ...(d.data() as CompetitionResult), id: d.id }));
      return results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }
    // Fallback to original collection for legacy data
    const q = query(
      collection(db, 'competition_results'),
      where('competitionId', '==', competitionId)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map((d) => ({ ...(d.data() as CompetitionResult), id: d.id }));
    return results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  },
  create: async (data: Omit<InsertCompetitionResult, 'id' | 'completedAt'>): Promise<void> => {
    await addDoc(collection(db, 'competition_results_v2'), { ...data, completedAt: new Date().toISOString() });
  },
};

// Competition Answers API (collection: `competition_answers_v2`)
export const competitionAnswersApi = {
  create: async (data: Omit<InsertCompetitionAnswer, 'id' | 'createdAt'>): Promise<void> => {
    await addDoc(collection(db, 'competition_answers_v2'), { ...data, createdAt: new Date().toISOString() });
  },
  getByUserAndCompetition: async (userId: string, competitionId: string): Promise<any[]> => {
    const q = query(
      collection(db, 'competition_answers_v2'),
      where('userId', '==', userId),
      where('competitionId', '==', competitionId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
  },
};

// Leaderboard API - Calculate user rankings
export const leaderboardApi = {
  getTopUsers: async (): Promise<Array<{
    userId: string;
    userName: string;
    totalPoints: number;
    competitionsParticipated: number;
    eventsAttended: number;
    bestRank: number;
    rank: number;
  }>> => {
    // Get all competition results (v1 and v2)
    const resultsSnap = await getDocs(collection(db, 'competition_results'));
    const resultsSnapV2 = await getDocs(collection(db, 'competition_results_v2'));

    const allResults = [
      ...resultsSnap.docs.map(d => {
        const data = d.data() as CompetitionResult;
        return { ...data, docId: d.id };
      }),
      ...resultsSnapV2.docs.map(d => {
        const data = d.data() as CompetitionResult;
        return { ...data, docId: d.id };
      })
    ];

    // Get all event registrations with awarded points
    const eventRegsSnap = await getDocs(collection(db, 'event_registrations'));
    const eventRegistrations = eventRegsSnap.docs.map(d => d.data() as EventRegistration);
    const attendedEvents = eventRegistrations.filter(r => r.attended && r.pointsAwarded);

    // Get all users
    const usersSnap = await getDocs(collection(db, 'users'));
    const users = usersSnap.docs.map(d => ({ ...(d.data() as User), id: d.id }));

    // Fetch all competitions to get point values
    const competitionsSnap = await getDocs(collection(db, 'competitions'));
    const competitionsMap = new Map(competitionsSnap.docs.map(d => [d.id, d.data() as Competition]));

    // Group results by competition to calculate ranks
    const competitionGroups = new Map<string, typeof allResults>();
    allResults.forEach(result => {
      const group = competitionGroups.get(result.competitionId) || [];
      group.push(result);
      competitionGroups.set(result.competitionId, group);
    });

    // Calculate rank for each result based on score within competition
    const resultsWithRank = allResults.map(result => {
      const competitionResults = competitionGroups.get(result.competitionId) || [];
      const sorted = [...competitionResults].sort((a, b) => b.score - a.score);
      const rank = sorted.findIndex(r => r.docId === result.docId) + 1;
      return { ...result, rank };
    });

    // Calculate points for each user
    const userStats = new Map<string, {
      userId: string;
      userName: string;
      totalPoints: number;
      competitionPoints: number;
      eventPoints: number;
      manualPoints: number;
      competitionsParticipated: number;
      eventsAttended: number;
      bestRank: number;
    }>();

    // Initialize ALL users with their manual points (even if 0)
    users.forEach(user => {
      const manualPoints = (user as any).manualPoints || 0;
      userStats.set(user.id, {
        userId: user.id,
        userName: user.name || user.email || 'مستخدم',
        totalPoints: manualPoints,
        competitionPoints: 0,
        eventPoints: 0,
        manualPoints: manualPoints,
        competitionsParticipated: 0,
        eventsAttended: 0,
        bestRank: 999,
      });
    });

    // Add competition points
    resultsWithRank.forEach(result => {
      const user = users.find(u => u.id === result.userId);
      if (!user) return;

      const existing = userStats.get(result.userId);
      if (!existing) return; // Should never happen since we initialized all users

      // Get competition specific points or defaults
      const competition = competitionsMap.get(result.competitionId);
      const firstPlace = competition?.firstPlacePoints || 100;
      const secondPlace = competition?.secondPlacePoints || 75;
      const thirdPlace = competition?.thirdPlacePoints || 50;
      const participation = competition?.participationPoints || 20;

      // Award points based on rank
      let points = participation; // Default participation points
      if (result.rank === 1) points = firstPlace;
      else if (result.rank === 2) points = secondPlace;
      else if (result.rank === 3) points = thirdPlace;

      existing.totalPoints += points;
      existing.competitionPoints += points;
      existing.competitionsParticipated += 1;
      existing.bestRank = Math.min(existing.bestRank, result.rank);

      userStats.set(result.userId, existing);
    });

    // Add event attendance points
    // Fetch all events to get their points
    const events = await eventsApi.list();
    const eventsMap = new Map(events.map(e => [e.id, e]));

    attendedEvents.forEach(registration => {
      const user = users.find(u => u.id === registration.userId);
      if (!user) return;

      const event = eventsMap.get(registration.eventId);
      const eventPoints = event?.points || 10; // Default to 10 if not found

      const existing = userStats.get(registration.userId);
      if (!existing) return; // Should never happen since we initialized all users

      existing.totalPoints += eventPoints;
      existing.eventPoints += eventPoints;
      existing.eventsAttended += 1;

      userStats.set(registration.userId, existing);
    });

    // Convert to array and sort by points
    const leaderboard = Array.from(userStats.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    return leaderboard;
  },
};

// Event Registrations API - User enrollment and attendance tracking
export const eventRegistrationsApi = {
  // Register user for an event
  register: async (eventId: string, userId: string, userName: string, userEmail: string | null): Promise<string> => {
    const id = `${eventId}_${userId}`;
    const ref = doc(db, 'event_registrations', id);
    await setDoc(ref, {
      id,
      eventId,
      userId,
      userName,
      userEmail,
      registeredAt: new Date().toISOString(),
      attended: false,
      pointsAwarded: false,
    });
    return id;
  },

  // Get all registrations for an event
  getByEvent: async (eventId: string): Promise<EventRegistration[]> => {
    const q = query(
      collection(db, 'event_registrations'),
      where('eventId', '==', eventId)
    );
    const snap = await getDocs(q);
    const registrations = snap.docs.map((d) => d.data() as EventRegistration);
    // Sort in memory to avoid composite index requirement
    return registrations.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
  },

  // Get user's registrations
  getByUser: async (userId: string): Promise<EventRegistration[]> => {
    const q = query(
      collection(db, 'event_registrations'),
      where('userId', '==', userId),
      orderBy('registeredAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as EventRegistration);
  },

  // Check if user is registered for an event
  isRegistered: async (eventId: string, userId: string): Promise<boolean> => {
    const id = `${eventId}_${userId}`;
    const ref = doc(db, 'event_registrations', id);
    const snap = await getDoc(ref);
    return snap.exists();
  },

  // Admin marks attendance
  markAttendance: async (registrationId: string, attended: boolean): Promise<void> => {
    const ref = doc(db, 'event_registrations', registrationId);
    await updateDoc(ref, { attended });
  },

  // Award points to all attendees of an event
  awardPoints: async (eventId: string): Promise<number> => {
    const registrations = await eventRegistrationsApi.getByEvent(eventId);
    const attendees = registrations.filter(r => r.attended && !r.pointsAwarded);

    // Award 10 points to each attendee (logic handled in leaderboard)

    // Update each registration to mark points as awarded
    const updatePromises = attendees.map(async (registration) => {
      const ref = doc(db, 'event_registrations', registration.id);
      await updateDoc(ref, { pointsAwarded: true });
    });

    await Promise.all(updatePromises);

    return attendees.length; // Return number of users who received points
  },
};

