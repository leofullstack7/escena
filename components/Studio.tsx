"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { renderDemoVideo } from "../lib/demo-video";
import {
  GenerationRecord,
  loadHistory,
  prependHistory,
} from "../lib/history";

type Status = {
  provider: string;
  ready: boolean;
  demo: boolean;
};

const PROMPT_EXAMPLES = [
  "Persona hablando con naturalidad en una cena familiar, cámara lenta y luz cálida de lámpara.",
  "Producto de restaurante sobre mesa de madera, órbita suave tipo After Effects y destellos de luz.",
  "Retrato en ventana lluviosa, ligero movimiento de cámara y reflejos realistas.",
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

export function Studio() {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"api" | "demo" | null>(null);
  const [history, setHistory] = useState<GenerationRecord[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    fetch("/api/status")
      .then((r) => r.json())
      .then((data: Status) => setStatus(data))
      .catch(() => setStatus({ provider: "demo", ready: true, demo: true }));
  }, []);

  const onPickFile = useCallback(async (file: File | null) => {
    setError(null);
    setVideoUrl(null);
    setMode(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Elige una imagen (JPEG, PNG o WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("La imagen supera 8 MB.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setImageDataUrl(dataUrl);
    setImageName(file.name);
  }, []);

  const generate = useCallback(async () => {
    if (!imageDataUrl || !prompt.trim() || busy) return;
    setBusy(true);
    setError(null);
    setProgress(0.05);
    setVideoUrl(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), imageDataUrl }),
      });
      const data = (await res.json()) as {
        error?: string;
        mode?: "api" | "demo";
        videoUrl?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Error al generar.");
      }

      let finalUrl: string;
      let finalMode: "api" | "demo";

      if (data.mode === "api" && data.videoUrl) {
        finalUrl = data.videoUrl;
        finalMode = "api";
        setProgress(1);
      } else {
        finalMode = "demo";
        const blob = await renderDemoVideo({
          imageUrl: imageDataUrl,
          durationSec: 3,
          onProgress: setProgress,
        });
        finalUrl = URL.createObjectURL(blob);
      }

      setVideoUrl(finalUrl);
      setMode(finalMode);
      const record: GenerationRecord = {
        id: crypto.randomUUID(),
        prompt: prompt.trim(),
        createdAt: new Date().toISOString(),
        mode: finalMode,
        videoUrl: finalUrl,
        thumbnailUrl: imageDataUrl,
      };
      setHistory(prependHistory(record));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal.");
    } finally {
      setBusy(false);
    }
  }, [busy, imageDataUrl, prompt]);

  const download = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `escena-${Date.now()}.${mode === "api" ? "mp4" : "webm"}`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [mode, videoUrl]);

  return (
    <section id="crear" className="mx-auto max-w-studio px-5 pb-24 pt-10 md:px-8">
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="brand-mark text-xs text-copper">Estudio</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-paper md:text-4xl">
            Sube · Describe · Genera
          </h2>
          <p className="mt-2 max-w-xl text-mist/90">
            Flujo directo: una imagen base, un prompt de movimiento realista y un
            clip corto listo para previsualizar y descargar.
          </p>
        </div>
        <div className="text-sm text-mist/80">
          {status?.demo ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-copper/30 px-3 py-1.5 text-copper-bright">
              Modo demo local
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 px-3 py-1.5 text-teal-glow">
              fal.ai · Kling
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div>
            <label htmlFor={inputId} className="mb-3 block text-sm text-mist">
              1. Imagen base
            </label>
            <input
              id={inputId}
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onPickFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className="group relative flex min-h-52 w-full flex-col items-center justify-center overflow-hidden border border-dashed border-mist/25 bg-fog/40 px-6 py-10 text-center transition hover:border-copper/50 hover:bg-fog/70"
            >
              {imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageDataUrl}
                  alt="Vista previa de la imagen base"
                  className="absolute inset-0 h-full w-full object-cover opacity-55 transition group-hover:opacity-70"
                />
              ) : null}
              <div className="relative z-10">
                <p className="font-display text-lg text-paper">
                  {imageName ? imageName : "Arrastra o elige una foto"}
                </p>
                <p className="mt-1 text-sm text-mist/80">JPEG · PNG · WebP · máx. 8 MB</p>
              </div>
            </button>
          </div>

          <div>
            <label htmlFor="prompt" className="mb-3 block text-sm text-mist">
              2. Prompt de movimiento
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              maxLength={1200}
              placeholder="Describe la escena cinematográfica: quién se mueve, cómo, luz y cámara…"
              className="w-full resize-y border border-mist/20 bg-ink/60 px-4 py-3 text-paper outline-none ring-copper/40 placeholder:text-mist/40 focus:border-copper/50 focus:ring-1"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {PROMPT_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="max-w-full truncate border border-mist/15 px-3 py-1.5 text-left text-xs text-mist/90 transition hover:border-copper/40 hover:text-copper-bright"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!imageDataUrl || !prompt.trim() || busy}
            onClick={generate}
            className="brand-mark w-full bg-copper px-6 py-4 text-sm font-semibold text-ink transition hover:bg-copper-bright disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Generando escena…" : "3. Generar clip ~3s"}
          </button>

          {busy ? (
            <div className="h-0.5 w-full overflow-hidden bg-mist/10">
              <div
                className="generating-bar h-full bg-teal-glow"
                style={{ width: `${Math.max(8, progress * 100)}%` }}
              />
            </div>
          ) : null}

          {error ? (
            <p className="border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-paper">
              {error}
            </p>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="relative aspect-video overflow-hidden border border-mist/15 bg-ink">
            {videoUrl ? (
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="h-full w-full object-contain"
              />
            ) : imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageDataUrl}
                alt="Imagen lista para animar"
                className="h-full w-full object-cover opacity-80"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-mist/60">
                Aquí verás el preview del clip
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!videoUrl}
              onClick={download}
              className="border border-paper/30 px-5 py-2.5 text-sm text-paper transition hover:border-copper hover:text-copper-bright disabled:opacity-40"
            >
              Descargar
            </button>
            {mode ? (
              <span className="text-xs uppercase tracking-[0.18em] text-mist/70">
                {mode === "api" ? "Generación API" : "Preview demo 3s"}
              </span>
            ) : null}
          </div>

          {history.length > 0 ? (
            <div>
              <h3 className="mb-3 font-display text-sm tracking-wide text-mist">
                Recientes (este dispositivo)
              </h3>
              <ul className="space-y-2">
                {history.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoUrl(item.videoUrl);
                        setMode(item.mode);
                        setPrompt(item.prompt);
                        if (item.thumbnailUrl) setImageDataUrl(item.thumbnailUrl);
                      }}
                      className="flex w-full items-start gap-3 border border-transparent px-2 py-2 text-left transition hover:border-mist/20 hover:bg-fog/40"
                    >
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl}
                          alt=""
                          className="h-12 w-16 shrink-0 object-cover"
                        />
                      ) : (
                        <span className="h-12 w-16 shrink-0 bg-fog" />
                      )}
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-sm text-paper/90">
                          {item.prompt}
                        </span>
                        <span className="mt-1 block text-xs text-mist/60">
                          {item.mode} · {new Date(item.createdAt).toLocaleString("es")}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
