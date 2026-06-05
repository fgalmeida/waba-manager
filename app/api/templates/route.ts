import { NextResponse } from "next/server";
import { metaApi } from "@/lib/meta-api";
import { getActiveAccountId } from "@/lib/credentials";
import { createTemplateSchema } from "@/lib/validations";
import { META_ERROR_MESSAGES } from "@/types/meta";

export async function GET(request: Request) {
  try {
    const activeId = await getActiveAccountId();
    if (!activeId) {
      return NextResponse.json(
        { error: "Nenhuma conta Meta ativa. Configure em /settings" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters: Record<string, string> = {};

    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const name = searchParams.get("name");
    const limit = searchParams.get("limit");

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (name) filters.name = name;
    if (limit) filters.limit = limit;

    const templates = await metaApi.templates.list(activeId, filters);
    return NextResponse.json(templates);
  } catch (error: any) {
    const code = error?.body?.error?.code;
    const message =
      META_ERROR_MESSAGES[code] ??
      error?.body?.error?.message ??
      "Erro ao buscar templates";

    return NextResponse.json(
      { error: message },
      { status: error?.status ?? 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const activeId = await getActiveAccountId();
    if (!activeId) {
      return NextResponse.json(
        { error: "Nenhuma conta Meta ativa. Configure em /settings" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const template = await metaApi.templates.create(activeId, parsed.data);
    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    const code = error?.body?.error?.code;
    const message =
      META_ERROR_MESSAGES[code] ??
      error?.body?.error?.message ??
      "Erro ao criar template";

    return NextResponse.json(
      { error: message, code },
      { status: error?.status ?? 500 }
    );
  }
}
