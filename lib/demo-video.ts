/** Client-side Ken Burns fallback when no image-to-video API key is configured. */

export type DemoVideoOptions = {
  imageUrl: string;
  durationSec?: number;
  width?: number;
  height?: number;
  onProgress?: (ratio: number) => void;
};

function pickMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "video/webm";
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen para el modo demo."));
    img.src = url;
  });
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  scale: number,
  panX: number,
  panY: number,
) {
  const ir = img.width / img.height;
  const cr = canvasW / canvasH;
  let dw: number;
  let dh: number;
  if (ir > cr) {
    dh = canvasH * scale;
    dw = dh * ir;
  } else {
    dw = canvasW * scale;
    dh = dw / ir;
  }
  const dx = (canvasW - dw) / 2 + panX * canvasW;
  const dy = (canvasH - dh) / 2 + panY * canvasH;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export async function renderDemoVideo(options: DemoVideoOptions): Promise<Blob> {
  const durationSec = options.durationSec ?? 3;
  const width = options.width ?? 960;
  const height = options.height ?? 540;
  const img = await loadImage(options.imageUrl);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible en este navegador.");

  const stream = canvas.captureStream(30);
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 4_000_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error("Error al grabar el vídeo demo."));
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  recorder.start(100);

  const start = performance.now();
  const totalMs = durationSec * 1000;

  await new Promise<void>((resolve) => {
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / totalMs);
      options.onProgress?.(t);

      const scale = 1.05 + t * 0.12;
      const panX = -0.02 * t;
      const panY = -0.015 * t;

      ctx.fillStyle = "#0b1210";
      ctx.fillRect(0, 0, width, height);
      coverDraw(ctx, img, width, height, scale, panX, panY);

      // Soft vignette for a cinematic feel
      const g = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.2,
        width / 2,
        height / 2,
        height * 0.75,
      );
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });

  recorder.stop();
  stream.getTracks().forEach((track) => track.stop());
  return done;
}
