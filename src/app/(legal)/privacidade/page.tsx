import { LEGAL_VERSION, DPO_EMAIL } from "@/lib/legal";

export const metadata = { title: "Política de Privacidade - Lito School" };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-lg font-bold text-[color:var(--ink)]">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-[color:var(--ink)]">Política de Privacidade</h1>
      <p className="text-xs text-[color:var(--muted)]">Versão {LEGAL_VERSION}</p>

      <H>1. Quem somos</H>
      <p>
        A <strong>Lito Aviation Academy</strong> (“Lito School”), integrante do Lito Group /
        Aviões e Músicas, Centro de Instrução de Aviação Civil homologado pela ANAC, é a
        controladora dos dados pessoais tratados nesta plataforma, nos termos da Lei nº
        13.709/2018 (LGPD).
      </p>
      <p>
        Razão social: <strong>Lito Academy Ltda.</strong> · CNPJ:{" "}
        <strong>48.629.788/0001-26</strong> · Endereço: Rua Brás Cubas, 231 - Vila Lanzara,
        Guarulhos/SP, CEP 07115-080 · Contato: (11) 99009-3005.
      </p>

      <H>2. Dados que coletamos</H>
      <p>
        Coletamos os dados que você nos fornece no cadastro - <strong>nome, e-mail e senha</strong>{" "}
        (armazenada apenas de forma criptografada/hash, nunca em texto) - e dados gerados pelo
        uso: matrículas, progresso nas aulas, resultados de avaliações e as respostas que você
        der à pesquisa de satisfação ao concluir um curso (nota e comentário, associados ao seu
        nome e visíveis apenas para a equipe da escola).
      </p>

      <H>3. Para que usamos</H>
      <p>
        Utilizamos seus dados para autenticar seu acesso, disponibilizar os cursos, registrar seu
        progresso e notas, e comunicar informações essenciais da plataforma. A base legal é a
        <strong> execução do contrato</strong> e o seu <strong>consentimento</strong> (LGPD Art. 7).
      </p>

      <H>4. Compartilhamento</H>
      <p>
        Para operar a plataforma, utilizamos os seguintes operadores: <strong>Vercel</strong>{" "}
        (hospedagem da aplicação), <strong>Supabase</strong> (banco de dados e armazenamento de
        arquivos) e <strong>YouTube/Vimeo</strong> (exibição de vídeos das aulas). Esses
        provedores tratam dados exclusivamente para prestar o serviço contratado. Não vendemos
        nem cedemos seus dados a terceiros para fins de marketing.
      </p>

      <H>5. Retenção</H>
      <p>
        Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar a exclusão em “Minha
        conta”, seus dados pessoais são eliminados dos nossos sistemas em até 30 dias, ressalvadas
        as informações que a lei exigir que sejam guardadas por prazo determinado.
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
        Usamos apenas cookies estritamente necessários para manter sua sessão autenticada e
        garantir a segurança do acesso. Não utilizamos cookies de publicidade ou de rastreamento
        de terceiros.
      </p>
    </>
  );
}
