"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  borrarResena,
  escucharMiResena,
  escucharResenas,
  guardarResena,
  resumenDe,
  type Resena,
  type ResumenResenas,
} from "@/lib/resenas";

interface Props {
  cursoId: string;
  uid: string | null;
}

export default function ResenasCurso({ cursoId, uid }: Props) {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [propia, setPropia] = useState<Resena | null>(null);
  const [resumen, setResumen] = useState<ResumenResenas | null>(null);
  const [soloCinco, setSoloCinco] = useState(false);
  const [puntaje, setPuntaje] = useState(5);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    return escucharResenas(
      cursoId,
      (nuevas) => {
        setResenas(nuevas);
        setCargando(false);
      },
      (fallo) => {
        setError(fallo.message);
        setCargando(false);
      },
      soloCinco,
    );
  }, [cursoId, soloCinco]);

  useEffect(() => {
    if (!uid) {
      setPropia(null);
      return;
    }
    return escucharMiResena(cursoId, uid, setPropia, (fallo) => setError(fallo.message));
  }, [cursoId, uid]);

  useEffect(() => {
    setPuntaje(propia?.puntaje ?? 5);
    setTexto(propia?.texto ?? "");
  }, [propia]);

  useEffect(() => {
    let vigente = true;
    resumenDe(cursoId)
      .then((nuevo) => {
        if (vigente) setResumen(nuevo);
      })
      .catch((fallo: Error) => {
        if (vigente) setError(fallo.message);
      });
    return () => {
      vigente = false;
    };
  }, [cursoId, resenas]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await guardarResena(cursoId, puntaje, texto);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo guardar la reseña.");
    } finally {
      setEnviando(false);
    }
  }

  async function onBorrar() {
    if (!window.confirm("¿Querés borrar tu reseña?")) return;
    setEnviando(true);
    setError(null);
    try {
      await borrarResena(cursoId);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo borrar la reseña.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="resenas" aria-label="Reseñas del curso">
      <h3 className="resenas__titulo">
        Reseñas
        {resumen && resumen.cantidad > 0 && (
          <small className="resenas__resumen">
            {" "}
            · ★ {resumen.promedio?.toFixed(1) ?? "—"} ({resumen.cantidad})
          </small>
        )}
      </h3>

      <label className="resenas__filtro">
        <input type="checkbox" checked={soloCinco} onChange={(event) => setSoloCinco(event.target.checked)} />
        Solo 5 estrellas
      </label>

      {uid ? (
        <form className="resenas__form" onSubmit={onSubmit}>
          <label>
            Puntaje
            <select value={puntaje} onChange={(event) => setPuntaje(Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((valor) => (
                <option key={valor} value={valor}>
                  {"★".repeat(valor)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tu comentario
            <textarea
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              maxLength={500}
              required
              rows={3}
            />
          </label>
          <div className="resenas__acciones">
            <button type="submit" className="button button--small" disabled={enviando}>
              {enviando ? "Guardando…" : propia ? "Actualizar mi reseña" : "Publicar reseña"}
            </button>
            {propia && (
              <button type="button" className="button button--small button--ghost" disabled={enviando} onClick={onBorrar}>
                Borrar
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="hint">Ingresá para publicar una reseña.</p>
      )}

      {error && <p className="alerta alerta--error" role="alert">{error}</p>}
      {cargando ? (
        <p className="hint">Cargando reseñas…</p>
      ) : resenas.length === 0 ? (
        <p className="hint">Todavía no hay reseñas para este filtro.</p>
      ) : (
        <ul className="resenas__lista">
          {resenas.map((resena) => (
            <li key={resena.uid} className="resenas__item">
              <strong aria-label={`${resena.puntaje} de 5 estrellas`}>{"★".repeat(resena.puntaje)}</strong>
              {resena.pendiente && <small className="hint"> · Guardando…</small>}
              <p>{resena.texto}</p>
              <small>
                {resena.autor}
                {resena.creadaEn && ` · ${resena.creadaEn.toDate().toLocaleDateString()}`}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
