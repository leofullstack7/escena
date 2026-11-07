# Escena

Convierte una imagen quieta + un prompt de movimiento en un clip cinematográfico corto.

## Stack

- Next.js (App Router) + Tailwind
- Generación real: **fal.ai** Kling image-to-video (`FAL_KEY`)
- Fallback: preview demo 3s en el navegador (Ken Burns)

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://127.0.0.1:3000

## Secretos

Declara `FAL_KEY` en Cursor Secrets (bound a la app). Sin valor → modo demo.

Ver nota de producto: Project store `docs/app-imagen-a-video.md`.
