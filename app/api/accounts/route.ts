import { NextResponse } from "next/server";
import { createAccount, getAllAccounts } from "@/lib/credentials";
import { accountSchema } from "@/lib/validations";

export async function GET() {
  try {
    const accounts = getAllAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao listar contas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = accountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, accessToken, wabaId, phoneNumberId } = parsed.data;
    const account = createAccount(name, accessToken, wabaId, phoneNumberId);

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar conta" },
      { status: 500 }
    );
  }
}
