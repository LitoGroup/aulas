import type { ComponentProps } from "react";

export function Input(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 " +
        (props.className ?? "")
      }
    />
  );
}

export function Label(props: ComponentProps<"label">) {
  return (
    <label
      {...props}
      className={"mb-1 block text-sm font-medium text-slate-700 " + (props.className ?? "")}
    />
  );
}

export function Button(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={
        "inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60 " +
        (props.className ?? "")
      }
    />
  );
}

export function Alert({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  const styles =
    kind === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>{children}</div>
  );
}
