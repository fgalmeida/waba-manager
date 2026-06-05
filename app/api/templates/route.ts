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
    console.error("[templates] Meta API error:", JSON.stringify(error?.body ?? error));

    const code = error?.body?.error?.code;
    const metaMsg = error?.body?.error?.message;
    const metaSubcode = error?.body?.error?.error_subcode;
    const translated = META_ERROR_MESSAGES[code];
    const message = metaMsg
      ? `${translated ?? "Erro da Meta"}: ${metaMsg}${metaSubcode ? ` (subcode: ${metaSubcode})` : ""}`
      : translated ?? "Erro ao buscar templates";

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
    console.log("[templates] POST body:", JSON.stringify(body));

    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      console.log("[templates] Zod validation failed:", parsed.error.issues);
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    console.log("[templates] Parsed payload:", JSON.stringify(parsed.data));
    const template = await metaApi.templates.create(activeId, parsed.data);
    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error("[templates] POST catch:", error?.constructor?.name, error?.message, error?.cause);
    console.error("[templates] POST error body:", JSON.stringify(error?.body));
    console.error("[templates] POST error full:", Object.keys(error ?? {}));

    const code = error?.body?.error?.code;
    const metaMsg = error?.body?.error?.message ?? error?.message;
    const metaSubcode = error?.body?.error?.error_subcode;
    const translated = META_ERROR_MESSAGES[code];
    const message = metaMsg
      ? `${translated ?? "Erro da Meta"}: ${metaMsg}${metaSubcode ? ` (subcode: ${metaSubcode})` : ""}`
      : translated ?? "Erro ao criar template";

    return NextResponse.json(
      { error: message, code },
      { status: error?.status ?? 500 }
    );
  }
}
