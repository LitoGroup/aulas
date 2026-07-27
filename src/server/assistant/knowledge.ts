import { ESCOLA } from "@/lib/contact";

/**
 * Base de conhecimento curada da escola. É a fonte da verdade do assistente:
 * ele só afirma fatos que estão aqui (ou no contexto da plataforma montado a
 * partir do banco). Dados e links extraídos do site oficial; quando o site
 * mudar (preços, prazos, links de checkout), atualize aqui.
 */

const SITE = "https://litoaviationacademy.com.br/formacoes-e-cursos";
const CHK = "https://checkout.litoacademy.com.br";

interface Pagamento {
  tipo: string;
  url: string;
}

interface CursoInfo {
  nome: string;
  duracao: string;
  formato: string;
  inclui: string;
  preRequisitos: string;
  certificacao: string;
  preco: string;
  pagina: string;
  pagamentos: Pagamento[];
}

const CURSOS: CursoInfo[] = [
  {
    nome: "Mecânico de Aeronaves Básico + Célula",
    duracao: "8 meses (extensão de mais 8 meses se necessário)",
    formato: "Semipresencial: teoria online + imersão prática de 4 dias em SP (2 em SP e 2 em oficinas conveniadas)",
    inclui: "plataforma digital, apostila, laboratório equipado, visita técnica, tutores e app offline",
    preRequisitos: "18 anos e ensino médio completos até o final da formação",
    certificacao: "Homologado pela ANAC",
    preco: "10x de R$ 598,70 no cartão ou R$ 5.687,00 à vista (boleto/PIX)",
    pagina: `${SITE}/curso-mecanico-de-aeronaves/`,
    pagamentos: [
      { tipo: "Cartão parcelado", url: `${CHK}/pay/mma-turbo-basico-celula-cartao-boleto-e-pix-turma-set24` },
      { tipo: "À vista (boleto/PIX)", url: `${CHK}/pay/basico-celula-pix-boleto-511765-a-vista` },
      { tipo: "Recorrência", url: `${CHK}/subscribe/bas-celula-recorrencia` },
    ],
  },
  {
    nome: "Mecânico de Aeronaves Básico + GMP",
    duracao: "8 meses (extensão de mais 8 meses se necessário)",
    formato: "Semipresencial: teoria online + prova e oficina prática em um final de semana em SP",
    inclui: "motores e sistemas (admissão, combustível, ignição, lubrificação, proteção contra fogo, hélices), apostila, tutores e app offline",
    preRequisitos: "18 anos e ensino médio completos até o final da formação (pode começar com 17)",
    certificacao: "Homologado pela ANAC; gera CCT (Certificado de Conhecimento Técnico)",
    preco: "10x de R$ 598,70 no cartão ou R$ 5.687,00 à vista (boleto/PIX)",
    pagina: `${SITE}/mecanico-de-aeronaves-basico-gmp/`,
    pagamentos: [
      { tipo: "Cartão parcelado", url: `${CHK}/pay/basico-gmp-turbo-em-10x-sem-juros-no-cartao` },
      { tipo: "À vista (boleto/PIX)", url: `${CHK}/pay/basico-gmp-turbo-a-vista-no-boleto-ou-pix-5-off-ou-10x-sem-juros-no-cartao` },
      { tipo: "Recorrência", url: `${CHK}/subscribe/basico-gmp-recorrencia` },
    ],
  },
  {
    nome: "Mecânico de Aeronaves Básico + Aviônica",
    duracao: "8 meses (extensão de mais 8 meses se necessário)",
    formato: "Semipresencial: teoria online + prova e oficina prática em um final de semana em SP",
    inclui: "módulo básico + Aviônica (eletrônica, instrumentos, sistemas elétricos), visitas monitoradas, apostilas, tutores e app offline",
    preRequisitos: "18 anos e ensino médio completos até o final da formação",
    certificacao: "Homologado pela ANAC (necessário fazer a prova da ANAC após a conclusão)",
    preco: "10x de R$ 598,70 no cartão ou R$ 5.687,00 à vista (boleto/PIX)",
    pagina: `${SITE}/mecanico-de-aeronaves-basico-avionica/`,
    pagamentos: [
      { tipo: "Cartão parcelado", url: `${CHK}/pay/basico-avionica-turbo-cartao-parcelado-em-10x-sem-juros` },
      { tipo: "À vista (boleto/PIX)", url: `${CHK}/pay/basico-avionica-turbo-a-vista` },
      { tipo: "Recorrência", url: `${CHK}/subscribe/basico-avionica-recorrencia2` },
    ],
  },
  {
    nome: "Mecânico de Aeronaves Básico + Célula + Aviônica + GMP (formação completa / combão)",
    duracao: "16 meses (extensão de mais 16 meses se necessário)",
    formato: "Semipresencial: teoria online + prova e oficina prática presencial em SP",
    inclui: "todas as disciplinas teóricas, imersão prática (2 dias em SP + 2 em oficinas), plataforma com player avançado, apostila, app Android, tutores e visitas técnicas",
    preRequisitos: "18 anos e ensino médio completos até o final da formação",
    certificacao: "Homologado pela ANAC",
    preco: "10x de R$ 1.200,00 no cartão ou R$ 11.400,00 à vista (boleto/PIX)",
    pagina: `${SITE}/mecanico-de-aeronaves-basico-celula-avionica-gmp/`,
    pagamentos: [
      { tipo: "Cartão parcelado", url: `${CHK}/pay/basico-celula-avionica-gmp-em-10x-sem-juros-no-cartao-parcelado` },
      { tipo: "À vista (boleto/PIX)", url: `${CHK}/pay/basico-celula-avionica-gmp-boleto-e-pix-a-vista` },
      { tipo: "Recorrência", url: `${CHK}/subscribe/basico-celula-avionica-gmp-recorrencia-10x-de-1370` },
    ],
  },
  {
    nome: "Preparatório FAA para Mecânicos",
    duracao: "Acesso por 24 meses",
    formato: "100% online, em inglês com legendas em português",
    inclui: "material oficial da FAA, preparação teórica e orientação para prova oral e prática",
    preRequisitos: "não informado",
    certificacao: "Preparatório para a certificação FAA (EUA)",
    preco: "10x de R$ 250,00 no cartão ou R$ 2.375,00 à vista (boleto/PIX, 5% de desconto)",
    pagina: `${SITE}/preparatorio-faa-para-mecanicos/`,
    pagamentos: [{ tipo: "Cartão ou à vista", url: `${CHK}/pay/preparatorio-faa-para-mma` }],
  },
  {
    nome: "Iniciação ao Airbus A320 para Mecânicos",
    duracao: "Acesso por 6 meses",
    formato: "100% online (EAD)",
    inclui: "curso de iniciação ao Airbus A320",
    preRequisitos: "não informado",
    certificacao: "Certificado ao término",
    preco: "6x de R$ 167,00 no cartão ou R$ 947,15 à vista (boleto/PIX)",
    pagina: `${SITE}/iniciacao-ao-airbus-a320-para-mecanicos/`,
    pagamentos: [{ tipo: "Cartão ou à vista", url: `${CHK}/pay/iniciacao-airbus-a320-para-mma-r-99700-a-vista-com-5-off-ou-6x-sem-juros-no-cartao` }],
  },
  {
    nome: "Iniciação Boeing 737 para Mecânicos",
    duracao: "Acesso por 6 meses",
    formato: "100% online (EAD)",
    inclui: "apostila em PDF, player com retomada, tutores, aulas online e app offline",
    preRequisitos: "não informado",
    certificacao: "Certificado ao término",
    preco: "6x de R$ 167,00 no cartão ou R$ 947,15 à vista (boleto/PIX)",
    pagina: `${SITE}/boeing_737_mecanicos/`,
    pagamentos: [
      { tipo: "Cartão ou à vista", url: `${CHK}/pay/iniciacao-boeing-737-para-mma-r-99700-com-5-a-vista-ou-em-6x-sem-juros-no-cartao` },
      { tipo: "Recorrência", url: `${CHK}/subscribe/iniciacao-boeing-737-para-mma-r-1200-em-6-parcelas-fixas-mensais` },
    ],
  },
  {
    nome: "Piloto Privado + Comercial Teórico",
    duracao: "6 a 9 meses (conforme o programa)",
    formato: "100% online (EAD)",
    inclui: "meteorologia, navegação, regulamentos, teoria de voo, radiocomunicações, apostila, tutores e app offline",
    preRequisitos: "não informado",
    certificacao: "Curso teórico (preparação para as provas)",
    preco: "10x de R$ 419,70 no cartão ou R$ 3.987,15 à vista (boleto/PIX)",
    pagina: `${SITE}/piloto-privado-comercial/`,
    pagamentos: [
      { tipo: "Cartão parcelado", url: `${CHK}/pay/pp-pc-419700-em-ate-10x-sem-juros-copia` },
      { tipo: "À vista (boleto/PIX)", url: `${CHK}/pay/pp-pc-pix-boleto-398715-a-vista` },
      { tipo: "Recorrência", url: `${CHK}/subscribe/pp-pc-teorico-10-parcelas-fixas-mensais-de-r-44000` },
    ],
  },
  {
    nome: "Piloto Comercial Teórico + IFR Teórico",
    duracao: "5 a 11 meses (conforme o programa)",
    formato: "100% online (EAD)",
    inclui: "meteorologia, navegação, regulamentos, teoria de voo, radiocomunicações, fatores humanos, apostila, tutores e app offline",
    preRequisitos: "não informado",
    certificacao: "Curso teórico (preparação para as provas)",
    preco: "10x de R$ 259,70 no cartão ou R$ 2.448,50 à vista (boleto/PIX)",
    pagina: `${SITE}/piloto-comercial-ifr/`,
    pagamentos: [
      { tipo: "Cartão parcelado", url: `${CHK}/pay/pc-ifr-teorico-249700-em-ate-10x-sem-juros` },
      { tipo: "À vista (boleto/PIX)", url: `${CHK}/pay/pc-ifr-teorico-boleto-pix-por-237215-a-vista` },
      { tipo: "Recorrência", url: `${CHK}/subscribe/pc-ifr-teorico-recorrencia-10-parcelas-fixas-24970` },
    ],
  },
  {
    nome: "Piloto Privado Teórico",
    duracao: "4 a 5 meses (conforme o programa)",
    formato: "100% online (EAD)",
    inclui: "meteorologia, fatores humanos, navegação, regulamentos, conhecimentos técnicos, teoria de voo, apostila, tutores e app offline",
    preRequisitos: "curso livre, sem requisito obrigatório",
    certificacao: "Curso teórico (preparação para as provas)",
    preco: "10x de R$ 198,70 no cartão ou R$ 1.887,65 à vista (boleto/PIX)",
    pagina: `${SITE}/piloto-privado-safe/`,
    pagamentos: [
      { tipo: "Cartão parcelado", url: `${CHK}/pay/pp-teorico-198700-em-ate-10x-sem-juros-no-cartao` },
      { tipo: "À vista (boleto/PIX)", url: `${CHK}/pay/pp-teorico-pix-boleto-188765-a-vista` },
      { tipo: "Recorrência", url: `${CHK}/subscribe/piloto-privado-em-10-parcelas-fixas-mensais-de-r-22000` },
    ],
  },
  {
    nome: "Comissário de Bordo Teórico + Selva",
    duracao: "Até 4 meses (acesso por 6 meses)",
    formato: "Online + prática de sobrevivência na selva presencial em Guarulhos",
    inclui: "aulas teóricas online, apostila, prática de sobrevivência na selva e no mar, tutores e app offline",
    preRequisitos: "não informado",
    certificacao: "Certificado para aprovados",
    preco: "10x de R$ 149,70 no cartão ou R$ 1.422,15 à vista (boleto/PIX)",
    pagina: `${SITE}/comissario-de-bordo-teorico-selva/`,
    pagamentos: [{ tipo: "Cartão ou à vista", url: `${CHK}/pay/comissario-teorico-selva-jan27` }],
  },
  {
    nome: "Comissário de Bordo Teórico",
    duracao: "Até 4 meses (acesso por 6 meses)",
    formato: "100% online",
    inclui: "regulamentação, segurança de voo, navegação, meteorologia, primeiros socorros, emergência a bordo, apostila, tutores e app offline",
    preRequisitos: "não informado",
    certificacao: "Certificado para aprovados",
    preco: "10x de R$ 78,70 no cartão ou R$ 748,10 à vista (boleto/PIX)",
    pagina: `${SITE}/comissario-de-bordo-teorico/`,
    pagamentos: [{ tipo: "Cartão parcelado", url: `${CHK}/pay/comissario-teorico-787-cartao-parcelado` }],
  },
  {
    nome: "Pós-Graduação em Engenharia Aeronáutica",
    duracao: "Até 15 meses (420 horas)",
    formato: "100% online (EAD)",
    inclui: "aerodinâmica, sistemas propulsivos, legislação, projeto de aeronaves, manutenção e mais disciplinas",
    preRequisitos: "18 anos e ensino superior completo (qualquer área, inclusive tecnólogos)",
    certificacao: "Reconhecido pelo MEC, inscrito no CREA (próxima turma em 2027)",
    preco: "a definir (próxima turma em 2027) - consultar pelo WhatsApp",
    pagina: `${SITE}/pos-graduacao-engenheiro-aeronautico/`,
    pagamentos: [{ tipo: "Matrícula/informações", url: ESCOLA.whatsappHref }],
  },
];

