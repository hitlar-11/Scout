/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly DATABASE_URL: string
  readonly OWNER_USER_ID: string
  readonly BUILT_IN_FORGE_API_URL: string
  readonly BUILT_IN_FORGE_API_KEY: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_API_KEY: string
  readonly CLOUDINARY_API_KEY: string
  readonly VITE_CLOUDINARY_API_SECRET: string
  readonly CLOUDINARY_API_SECRET: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_LOGO: string
  readonly VITE_ANALYTICS_ENDPOINT: string
  readonly VITE_ANALYTICS_WEBSITE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
