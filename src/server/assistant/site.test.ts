import { describe, it, expect } from "vitest";
import { hostPermitido, limparHtml } from "./site";

describe("hostPermitido", () => {
  it("aceita domínios oficiais da Lito", () => {
    expect(hostPermitido("https://litoaviationacademy.com.br/formacoes-e-cursos/x/")).toBe(true);
    expect(hostPermitido("https://www.litoaviationacademy.com.br/x")).toBe(true);
    expect(hostPermitido("https://checkout.litoacademy.com.br/pay/x")).toBe(true);
  });

  it("recusa qualquer outro endereço (anti-SSRF)", () => {
    expect(hostPermitido("https://google.com")).toBe(false);
    expect(hostPermitido("http://localhost:3000/admin")).toBe(false);
    expect(hostPermitido("http://169.254.169.254/")).toBe(false);
    expect(hostPermitido("não é url")).toBe(false);
  });
});

describe("limparHtml", () => {
  it("remove script, style e tags, normalizando espaços", () => {
    const html = `<html><head><style>.a{color:red}</style></head>
      <body><script>alert(1)</script><h1>Curso</h1><p>Preço:  R$ 100</p></body></html>`;
    const texto = limparHtml(html);
    expect(texto).toContain("Curso");
    expect(texto).toContain("Preço: R$ 100");
    expect(texto).not.toContain("alert");
    expect(texto).not.toContain("color:red");
    expect(texto).not.toMatch(/<[^>]+>/);
  });

  it("converte travessão de entidade em hífen", () => {
    expect(limparHtml("<p>8 &#8211; 16 meses</p>")).toBe("8 - 16 meses");
  });
});
