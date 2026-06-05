"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Template } from "@/types/meta";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CategoryIcon } from "./CategoryIcon";
import { TemplatePreview } from "./TemplatePreview";

interface TemplateCardProps {
  template: Template;
  onDelete: (template: Template) => void;
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const router = useRouter();

  const header = template.components.find((c) => c.type === "HEADER");
  const body = template.components.find((c) => c.type === "BODY");
  const footer = template.components.find((c) => c.type === "FOOTER");
  const btns = template.components.find((c) => c.type === "BUTTONS");

  const statusKey = template.status;
  const statusPill: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    PAUSED: "bg-orange-50 text-orange-700 border-orange-200",
    DISABLED: "bg-gray-50 text-gray-500 border-gray-200",
    DELETED: "bg-gray-50 text-gray-400 border-gray-200",
  };

  const statusLabel: Record<string, string> = {
    APPROVED: "Aprovado",
    PENDING: "Pendente",
    REJECTED: "Rejeitado",
    PAUSED: "Pausado",
    DISABLED: "Desativado",
    DELETED: "Excluido",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group border-2 hover:border-primary/30 py-0">
      <div
        className="h-[180px] overflow-hidden cursor-pointer"
        onClick={() => router.push(`/templates/${template.id}`)}
      >
        <TemplatePreview
          compact
          headerText={header?.text}
          headerFormat={header?.format}
          bodyText={body?.text ?? ""}
          bodyExamples={body?.example?.body_text?.[0]}
          footerText={footer?.text}
          buttons={
            btns?.buttons?.map((b) => ({ type: b.type, text: b.text })) ?? []
          }
        />
      </div>

      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <h3
            className="font-semibold text-sm truncate max-w-[180px] cursor-pointer hover:text-primary"
            onClick={() => router.push(`/templates/${template.id}`)}
          >
            {template.name}
          </h3>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusPill[statusKey]}`}
          >
            {statusLabel[statusKey]}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CategoryIcon category={template.category} size="sm" />
            <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
              {template.language}
            </span>
          </div>

          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => router.push(`/templates/${template.id}`)}
              title="Ver detalhes"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {(template.status === "APPROVED" ||
              template.status === "REJECTED") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => router.push(`/templates/${template.id}/edit`)}
                title="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(template);
              }}
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>

        {template.status === "REJECTED" && template.rejected_reason && (
          <div className="mt-2 text-[10px] text-red-600 bg-red-50 rounded p-1.5 leading-tight">
            <span className="font-semibold">Motivo: </span>
            {template.rejected_reason}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
