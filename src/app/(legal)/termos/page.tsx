import { LEGAL_VERSION } from "@/lib/legal";

export const metadata = { title: "Termos de Uso — Lito School" };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-lg font-bold text-[color:var(--ink)]">{children}</h2>;
}

export default function TermsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-[color:var(--ink)]">Termos de Uso</h1>
      <p className="text-xs text-[color:var(--muted)]">Versão {LEGAL_VERSION}</p>

      <H>1. Objeto</H>
      <p>
        Estes Termos regem o uso da plataforma <strong>Lito School</strong>, mantida por{" "}
        <strong>Lito Academy Ltda.</strong> (CNPJ 48.629.788/0001-26 — Lito Group / Aviões e
        Músicas), sediada na Rua Brás Cubas, 231 — Vila Lanzara, Guarulhos/SP, que oferece cursos e
        conteúdos educacionais de aviação online.
      </p>

      <H>2. Conta e acesso</H>
      <p>
        Você é responsável por manter a confidencialidade da sua senha e por todas as atividades
        realizadas na sua conta. O acesso é pessoal e intransferível.
      </p>

      <H>3. Uso do conteúdo</H>
      <p>
        Os cursos, vídeos e materiais são protegidos por direitos autorais e destinam-se ao seu
        uso pessoal. É vedada a reprodução, distribuição ou compartilhamento não autorizado.
      </p>

      <H>4. Conduta</H>
      <p>
        Você concorda em não tentar burlar mecanismos de segurança, acessar conteúdo ao qual não
        tem direito, ou prejudicar o funcionamento da plataforma.
      </p>

      <H>5. Alterações e encerramento</H>
      <p>
        Podemos atualizar estes Termos e a plataforma a qualquer momento. Você pode encerrar sua
        conta quando quiser em “Minha conta”. [confirmar: condições comerciais de
        matrícula/pagamento, cancelamento e reembolso, quando aplicáveis.]
      </p>

      <H>6. Contato</H>
      <p>
        Suporte e dúvidas: <strong>mma@litogroup.com</strong> · (11) 99009-3005 · Rua Brás Cubas,
        231 — Vila Lanzara, Guarulhos/SP.
      </p>
    </>
  );
}
