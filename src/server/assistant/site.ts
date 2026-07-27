/**
 * Leitura ao vivo de páginas oficiais da Lito, para o assistente responder com
 * informação real (não uma cópia curada). Restrito aos domínios da escola por
 * segurança (evita usar a ferramenta para buscar endereços arbitrários).
 */
const HOSTS_PERMITIDOS = new Set([
  "litoaviationacademy.com.br",
  "www.litoaviationacademy.com.br",
  "checkout.litoacademy.com.br",
]);

const MAX_CHARS = 7000;

export function hostPermitido(url: string): boolean {
  try {
    return HOSTS_PERMITIDOS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Converte HTML em texto legível: tira script/style/tags e normaliza espaços. */
export function limparHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&(?:#8211|#8212|mdash|ndash);/gi, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Busca uma página oficial e devolve o texto (para o modelo extrair os dados). */
export async function consultarSite(url: string): Promise<string> {
  if (!hostPermitido(url)) {
    return "Endereço não permitido. Consulte a página oficial do curso ou fale no WhatsApp.";
  }
  try {
    const res = await fetch(url, { headers: { "user-agent": "LitoAssistente/1.0" } });
    if (!res.ok) return `Não foi possível abrir a página (status ${res.status}).`;
    return limparHtml(await res.text()).slice(0, MAX_CHARS);
  } catch {
    return "Não foi possível abrir a página agora.";
  }
}
