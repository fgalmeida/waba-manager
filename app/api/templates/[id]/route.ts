import { NextResponse } from "next/server";
import { metaApi } from "@/lib/meta-api";
import { getActiveAccountId } from "@/lib/credentials";
import { updateTemplateSchema } from "@/lib/validations";
import { META_ERROR_MESSAGES } from "@/types/meta";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const activeId = await getActiveAccountId();
    if (!activeId) {
      return NextResponse.json(
        { error: "Nenhuma conta Meta ativa" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const template = await metaApi.templates.getById(id, activeId);
    return NextResponse.json(template);
  } catch (error: any) {
    console.error("[templates] GET error:", JSON.stringify(error?.body ?? error));
    const code = error?.body?.error?.code;
    const metaMsg = error?.body?.error?.message;
    const translated = META_ERROR_MESSAGES[code];
    const message = metaMsg
      ? `${translated ?? "Erro da Meta"}: ${metaMsg}`
      : translated ?? "Template nao encontrado";
    return NextResponse.json(
      { error: message },
      { status: error?.status ?? 404 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const activeId = await getActiveAccountId();
    if (!activeId) {
      return NextResponse.json(
        { error: "Nenhuma conta Meta ativa" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const template = await metaApi.templates.update(id, activeId, parsed.data);
    return NextResponse.json(template);
  } catch (error: any) {
    console.error("[templates] POST error:", JSON.stringify(error?.body ?? error));
    const code = error?.body?.error?.code;
    const metaMsg = error?.body?.error?.message;
    const translated = META_ERROR_MESSAGES[code];
    const message = metaMsg
      ? `${translated ?? "Erro da Meta"}: ${metaMsg}`
      : translated ?? "Erro ao editar template";
    return NextResponse.json(
      { error: message },
      { status: error?.status ?? 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const activeId = await getActiveAccountId();
    if (!activeId) {
      return NextResponse.json(
        { error: "Nenhuma conta Meta ativa" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Parametro 'name' obrigatorio para deletar template" },
        { status: 400 }
      );
    }

    await metaApi.templates.delete(activeId, name);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[templates] DELETE error:", JSON.stringify(error?.body ?? error));
    const code = error?.body?.error?.code;
    const metaMsg = error?.body?.error?.message;
    const translated = META_ERROR_MESSAGES[code];
    const message = metaMsg
      ? `${translated ?? "Erro da Meta"}: ${metaMsg}`
      : translated ?? "Erro ao deletar template";
    return NextResponse.json(
      { error: message },
      { status: error?.status ?? 500 }
    );
  }
}
