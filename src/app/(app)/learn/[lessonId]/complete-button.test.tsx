// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CompleteButton } from "./complete-button";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock("@/server/actions/progress", () => ({ markCompleteAction: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    // `prefetch` não é atributo de <a>; descartado para não poluir o DOM.
    <a href={href} {...{ ...rest, prefetch: undefined }}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

const base = { lessonId: "l1", slug: "curso", nextHref: "/learn/l2" };

describe("aluno matriculado", () => {
  it("ve concluir e avancar na aula pendente", () => {
    render(<CompleteButton {...base} done={false} podeConcluir />);
    expect(screen.getByText("Marcar como concluída")).toBeDefined();
    expect(screen.getByText("Concluir e avançar")).toBeDefined();
  });

  it("na aula ja concluida ve o selo e o link da proxima", () => {
    render(<CompleteButton {...base} done podeConcluir />);
    expect(screen.getByText("Aula concluída")).toBeDefined();
    const proxima = screen.getByText("Próxima aula");
    expect(proxima.getAttribute("href")).toBe("/learn/l2");
    // Ja concluida: nao deve reexecutar a acao, e so navegar.
    expect(proxima.tagName).toBe("A");
  });

  it("na ultima aula nao oferece avancar", () => {
    render(<CompleteButton {...base} nextHref={null} done={false} podeConcluir />);
    expect(screen.getByText("Marcar como concluída")).toBeDefined();
    expect(screen.queryByText("Concluir e avançar")).toBeNull();
    expect(screen.queryByText("Próxima aula")).toBeNull();
  });
});

describe("quem abre sem matricula (professor conferindo)", () => {
  it("nao ve os botoes de progresso, que falhariam", () => {
    render(<CompleteButton {...base} done={false} podeConcluir={false} />);
    expect(screen.queryByText("Marcar como concluída")).toBeNull();
    expect(screen.queryByText("Concluir e avançar")).toBeNull();
  });

  it("continua conseguindo navegar para a proxima aula", () => {
    render(<CompleteButton {...base} done={false} podeConcluir={false} />);
    expect(screen.getByText("Próxima aula").getAttribute("href")).toBe("/learn/l2");
  });

  it("explica por que nao ha botao de concluir", () => {
    render(<CompleteButton {...base} done={false} podeConcluir={false} />);
    expect(screen.getByText(/progresso não é registrado/)).toBeDefined();
  });
});
