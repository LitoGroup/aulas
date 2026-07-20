// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { MobileNav } from "./mobile-nav";

// A navegação do App Router e o next-auth não existem fora do Next.
let rotaAtual = "/dashboard";
vi.mock("next/navigation", () => ({ usePathname: () => rotaAtual }));
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

function hrefsDaBarra() {
  const barra = screen.getByRole("navigation");
  return within(barra)
    .getAllByRole("link")
    .map((a) => a.getAttribute("href"));
}

describe("barra de abas do celular", () => {
  it("tem 4 abas mais o botao Menu", () => {
    render(<MobileNav name="Gabriel Marcelo" role="STUDENT" />);
    expect(hrefsDaBarra()).toHaveLength(4);
    expect(screen.getByText("Menu")).toBeDefined();
  });

  it("aluno ve a conta na barra", () => {
    render(<MobileNav name="Ana" role="STUDENT" />);
    expect(hrefsDaBarra()).toEqual(["/dashboard", "/courses", "/assessments", "/conta"]);
  });

  it("admin troca a conta por gerenciar", () => {
    render(<MobileNav name="Ana" role="ADMIN" />);
    expect(hrefsDaBarra()).toEqual(["/dashboard", "/courses", "/assessments", "/manage"]);
  });

  it("marca a aba da rota atual", () => {
    rotaAtual = "/courses/mecanica-basica";
    render(<MobileNav name="Ana" role="STUDENT" />);
    const ativos = screen
      .getByRole("navigation")
      .querySelectorAll('[aria-current="page"]');
    expect(ativos).toHaveLength(1);
    expect(ativos[0].getAttribute("href")).toBe("/courses");
    rotaAtual = "/dashboard";
  });
});

describe("gaveta do menu", () => {
  it("comeca fechada", () => {
    render(<MobileNav name="Ana" role="STUDENT" />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("abre no toque do Menu e mostra o nome e o papel", () => {
    render(<MobileNav name="Gabriel Marcelo" role="ADMIN" />);
    fireEvent.click(screen.getByText("Menu"));
    const gaveta = screen.getByRole("dialog");
    expect(within(gaveta).getByText("Gabriel Marcelo")).toBeDefined();
    expect(within(gaveta).getByText("Administrador")).toBeDefined();
  });

  it("a gaveta do admin alcanca todas as rotas, inclusive a conta", () => {
    render(<MobileNav name="Ana" role="ADMIN" />);
    fireEvent.click(screen.getByText("Menu"));
    const hrefs = within(screen.getByRole("dialog"))
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual([
      "/dashboard",
      "/courses",
      "/assessments",
      "/conta",
      "/manage",
      "/manage/users",
    ]);
  });

  it("aluno nao ve as rotas de gestao na gaveta", () => {
    render(<MobileNav name="Ana" role="STUDENT" />);
    fireEvent.click(screen.getByText("Menu"));
    const hrefs = within(screen.getByRole("dialog"))
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/dashboard", "/courses", "/assessments", "/conta"]);
    expect(hrefs.some((h) => h?.startsWith("/manage"))).toBe(false);
  });

  it("oferece sair", () => {
    render(<MobileNav name="Ana" role="STUDENT" />);
    fireEvent.click(screen.getByText("Menu"));
    expect(within(screen.getByRole("dialog")).getByText("Sair")).toBeDefined();
  });

  it("trava a rolagem do fundo enquanto aberta e devolve ao fechar", () => {
    render(<MobileNav name="Ana" role="STUDENT" />);
    expect(document.body.style.overflow).toBe("");
    fireEvent.click(screen.getByText("Menu"));
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByLabelText("Fechar menu"));
    expect(document.body.style.overflow).toBe("");
  });

  it("fecha no Esc", () => {
    render(<MobileNav name="Ana" role="STUDENT" />);
    fireEvent.click(screen.getByText("Menu"));
    expect(screen.getByRole("dialog")).toBeDefined();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("fecha ao tocar num item, para nao ficar aberta sobre a tela nova", () => {
    render(<MobileNav name="Ana" role="STUDENT" />);
    fireEvent.click(screen.getByText("Menu"));
    const gaveta = screen.getByRole("dialog");
    fireEvent.click(within(gaveta).getByText("Minha conta"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
