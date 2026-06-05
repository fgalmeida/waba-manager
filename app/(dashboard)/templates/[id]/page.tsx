"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { CategoryIcon } from "@/components/templates/CategoryIcon";
import { ArrowLeft, Pencil, Trash2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Template } from "@/types/meta";

const statusLabels: Record<string, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Rejeitado",
  PAUSED: "Pausado",
  DISABLED: "Desativado",
};

const statusDescriptions: Record<string, string> = {
  APPROVED: "Seu template esta ativo e pode ser usado para enviar mensagens.",
  PENDING: "Em analise pela Meta. Pode levar ate 24 horas para aprovacao.",
  REJECTED: "Template recusado. Veja o motivo abaixo e corrija para reenviar.",
  PAUSED: "Template pausado. Nao pode ser usado ate ser reativado.",
  DISABLED: "Template desativado. Entre em contato com o suporte da Meta.",
};

const statusPills: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  PAUSED: "bg-orange-100 text-orange-800 border-orange-300",
  DISABLED: "bg-gray-100 text-gray-600 border-gray-300",
  DELETED: "bg-gray-100 text-gray-400 border-gray-300",
};

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/templates/${id}`);
        if (!res.ok) throw new Error("Nao encontrado");
        const data = await res.json();
        setTemplate(data);
      } catch {
        router.push("/templates");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const handleDelete = async () => {
    if (!template) return;
    if (!confirm(`Excluir o template "${template.name}"? Esta acao nao pode ser desfeita.`)) return;
    try {
      const res = await fetch(
        `/api/templates/${template.id}?name=${encodeURIComponent(template.name)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast.success("Template excluido com sucesso");
      router.push("/templates");
    } catch {
      toast.error("Erro ao excluir template");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!template) return null;

  const header = template.components.find((c) => c.type === "HEADER");
  const body = template.components.find((c) => c.type === "BODY");
  const footer = template.components.find((c) => c.type === "FOOTER");
  const btns = template.components.find((c) => c.type === "BUTTONS");

  const statusKey = template.status;
  const pillStyle = statusPills[statusKey] ?? statusPills.DISABLED;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{template.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <CategoryIcon category={template.category} size="sm" showLabel />
              <span className="text-xs text-muted-foreground">{template.language}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {(template.status === "APPROVED" || template.status === "REJECTED") && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/templates/${template.id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1 text-destructive" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Visualizacao no WhatsApp
            </h3>
          </div>
          <TemplatePreview
            headerText={header?.text}
            headerFormat={header?.format}
            bodyText={body?.text ?? ""}
            bodyExamples={body?.example?.body_text?.[0]}
            footerText={footer?.text}
            buttons={btns?.buttons?.map((b) => ({ type: b.type, text: b.text })) ?? []}
          />
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${pillStyle}`}>
                  {statusLabels[statusKey] ?? statusKey}
                </span>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {statusDescriptions[statusKey] ?? ""}
                </p>
              </div>

              {template.status === "REJECTED" && template.rejected_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-800 mb-0.5">Motivo da Rejeicao</p>
                    <p className="text-sm text-red-700">{template.rejected_reason}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Componentes</h4>
                {template.components.map((comp, i) => (
                  <div key={i} className="border rounded-md p-3 text-sm bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] h-5">
                        {comp.type}
                      </Badge>
                      {comp.format && (
                        <span className="text-[10px] text-muted-foreground">{comp.format}</span>
                      )}
                    </div>
                    {comp.text && (
                      <p className="whitespace-pre-wrap text-[13px] text-muted-foreground leading-relaxed">
                        {comp.text}
                      </p>
                    )}
                    {comp.buttons && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {comp.buttons.map((btn, j) => (
                          <Badge key={j} variant="secondary" className="text-[10px]">
                            {btn.text} ({btn.type})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <button
            onClick={() => setShowRaw(!showRaw)}
            className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 py-2"
          >
            {showRaw ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showRaw ? "Ocultar dados tecnicos (JSON)" : "Ver dados tecnicos (JSON)"}
          </button>
          {showRaw && (
            <pre className="bg-muted p-4 rounded-lg text-[10px] mt-1 overflow-auto max-h-[300px] leading-relaxed">
              {JSON.stringify(template, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
