export type TemplateStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "PAUSED"
  | "DISABLED"
  | "DELETED";

export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";

export type ComponentType = "HEADER" | "BODY" | "FOOTER" | "BUTTONS";

export type HeaderFormat =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "DOCUMENT"
  | "LOCATION";

export type ButtonType =
  | "QUICK_REPLY"
  | "PHONE_NUMBER"
  | "URL"
  | "COPY_CODE"
  | "OTP";

export interface TemplateButton {
  type: ButtonType;
  text: string;
  phone_number?: string;
  url?: string;
}

export interface TemplateComponent {
  type: ComponentType;
  format?: HeaderFormat;
  text?: string;
  buttons?: TemplateButton[];
  example?: {
    header_text?: string[];
    body_text?: string[][];
    header_handle?: string[];
  };
}

export interface Template {
  id: string;
  name: string;
  status: TemplateStatus;
  category: TemplateCategory;
  language: string;
  components: TemplateComponent[];
  rejected_reason?: string;
  created_time?: string;
}

export interface CreateTemplateInput {
  name: string;
  category: TemplateCategory;
  language: string;
  components: TemplateComponent[];
}

export interface UpdateTemplateInput {
  components: TemplateComponent[];
}

export interface TemplateFilters {
  status?: TemplateStatus;
  category?: TemplateCategory;
  name?: string;
  limit?: number;
}

export interface MetaAccount {
  id: string;
  name: string;
  encToken: string;
  encWabaId: string;
  encPhoneId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetaAccountDecrypted {
  id: string;
  name: string;
  accessToken: string;
  wabaId: string;
  phoneNumberId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetaAccountListItem {
  id: string;
  name: string;
  createdAt: string;
}

export interface MetaErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

export const META_ERROR_MESSAGES: Record<number, string> = {
  100: "Parametro invalido: verifique os campos do template",
  190: "Token de acesso invalido. Atualize nas configuracoes.",
  368: "Conta bloqueada pela Meta. Verifique o Business Manager.",
  132000: "Ja existe um template com este nome.",
  132001: "Template nao encontrado.",
  132005: "Limite de templates da conta atingido.",
  132015: "Idioma nao suportado pela Meta.",
};
