import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  pbkdf2Sync,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;
const DIGEST = "sha512";

function deriveKey(secret: string): Buffer {
  const salt = "waba-manager-fixed-salt-2026";
  return pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, DIGEST);
}

export function encrypt(text: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const ivHex = iv.toString("hex");
  const encryptedHex = encrypted.toString("hex");
  const authTagHex = authTag.toString("hex");

  return `${ivHex}:${encryptedHex}:${authTagHex}`;
}

export function decrypt(encrypted: string, secret: string): string {
  const key = deriveKey(secret);
  const parts = encrypted.split(":");

  if (parts.length !== 3) {
    throw new Error("Formato de dados criptografados invalido");
  }

  const [ivHex, encryptedHex, authTagHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const encryptedData = Buffer.from(encryptedHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
