import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let app: App;

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString();
    credential = cert(JSON.parse(json));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const keyPath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    const json = readFileSync(keyPath, 'utf-8');
    credential = cert(JSON.parse(json));
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = cert(JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8')));
  } else {
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    return app;
  }

  app = initializeApp({ credential });
  return app;
}

export const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
