import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/server/auth/auth.config";

const { auth } = NextAuth(authConfig);

// Rotas que exigem usuario autenticado.
const PRIVATE = [/^\/dashboard/, /^\/manage/, /^\/learn/];

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  // videos hospedados no Supabase Storage (player proprio)
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  // players de video embutidos
  "frame-src 'self' https://player.vimeo.com https://www.youtube-nocookie.com https://www.youtube.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Content-Security-Policy", CSP);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const isPrivate = PRIVATE.some((r) => r.test(pathname));

  if (isPrivate && !req.auth) {
    const url = new URL("/login", origin);
    url.searchParams.set("callbackUrl", pathname);
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  return withSecurityHeaders(NextResponse.next());
});

export const config = {
  // Aplica em tudo, exceto assets estaticos e a rota interna do NextAuth.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
