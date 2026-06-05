import { NextResponse } from "next/server";
import {
  getAccount,
  updateAccount,
  deleteAccount,
} from "@/lib/credentials";
import { accountUpdateSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const account = getAccount(id);
    const { accessToken, ...safe } = account;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json(
      { error: "Conta nao encontrada" },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = accountUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    updateAccount(id, parsed.data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar conta" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteAccount(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao deletar conta" },
      { status: 500 }
    );
  }
}
