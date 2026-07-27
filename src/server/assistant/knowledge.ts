import { ESCOLA } from "@/lib/contact";

/**
 * Base de conhecimento curada da escola. É a fonte da verdade do assistente:
 * ele só afirma fatos que estão aqui (ou no contexto da plataforma montado a
 * partir do banco). Os dados dos cursos foram extraídos do site oficial;
 * quando o site mudar (preços, prazos), atualize aqui.
 */

interface CursoInfo {
  nome: string;
  duracao: string;
  formato: string;
  inclui: string;
  preRequisitos: string;
  certificacao: string;
  preco: string;
}

const CURSOS: CursoInfo[] = [
  {
    nome: "Mecânico de Aeronaves Básico + Célula",
    duracao: "8 meses (com extensão de mais 8 meses se necessário)",
    formato:
      "Semipresencial: teoria online + imersão prática de 4 dias em São Paulo (2 dias em SP e 2 dias em oficinas conveniadas)",
    inclui:
      "plataforma digital, apostila de apoio, aulas com professores, laboratório equipado, visita técnica monitorada, suporte de tutores e aplicativo para assistir offline",
    preRequisitos: "18 anos e ensino médio completos até o final da formação",
    certificacao: "Homologado pela ANAC",
    preco: "10x de R$ 598,70 no cartão ou R$ 5.687,00 à vista (boleto/PIX)",
  },
  {
    nome: "Mecânico de Aeronaves Básico + GMP",
    duracao: "8 meses (com extensão de mais 8 meses se necessário)",
    formato: "Semipresencial: teoria online + prova e oficina prática em um final de semana em SP",
    inclui:
      "motores e sistemas (admissão, combustível, ignição, partida, lubrificação, refrigeração, proteção contra fogo, hélices), apostila, player com retomada de aula, tutores e aplicativo offline",
    preRequisitos: "18 anos e ensino médio completos até o final da formação (pode começar com 17)",
    certificacao: "Homologado pela ANAC; gera CCT (Certificado de Conhecimento Técnico)",
    preco: "10x de R$ 598,70 no cartão ou R$ 5.687,00 à vista (boleto/PIX)",
  },
  {
    nome: "Mecânico de Aeronaves Básico + Aviônica",
    duracao: "8 meses (com extensão de mais 8 meses se necessário)",
    formato: "Semipresencial: teoria online + prova e oficina prática em um final de semana em SP",
    inclui:
      "módulo básico + especialização em Aviônica (eletrônica, instrumentos, sistemas elétricos), visitas monitoradas, apostilas, suporte de tutores e aplicativo offline",
    preRequisitos: "18 anos e ensino médio completos até o final da formação",
    certificacao: "Homologado pela ANAC (é necessário fazer a prova da ANAC após a conclusão)",
    preco: "10x de R$ 598,70 no cartão ou R$ 5.687,00 à vista (boleto/PIX)",
  },
  {
    nome: "Mecânico de Aeronaves Básico + Célula + Aviônica + GMP (formação completa / combão)",
    duracao: "16 meses (com extensão de mais 16 meses se necessário)",
    formato: "Semipresencial: teoria online + prova e oficina prática presencial em SP",
    inclui:
      "todas as disciplinas teóricas, imersão prática (2 dias em SP + 2 dias em oficinas conveniadas), plataforma com player avançado, apostila, aplicativo Android, tutores e visitas técnicas",
    preRequisitos: "18 anos e ensino médio completos até o final da formação",
    certificacao: "Homologado pela ANAC",
    preco: "10x de R$ 1.200,00 no cartão ou R$ 11.400,00 à vista (boleto/PIX)",
  },
  {
    nome: "Preparatório FAA para Mecânicos",
    duracao: "Acesso por 24 meses",
    formato: "100% online, em inglês com legendas em português",
    inclui: "material oficial da FAA, preparação teórica completa e orientação para prova oral e prática",
    preRequisitos: "não informado",
    certificacao: "Preparatório para a certificação FAA (dos EUA)",
    preco: "10x de R$ 250,00 no cartão ou R$ 2.375,00 à vista (boleto/PIX, com 5% de desconto)",
  },
  {
    nome: "Iniciação ao Airbus A320 para Mecânicos",
    duracao: "Acesso ao conteúdo por 6 meses",
    formato: "100% online (EAD)",
    inclui: "curso de iniciação ao Airbus A320",
    preRequisitos: "não informado",
    certificacao: "Certificado ao término",
    preco: "6x de R$ 167,00 no cartão ou R$ 947,15 à vista (boleto/PIX)",
  },
  {
    nome: "Iniciação Boeing 737 para Mecânicos",
    duracao: "Acesso ao conteúdo por 6 meses",
    formato: "100% online (EAD)",
    inclui: "apostila em PDF, player com retomada de aula, tutores, aulas online para dúvidas e aplicativo offline",
    preRequisitos: "não informado",
    certificacao: "Certificado ao término",
    preco: "6x de R$ 167,00 no cartão ou R$ 947,15 à vista (boleto/PIX)",
  },
];

const cursosTexto = CURSOS.map(
  (c) =>
    `• ${c.nome}
  Duração: ${c.duracao}
  Formato: ${c.formato}
  Inclui: ${c.inclui}
  Pré-requisitos: ${c.preRequisitos}
  Certificação: ${c.certificacao}
  Preço: ${c.preco}`,
).join("\n\n");

export const KNOWLEDGE_BASE = `SOBRE A ESCOLA
A Lito Aviation Academy é uma escola de aviação com foco em manutenção de aeronaves.
Site oficial: ${ESCOLA.site}
Telefone e WhatsApp: ${ESCOLA.telefone}
A escola também oferece cursos de Piloto, Comissário de Bordo e uma Pós-Graduação em Engenharia
Aeronáutica; para detalhes desses, oriente a pessoa a ver o site ou falar pelo WhatsApp.

CURSOS E FORMAÇÕES DE MECÂNICO (dados do site oficial)
${cursosTexto}

DESCONTOS E CUPONS
Há uma oferta de 17% de desconto. Cupons:
- À vista ou parcelado: AGORAOUNUNCA
- Recorrência: AGORAOUNUNCA2

OBSERVAÇÃO SOBRE VALORES E PRAZOS
Os preços, parcelas e prazos acima são os informados no site e podem mudar. Ao informar um valor,
sugira confirmar as condições atuais com a equipe pelo WhatsApp ${ESCOLA.telefone}. A matrícula
nas formações é feita no site oficial (${ESCOLA.site}); a plataforma de aulas não faz a venda.

COMO A PLATAFORMA DE AULAS FUNCIONA
- O aluno acessa os cursos publicados pelo painel; todo curso publicado aparece para ele.
- Cada curso tem módulos e aulas (vídeo, texto de apoio e materiais para baixar).
- Para registrar avanço, o aluno marca a aula como concluída; a próxima aula libera em sequência.
- Materiais (PDF e afins) podem ser abertos ou baixados na própria aula.
- Algumas aulas têm prova, com nota calculada automaticamente.
- Ao concluir 100% de um curso, aparece uma pesquisa de satisfação (nota e comentário).
- Dúvidas que fujam disto: encaminhe para o WhatsApp ${ESCOLA.telefone}.`;
