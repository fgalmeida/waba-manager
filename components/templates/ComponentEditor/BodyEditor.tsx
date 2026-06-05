"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Type } from "lucide-react";

interface BodyData {
  text: string;
  example?: { body_text?: string[][] };
}

interface Props {
  data: BodyData;
  onChange: (data: BodyData) => void;
}

export function BodyEditor({ data, onChange }: Props) {
  const variables = useMemo(() => {
    const matches = data.text.match(/\{\{(\d+)\}\}/g) ?? [];
    return [...new Set(matches)].map((m) => {
      const num = m.match(/\d+/)![0];
      return { placeholder: m, index: parseInt(num) };
    }).sort((a, b) => a.index - b.index);
  }, [data.text]);

  const charPercent = Math.min((data.text.length / 1024) * 100, 100);
  const charColor = charPercent > 90 ? "bg-red-500" : charPercent > 70 ? "bg-amber-500" : "bg-emerald-500";

  const insertVariable = () => {
    const nextIndex = variables.length + 1;
    const textarea = document.getElementById("body-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = data.text.slice(0, start) + `{{${nextIndex}}}` + data.text.slice(end);
    onChange({ ...data, text: newText });
  };

  const updateExample = (index: number, value: string) => {
    const examples = data.example?.body_text ?? [[]];
    const flat = [...(examples[0] ?? [])];
    flat[index - 1] = value;
    onChange({ ...data, example: { body_text: [flat] } });
  };

  const removeVariable = (placeholder: string) => {
    const newText = data.text.replace(placeholder, "").replace(/\s+/g, " ").trim();
    onChange({ ...data, text: newText });
  };

  return (
    <div className="space-y-3 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded p-1">
            <Type className="h-4 w-4 text-primary" />
          </div>
          <div>
            <Label className="font-semibold">Corpo da Mensagem</Label>
            <p className="text-[11px] text-muted-foreground">Obrigatorio — e o texto principal do template</p>
          </div>
        </div>
      </div>

      <Textarea
        id="body-textarea"
        placeholder="Digite o texto do seu template aqui...&#10;&#10;Use {{1}} para inserir variaveis como nome do cliente, numero do pedido, etc."
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        className="min-h-[130px] text-sm leading-relaxed"
        maxLength={1024}
      />

      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{data.text.length} caracteres</span>
          <span>limite: 1024</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${charColor}`} style={{ width: `${charPercent}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={insertVariable} className="text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Inserir Variavel
        </Button>
        <span className="text-[11px] text-muted-foreground self-center">
          Variaveis detectadas: <strong>{variables.length}</strong>
        </span>
      </div>

      {variables.length > 0 && (
        <div className="space-y-2 mt-2 pt-3 border-t">
          <div>
            <Label className="text-sm">Exemplos para cada variavel</Label>
            <p className="text-[11px] text-muted-foreground">
              Esses exemplos sao obrigatorios para a Meta aprovar o template. Use valores reais.
            </p>
          </div>
          {variables.map((v) => (
            <div key={v.placeholder} className="flex items-center gap-2">
              <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold min-w-[44px] text-center">
                {v.placeholder}
              </span>
              <Input
                placeholder={`Ex: ${v.index === 1 ? "Maria" : v.index === 2 ? "12345" : "valor"}`}
                className="flex-1 h-8 text-sm"
                value={data.example?.body_text?.[0]?.[v.index - 1] ?? ""}
                onChange={(e) => updateExample(v.index, e.target.value)}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeVariable(v.placeholder)} className="shrink-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
