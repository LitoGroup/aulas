import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-base font-bold text-white shadow-[var(--shadow-md)]">
              S
            </span>
            <span className="font-display text-2xl font-bold text-[color:var(--ink)]">
              School
            </span>
          </Link>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Sua <span className="highlight">plataforma de aulas</span> online
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
