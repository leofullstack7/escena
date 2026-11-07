import { Studio } from "../components/Studio";

export default function Home() {
  return (
    <main className="film-atmosphere min-h-screen">
      <header className="relative min-h-[100svh] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          <div
            className="hero-still absolute inset-[-8%] bg-cover bg-center opacity-55"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(7,17,14,0.92) 0%, rgba(7,17,14,0.55) 42%, rgba(7,17,14,0.35) 100%), url('/hero-still.svg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        </div>

        <nav className="relative z-10 mx-auto flex max-w-studio items-center justify-between px-5 py-6 md:px-8">
          <a href="#inicio" className="brand-mark text-sm text-copper-bright">
            Escena
          </a>
          <a
            href="#crear"
            className="text-sm text-mist transition hover:text-paper"
          >
            Crear clip
          </a>
        </nav>

        <div
          id="inicio"
          className="relative z-10 mx-auto flex max-w-studio flex-col justify-end px-5 pb-20 pt-24 md:min-h-[calc(100svh-5rem)] md:px-8 md:pb-28 md:pt-16"
        >
          <p className="animate-rise brand-mark text-4xl text-copper-bright sm:text-6xl md:text-7xl lg:text-8xl">
            Escena
          </p>
          <h1 className="animate-rise-delay mt-6 max-w-2xl font-display text-2xl font-semibold leading-tight tracking-tight text-paper sm:text-3xl md:text-4xl">
            De una foto quieta a un clip cinematográfico de unos tres segundos.
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-lg text-base text-mist md:text-lg">
            Sube la imagen, describe el movimiento realista y genera un preview
            listo para descargar — cenas, productos, retratos con cámara viva.
          </p>
          <div className="animate-rise-delay-2 mt-10 flex flex-wrap gap-4">
            <a
              href="#crear"
              className="brand-mark bg-copper px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-copper-bright"
            >
              Empezar
            </a>
            <a
              href="#crear"
              className="border border-paper/25 px-6 py-3.5 text-sm text-paper transition hover:border-copper/60 hover:text-copper-bright"
            >
              Ver el estudio
            </a>
          </div>
        </div>
      </header>

      <Studio />

      <footer className="border-t border-mist/10 px-5 py-10 text-center text-sm text-mist/60 md:px-8">
        <p className="brand-mark text-xs text-mist/50">Escena</p>
        <p className="mt-2">
          Imagen → prompt → clip corto. Sin clave API, el modo demo anima la
          foto en el navegador.
        </p>
      </footer>
    </main>
  );
}
