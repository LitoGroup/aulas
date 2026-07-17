import { LEGAL_VERSION, DPO_EMAIL } from "@/lib/legal";

export const metadata = { title: "Política de Privacidade — Lito School" };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-lg font-bold text-[color:var(--ink)]">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-[color:var(--ink)]">Política de Privacidade</h1>
      <p className="text-xs text-[color:var(--muted)]">Versão {LEGAL_VERSION}</p>

      <p className="rounded-xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/8 p-3 text-xs text-[color:var(--ink-soft)]">
        <strong>Aviso ao operador:</strong> este é um modelo-base. Revise e valide com seu
        advogado/DPO antes de publicar. Preencha os itens marcados como [preencher].
      </p>

      <H>1. Quem somos</H>
      <p>
        A Lito School ([preencher: razão social, CNPJ, endereço]) é a controladora dos dados
        pessoais tratados nesta plataforma, nos termos da Lei nº 13.709/2018 (LGPD).
      </p>

      <H>2. Dados que coletamos</H>
      <p>
        Coletamos os dados que você nos fornece no cadastro — <strong>nome, e-mail e senha</strong>{" "}
        (armazenada apenas de forma criptografada/hash, nunca em texto) — e dados gerados pelo
        uso: matrículas, progresso nas aulas e resultados de avaliações.
      </p>

      <H>3. Para que usamos</H>
      <p>
        Utilizamos seus dados para autenticar seu acesso, disponibilizar os cursos, registrar seu
        progresso e notas, e comunicar informações essenciais da plataforma. A base legal é a
        <strong> execução do contrato</strong> e o seu <strong>consentimento</strong> (LGPD Art. 7).
      </p>

      <H>4. Compartilhamento</H>
      <p>
        Utilizamos provedores de infraestrutura para hospedagem e armazenamento
        ([preencher: ex. Vercel, Supabase]). Vídeos podem ser exibidos via YouTube/Vimeo.
        Não vendemos seus dados.
      </p>

      <H>5. Retenção</H>
      <p>
        Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir a conta, os dados são
        removidos [preencher: prazo e eventuais exceções legais de guarda].
      </p>

      <H>6. Seus direitos</H>
      <p>
        Você pode acessar, corrigir, exportar e excluir seus dados diretamente em{" "}
        <strong>“Minha conta”</strong>, ou solicitando ao nosso Encarregado. Você também pode
        revogar o consentimento a qualquer momento (LGPD Art. 18).
      </p>

      <H>7. Encarregado (DPO)</H>
      <p>
        Contato para assuntos de privacidade: <strong>{DPO_EMAIL}</strong>.
      </p>

      <H>8. Cookies</H>
      <p>
        Usamos cookies estritamente necessários para manter sua sessão autenticada. [preencher:
        detalhar demais cookies, se houver].
      </p>
    </>
  );
}
