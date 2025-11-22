// Environment variables configuration
// This file provides a safe way to access environment variables
// In Vite, use import.meta.env for client-side variables

export const ENV = {
  // Firebase Configuration
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  firebaseStorageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  firebaseMessagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  firebaseMeasurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  
  // Database (PostgreSQL connection string)
  databaseUrl: import.meta.env.DATABASE_URL || '',

  // Owner User ID (for admin role assignment)
  ownerUserId: import.meta.env.OWNER_USER_ID || '',
  
  // Storage/Forge API
  forgeApiUrl: import.meta.env.BUILT_IN_FORGE_API_URL || '',
  forgeApiKey: import.meta.env.BUILT_IN_FORGE_API_KEY || '',
  
  // Cloudinary Configuration
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || import.meta.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || import.meta.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET || import.meta.env.CLOUDINARY_API_SECRET || '',
  
  // App configuration
  appTitle: import.meta.env.VITE_APP_TITLE || 'كشاف المهدي',
  appLogo: import.meta.env.VITE_APP_LOGO || '/logo.png',
};



