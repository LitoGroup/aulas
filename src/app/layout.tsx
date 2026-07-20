import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Lito School - Plataforma de Aulas",
  description: "Sistema de aulas online: cursos, aulas e avaliações.",
  applicationName: "Lito School",
  // Instalável na tela inicial; no iOS abre sem a barra do Safari.
  appleWebApp: {
    capable: true,
    title: "Lito School",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Deixa o app pintar sob o notch e a barra inferior do iPhone; o conteúdo
  // é reposicionado pelos utilitários pt-safe/pb-safe.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1420" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Aplica o tema salvo antes da pintura (evita flash claro/escuro) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`,
          }}
        />
        {/* O navegador dispara "beforeinstallprompt" bem cedo, muitas vezes
            antes do React montar. Guardamos o evento aqui para o botão de
            instalar poder usá-lo depois. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){window.__pwaPrompt=null;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__pwaPrompt=e;window.dispatchEvent(new Event("pwa-installable"))});window.addEventListener("appinstalled",function(){window.__pwaPrompt=null});if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})})}})();`,
          }}
        />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
