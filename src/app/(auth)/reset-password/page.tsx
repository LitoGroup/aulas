import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[1.7rem] font-bold leading-tight text-white">Nova senha</h1>
        <p className="mt-1.5 text-sm text-white/45">Defina uma nova senha para sua conta.</p>
      </div>
      <ResetForm token={token ?? ""} />
    </div>
  );
}
