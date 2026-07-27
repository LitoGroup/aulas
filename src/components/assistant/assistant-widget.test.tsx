// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

const sendMessage = vi.fn();
const regenerate = vi.fn();
let mockStatus = "ready";
let mockError: Error | undefined;
let mockMessages: { id: string; role: string; parts: { type: string; text: string }[] }[] = [];

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({ messages: mockMessages, sendMessage, status: mockStatus, error: mockError, regenerate }),
}));
vi.mock("ai", () => ({ DefaultChatTransport: class {} }));

import { AssistantWidget } from "./assistant-widget";

beforeEach(() => {
  sendMessage.mockClear();
  regenerate.mockClear();
  mockStatus = "ready";
  mockError = undefined;
  mockMessages = [];
});
afterEach(cleanup);

describe("AssistantWidget", () => {
  it("começa fechado, mostrando só o botão flutuante", () => {
    render(<AssistantWidget />);
    expect(screen.getByLabelText("Abrir assistente de suporte")).toBeDefined();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("abre o painel com as sugestões e o campo de texto", () => {
    render(<AssistantWidget />);
    fireEvent.click(screen.getByLabelText("Abrir assistente de suporte"));
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Quais cursos vocês têm?")).toBeDefined();
    expect(screen.getByText("Como concluo uma aula?")).toBeDefined();
    expect(screen.getByPlaceholderText("Escreva sua dúvida...")).toBeDefined();
  });

  it("clicar numa sugestão envia a mensagem", () => {
    render(<AssistantWidget />);
    fireEvent.click(screen.getByLabelText("Abrir assistente de suporte"));
    fireEvent.click(screen.getByText("Quais cursos vocês têm?"));
    expect(sendMessage).toHaveBeenCalledWith({ text: "Quais cursos vocês têm?" });
  });

  it("digitar e enviar chama sendMessage com o texto", () => {
    render(<AssistantWidget />);
    fireEvent.click(screen.getByLabelText("Abrir assistente de suporte"));
    fireEvent.change(screen.getByPlaceholderText("Escreva sua dúvida..."), {
      target: { value: "Tem desconto?" },
    });
    fireEvent.click(screen.getByLabelText("Enviar"));
    expect(sendMessage).toHaveBeenCalledWith({ text: "Tem desconto?" });
  });

  it("mostra o erro quando a chamada falha e oferece tentar de novo", () => {
    mockError = new Error("Falha no gateway XYZ");
    render(<AssistantWidget />);
    fireEvent.click(screen.getByLabelText("Abrir assistente de suporte"));
    expect(screen.getByText(/Falha no gateway XYZ/)).toBeDefined();
    fireEvent.click(screen.getByText("Tentar de novo"));
    expect(regenerate).toHaveBeenCalled();
  });

  it("renderiza mensagens já trocadas", () => {
    mockMessages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "Oi" }] },
      { id: "2", role: "assistant", parts: [{ type: "text", text: "Olá! Como ajudo?" }] },
    ];
    render(<AssistantWidget />);
    fireEvent.click(screen.getByLabelText("Abrir assistente de suporte"));
    expect(screen.getByText("Oi")).toBeDefined();
    expect(screen.getByText("Olá! Como ajudo?")).toBeDefined();
  });
});
