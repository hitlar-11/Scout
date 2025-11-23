import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as fbSignOut,
  User as FbUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ENV } from '@/_core/env';

const firebaseConfig = {
  apiKey: ENV.firebaseApiKey,
  authDomain: ENV.firebaseAuthDomain,
  projectId: ENV.firebaseProjectId,
  storageBucket: ENV.firebaseStorageBucket,
  messagingSenderId: ENV.firebaseMessagingSenderId,
  appId: ENV.firebaseAppId,
  measurementId: ENV.firebaseMeasurementId,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig as any);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const res = await signInWithPopup(auth, googleProvider);
  // After successful sign-in, create or update the user record in Firestore
  try {
    const fbUser = res.user;
    if (fbUser) {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // User exists, just update lastLogin
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        // New user, create full profile
        await setDoc(
          userRef,
          {
            uid: fbUser.uid,
            email: fbUser.email ? fbUser.email.toLowerCase() : null,
            name: fbUser.displayName || null,
            photoURL: fbUser.photoURL || null,
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp(),
            role: 'user', // Default role
          },
          { merge: true }
        );
      }
    }
  } catch (e) {
    console.warn('Failed to upsert user in Firestore after Google sign-in', e);
  }

  return res;
}

export async function getUserRole(uid: string): Promise<string | null> {
  if (!uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role || null;
    }
    return null;
  } catch (e) {
    console.warn('Error fetching user role:', e);
    return null;
  }
}

// Utility: upsert a Firestore `users` doc from a Firebase User object
export async function upsertUserFromFirebaseUser(fbUser: any) {
  if (!fbUser) return;
  try {
    const userRef = doc(db, 'users', fbUser.uid);
    await setDoc(
      userRef,
      {
        uid: fbUser.uid,
        email: fbUser.email ? fbUser.email.toLowerCase() : null,
        name: fbUser.displayName || null,
        photoURL: fbUser.photoURL || null,
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('upsertUserFromFirebaseUser error', e);
  }
}

// Update profile fields for a user in Firestore (merge)
export async function updateUserProfile(uid: string, data: Record<string, any>) {
  if (!uid) throw new Error('Missing uid');
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.warn('updateUserProfile error', e);
    throw e;
  }
}

export function onAuthChange(callback: (user: FbUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signOut() {
  return fbSignOut(auth);
}

// Utility: get user role from Firestore `user_roles` collection by email
export async function getUserRoleByEmail(email?: string) {
  if (!email) return null;
  try {
    const q = query(collection(db, 'user_roles'), where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      return docData.role || null;
    }
    // as fallback, try single doc keyed by uid or email
    const docRef = doc(db, 'user_roles', email.toLowerCase());
    const single = await getDoc(docRef);
    if (single.exists()) return (single.data() as any).role || null;
    return null;
  } catch (e) {
    console.warn('Error fetching user role from Firestore', e);
    return null;
  }
}

export default { app, auth, db };
