import { db } from './firebase';
import { doc, getDocs, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

/**
 * Admin user management functions
 * These functions help manage user roles and permissions
 */

/**
 * Set a user as admin by email
 * @param email - User email address
 * @returns Success status and message
 */
export async function makeUserAdmin(email: string) {
  try {
    // Find user by email
    const usersSnap = await getDocs(collection(db, 'users'));
    const userDoc = usersSnap.docs.find(d => {
      const data = d.data();
      return data.email?.toLowerCase() === email.toLowerCase();
    });

    if (!userDoc) {
      return { success: false, message: `User with email ${email} not found` };
    }

    // Update user role
    const ref = doc(db, 'users', userDoc.id);
    await updateDoc(ref, { role: 'admin' });

    return { success: true, message: `User ${email} has been made admin`, userId: userDoc.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to make user admin: ${message}` };
  }
}

/**
 * Remove admin role from user by email
 * @param email - User email address
 * @returns Success status and message
 */
export async function removeUserAdmin(email: string) {
  try {
    // Find user by email
    const usersSnap = await getDocs(collection(db, 'users'));
    const userDoc = usersSnap.docs.find(d => {
      const data = d.data();
      return data.email?.toLowerCase() === email.toLowerCase();
    });

    if (!userDoc) {
      return { success: false, message: `User with email ${email} not found` };
    }

    // Update user role
    const ref = doc(db, 'users', userDoc.id);
    await updateDoc(ref, { role: 'user' });

    return { success: true, message: `User ${email} admin role has been removed`, userId: userDoc.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to remove admin role: ${message}` };
  }
}

/**
 * Get user by email and return their role
 * @param email - User email address
 * @returns User object with role info
 */
export async function getUserByEmail(email: string) {
  try {
    // Search in users collection
    const usersSnap = await getDocs(collection(db, 'users'));
    const user = usersSnap.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .find(u => u.email?.toLowerCase() === email.toLowerCase() || u.name?.toLowerCase().includes(email.toLowerCase()));

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        name: user.name || user.email || '',
        role: user.role || 'user',
        scoutLevel: user.scoutLevel || null,
        manualPoints: user.manualPoints || 0,
        trophies: user.trophies || [],
        createdAt: user.createdAt || '',
        lastSignIn: user.lastSignedIn || null,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to get user: ${message}` };
  }
}

/**
 * List all users with their roles
 * @returns Array of users with role info
 */
export async function listAllUsers() {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const users = usersSnap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        email: data.email || '',
        name: data.name || data.email || 'User',
        role: data.role || 'user',
        scoutLevel: data.scoutLevel || null,
        manualPoints: data.manualPoints || 0,
        trophies: data.trophies || [],
        createdAt: data.createdAt || '',
        lastSignIn: data.lastSignedIn || null,
      };
    });
    return { success: true, users };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to list users: ${message}` };
  }
}

/**
 * Check if user is admin by email
 * @param email - User email address
 * @returns Boolean indicating if user is admin
 */
