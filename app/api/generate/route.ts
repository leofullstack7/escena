import { fal } from "@fal-ai/client";
import { requireIdentity } from "../../../cursor/identity";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_PROMPT = 1200;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type Orientation = "horizontal" | "vertical";

type GenerateBody = {
  prompt?: string;
  imageDataUrl?: string;
  orientation?: Orientation;
};

function parseOrientation(value: unknown): Orientation {
  return value === "vertical" ? "vertical" : "horizontal";
}

function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status });
}

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) return null;
  try {
    const buffer = Buffer.from(match[2], "base64");
    return { mime: match[1], buffer };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const falKey = process.env.FAL_KEY?.trim() ?? "";

  // Paid API path requires a signed-in viewer on private/team apps.
  if (falKey) {
    const identity = await requireIdentity(request);
    if (identity instanceof Response) return identity;
  }

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return jsonError("JSON inválido.", 400);
  }

  const prompt = (body.prompt ?? "").trim();
  const imageDataUrl = body.imageDataUrl ?? "";
  const orientation = parseOrientation(body.orientation);

  if (!prompt) return jsonError("Escribe un prompt de movimiento.", 400);
  if (prompt.length > MAX_PROMPT) {
    return jsonError(`El prompt supera ${MAX_PROMPT} caracteres.`, 400);
  }
  if (!imageDataUrl.startsWith("data:image/")) {
    return jsonError("Sube una imagen válida (JPEG, PNG o WebP).", 400);
  }

  const parsed = parseDataUrl(imageDataUrl);
  if (!parsed) return jsonError("No se pudo leer la imagen.", 400);
  if (parsed.buffer.byteLength > MAX_IMAGE_BYTES) {
    return jsonError("La imagen supera 8 MB. Usa una más ligera.", 400);
  }
  if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(parsed.mime)) {
    return jsonError("Formato no soportado. Usa JPEG, PNG o WebP.", 400);
  }

  if (!falKey) {
    return Response.json({
      mode: "demo" as const,
      orientation,
      message:
        "Sin FAL_KEY: el cliente genera un preview cinematográfico local de 3s (Ken Burns).",
    });
  }

  try {
    fal.config({ credentials: falKey });

    const uploaded = await fal.storage.upload(
      new Blob([new Uint8Array(parsed.buffer)], { type: parsed.mime }),
    );

    const result = await fal.subscribe(
      "fal-ai/kling-video/v2.1/standard/image-to-video",
      {
        input: {
          prompt,
          image_url: uploaded,
          duration: "5",
          negative_prompt:
            "blur, distort, low quality, watermark, text overlay, cartoon, anime",
          cfg_scale: 0.5,
        },
        logs: false,
      },
    );

    const data = result.data as {
      video?: { url?: string };
    };

    const videoUrl = data.video?.url;
    if (!videoUrl) {
      return jsonError("La API no devolvió un vídeo.", 502);
    }

    return Response.json({
      mode: "api" as const,
      videoUrl,
      orientation,
      provider: "fal/kling-v2.1",
      durationHintSec: 5,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Fallo al generar con fal.ai";
    console.error("generate failed:", message);
    return jsonError(
      "No se pudo generar el vídeo con el proveedor. Revisa la clave FAL_KEY o inténtalo de nuevo.",
      502,
      { detail: message.slice(0, 200) },
    );
  }
}
