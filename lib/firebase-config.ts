/**
 * Configuración web de tu proyecto Firebase.
 * Consola de Firebase → ⚙ Configuración del proyecto → General → Tus apps → App web → SDK setup and configuration
 *
 * Los valores de este archivo se exponen en el cliente (JavaScript) y no son secretos.
 * Por eso NO se deben commitear claves reales ni credenciales privadas.
 *
 * En desarrollo, la app usa los emuladores locales. En producción, completar las variables
 * de entorno del proyecto y dejar este archivo sin valores reales en el repositorio.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "practica-firebase-clase-3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "practica-firebase-clase-3",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:906579072682:web:8fcfb6d4d453f28480e2d3",
};

export const sqlConnectConfig = {
  location: "us-east4",
  service: "catalogo",
  connector: "cursos",
};