export async function isUserAdmin(email: string): Promise<boolean> {
  try {
    const result = await getUserByEmail(email);
    if (!result.success) return false;
    return result.user?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Award a trophy to a user
 * @param userId - User ID
 * @param trophyName - Name/description of the trophy
 * @returns Success status and message
 */
export async function awardTrophy(userId: string, trophyName: string) {
  try {
    const ref = doc(db, 'users', userId);
    const userSnap = await getDocs(collection(db, 'users'));
    const userDoc = userSnap.docs.find(d => d.id === userId);

    if (!userDoc) {
      return { success: false, message: 'User not found' };
    }

    const userData = userDoc.data();
    const currentTrophies = userData.trophies || [];

    // Add new trophy if it doesn't already exist
    if (!currentTrophies.includes(trophyName)) {
      await updateDoc(ref, {
        trophies: [...currentTrophies, trophyName]
      });
      return { success: true, message: `Trophy "${trophyName}" awarded successfully` };
    } else {
      return { success: false, message: 'User already has this trophy' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to award trophy: ${message}` };
  }
}

/**
 * Remove a trophy from a user
 * @param userId - User ID
 * @param trophyName - Name/description of the trophy to remove
 * @returns Success status and message
 */
export async function removeTrophy(userId: string, trophyName: string) {
  try {
    const ref = doc(db, 'users', userId);
    const userSnap = await getDocs(collection(db, 'users'));
    const userDoc = userSnap.docs.find(d => d.id === userId);

    if (!userDoc) {
      return { success: false, message: 'User not found' };
    }

    const userData = userDoc.data();
    const currentTrophies = userData.trophies || [];

    // Remove trophy
    const updatedTrophies = currentTrophies.filter((t: string) => t !== trophyName);
    await updateDoc(ref, {
      trophies: updatedTrophies
    });

    return { success: true, message: `Trophy "${trophyName}" removed successfully` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to remove trophy: ${message}` };
  }
}

/**
 * Delete a user and all their related data
 * @param userId - User ID to delete
 * @returns Success status and message
 */
export async function deleteUser(userId: string) {
  try {
    // 1. Delete from users collection
    await deleteDoc(doc(db, 'users', userId));

    // 2. Delete from event_registrations
    const registrationsQuery = query(collection(db, 'event_registrations'), where('userId', '==', userId));
    const registrationsSnap = await getDocs(registrationsQuery);
    const registrationDeletes = registrationsSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(registrationDeletes);

    // 3. Delete from competition_results
    const resultsQuery = query(collection(db, 'competition_results'), where('userId', '==', userId));
    const resultsSnap = await getDocs(resultsQuery);
    const resultDeletes = resultsSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(resultDeletes);

    // 4. Delete from competition_results_v2 (if exists)
    const resultsV2Query = query(collection(db, 'competition_results_v2'), where('userId', '==', userId));
    const resultsV2Snap = await getDocs(resultsV2Query);
    const resultV2Deletes = resultsV2Snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(resultV2Deletes);

    // 5. Delete from competition_answers
    const answersQuery = query(collection(db, 'competition_answers'), where('userId', '==', userId));
    const answersSnap = await getDocs(answersQuery);
    const answerDeletes = answersSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(answerDeletes);

    return { success: true, message: 'User and all related data deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to delete user: ${message}` };
  }
}

/**
 * Reset all points for a user (competition results, event registrations, and manual points)
 * @param userId - User ID to reset points for
 * @returns Success status and message
 */
export async function resetUserPoints(userId: string) {
  try {
    // 1. Delete from event_registrations
    const registrationsQuery = query(collection(db, 'event_registrations'), where('userId', '==', userId));
    const registrationsSnap = await getDocs(registrationsQuery);
    const registrationDeletes = registrationsSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(registrationDeletes);

    // 2. Delete from competition_results
    const resultsQuery = query(collection(db, 'competition_results'), where('userId', '==', userId));
    const resultsSnap = await getDocs(resultsQuery);
    const resultDeletes = resultsSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(resultDeletes);

    // 3. Delete from competition_results_v2
    const resultsV2Query = query(collection(db, 'competition_results_v2'), where('userId', '==', userId));
    const resultsV2Snap = await getDocs(resultsV2Query);
    const resultV2Deletes = resultsV2Snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(resultV2Deletes);

    // 4. Delete from competition_answers_v2
    const answersQuery = query(collection(db, 'competition_answers_v2'), where('userId', '==', userId));
    const answersSnap = await getDocs(answersQuery);
    const answerDeletes = answersSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(answerDeletes);

    // 5. Reset manual points to 0
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      manualPoints: 0
    });

    return { success: true, message: 'تم إعادة تعيين جميع النقاط بنجاح' };
  } catch (error) {
    console.error('Error resetting user points:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to reset user points: ${message}` };
  }
}
