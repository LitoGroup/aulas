import { hash, verify } from "@node-rs/argon2";

// Parametros seguindo recomendacao OWASP para Argon2id.
const OPTS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTS);
}

export async function verifyPassword(
  hashed: string,
  plain: string,
): Promise<boolean> {
  try {
    return await verify(hashed, plain, OPTS);
  } catch {
    return false;
  }
}
