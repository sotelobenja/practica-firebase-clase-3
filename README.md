# Práctica de Cloud Firestore: reseñas de cursos

Aplicación Next.js con Firebase Authentication, SQL Connect y Cloud Firestore. Esta guía
documenta únicamente las reseñas de Firestore de la Práctica 4; el catálogo y las inscripciones
existentes se mantienen en el código.

## Funcionalidad

- Consulta pública de reseñas en tiempo real.
- Acceso con cuenta para crear, editar o borrar la reseña propia de cada curso.
- Una reseña por usuario y curso, con el UID como ID del documento.
- Filtro por puntaje, promedio y cantidad calculados con una agregación de Firestore.
- Reglas que validan identidad, campos, tipos, rangos y fecha; índice compuesto para filtrar
  por puntaje y ordenar por fecha.

## Estructura principal

| Archivo | Responsabilidad |
|---|---|
| `firestore.rules` | Acceso y validación de documentos de cursos y reseñas |
| `firestore.indexes.json` | Índice para el filtro por puntaje y orden por fecha |
| `tests/reglas.test.mjs` | Casos permitidos y denegados contra el emulador |
| `lib/resenas.ts` | Lectura, escritura, listener y agregación de reseñas |
| `app/components/ResenasCurso.tsx` | Interfaz de reseñas por curso |

El modelo usado es `cursos/{cursoId}/resenas/{uid}`. Las reglas permiten leer reseñas
públicamente y reservan la escritura al usuario autenticado cuyo UID coincide con el ID del
documento. La fecha de creación debe ser del servidor y no puede modificarse.

## Desarrollo y pruebas

Se requiere Node 24.12 o posterior y Java 21 para el emulador de Firestore.
Para usar cuentas reales, habilitar el proveedor Correo electrónico/contraseña en Firebase
Authentication.

```bash
npm ci
npm run emulators
```

En otra terminal, cargar los datos de ejemplo con `npm run seed` e iniciar la app con
`npm run dev`; abrí <http://localhost:3000/cursos>. Para ejecutar los tests de reglas, detener
los emuladores y usar:

```bash
npm run test:reglas
npm run typecheck
npm run build
```

`lib/firebase-config.ts` contiene la configuración web del proyecto Firebase. En desarrollo,
Auth, SQL Connect y Firestore se conectan a sus emuladores locales; el build usa los servicios
configurados en Firebase.

Para evitar exponer claves reales en el repositorio, usar variables de entorno del cliente:

```bash
cp .env.example .env.local
# completar los valores reales de Firebase en .env.local
```

Ejemplo de variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="tu-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="practica-firebase-clase-3.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="practica-firebase-clase-3"
NEXT_PUBLIC_FIREBASE_APP_ID="1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxx"
```

## Despliegue de Firestore

Revisar el proyecto activo en `.firebaserc` antes de desplegar:

```bash
npx firebase deploy --only firestore:rules,firestore:indexes
```

Para publicar la interfaz, ejecutar `npm run build` y luego `npx firebase deploy --only hosting`.
Firebase Hosting sirve el export estático de Next.js.

## Reflexiones y evidencias

- [REFLEXION.md](./REFLEXION.md): respuestas sobre el diseño de Firestore.
- [docs/evidencias.md](./docs/evidencias.md): pruebas y despliegues documentados para esta práctica.
