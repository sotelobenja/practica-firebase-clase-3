import { after, before, beforeEach, test } from "node:test";
import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

let environment;
const CURSO = "seguridad-web";
const resena = (extra = {}) => ({
  puntaje: 5,
  texto: "Muy bueno",
  autor: "Ana",
  creadaEn: serverTimestamp(),
  ...extra,
});

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-resenas",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

beforeEach(() => environment.clearFirestore());
after(() => environment.cleanup());

test("cualquiera puede consultar reseñas, incluso sin login", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "cursos", CURSO, "resenas", "ana"), {
      puntaje: 5,
      texto: "Visible",
      autor: "Ana",
      creadaEn: Timestamp.now(),
    });
  });

  const anonimo = environment.unauthenticatedContext().firestore();
  await assertSucceeds(getDocs(query(collection(anonimo, "cursos", CURSO, "resenas"))));
});

test("no se puede leer públicamente el documento padre del curso", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "cursos", CURSO), { resumen: "Privado" });
  });

  const anonimo = environment.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anonimo, "cursos", CURSO)));
});

test("Ana puede crear su propia reseña con fecha del servidor", async () => {
  const db = environment.authenticatedContext("ana").firestore();
  await assertSucceeds(setDoc(doc(db, "cursos", CURSO, "resenas", "ana"), resena()));
});

test("Ana no puede crear una reseña con el UID de Bruno", async () => {
  const db = environment.authenticatedContext("ana").firestore();
  await assertFails(setDoc(doc(db, "cursos", CURSO, "resenas", "bruno"), resena()));
});

test("un usuario sin login no puede escribir", async () => {
  const db = environment.unauthenticatedContext().firestore();
  await assertFails(setDoc(doc(db, "cursos", CURSO, "resenas", "ana"), resena()));
});

test("rechaza puntajes fuera de rango o decimales", async () => {
  const db = environment.authenticatedContext("ana").firestore();
  const ref = doc(db, "cursos", CURSO, "resenas", "ana");
  await assertFails(setDoc(ref, resena({ puntaje: 6 })));
  await assertFails(setDoc(ref, resena({ puntaje: 4.5 })));
});

test("rechaza campos no incluidos en la lista permitida", async () => {
  const db = environment.authenticatedContext("ana").firestore();
  await assertFails(
    setDoc(doc(db, "cursos", CURSO, "resenas", "ana"), resena({ destacada: true })),
  );
});

test("la fecha es del servidor al crear e inmutable al editar", async () => {
  const db = environment.authenticatedContext("ana").firestore();
  const ref = doc(db, "cursos", CURSO, "resenas", "ana");
  await assertFails(
    setDoc(ref, resena({ creadaEn: Timestamp.fromDate(new Date("2020-01-01T00:00:00Z")) })),
  );
  await assertSucceeds(setDoc(ref, resena()));
  await assertFails(updateDoc(ref, { creadaEn: Timestamp.now() }));
  await assertSucceeds(updateDoc(ref, { puntaje: 4 }));
});

test("el cliente no puede escribir en el documento del curso", async () => {
  const db = environment.authenticatedContext("ana").firestore();
  await assertFails(setDoc(doc(db, "cursos", CURSO), { resumen: { cantidad: 999, promedio: 5 } }));
});

test("la validación de campos y tamaños también aplica al actualizar", async () => {
  const db = environment.authenticatedContext("ana").firestore();
  const ref = doc(db, "cursos", CURSO, "resenas", "ana");
  await assertSucceeds(setDoc(ref, resena()));
  await assertFails(updateDoc(ref, { texto: "x".repeat(501) }));
  await assertFails(updateDoc(ref, { puntaje: "4" }));
});

test("solo el dueño puede borrar la reseña", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "cursos", CURSO, "resenas", "ana"), {
      puntaje: 5,
      texto: "Muy bueno",
      autor: "Ana",
      creadaEn: Timestamp.now(),
    });
  });

  const bruno = environment.authenticatedContext("bruno").firestore();
  const ana = environment.authenticatedContext("ana").firestore();
  await assertFails(deleteDoc(doc(bruno, "cursos", CURSO, "resenas", "ana")));
  await assertSucceeds(deleteDoc(doc(ana, "cursos", CURSO, "resenas", "ana")));
});
