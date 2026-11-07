/** Orientación del clip de salida (16:9 o 9:16). */

export type Orientation = "horizontal" | "vertical";

export const ORIENTATIONS: Orientation[] = ["horizontal", "vertical"];

export function isOrientation(value: unknown): value is Orientation {
  return value === "horizontal" || value === "vertical";
}

export function orientationLabel(orientation: Orientation): string {
  return orientation === "vertical" ? "Vertical" : "Horizontal";
}

export function orientationAspect(orientation: Orientation): "16:9" | "9:16" {
  return orientation === "vertical" ? "9:16" : "16:9";
}

/** Tamaño de render para demo y reencuadre previo a fal.ai. */
export function orientationSize(orientation: Orientation): {
  width: number;
  height: number;
} {
  return orientation === "vertical"
    ? { width: 540, height: 960 }
    : { width: 960, height: 540 };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("No se pudo cargar la imagen para reencuadrar."));
    img.src = url;
  });
}

/**
 * Reencuadra la imagen en 16:9 o 9:16 (cover + letterbox oscuro)
 * para que Kling I2V y el demo respeten la orientación elegida.
 */
export async function frameImageToOrientation(
  imageDataUrl: string,
  orientation: Orientation,
): Promise<string> {
  const { width, height } = orientationSize(orientation);
  const img = await loadImage(imageDataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible en este navegador.");

  ctx.fillStyle = "#0b1210";
  ctx.fillRect(0, 0, width, height);

  const ir = img.width / img.height;
  const cr = width / height;
  let dw: number;
  let dh: number;
  if (ir > cr) {
    dh = height;
    dw = dh * ir;
  } else {
    dw = width;
    dh = dw / ir;
  }
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);

  return canvas.toDataURL("image/jpeg", 0.92);
}
