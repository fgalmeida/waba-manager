import { NextResponse } from "next/server";
import { getAccount } from "@/lib/credentials";
import { metaApi } from "@/lib/meta-api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const account = getAccount(id);
    const result = await metaApi.templates.validateCredentials(
      account.wabaId,
      account.accessToken
    );
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[validate] Erro ao validar credenciais:", error);

    const errorMessage =
      error?.message ??
      error?.body?.error?.message ??
      error?.body?.error?.error_user_msg ??
      "Erro ao validar credenciais";

    const errorCode = error?.body?.error?.code ?? error?.status ?? 500;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
      },
      { status: 200 }
    );
  }
}
