/**
 * Navegação da área logada, em um lugar só.
 *
 * A sidebar (desktop), a barra inferior e o menu do celular consomem daqui
 * para não divergirem — antes a lista do celular era escrita à mão no layout
 * e tinha ficado sem "Minha conta".
 */
export type NavIconName =
  | "panel"
  | "catalog"
  | "assessments"
  | "manage"
  | "users"
  | "account";

export interface NavItem {
  href: string;
  /** Rótulo completo (sidebar e menu). */
  label: string;
  /** Rótulo curto para a barra inferior, onde cabe pouco. */
  short: string;
  icon: NavIconName;
}

const LEARN: NavItem[] = [
  { href: "/dashboard", label: "Painel", short: "Painel", icon: "panel" },
  { href: "/courses", label: "Catálogo de cursos", short: "Cursos", icon: "catalog" },
  // "Provas" e não "Avaliações": a pesquisa de satisfação também é uma
  // avaliação, e o nome ambíguo mandava quem procurava uma para a outra.
  { href: "/assessments", label: "Minhas provas", short: "Provas", icon: "assessments" },
  { href: "/conta", label: "Minha conta", short: "Conta", icon: "account" },
];

export function isTeacherRole(role: string): boolean {
  return role === "TEACHER" || role === "ADMIN";
}

/** Itens de aluno, disponíveis para todos os papéis. */
export function learnItems(): NavItem[] {
  return LEARN;
}

/** Itens de professor/admin. Vazio para aluno. */
export function teachItems(role: string): NavItem[] {
  if (!isTeacherRole(role)) return [];
  return [
    { href: "/manage", label: "Gerenciar conteúdo", short: "Gerenciar", icon: "manage" },
    ...(role === "ADMIN"
      ? [{ href: "/manage/users", label: "Alunos", short: "Alunos", icon: "users" as const }]
      : []),
  ];
}

/**
 * As quatro abas da barra inferior do celular. O quinto espaço é sempre o
 * botão "Menu", por isso o limite de quatro: acima disso os rótulos ficam
 * ilegíveis em 375px.
 */
export function bottomBarItems(role: string): NavItem[] {
  const [painel, cursos, provas, conta] = LEARN;
  const ensino = teachItems(role);
  // Professor troca "Conta" por "Gerenciar" na barra; "Conta" continua no menu.
  return ensino.length > 0
    ? [painel, cursos, provas, ensino[0]]
    : [painel, cursos, provas, conta];
}

/**
 * Item ativo: o href mais específico que casa com a rota atual. Sem isso
 * "/manage" ficaria aceso junto com "/manage/users".
 */
export function activeHref(pathname: string, hrefs: string[]): string | undefined {
  return hrefs
    .filter((h) => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];
}
