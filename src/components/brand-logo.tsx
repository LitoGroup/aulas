"use client";

import { useState } from "react";

/**
 * Marca da Lito School. Usa a logo real em /brand/lito-mark.png quando existir;
 * enquanto o arquivo nao for adicionado, mostra o selo "LS" como fallback.
 * Passe `variant="white"` para versoes sobre fundo escuro (aplica um leve
 * realce para a logo cinza aparecer melhor).
 */
export function BrandMark({
  size = 36,
  variant = "adaptive",
}: {
  size?: number;
  variant?: "default" | "adaptive" | "white";
}) {
  const [ok, setOk] = useState(true);

  if (!ok) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent)] font-extrabold text-[#0a1f3c]"
        style={{ width: size, height: size, fontSize: size * 0.36 }}
      >
        LS
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/lito-mark.png"
      alt="Lito School"
      width={size}
      height={size}
      onError={() => setOk(false)}
      className={`shrink-0 object-contain ${
        variant === "white" ? "[filter:brightness(0)_invert(1)]" : variant === "adaptive" ? "logo-adaptive" : ""
      }`}
      style={{ width: size, height: size }}
    />
  );
}
