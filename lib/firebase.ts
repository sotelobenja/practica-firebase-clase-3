"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectDataConnectEmulator, getDataConnect, type DataConnect } from "firebase/data-connect";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig, sqlConnectConfig } from "./firebase-config";

/**
 * En `npm run dev` (NODE_ENV=development) la app habla con los emuladores locales:
 *   Auth → 127.0.0.1:9099   ·   SQL Connect → 127.0.0.1:9399   ·   Firestore → 127.0.0.1:8080
 * En el build de producción (`npm run build`) habla con los servicios reales.
 */
export const USA_EMULADORES = process.env.NODE_ENV === "development";

let cache: { app: FirebaseApp; auth: Auth; dc: DataConnect; db: Firestore } | null = null;

/** Inicialización perezosa: solo en el navegador, nunca durante el build estático. */
export function firebase() {
  if (cache) return cache;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const dc = getDataConnect(app, sqlConnectConfig);
  const db = getFirestore(app);
  if (USA_EMULADORES) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectDataConnectEmulator(dc, "127.0.0.1", 9399);
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  cache = { app, auth, dc, db };
  return cache;
}
