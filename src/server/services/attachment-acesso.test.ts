import { describe, it, expect } from "vitest";
import {
  isInlineViewable,
  resolverModoDeAcesso,
  formatarTamanho,
} from "./attachment";

const PDF = { mime: "application/pdf", nome: "Introdução.pdf" };
const DOCX = {
  mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  nome: "Apostila.docx",
};
const ZIP = { mime: "application/zip", nome: "materiais.zip" };
const IMG = { mime: "image/png", nome: "diagrama.png" };

describe("resolverModoDeAcesso", () => {
  it("PDF sem pedido abre no navegador", () => {
    expect(resolverModoDeAcesso(null, PDF.mime, PDF.nome)).toBe("abrir");
  });

  it("PDF com pedido de baixar respeita a escolha do aluno", () => {
    expect(resolverModoDeAcesso("baixar", PDF.mime, PDF.nome)).toBe("baixar");
  });

  it("imagem tambem oferece os dois modos", () => {
    expect(resolverModoDeAcesso(null, IMG.mime, IMG.nome)).toBe("abrir");
    expect(resolverModoDeAcesso("baixar", IMG.mime, IMG.nome)).toBe("baixar");
  });

  it("DOCX e ZIP sempre baixam, mesmo se pedirem para abrir", () => {
    // Abrir inline um DOCX daria uma guia em branco que baixa sozinha.
    expect(resolverModoDeAcesso("abrir", DOCX.mime, DOCX.nome)).toBe("baixar");
    expect(resolverModoDeAcesso("abrir", ZIP.mime, ZIP.nome)).toBe("baixar");
    expect(resolverModoDeAcesso(null, DOCX.mime, DOCX.nome)).toBe("baixar");
  });

  it("parametro desconhecido cai no comportamento padrao", () => {
    expect(resolverModoDeAcesso("qualquer", PDF.mime, PDF.nome)).toBe("abrir");
    expect(resolverModoDeAcesso("", DOCX.mime, DOCX.nome)).toBe("baixar");
  });

  it("reconhece PDF pela extensao quando o mime vem generico", () => {
    // Alguns navegadores enviam application/octet-stream no upload.
    expect(resolverModoDeAcesso(null, "application/octet-stream", "aula.pdf")).toBe("abrir");
  });
});

describe("isInlineViewable", () => {
  it("aceita PDF e imagens", () => {
    expect(isInlineViewable(PDF.mime, PDF.nome)).toBe(true);
    expect(isInlineViewable(IMG.mime, IMG.nome)).toBe(true);
  });

  it("recusa documentos e arquivos compactados", () => {
    expect(isInlineViewable(DOCX.mime, DOCX.nome)).toBe(false);
    expect(isInlineViewable(ZIP.mime, ZIP.nome)).toBe(false);
  });
});

describe("formatarTamanho", () => {
  it("mostra bytes, KB e MB", () => {
    expect(formatarTamanho(512)).toBe("512 B");
    expect(formatarTamanho(2048)).toBe("2 KB");
    expect(formatarTamanho(1024 * 1024 * 3.5)).toBe("3.5 MB");
    expect(formatarTamanho(1024 * 1024 * 42)).toBe("42 MB");
  });

  it("omite quando nao ha tamanho", () => {
    expect(formatarTamanho(0)).toBe("");
    expect(formatarTamanho(NaN)).toBe("");
  });
});