function cursoTexto(c: CursoInfo): string {
  const pag = c.pagamentos.map((p) => `    - ${p.tipo}: ${p.url}`).join("\n");
  return `• ${c.nome}
  Duração: ${c.duracao}
  Formato: ${c.formato}
  Inclui: ${c.inclui}
  Pré-requisitos: ${c.preRequisitos}
  Certificação: ${c.certificacao}
  Preço: ${c.preco}
  Página do curso: ${c.pagina}
  Links de pagamento:
${pag}`;
}

const cursosTexto = CURSOS.map(cursoTexto).join("\n\n");

export const KNOWLEDGE_BASE = `SOBRE A ESCOLA
A Lito Aviation Academy é uma escola de aviação com cursos de manutenção de aeronaves, piloto,
comissário de bordo e pós-graduação.
Site oficial: ${ESCOLA.site}
Telefone e WhatsApp: ${ESCOLA.telefone}
A matrícula é feita no site/checkout oficial; a plataforma de aulas em si não processa a venda.

CURSOS E FORMAÇÕES (dados e links do site oficial)
${cursosTexto}

DESCONTOS E CUPONS
Há 17% de desconto. Aplique no checkout:
- Cupom AGORAOUNUNCA: pagamento à vista ou parcelado.
- Cupom AGORAOUNUNCA2: pagamento por recorrência (assinatura).

COMO A PLATAFORMA DE AULAS FUNCIONA
- O aluno acessa os cursos publicados pelo painel; todo curso publicado aparece para ele.
- Cada curso tem módulos e aulas (vídeo, texto de apoio e materiais para baixar).
- Para registrar avanço, o aluno marca a aula como concluída; a próxima aula libera em sequência.
- Materiais (PDF e afins) podem ser abertos ou baixados na própria aula.
- Algumas aulas têm prova, com nota calculada automaticamente.
- Ao concluir 100% de um curso, aparece uma pesquisa de satisfação (nota e comentário).
- Se um link de pagamento não abrir, direcione a pessoa à página do curso ou ao WhatsApp ${ESCOLA.telefone}.`;
