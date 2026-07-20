import { describe, it, expect } from "vitest";
import { ehIosSafari } from "./install-app-button";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPHONE_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1";
const IPAD_MODERNO =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const MAC_SAFARI =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";

describe("ehIosSafari", () => {
  it("reconhece o Safari do iPhone (unico caminho de instalacao no iOS)", () => {
    expect(ehIosSafari(IPHONE_SAFARI, 5)).toBe(true);
  });

  it("iPad recente se diz Macintosh, mas tem toque", () => {
    expect(ehIosSafari(IPAD_MODERNO, 5)).toBe(true);
  });

  it("Mac de mesa nao e iOS, mesmo com a mesma string", () => {
    // Mesmo user agent do iPad; o que separa os dois e o toque.
    expect(ehIosSafari(MAC_SAFARI, 0)).toBe(false);
  });

  it("Chrome no iPhone nao instala PWA, entao nao mostra as instrucoes do Safari", () => {
    expect(ehIosSafari(IPHONE_CHROME, 5)).toBe(false);
  });

  it("Android nao entra no caminho do iOS (la existe a API de instalacao)", () => {
    expect(ehIosSafari(ANDROID_CHROME, 5)).toBe(false);
  });
});
