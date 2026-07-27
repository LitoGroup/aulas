import { ESCOLA } from "@/lib/contact";

/**
 * Diretório de conhecimento do assistente: o que a escola oferece e ONDE está a
 * informação oficial (URLs das páginas). Os dados que mudam (preço, duração,
 * links de pagamento) NÃO ficam fixos aqui — o assistente lê a página oficial
 * ao vivo (ferramenta consultarPaginaDoCurso) para responder com dados reais.
 */
const SITE = "https://litoaviationacademy.com.br/formacoes-e-cursos";

const CURSOS: { nome: string; pagina: string }[] = [
  { nome: "Mecânico de Aeronaves Básico + Célula", pagina: `${SITE}/curso-mecanico-de-aeronaves/` },
  { nome: "Mecânico de Aeronaves Básico + GMP", pagina: `${SITE}/mecanico-de-aeronaves-basico-gmp/` },
  { nome: "Mecânico de Aeronaves Básico + Aviônica", pagina: `${SITE}/mecanico-de-aeronaves-basico-avionica/` },
  { nome: "Mecânico de Aeronaves Básico + Célula + Aviônica + GMP (formação completa / combão)", pagina: `${SITE}/mecanico-de-aeronaves-basico-celula-avionica-gmp/` },
  { nome: "Preparatório FAA para Mecânicos", pagina: `${SITE}/preparatorio-faa-para-mecanicos/` },
  { nome: "Iniciação ao Airbus A320 para Mecânicos", pagina: `${SITE}/iniciacao-ao-airbus-a320-para-mecanicos/` },
  { nome: "Iniciação Boeing 737 para Mecânicos", pagina: `${SITE}/boeing_737_mecanicos/` },
  { nome: "Piloto Privado + Comercial Teórico", pagina: `${SITE}/piloto-privado-comercial/` },
  { nome: "Piloto Comercial Teórico + IFR Teórico", pagina: `${SITE}/piloto-comercial-ifr/` },
  { nome: "Piloto Privado Teórico", pagina: `${SITE}/piloto-privado-safe/` },
  { nome: "Comissário de Bordo Teórico + Selva", pagina: `${SITE}/comissario-de-bordo-teorico-selva/` },
  { nome: "Comissário de Bordo Teórico", pagina: `${SITE}/comissario-de-bordo-teorico/` },
  { nome: "Pós-Graduação em Engenharia Aeronáutica", pagina: `${SITE}/pos-graduacao-engenheiro-aeronautico/` },
];

const cursosTexto = CURSOS.map((c) => `- ${c.nome}: ${c.pagina}`).join("\n");

export const KNOWLEDGE_BASE = `SOBRE A ESCOLA
A Lito Aviation Academy é uma escola de aviação com cursos de manutenção de aeronaves, piloto,
comissário de bordo e pós-graduação.
Site oficial: ${ESCOLA.site}
Telefone e WhatsApp: ${ESCOLA.telefone}
A matrícula é feita no site/checkout oficial; a plataforma de aulas em si não processa a venda.

CURSOS E FORMAÇÕES (nome e página oficial)
Para dados atuais de um curso (preço, duração, formato, o que inclui e links de pagamento),
consulte a página oficial dele com a ferramenta disponível e responda com o que ela retornar.
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
- Se não souber algo ou uma página não abrir, direcione ao WhatsApp ${ESCOLA.telefone}.`;
