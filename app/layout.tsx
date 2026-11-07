import type { Metadata } from "next";
import { Syne, Newsreader } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const newsreader = Newsreader({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Escena — imagen a vídeo cinematográfico",
  description:
    "Sube una foto, describe el movimiento y genera un clip realista de ~3 segundos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${syne.variable} ${newsreader.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
