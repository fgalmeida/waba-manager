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
import { Plus, Trash2, GripVertical, Smartphone, Globe, Phone, Copy, Key } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ButtonData {
  id: string;
  type: string;
  text: string;
  url?: string;
  phone_number?: string;
}

interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  buttons: ButtonData[];
  onChange: (buttons: ButtonData[]) => void;
}

const buttonTypeIcons: Record<string, typeof Smartphone> = {
  QUICK_REPLY: Smartphone,
  URL: Globe,
  PHONE_NUMBER: Phone,
  COPY_CODE: Copy,
  OTP: Key,
};

const buttonTypeLabels: Record<string, string> = {
  QUICK_REPLY: "Resposta Rapida",
  URL: "Link / Site",
  PHONE_NUMBER: "Telefone",
  COPY_CODE: "Copiar Codigo",
  OTP: "Senha (OTP)",
};

let btnIdCounter = 0;

function SortableButtonItem({
  btn,
  index,
  onUpdate,
  onRemove,
}: {
  btn: ButtonData;
  index: number;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: btn.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = buttonTypeIcons[btn.type] ?? Smartphone;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-3 bg-white border rounded-lg shadow-sm"
    >
      <button
        type="button"
        className="text-muted-foreground mt-1 cursor-grab active:cursor-grabbing touch-none"
        title="Arraste para reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Select
            value={btn.type}
            onValueChange={(v) => onUpdate(index, "type", v ?? "QUICK_REPLY")}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(buttonTypeLabels).map(([value, label]) => {
                const BtnIcon = buttonTypeIcons[value] ?? Smartphone;
                return (
                  <SelectItem key={value} value={value} className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <BtnIcon className="h-3 w-3" />
                      {label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Input
            placeholder="Texto do botao (ex: Comprar agora)"
            className="flex-1 h-8 text-sm"
            value={btn.text}
            onChange={(e) => onUpdate(index, "text", e.target.value.slice(0, 25))}
            maxLength={25}
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)} className="shrink-0">
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>

        {btn.type === "URL" && (
          <Input
            placeholder="https://seusite.com"
            className="h-8 text-sm"
            value={btn.url ?? ""}
            onChange={(e) => onUpdate(index, "url", e.target.value)}
          />
        )}

        {btn.type === "PHONE_NUMBER" && (
          <Input
            placeholder="+5511999999999"
            className="h-8 text-sm"
            value={btn.phone_number ?? ""}
            onChange={(e) => onUpdate(index, "phone_number", e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

export function ButtonsEditor({ enabled, onToggle, buttons, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const addButton = () => {
    if (buttons.length >= 10) return;
    onChange([...buttons, { id: `btn-${++btnIdCounter}`, type: "QUICK_REPLY", text: "" }]);
  };

  const removeButton = (index: number) => {
    onChange(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, field: string, value: string) => {
    const updated = buttons.map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    );
    onChange(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = buttons.findIndex((b) => b.id === active.id);
    const newIndex = buttons.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(buttons, oldIndex, newIndex));
  };

  const quickReplyCount = buttons.filter((b) => b.type === "QUICK_REPLY").length;

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded p-1">
            <Smartphone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <Label className="font-semibold">Botoes de Acao</Label>
            <p className="text-[11px] text-muted-foreground">O cliente clica para responder, abrir link ou ligar</p>
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
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={buttons.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {buttons.map((btn, i) => (
                <SortableButtonItem
                  key={btn.id}
                  btn={btn}
                  index={i}
                  onUpdate={updateButton}
                  onRemove={removeButton}
                />
              ))}
            </SortableContext>
          </DndContext>

          <Button type="button" variant="outline" size="sm" onClick={addButton} disabled={buttons.length >= 10} className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Adicionar Botao ({buttons.length}/10)
          </Button>

          {quickReplyCount > 3 && (
            <p className="text-xs text-destructive">
              Maximo 3 botoes de Resposta Rapida (voce tem {quickReplyCount})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
