import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--ink)]">Nova senha</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">Defina uma nova senha para sua conta.</p>
      </div>
      <ResetForm token={token ?? ""} />
    </div>
  );
}
