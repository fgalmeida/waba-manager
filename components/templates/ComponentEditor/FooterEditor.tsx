"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StickyNote } from "lucide-react";

interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  text: string;
  onChange: (text: string) => void;
}

export function FooterEditor({ enabled, onToggle, text, onChange }: Props) {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded p-1">
            <StickyNote className="h-4 w-4 text-primary" />
          </div>
          <div>
            <Label className="font-semibold">Rodape</Label>
            <p className="text-[11px] text-muted-foreground">Texto pequeno no final da mensagem — opcional</p>
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
        <div className="space-y-1">
          <Input
            placeholder="Ex: Obrigado por escolher nossa empresa!"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            maxLength={60}
          />
          <p className="text-[10px] text-muted-foreground text-right">{text.length}/60</p>
        </div>
      )}
    </div>
  );
}
