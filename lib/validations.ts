import { z } from "zod";

export const loginSchema = z.object({
  password: z.string().min(1, "Senha e obrigatoria"),
});

export const accountSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio").max(100),
  accessToken: z.string().min(1, "Access Token e obrigatorio"),
  wabaId: z.string().min(1, "WABA ID e obrigatorio"),
  phoneNumberId: z.string().min(1, "Phone Number ID e obrigatorio"),
});

export const accountUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  accessToken: z.string().min(1).optional(),
  wabaId: z.string().min(1).optional(),
  phoneNumberId: z.string().min(1).optional(),
});

const buttonSchema = z.object({
  type: z.enum(["QUICK_REPLY", "PHONE_NUMBER", "URL", "COPY_CODE", "OTP"]),
  text: z.string().min(1, "Texto do botao e obrigatorio").max(25),
  url: z.string().optional(),
  phone_number: z.string().optional(),
});

const headerFormatEnum = z.enum([
  "TEXT",
  "IMAGE",
  "VIDEO",
  "DOCUMENT",
  "LOCATION",
]);

const templateComponentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("HEADER"),
    format: headerFormatEnum,
    text: z.string().optional(),
    example: z
      .object({
        header_text: z.array(z.string()).optional(),
        header_handle: z.array(z.string()).optional(),
      })
      .optional(),
  }),
  z.object({
    type: z.literal("BODY"),
    text: z.string().min(1, "Body e obrigatorio").max(1024, "Body maximo 1024 caracteres"),
    example: z
      .object({
        body_text: z.array(z.array(z.string())).optional(),
      })
      .optional(),
  }),
  z.object({
    type: z.literal("FOOTER"),
    text: z.string().min(1).max(60),
  }),
  z.object({
    type: z.literal("BUTTONS"),
    buttons: z
      .array(buttonSchema)
      .min(1, "Pelo menos um botao")
      .max(10, "Maximo 10 botoes")
      .refine(
        (btns) => btns.filter((b) => b.type === "QUICK_REPLY").length <= 3,
        { message: "Maximo 3 botoes QUICK_REPLY" }
      ),
  }),
]);

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Nome e obrigatorio")
    .max(60)
    .regex(
      /^[a-z0-9_]+$/,
      "Nome deve conter apenas letras minusculas, numeros e underscore"
    ),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
  language: z.string().min(1, "Idioma e obrigatorio"),
  components: z
    .array(templateComponentSchema)
    .min(1, "Pelo menos um componente (BODY) e obrigatorio")
    .refine(
      (comps) => comps.some((c) => c.type === "BODY"),
      { message: "Componente BODY e obrigatorio" }
    )
    .refine(
      (comps) => comps.filter((c) => c.type === "HEADER").length <= 1,
      { message: "Apenas um HEADER permitido" }
    ),
});

export const updateTemplateSchema = z.object({
  components: z
    .array(templateComponentSchema)
    .min(1, "Pelo menos um componente (BODY) e obrigatorio")
    .refine(
      (comps) => comps.some((c) => c.type === "BODY"),
      { message: "Componente BODY e obrigatorio" }
    )
    .refine(
      (comps) => comps.filter((c) => c.type === "HEADER").length <= 1,
      { message: "Apenas um HEADER permitido" }
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AccountInput = z.infer<typeof accountSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
