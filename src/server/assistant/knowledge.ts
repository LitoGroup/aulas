import { SHOWCASE_COURSES } from "@/lib/showcase-courses";
import { ESCOLA } from "@/lib/contact";

/**
 * Base de conhecimento curada da escola. É a fonte da verdade do assistente:
 * ele só afirma fatos que estão aqui (ou no contexto da plataforma montado a
 * partir do banco). Mantida à mão — quando o site mudar, atualize aqui.
 */
const formacoes = SHOWCASE_COURSES.map((c) => `- ${c.title} (${c.subtitle})`).join("\n");

export const KNOWLEDGE_BASE = `SOBRE A ESCOLA
A Lito Aviation Academy é uma escola de aviação focada em manutenção de aeronaves.
Site oficial: ${ESCOLA.site}
Telefone e WhatsApp: ${ESCOLA.telefone}

FORMAÇÕES E CURSOS OFERECIDOS (no site oficial)
${formacoes}
As matrículas nessas formações são feitas no site oficial (${ESCOLA.site}); a plataforma de
aulas não faz a venda. Para valores e condições de cada formação, oriente a pessoa a falar com
a equipe pelo WhatsApp ${ESCOLA.telefone} ou pelo site.

DESCONTOS E CUPONS
Há uma oferta de 17% de desconto nos cursos. Cupons:
- À vista ou parcelado: AGORAOUNUNCA
- Recorrência: AGORAOUNUNCA2

COMO A PLATAFORMA DE AULAS FUNCIONA
- O aluno acessa os cursos publicados pelo painel; todo curso publicado aparece para ele.
- Cada curso tem módulos e aulas (vídeo, texto de apoio e materiais para baixar).
- Para registrar avanço, o aluno marca a aula como concluída; a próxima aula libera em sequência.
- Materiais (PDF e afins) podem ser abertos ou baixados na própria aula.
- Algumas aulas têm prova, com nota calculada automaticamente.
- Ao concluir 100% de um curso, aparece uma pesquisa de satisfação (nota e comentário).
- Dúvidas que fujam disto: encaminhe para o WhatsApp ${ESCOLA.telefone}.`;
