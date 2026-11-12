/**
 * Configuración web de tu proyecto Firebase.
 * Consola de Firebase → ⚙ Configuración del proyecto → General → Tus apps → App web → SDK setup and configuration
 *
 * Estos valores NO son secretos: viajan en el bundle de JavaScript y cualquiera puede verlos.
 * La seguridad de las reseñas depende de Firebase Auth y las reglas de Firestore.
 *
 * Mientras desarrollás con `npm run dev`, la app usa los emuladores locales y no importa
 * si estos valores son reales. Para producción tenés que completarlos.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCwpP00lth6HY7NWpW3LFiRLx0UZkFSokW",
  authDomain: "practica-firebase-clase-3.firebaseapp.com",
  projectId: "practica-firebase-clase-3",
  appId: "1:906579072682:web:8fcfb6d4d453f28480e2d3",
};

export const sqlConnectConfig = {
  location: "us-east4",
  service: "catalogo",
  connector: "cursos",
};
