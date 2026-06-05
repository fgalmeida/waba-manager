import { NextResponse } from "next/server";
import { timingSafeEqual, createHmac } from "node:crypto";
import { SignJWT } from "jose";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos" },
      { status: 400 }
    );
  }

  const { password } = parsed.data;
  const appPassword = process.env.APP_PASSWORD!;
  const sessionSecret = process.env.SESSION_SECRET!;

  const inputBuffer = Buffer.from(password ?? "");
  const expectedBuffer = Buffer.from(appPassword);

  const inputHash = createHmac("sha256", sessionSecret)
    .update(inputBuffer)
    .digest();
  const expectedHash = createHmac("sha256", sessionSecret)
    .update(expectedBuffer)
    .digest();

  if (inputHash.length !== expectedHash.length) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json(
      { error: "Credenciais invalidas" },
      { status: 401 }
    );
  }

  const isValid = timingSafeEqual(inputHash, expectedHash);

  if (!isValid) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json(
      { error: "Credenciais invalidas" },
      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(sessionSecret);
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const response = NextResponse.json({ success: true });

  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}
