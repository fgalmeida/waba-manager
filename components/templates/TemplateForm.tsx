"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HeaderEditor } from "./ComponentEditor/HeaderEditor";
import { BodyEditor } from "./ComponentEditor/BodyEditor";
import { FooterEditor } from "./ComponentEditor/FooterEditor";
import { ButtonsEditor } from "./ComponentEditor/ButtonsEditor";
import { TemplatePreview } from "./TemplatePreview";
import { createTemplateSchema } from "@/lib/validations";
import { toast } from "sonner";
import { ArrowLeft, Save, Sparkles, Info } from "lucide-react";
import type { Template, TemplateComponent } from "@/types/meta";

interface TemplateFormProps {
  template?: Template;
}

export function TemplateForm({ template }: TemplateFormProps) {
  const router = useRouter();
  const isEdit = !!template;
  const [loading, setLoading] = useState(false);

  const [headerEnabled, setHeaderEnabled] = useState(false);
  const [headerData, setHeaderData] = useState({
    format: "TEXT" as string,
    text: "",
  });

  const [bodyData, setBodyData] = useState<{
    text: string;
    example?: { body_text?: string[][] };
  }>({ text: "" });

  const [footerEnabled, setFooterEnabled] = useState(false);
  const [footerText, setFooterText] = useState("");

  const [buttonsEnabled, setButtonsEnabled] = useState(false);
  const [buttons, setButtons] = useState<any[]>([]);

  const form = useForm({
    defaultValues: {
      name: template?.name ?? "",
      category: template?.category ?? "MARKETING",
      language: template?.language ?? "pt_BR",
    },
  });

  useEffect(() => {
    if (template) {
      const header = template.components.find((c) => c.type === "HEADER");
      const body = template.components.find((c) => c.type === "BODY");
      const footer = template.components.find((c) => c.type === "FOOTER");
      const btns = template.components.find((c) => c.type === "BUTTONS");

      if (header) {
        setHeaderEnabled(true);
        setHeaderData({ format: header.format ?? "TEXT", text: header.text ?? "" });
      }
      if (body) {
        setBodyData({ text: body.text ?? "", example: body.example });
      }
      if (footer) {
        setFooterEnabled(true);
        setFooterText(footer.text ?? "");
      }
      if (btns?.buttons) {
        setButtonsEnabled(true);
        setButtons(btns.buttons.map((b, i) => ({ id: `edit-btn-${i + 1}`, ...b })));
      }
    }
  }, [template]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const buildComponents = useCallback((): TemplateComponent[] => {
    const components: TemplateComponent[] = [];

    if (headerEnabled && headerData.format) {
      const comp: TemplateComponent = { type: "HEADER", format: headerData.format as any };
      if (headerData.text) comp.text = headerData.text;
      components.push(comp);
    }

    components.push({
      type: "BODY",
      text: bodyData.text,
      example: bodyData.example,
    });

    if (footerEnabled && footerText) {
      components.push({ type: "FOOTER", text: footerText });
    }

    if (buttonsEnabled && buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: buttons.map(({ id: _id, ...rest }) => rest),
      });
    }

    return components;
  }, [headerEnabled, headerData, bodyData, footerEnabled, footerText, buttonsEnabled, buttons]);

  const onSubmit = async () => {
    setLoading(true);
    const components = buildComponents();

    const rawName = watch("name");
    const category = watch("category");
    const language = watch("language");

    const name = rawName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const payload: any = { name, category, language, components };

    const validation = createTemplateSchema.safeParse(payload);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      toast.error(firstIssue?.message ?? "Dados invalidos");
      setLoading(false);
      return;
    }

    try {
      let res: Response;
      if (isEdit && template) {
        res = await fetch(`/api/templates/${template.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ components }),
        });
      } else {
        res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar template");

      toast.success(
        isEdit
          ? "Template editado com sucesso! Status: PENDING"
          : "Template criado com sucesso!"
      );
      router.push("/templates");
    } catch (error: any) {
      toast.error(error.message ?? "Erro ao salvar template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            {isEdit ? "Editar Template" : "Criar Novo Template"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isEdit
              ? "Altere os componentes e reenvie para aprovacao"
              : "Preencha os campos e monte seu template visualmente"}
          </p>
        </div>
      </div>

      {isEdit && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-6 text-sm flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>Atencao:</strong> Editar um template aprovado envia ele de volta para revisao da Meta.
            O status mudara para <strong>PENDING</strong> e pode levar ate 24 horas para ser aprovado novamente.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <form className="xl:col-span-5 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Informacoes do Template
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Nome do Template *</Label>
                <Input
                  id="name"
                  placeholder="ex: boas_vindas_cliente"
                  className="h-9"
                  {...register("name")}
                  onBlur={() => {
                    const raw = watch("name");
                    if (!raw) return;
                    const formatted = raw
                      .toLowerCase()
                      .replace(/\s+/g, "_")
                      .replace(/[^a-z0-9_]/g, "");
                    if (formatted !== raw) {
                      setValue("name", formatted, { shouldValidate: true, shouldTouch: true });
                    }
                  }}
                />
                {errors.name && (
                  <p className="text-[11px] text-destructive">{errors.name.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Apenas letras minusculas, numeros e underscore. Ex: confirmacao_pedido
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="language" className="text-xs">Idioma *</Label>
                <Select
                  value={watch("language")}
                  onValueChange={(v) => setValue("language", v ?? "pt_BR")}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt_BR">Portugues (Brasil)</SelectItem>
                    <SelectItem value="en_US">English (US)</SelectItem>
                    <SelectItem value="es_ES">Espanol</SelectItem>
                    <SelectItem value="en_GB">English (UK)</SelectItem>
                    <SelectItem value="fr">Francais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs">Categoria *</Label>
              <Select
                value={watch("category")}
                onValueChange={(v) => setValue("category", (v ?? "MARKETING") as any)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKETING">Marketing — Ofertas, promocoes e novidades</SelectItem>
                  <SelectItem value="UTILITY">Utilidade — Pedidos, recibos e atualizacoes</SelectItem>
                  <SelectItem value="AUTHENTICATION">Autenticacao — Codigos OTP e verificacao</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                A categoria define quando o template pode ser usado. Escolha com atencao.
              </p>
            </div>
          </div>

          <HeaderEditor
            enabled={headerEnabled}
            onToggle={setHeaderEnabled}
            data={headerData}
            onChange={setHeaderData}
          />

          <BodyEditor data={bodyData} onChange={setBodyData} />

          <FooterEditor
            enabled={footerEnabled}
            onToggle={setFooterEnabled}
            text={footerText}
            onChange={setFooterText}
          />

          <ButtonsEditor
            enabled={buttonsEnabled}
            onToggle={setButtonsEnabled}
            buttons={buttons}
            onChange={setButtons}
          />

          <div className="flex gap-3 pt-2 pb-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Salvando..." : isEdit ? "Salvar Alteracoes" : "Criar Template"}
            </Button>
          </div>
        </form>

        <div className="xl:col-span-7">
          <div className="sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Preview no WhatsApp
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                Tempo real
              </span>
            </div>
            <TemplatePreview
              headerText={headerEnabled ? headerData.text : undefined}
              headerFormat={headerEnabled ? headerData.format : undefined}
              bodyText={bodyData.text}
              bodyExamples={bodyData.example?.body_text?.[0]}
              footerText={footerEnabled ? footerText : undefined}
              buttons={
                buttonsEnabled
                  ? buttons.map((b) => ({ type: b.type, text: b.text }))
                  : []
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
