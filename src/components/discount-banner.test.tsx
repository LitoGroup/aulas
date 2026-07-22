// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import { DiscountBanner } from "./discount-banner";

const writeText = vi.fn(() => Promise.resolve());
Object.assign(navigator, { clipboard: { writeText } });

afterEach(() => {
  writeText.mockClear();
  cleanup();
});

function linhaDoCupom(rotulo: string) {
  return screen.getByText(rotulo).closest("div") as HTMLElement;
}

describe("DiscountBanner", () => {
  it("mostra os dois cupons, à vista e recorrência", () => {
    render(<DiscountBanner />);
    expect(screen.getByText("À vista")).toBeDefined();
    expect(screen.getByText("Recorrência")).toBeDefined();
    expect(screen.getByText("agoraoununca")).toBeDefined();
    expect(screen.getByText("agoraoununca2")).toBeDefined();
  });

  it("copia o código à vista exatamente em minúsculas", async () => {
    render(<DiscountBanner />);
    fireEvent.click(within(linhaDoCupom("À vista")).getByRole("button"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("agoraoununca"));
  });

  it("copia o código de recorrência exatamente em minúsculas", async () => {
    render(<DiscountBanner />);
    fireEvent.click(within(linhaDoCupom("Recorrência")).getByRole("button"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("agoraoununca2"));
  });

  it("o texto visível não é o que quebra o checkout: o código copiado é minúsculo", () => {
    render(<DiscountBanner />);
    // O DOM guarda o código em minúsculas; o maiúsculo é só CSS (uppercase).
    const codigo = screen.getByText("agoraoununca");
    expect(codigo.textContent).toBe("agoraoununca");
  });
});
