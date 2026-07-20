/*
 * Service worker mínimo, de propósito.
 *
 * O Chrome só considera o app instalável (e só dispara "beforeinstallprompt",
 * que é o que faz o botão de instalar aparecer) se houver um service worker
 * com tratador de fetch registrado.
 *
 * Ele NÃO guarda nada em cache: o tratador de fetch não chama respondWith, o
 * que deixa toda requisição seguir direto para a rede. Isso é intencional —
 * um cache aqui faria alunos continuarem vendo a versão antiga da plataforma
 * depois de cada deploy, e o conteúdo (vídeos, notas, progresso) precisa vir
 * sempre atualizado.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Sem respondWith: o navegador trata normalmente.
});
