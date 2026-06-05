import { getAccount } from "./credentials";
import type {
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateFilters,
} from "@/types/meta";

const BASE_URL = `https://graph.facebook.com/${process.env.META_API_VERSION || "v19.0"}`;

function getHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function handleResponse(response: Response): Promise<any> {
  let data: any;
  try {
    data = await response.json();
  } catch {
    const text = await response.text().catch(() => "");
    throw {
      status: response.status,
      message: `Resposta inesperada da Meta API (status ${response.status}): ${text.slice(0, 200)}`,
      body: { error: { message: `Erro HTTP ${response.status}`, code: response.status } },
    };
  }
  if (!response.ok) {
    throw { status: response.status, body: data };
  }
  return data;
}

function buildQueryParams(filters?: TemplateFilters): string {
  const params = new URLSearchParams();
  const fields = [
    "name",
    "status",
    "category",
    "language",
    "components",
    "rejected_reason",
  ];
  params.set("fields", fields.join(","));

  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.name) params.set("name", filters.name);
  if (filters?.limit) params.set("limit", String(filters.limit));
  else params.set("limit", "100");

  return params.toString();
}

export const metaApi = {
  templates: {
    async list(
      accountId: string,
      filters?: TemplateFilters
    ): Promise<Template[]> {
      const account = getAccount(accountId);
      const qs = buildQueryParams(filters);
      const response = await fetch(
        `${BASE_URL}/${account.wabaId}/message_templates?${qs}`,
        { headers: getHeaders(account.accessToken) }
      );
      const data = await handleResponse(response);
      return data.data ?? [];
    },

    async create(
      accountId: string,
      input: CreateTemplateInput
    ): Promise<Template> {
      const account = getAccount(accountId);
      const response = await fetch(
        `${BASE_URL}/${account.wabaId}/message_templates`,
        {
          method: "POST",
          headers: getHeaders(account.accessToken),
          body: JSON.stringify(input),
        }
      );
      const data = await handleResponse(response);
      return data;
    },

    async update(
      templateId: string,
      accountId: string,
      input: UpdateTemplateInput
    ): Promise<Template> {
      const account = getAccount(accountId);
      const response = await fetch(
        `${BASE_URL}/${templateId}`,
        {
          method: "POST",
          headers: getHeaders(account.accessToken),
          body: JSON.stringify({ components: input.components }),
        }
      );
      const data = await handleResponse(response);
      return data;
    },

    async delete(accountId: string, name: string): Promise<void> {
      const account = getAccount(accountId);
      const response = await fetch(
        `${BASE_URL}/${account.wabaId}/message_templates?name=${encodeURIComponent(name)}`,
        {
          method: "DELETE",
          headers: getHeaders(account.accessToken),
        }
      );
      await handleResponse(response);
    },

    async getById(
      templateId: string,
      accountId: string
    ): Promise<Template> {
      const account = getAccount(accountId);
      const fields = [
        "name",
        "status",
        "category",
        "language",
        "components",
        "rejected_reason",
      ].join(",");
      const response = await fetch(
        `${BASE_URL}/${templateId}?fields=${fields}`,
        { headers: getHeaders(account.accessToken) }
      );
      const data = await handleResponse(response);
      return data;
    },

    async validateCredentials(
      wabaId: string,
      accessToken: string
    ): Promise<{ success: boolean }> {
      let response: Response;
      try {
        response = await fetch(
          `${BASE_URL}/${wabaId}/message_templates?limit=1&fields=name`,
          { headers: getHeaders(accessToken) }
        );
      } catch (err: any) {
        throw {
          status: 0,
          message: `Falha de rede ao conectar na Meta API: ${err.message ?? "Erro desconhecido"}`,
          body: { error: { message: `Falha de rede: ${err.message ?? "Verifique sua conexao"}`, code: 0 } },
        };
      }

      if (response.status === 401 || response.status === 403) {
        throw {
          status: 190,
          message: "Token de acesso invalido ou expirado",
          body: { error: { message: "Token de acesso invalido. Verifique o Access Token.", code: 190 } },
        };
      }

      const data = await handleResponse(response);
      if (data.data !== undefined) {
        return { success: true };
      }
      return { success: false };
    },
  },
};
