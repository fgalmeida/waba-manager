"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heading, Image, Video, FileText, MapPin } from "lucide-react";

interface HeaderData {
  format: string;
  text: string;
  example?: { header_text?: string[] };
}

interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  data: HeaderData;
  onChange: (data: HeaderData) => void;
}

const headerTypes: Record<string, { icon: typeof Heading; label: string; desc: string }> = {
  TEXT: { icon: Heading, label: "Texto", desc: "Titulo em texto (ex: Ola Maria!)" },
  IMAGE: { icon: Image, label: "Imagem", desc: "Imagem enviada como cabecalho" },
  VIDEO: { icon: Video, label: "Video", desc: "Video reproduzido no topo" },
  DOCUMENT: { icon: FileText, label: "Documento", desc: "PDF ou arquivo enviado" },
  LOCATION: { icon: MapPin, label: "Localizacao", desc: "Endereco ou mapa" },
};

export function HeaderEditor({ enabled, onToggle, data, onChange }: Props) {
  const currentType = headerTypes[data.format] ?? headerTypes.TEXT;
  const TypeIcon = currentType.icon;

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded p-1">
            <Heading className="h-4 w-4 text-primary" />
          </div>
          <div>
            <Label className="font-semibold">Cabecalho</Label>
            <p className="text-[11px] text-muted-foreground">Aparece no topo da mensagem — opcional</p>
          </div>
        </div>
        <Button
          type="button"
          variant={enabled ? "default" : "outline"}
          size="sm"
          className="text-xs h-7"
          onClick={() => onToggle(!enabled)}
        >
          {enabled ? "Remover" : "Adicionar"}
        </Button>
      </div>

      {enabled && (
        <div className="space-y-3 pl-1">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tipo de cabecalho</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {Object.entries(headerTypes).map(([key, { icon: Icon, label, desc }]) => (
                <button
                  key={key}
                  type="button"
                  title={desc}
                  onClick={() => onChange({ ...data, format: key })}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all
                    ${data.format === key
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-transparent hover:border-muted-foreground/20 hover:bg-muted"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {data.format === "TEXT" && (
            <div className="space-y-1">
              <Label className="text-xs">Texto do cabecalho</Label>
              <Input
                placeholder="Ex: Ola, seja bem-vindo!"
                value={data.text}
                onChange={(e) => onChange({ ...data, text: e.target.value })}
                maxLength={60}
              />
              <p className="text-[10px] text-muted-foreground text-right">{data.text.length}/60</p>
            </div>
          )}

          {data.format !== "TEXT" && (
            <div className="space-y-1">
              <Label className="text-xs">Link ou ID da midia</Label>
              <Input
                placeholder="Cole o link ou ID do arquivo de midia..."
                value={data.text}
                onChange={(e) => onChange({ ...data, text: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground">
                A midia deve estar hospedada nos servidores da Meta
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
