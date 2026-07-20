import type { MetadataRoute } from "next";

/**
 * Manifesto do app instalável. Com `display: standalone` a plataforma abre
 * sem barra de endereço quando o aluno adiciona à tela inicial.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lito School - Plataforma de Aulas",
    short_name: "Lito School",
    description: "Cursos, aulas e avaliações da Lito Aviation Academy.",
    lang: "pt-BR",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a1420",
    theme_color: "#0e2440",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Meus cursos", url: "/dashboard" },
      { name: "Catálogo", url: "/courses" },
      { name: "Avaliações", url: "/assessments" },
    ],
  };
}
