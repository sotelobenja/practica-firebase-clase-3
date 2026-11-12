import { firebase } from "./firebase";
import {
  average,
  collection,
  count,
  deleteDoc,
  doc,
  getAggregateFromServer,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

export interface Resena {
  uid: string;
  puntaje: number;
  texto: string;
  autor: string;
  creadaEn: Timestamp | null;
  pendiente: boolean;
}

export interface ResumenResenas {
  cantidad: number;
  promedio: number | null;
}

const resenasDe = (cursoId: string) => collection(firebase().db, "cursos", cursoId, "resenas");

function mapearResena(snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Resena {
  const data = snapshot.data({ serverTimestamps: "estimate" });
  if (!data) throw new Error("La reseña dejó de existir.");
  return {
    uid: snapshot.id,
    puntaje: data.puntaje,
    texto: data.texto,
    autor: data.autor,
    creadaEn: data.creadaEn ?? null,
    pendiente: snapshot.metadata.hasPendingWrites,
  };
}

export async function guardarResena(cursoId: string, puntaje: number, texto: string): Promise<void> {
  const usuario = firebase().auth.currentUser;
  if (!usuario) throw new Error("Tenés que ingresar para dejar una reseña.");
  if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
    throw new Error("El puntaje debe ser un número entero entre 1 y 5.");
  }

  const comentario = texto.trim();
  if (comentario.length === 0 || comentario.length > 500) {
    throw new Error("El comentario debe tener entre 1 y 500 caracteres.");
  }

  const nombre = usuario.displayName?.trim() || "Anónimo";
  if (nombre.length > 80) throw new Error("El nombre no puede superar los 80 caracteres.");

  const ref = doc(resenasDe(cursoId), usuario.uid);
  const existente = await getDoc(ref);
  const datos = { puntaje, texto: comentario, autor: nombre };
  if (existente.exists()) {
    await setDoc(ref, datos, { merge: true });
  } else {
    await setDoc(ref, { ...datos, creadaEn: serverTimestamp() });
  }
}

export async function borrarResena(cursoId: string): Promise<void> {
  const usuario = firebase().auth.currentUser;
  if (!usuario) throw new Error("Tenés que ingresar para borrar tu reseña.");
  await deleteDoc(doc(resenasDe(cursoId), usuario.uid));
}

export function escucharResenas(
  cursoId: string,
  alCambiar: (resenas: Resena[]) => void,
  alFallar: (error: Error) => void,
  soloCincoEstrellas = false,
): Unsubscribe {
  const filtros = soloCincoEstrellas ? [where("puntaje", "==", 5)] : [];
  const consulta = query(resenasDe(cursoId), ...filtros, orderBy("creadaEn", "desc"), limit(20));
  return onSnapshot(consulta, (snapshot) => alCambiar(snapshot.docs.map(mapearResena)), alFallar);
}

export function escucharMiResena(
  cursoId: string,
  uid: string,
  alCambiar: (resena: Resena | null) => void,
  alFallar: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(resenasDe(cursoId), uid),
    (snapshot) => alCambiar(snapshot.exists() ? mapearResena(snapshot) : null),
    alFallar,
  );
}

export async function resumenDe(cursoId: string): Promise<ResumenResenas> {
  const snapshot = await getAggregateFromServer(resenasDe(cursoId), {
    cantidad: count(),
    promedio: average("puntaje"),
  });
  return snapshot.data();
}
