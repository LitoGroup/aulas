"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      title={isDark ? "Tema claro" : "Tema escuro"}
      className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-[color:var(--ink-soft)] transition hover:bg-[color:var(--canvas)] hover:text-[color:var(--ink)] ${
        collapsed ? "justify-center px-0" : "px-3"
      }`}
    >
      {isDark ? (
        <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="8" cy="8" r="3.2" />
          <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z" strokeLinejoin="round" />
        </svg>
      )}
      {!collapsed && (isDark ? "Tema claro" : "Tema escuro")}
    </button>
  );
}
