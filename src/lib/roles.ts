// Rótulos de papel em português para exibição (o valor real no banco
// continua STUDENT | TEACHER | ADMIN).
export function roleLabel(role: string): string {
  if (role === "ADMIN") return "Administrador";
  if (role === "TEACHER") return "Professor";
  return "Aluno";
}
