// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CourseReviewCard } from "./course-review-card";

vi.mock("@/server/actions/review", () => ({ submitReviewAction: vi.fn() }));

afterEach(cleanup);

const base = { courseId: "c1", slug: "curso-teste" };

function estrelas() {
  return screen.getAllByRole("radio") as HTMLInputElement[];
}

describe("aluno que ainda nao respondeu", () => {
  it("mostra as 5 estrelas e o campo de comentario", () => {
    render(<CourseReviewCard {...base} notaAtual={null} comentarioAtual={null} />);
    expect(estrelas()).toHaveLength(5);
    expect(screen.getByLabelText(/Comentário/)).toBeDefined();
  });

  it("nao deixa enviar sem escolher nota", () => {
    render(<CourseReviewCard {...base} notaAtual={null} comentarioAtual={null} />);
    const enviar = screen.getByText("Enviar avaliação") as HTMLButtonElement;
    expect(enviar.disabled).toBe(true);
    expect(screen.getByText("Escolha uma nota para enviar")).toBeDefined();
  });

  it("libera o envio ao escolher a nota", () => {
    render(<CourseReviewCard {...base} notaAtual={null} comentarioAtual={null} />);
    fireEvent.click(estrelas()[3]); // 4 estrelas
    expect((screen.getByText("Enviar avaliação") as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText("Bom")).toBeDefined();
  });

  it("as estrelas sao radio de verdade, para funcionar por teclado", () => {
    render(<CourseReviewCard {...base} notaAtual={null} comentarioAtual={null} />);
    fireEvent.click(estrelas()[4]);
    expect(estrelas()[4].checked).toBe(true);
    expect(estrelas()[0].checked).toBe(false);
    expect(screen.getByText("Excelente")).toBeDefined();
  });

  it("envia a nota escolhida no campo do formulario", () => {
    const { container } = render(
      <CourseReviewCard {...base} notaAtual={null} comentarioAtual={null} />,
    );
    fireEvent.click(estrelas()[2]);
    const campo = container.querySelector('input[name="rating"]') as HTMLInputElement;
    expect(campo.value).toBe("3");
  });

  it("conta os caracteres do comentario", () => {
    render(<CourseReviewCard {...base} notaAtual={null} comentarioAtual={null} />);
    fireEvent.change(screen.getByLabelText(/Comentário/), { target: { value: "otimo" } });
    expect(screen.getByText("5/2000")).toBeDefined();
  });
});

describe("aluno que ja respondeu", () => {
  it("mostra o resumo em vez do formulario", () => {
    render(<CourseReviewCard {...base} notaAtual={5} comentarioAtual="Curso excelente" />);
    expect(screen.getByText("Obrigado por avaliar este curso")).toBeDefined();
    expect(screen.getByText("Excelente")).toBeDefined();
    expect(screen.getByText(/Curso excelente/)).toBeDefined();
    expect(screen.queryByText("Enviar avaliação")).toBeNull();
  });

  it("abre o formulario preenchido ao editar", () => {
    render(<CourseReviewCard {...base} notaAtual={4} comentarioAtual="Bom curso" />);
    fireEvent.click(screen.getByText("Editar avaliação"));
    expect(screen.getByText("Salvar alterações")).toBeDefined();
    expect(estrelas()[3].checked).toBe(true);
    expect((screen.getByLabelText(/Comentário/) as HTMLTextAreaElement).value).toBe("Bom curso");
  });

  it("some o resumo de comentario quando nao houve comentario", () => {
    render(<CourseReviewCard {...base} notaAtual={3} comentarioAtual={null} />);
    expect(screen.getByText("Regular")).toBeDefined();
    expect(screen.queryByText(/“/)).toBeNull();
  });
});
