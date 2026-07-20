/**
 * Identificação de vídeos do YouTube e do Vimeo.
 *
 * O campo aceita o link completo (que é o que as pessoas têm em mãos) e extrai
 * o identificador que o player precisa. Antes ele guardava a string crua e o
 * player montava `.../embed/https%3A%2F%2Fyoutu.be%2F...`, que não toca.
 */

const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

function paraUrl(entrada: string): URL | null {
  const texto = entrada.trim();
  if (!texto) return null;
  try {
    return new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
  } catch {
    return null;
  }
}

/** Extrai o ID de 11 caracteres de qualquer formato de link do YouTube. */
export function extrairIdYoutube(entrada: string): string | null {
  const texto = (entrada ?? "").trim();
  if (!texto) return null;
  if (ID_YOUTUBE.test(texto)) return texto;

  const url = paraUrl(texto);
  if (!url) return null;
  const host = url.hostname.replace(/^(www|m|music)\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return ID_YOUTUBE.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && ID_YOUTUBE.test(v)) return v;
    // /embed/ID, /shorts/ID, /live/ID, /v/ID
    const m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
}

export interface RefVimeo {
  id: string;
  /** Hash de privacidade dos vídeos não listados; sem ele o player recusa. */
  hash?: string;
}

export function extrairIdVimeo(entrada: string): RefVimeo | null {
  const texto = (entrada ?? "").trim();
  if (!texto) return null;
  if (/^\d+$/.test(texto)) return { id: texto };

  // Forma canônica que guardamos: "123456789/abc123def"
  const solto = texto.match(/^(\d+)\/([A-Za-z0-9]+)$/);
  if (solto) return { id: solto[1], hash: solto[2] };

  const url = paraUrl(texto);
  if (!url) return null;
  if (!/(^|\.)vimeo\.com$/.test(url.hostname)) return null;

  const m = url.pathname.match(/\/(?:video\/)?(\d+)(?:\/([A-Za-z0-9]+))?/);
  if (!m) return null;
  const hash = m[2] ?? url.searchParams.get("h") ?? undefined;
  return hash ? { id: m[1], hash } : { id: m[1] };
}

/**
 * Converte o que o professor digitou na forma que guardamos. Devolve null
 * quando o link não é reconhecido, para a gravação poder recusar em vez de
 * salvar algo que não toca.
 */
export function normalizarVideoRef(
  provider: string | null | undefined,
  entrada: string | null | undefined,
): string | null {
  const texto = (entrada ?? "").trim();
  if (!texto) return null;
  if (provider === "YOUTUBE") return extrairIdYoutube(texto);
  if (provider === "VIMEO") {
    const v = extrairIdVimeo(texto);
    if (!v) return null;
    return v.hash ? `${v.id}/${v.hash}` : v.id;
  }
  // S3: é a chave do arquivo no storage, não um link.
  return texto;
}

/** URL do player. Aceita tanto a forma canônica quanto um link completo. */
export function montarUrlDoPlayer(
  provider: string | null | undefined,
  ref: string | null | undefined,
): string | null {
  const texto = (ref ?? "").trim();
  if (!provider || !texto) return null;

  if (provider === "VIMEO") {
    const v = extrairIdVimeo(texto);
    if (!v) return null;
    return `https://player.vimeo.com/video/${v.id}${
      v.hash ? `?h=${encodeURIComponent(v.hash)}` : ""
    }`;
  }
  const id = extrairIdYoutube(texto);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}
