import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { prisma } from "@/server/db";
import { PageHeader, Card } from "@/components/ui";
import { DPO_EMAIL } from "@/lib/legal";
import {
  ProfileForm,
  PasswordForm,
  ExportButton,
  DeleteAccount,
} from "./account-forms";

export default async function AccountPage() {
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const user = await prisma.user.findUnique({
    where: { id: actor.id },
    select: { name: true, email: true },
  });
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Minha conta" subtitle="Gerencie seus dados e privacidade." />

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold text-[color:var(--ink)]">Dados pessoais</h2>
        <ProfileForm name={user.name} email={user.email} />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold text-[color:var(--ink)]">Senha</h2>
        <PasswordForm />
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-[color:var(--ink)]">Seus dados (LGPD)</h2>
        <p className="mt-1 mb-4 text-sm text-[color:var(--muted)]">
          Você pode baixar uma cópia de todos os dados que mantemos sobre você, ou
          solicitar a exclusão da sua conta a qualquer momento.
        </p>
        <div className="flex flex-wrap gap-3">
          <ExportButton />
        </div>
        <div className="mt-6 border-t border-[color:var(--border)] pt-5">
          <DeleteAccount />
        </div>
      </Card>

      <p className="text-center text-xs text-[color:var(--muted)]">
        Dúvidas sobre seus dados? Fale com nosso Encarregado (DPO):{" "}
        <a href={`mailto:${DPO_EMAIL}`} className="text-[color:var(--brand-ink)] underline">
          {DPO_EMAIL}
        </a>{" "}
        · Veja a{" "}
        <Link href="/privacidade" className="text-[color:var(--brand-ink)] underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
