import { NextResponse } from "next/server";
import { setActiveAccountId, getActiveAccountId } from "@/lib/credentials";

export async function GET() {
  try {
    const activeId = await getActiveAccountId();
    return NextResponse.json({ activeAccountId: activeId });
  } catch {
    return NextResponse.json({ activeAccountId: null });
  }
}

export async function POST(request: Request) {
  try {
    const { accountId } = await request.json();
    if (!accountId) {
      return NextResponse.json(
        { error: "accountId e obrigatorio" },
        { status: 400 }
      );
    }

    await setActiveAccountId(accountId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Erro ao definir conta ativa" },
      { status: 500 }
    );
  }
}
