import { describe, it, expect } from "vitest";
import {
  extrairIdYoutube,
  extrairIdVimeo,
  normalizarVideoRef,
  montarUrlDoPlayer,
} from "./video-ref";

describe("extrairIdYoutube", () => {
  it("aceita o ID puro", () => {
    expect(extrairIdYoutube("QW9JnB0GX1I")).toBe("QW9JnB0GX1I");
  });

  it("aceita o link curto com o parametro de rastreio do app", () => {
    // Formato que o botao Compartilhar do YouTube gera - e o que esta no banco.
    expect(extrairIdYoutube("https://youtu.be/QW9JnB0GX1I?si=K8HyWa4_feITzxb7")).toBe(
      "QW9JnB0GX1I",
    );
  });

  it("aceita o link normal de assistir", () => {
    expect(extrairIdYoutube("https://www.youtube.com/watch?v=_SOfsoUVVUU")).toBe("_SOfsoUVVUU");
  });

  it("aceita o link com tempo e lista junto", () => {
    expect(
      extrairIdYoutube("https://www.youtube.com/watch?v=_SOfsoUVVUU&t=42s&list=PLabc"),
    ).toBe("_SOfsoUVVUU");
  });

  it("aceita embed, shorts, live e a versao movel", () => {
    expect(extrairIdYoutube("https://www.youtube.com/embed/QW9JnB0GX1I")).toBe("QW9JnB0GX1I");
    expect(extrairIdYoutube("https://www.youtube.com/shorts/QW9JnB0GX1I")).toBe("QW9JnB0GX1I");
    expect(extrairIdYoutube("https://www.youtube.com/live/QW9JnB0GX1I")).toBe("QW9JnB0GX1I");
    expect(extrairIdYoutube("https://m.youtube.com/watch?v=QW9JnB0GX1I")).toBe("QW9JnB0GX1I");
  });

  it("aceita link sem o https na frente", () => {
    expect(extrairIdYoutube("youtu.be/QW9JnB0GX1I")).toBe("QW9JnB0GX1I");
  });

  it("recusa o que nao e video do YouTube", () => {
    expect(extrairIdYoutube("")).toBeNull();
    expect(extrairIdYoutube("   ")).toBeNull();
    expect(extrairIdYoutube("https://vimeo.com/123456789")).toBeNull();
    expect(extrairIdYoutube("https://youtube.com/@canal")).toBeNull();
    expect(extrairIdYoutube("qualquer texto")).toBeNull();
  });

  it("recusa ID de tamanho errado", () => {
    expect(extrairIdYoutube("abc123")).toBeNull();
    expect(extrairIdYoutube("QW9JnB0GX1I_EXTRA")).toBeNull();
  });
});

describe("extrairIdVimeo", () => {
  it("aceita so o numero", () => {
    expect(extrairIdVimeo("123456789")).toEqual({ id: "123456789" });
  });

  it("aceita o link normal", () => {
    expect(extrairIdVimeo("https://vimeo.com/123456789")).toEqual({ id: "123456789" });
  });

  it("preserva o hash do video nao listado", () => {
    // Sem o hash o player recusa videos nao listados - era o caso de uso citado.
    expect(extrairIdVimeo("https://vimeo.com/123456789/abc123def")).toEqual({
      id: "123456789",
      hash: "abc123def",
    });
  });

  it("aceita o hash como parametro h", () => {
    expect(extrairIdVimeo("https://vimeo.com/123456789?h=abc123def")).toEqual({
      id: "123456789",
      hash: "abc123def",
    });
  });

  it("aceita o link do proprio player", () => {
    expect(extrairIdVimeo("https://player.vimeo.com/video/123456789")).toEqual({
      id: "123456789",
    });
  });

  it("recusa o que nao e Vimeo", () => {
    expect(extrairIdVimeo("https://youtu.be/QW9JnB0GX1I")).toBeNull();
    expect(extrairIdVimeo("")).toBeNull();
  });
});

describe("normalizarVideoRef", () => {
  it("guarda so o ID do YouTube", () => {
    expect(normalizarVideoRef("YOUTUBE", "https://youtu.be/QW9JnB0GX1I?si=K8Hy")).toBe(
      "QW9JnB0GX1I",
    );
  });

  it("guarda id/hash no Vimeo nao listado", () => {
    expect(normalizarVideoRef("VIMEO", "https://vimeo.com/123456789/abc123def")).toBe(
      "123456789/abc123def",
    );
  });

  it("devolve null quando o link nao e reconhecido, para a gravacao recusar", () => {
    expect(normalizarVideoRef("YOUTUBE", "https://exemplo.com/video")).toBeNull();
    expect(normalizarVideoRef("YOUTUBE", "")).toBeNull();
  });

  it("nao mexe na chave do arquivo enviado para a plataforma", () => {
    expect(normalizarVideoRef("S3", "videos/curso-1/aula-2.mp4")).toBe("videos/curso-1/aula-2.mp4");
  });
});

describe("montarUrlDoPlayer", () => {
  it("monta a URL do YouTube a partir do ID", () => {
    expect(montarUrlDoPlayer("YOUTUBE", "QW9JnB0GX1I")).toBe(
      "https://www.youtube-nocookie.com/embed/QW9JnB0GX1I",
    );
  });

  it("funciona com as aulas antigas, que guardaram o link inteiro", () => {
    // As 20 aulas ja cadastradas estao assim; precisam tocar sem migracao.
    expect(montarUrlDoPlayer("YOUTUBE", "https://youtu.be/QW9JnB0GX1I?si=K8HyWa4_feITzxb7")).toBe(
      "https://www.youtube-nocookie.com/embed/QW9JnB0GX1I",
    );
    expect(montarUrlDoPlayer("YOUTUBE", "https://www.youtube.com/watch?v=_SOfsoUVVUU")).toBe(
      "https://www.youtube-nocookie.com/embed/_SOfsoUVVUU",
    );
  });

  it("leva o hash do Vimeo nao listado para o player", () => {
    expect(montarUrlDoPlayer("VIMEO", "123456789/abc123def")).toBe(
      "https://player.vimeo.com/video/123456789?h=abc123def",
    );
  });

  it("devolve null quando nao da para montar", () => {
    expect(montarUrlDoPlayer("YOUTUBE", "texto qualquer")).toBeNull();
    expect(montarUrlDoPlayer(null, "QW9JnB0GX1I")).toBeNull();
    expect(montarUrlDoPlayer("YOUTUBE", null)).toBeNull();
  });
});
