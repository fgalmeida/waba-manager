import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { encrypt, decrypt } from "./crypto";
import { cookies } from "next/headers";
import type {
  MetaAccountDecrypted,
  MetaAccountListItem,
} from "@/types/meta";

interface MetaAccountRow {
  id: string;
  name: string;
  enc_token: string;
  enc_waba_id: string;
  enc_phone_id: string;
  created_at: string;
  updated_at: string;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET nao configurada");
  }
  return secret;
}

export function createAccount(
  name: string,
  accessToken: string,
  wabaId: string,
  phoneNumberId: string
): { id: string; name: string } {
  const secret = getSecret();
  const id = uuidv4();
  const encToken = encrypt(accessToken, secret);
  const encWabaId = encrypt(wabaId, secret);
  const encPhoneId = encrypt(phoneNumberId, secret);

  const db = getDb();
  db.prepare(
    `INSERT INTO meta_accounts (id, name, enc_token, enc_waba_id, enc_phone_id)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, name, encToken, encWabaId, encPhoneId);

  return { id, name };
}

export function getAllAccounts(): MetaAccountListItem[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, name, created_at FROM meta_accounts ORDER BY created_at DESC")
    .all() as { id: string; name: string; created_at: string }[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
  }));
}

export function getAccount(id: string): MetaAccountDecrypted {
  const secret = getSecret();
  const db = getDb();

  const row = db
    .prepare("SELECT * FROM meta_accounts WHERE id = ?")
    .get(id) as MetaAccountRow | undefined;

  if (!row) {
    throw new Error("Conta nao encontrada");
  }

  return {
    id: row.id,
    name: row.name,
    accessToken: decrypt(row.enc_token, secret),
    wabaId: decrypt(row.enc_waba_id, secret),
    phoneNumberId: decrypt(row.enc_phone_id, secret),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function updateAccount(
  id: string,
  data: { name?: string; accessToken?: string; wabaId?: string; phoneNumberId?: string }
): void {
  const secret = getSecret();
  const db = getDb();

  const existing = db
    .prepare("SELECT * FROM meta_accounts WHERE id = ?")
    .get(id) as MetaAccountRow | undefined;

  if (!existing) {
    throw new Error("Conta nao encontrada");
  }

  const name = data.name ?? existing.name;
  const encToken = data.accessToken
    ? encrypt(data.accessToken, secret)
    : existing.enc_token;
  const encWabaId = data.wabaId
    ? encrypt(data.wabaId, secret)
    : existing.enc_waba_id;
  const encPhoneId = data.phoneNumberId
    ? encrypt(data.phoneNumberId, secret)
    : existing.enc_phone_id;

  db.prepare(
    `UPDATE meta_accounts
     SET name = ?, enc_token = ?, enc_waba_id = ?, enc_phone_id = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(name, encToken, encWabaId, encPhoneId, id);
}

export function deleteAccount(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM meta_accounts WHERE id = ?").run(id);
}

export async function getActiveAccountId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("active_account_id")?.value ?? null;
}

export async function setActiveAccountId(id: string): Promise<void> {
  const db = getDb();
  const exists = db
    .prepare("SELECT id FROM meta_accounts WHERE id = ?")
    .get(id);

  if (!exists) {
    throw new Error("Conta nao encontrada");
  }

  const cookieStore = await cookies();
  cookieStore.set("active_account_id", id, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
}

export async function getActiveAccount(): Promise<MetaAccountDecrypted> {
  const activeId = await getActiveAccountId();
  if (!activeId) {
    throw new Error("Nenhuma conta Meta ativa selecionada");
  }
  return getAccount(activeId);
}
